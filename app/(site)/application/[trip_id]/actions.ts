"use server";

import { createClient } from "@/lib/supabase/server";
import { createTripApplication } from "@/lib/trips";
import { triggerTripRegistrationEmail } from "@/lib/emails";
import stripe from "@/lib/stripe";

async function triggerConfirmationEmail(
  tripId: string,
  userEmail: string,
  fallbackTripId: string
) {
  const supabase = await createClient();
  const { data: trip } = await supabase
    .from("trips")
    .select("title, trip_id")
    .eq("trip_id", tripId)
    .maybeSingle();

  const emailResult = await triggerTripRegistrationEmail({
    recipientEmail: userEmail,
    tripTitle: trip?.title ?? "your trip",
    tripId: trip?.trip_id ?? fallbackTripId,
  });

  if (emailResult.error) {
    console.error("Trip registration email error:", emailResult.error);
  }
}

async function ensureNoExistingApplication(tripId: string, userId: string) {
  const supabase = await createClient();
  const { data: existingApplication } = await supabase
    .from("trip_applications")
    .select("form_id")
    .eq("trip_id", tripId)
    .eq("camper_id", userId)
    .maybeSingle();

  return existingApplication;
}

async function ensureNoExistingApplicationByPaymentId(paymentId: string) {
  const supabase = await createClient();
  const { data: existingApplication } = await supabase
    .from("trip_applications")
    .select("form_id")
    .eq("payment_id", paymentId)
    .maybeSingle();

  return existingApplication;
}

async function ensureGuestCamperId(submission: Record<string, string>) {
  const supabase = await createClient();
  const guestId = crypto.randomUUID();
  const guestFirstName = submission.first_name?.trim() || "Guest";
  const guestLastName = submission.last_name?.trim() || "Applicant";
  const guestEmail = submission.email?.trim().toLowerCase();

  if (!guestEmail) {
    return { camperId: null, error: "Guest application is missing an email." };
  }

  const { error } = await supabase.from("profiles").insert({
    id: guestId,
    email: guestEmail,
    name_first: guestFirstName,
    name_last: guestLastName,
  });

  if (error) {
    return { camperId: null, error: error.message };
  }

  return { camperId: guestId, error: null };
}

function getConfirmationEmail(
  submission: Record<string, string>,
  authenticatedEmail?: string | null
) {
  return authenticatedEmail ?? submission.email ?? null;
}

export async function submitTripApplication(
  tripId: string,
  submission: Record<string, string>,
  paymentId: string
) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  let camperId = authError ? null : authData.user?.id ?? null;

  const existingPaymentApplication =
    await ensureNoExistingApplicationByPaymentId(paymentId);

  if (existingPaymentApplication) {
    return { error: null };
  }

  if (camperId) {
    const existingApplication = await ensureNoExistingApplication(tripId, camperId);

    if (existingApplication) {
      return { error: null };
    }
  }

  if (!camperId) {
    const guestCamper = await ensureGuestCamperId(submission);

    if (guestCamper.error || !guestCamper.camperId) {
      return {
        error:
          guestCamper.error ?? "Unable to create a guest application profile.",
      };
    }

    camperId = guestCamper.camperId;
  }

  const { error } = await createTripApplication(
    tripId,
    { ...submission, payment_plan: "full" },
    camperId,
    true,
    paymentId
  );

  const confirmationEmail = getConfirmationEmail(
    submission,
    authError ? null : authData.user?.email
  );

  if (!error && confirmationEmail) {
    await triggerConfirmationEmail(tripId, confirmationEmail, tripId);
  }

  return { error };
}

export async function submitInstallmentTripApplication(
  tripId: string,
  submission: Record<string, string>,
  checkoutSessionId: string
) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  let camperId = authError ? null : authData.user?.id ?? null;
  const existingPaymentApplication =
    await ensureNoExistingApplicationByPaymentId(checkoutSessionId);

  if (existingPaymentApplication) {
    return { error: null };
  }

  if (camperId) {
    const existingApplication = await ensureNoExistingApplication(tripId, camperId);

    if (existingApplication) {
      return { error: null };
    }
  }

  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
    expand: ["subscription"],
  });

  if (session.mode !== "subscription" || session.payment_status !== "paid") {
    return { error: "Installment checkout has not completed yet." };
  }

  if (session.metadata?.trip_id !== tripId) {
    return { error: "Installment session does not match this trip." };
  }

  if (session.metadata?.user_id && camperId && session.metadata.user_id !== camperId) {
    return { error: "Installment session does not belong to this user." };
  }

  if (!camperId) {
    const guestCamper = await ensureGuestCamperId(submission);

    if (guestCamper.error || !guestCamper.camperId) {
      return {
        error:
          guestCamper.error ?? "Unable to create a guest application profile.",
      };
    }

    camperId = guestCamper.camperId;
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
  const subscriptionObject =
    typeof session.subscription === "string" ? null : session.subscription;

  if (subscriptionObject) {
    const targetCount = Number(
      subscriptionObject.metadata?.installment_count ?? "4"
    );
    const intervalWeeks = Number(
      subscriptionObject.metadata?.installment_interval_weeks ?? "2"
    );

    if (
      Number.isFinite(targetCount) &&
      targetCount > 0 &&
      Number.isFinite(intervalWeeks) &&
      intervalWeeks > 0
    ) {
      try {
        const schedule = await stripe.subscriptionSchedules.create({
          from_subscription: subscriptionObject.id,
        });
        const scheduleAnchor =
          schedule.current_phase?.start_date ??
          Math.floor(Date.now() / 1000);

        await stripe.subscriptionSchedules.update(schedule.id, {
          end_behavior: "cancel",
          phases: [
            {
              start_date: scheduleAnchor,
              items: subscriptionObject.items.data.map((item) => ({
                price:
                  typeof item.price === "string" ? item.price : item.price.id,
                quantity: item.quantity ?? 1,
              })),
              duration: {
                interval: "week",
                interval_count: targetCount * intervalWeeks,
              },
              metadata: {
                ...subscriptionObject.metadata,
              },
            },
          ],
          proration_behavior: "none",
        });
      } catch (error) {
        console.error("Failed to configure installment schedule:", error);
      }
    }
  }

  const { error } = await createTripApplication(
    tripId,
    {
      ...submission,
      payment_plan: "installments",
      installment_paid_count: "1",
      installment_target_count: "4",
      installment_status: "active",
      installment_last_paid_at: new Date().toISOString(),
    },
    camperId,
    false,
    subscriptionId ?? session.id
  );

  const confirmationEmail = getConfirmationEmail(
    submission,
    authError ? null : authData.user?.email
  );

  if (!error && confirmationEmail) {
    await triggerConfirmationEmail(tripId, confirmationEmail, tripId);
  }

  return { error };
}
