"use server";

import { createClient } from "@/lib/supabase/server";
import { createTripApplication } from "@/lib/trips";
import { triggerTripRegistrationEmail } from "@/lib/emails";
import { createClaimToken } from "@/lib/account-claim";

async function ensureGuestCamperId(submission: Record<string, string>) {
  const supabase = await createClient();
  const guestId = crypto.randomUUID();
  const guestFirstName = submission.first_name?.trim() || "Guest";
  const guestLastName = submission.last_name?.trim() || "Attendee";
  const guestEmail = submission.email?.trim().toLowerCase();

  if (!guestEmail) {
    return { camperId: null, error: "Guest RSVP is missing an email." };
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

async function ensureNoExistingApplicationByPaymentId(paymentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trip_applications")
    .select("form_id")
    .eq("payment_id", paymentId)
    .maybeSingle();
  return data;
}

async function ensureNoExistingApplication(tripId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trip_applications")
    .select("form_id")
    .eq("trip_id", tripId)
    .eq("camper_id", userId)
    .maybeSingle();
  return data;
}

async function triggerConfirmationEmail(
  tripId: string,
  recipientEmail: string,
  claimUrl: string | null
) {
  const supabase = await createClient();
  const { data: trip } = await supabase
    .from("trips")
    .select("title, trip_id")
    .eq("trip_id", tripId)
    .maybeSingle();

  const emailResult = await triggerTripRegistrationEmail({
    recipientEmail,
    tripTitle: trip?.title ?? "your day event",
    tripId: trip?.trip_id ?? tripId,
    claimUrl,
    detailPath: "day-events",
  });

  if (emailResult.error) {
    console.error("Day-event RSVP email error:", emailResult.error);
  }
}

type SubmitInput = {
  tripId: string;
  submission: Record<string, string>;
  donationAmount: number; // 0, 5, or 10
  paymentId?: string | null;
};

export async function submitDayEventRsvp({
  tripId,
  submission,
  donationAmount,
  paymentId,
}: SubmitInput): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  let camperId = authError ? null : authData.user?.id ?? null;

  // If we have a paymentId (donation path), make sure we haven't already
  // consumed it — protects against double-submits on page reloads.
  if (paymentId) {
    const existing = await ensureNoExistingApplicationByPaymentId(paymentId);
    if (existing) {
      return { error: null };
    }
  }

  // Logged-in users can only RSVP once per event.
  if (camperId) {
    const existing = await ensureNoExistingApplication(tripId, camperId);
    if (existing) {
      return { error: null };
    }
  }

  let createdGuestProfile = false;
  if (!camperId) {
    const guest = await ensureGuestCamperId(submission);
    if (guest.error || !guest.camperId) {
      return {
        error: guest.error ?? "Unable to create a guest RSVP profile.",
      };
    }
    camperId = guest.camperId;
    createdGuestProfile = true;
  }

  const enrichedSubmission: Record<string, string> = {
    ...submission,
    payment_plan: donationAmount > 0 ? "donation" : "free_rsvp",
    donation_amount: String(donationAmount),
    event_kind: "day_event",
  };

  const { error } = await createTripApplication(
    tripId,
    enrichedSubmission,
    camperId,
    true, // day events are "paid" the moment they RSVP (no gated spots)
    paymentId ?? null
  );

  if (error) {
    return { error };
  }

  const recipient =
    (authError ? null : authData.user?.email) ?? submission.email ?? null;

  // Only mint a claim token for brand-new guest profiles — authed users
  // already have accounts, and repeat guests (same email, different trip)
  // shouldn't accumulate tokens.
  let claimUrl: string | null = null;
  if (createdGuestProfile && recipient) {
    const claim = await createClaimToken({
      profileId: camperId,
      email: recipient,
    });
    if (claim.error) {
      console.error("Day-event RSVP claim token error:", claim.error);
    } else {
      claimUrl = claim.claimUrl ?? null;
    }
  }

  if (recipient) {
    await triggerConfirmationEmail(tripId, recipient, claimUrl);
  }

  return { error: null };
}
