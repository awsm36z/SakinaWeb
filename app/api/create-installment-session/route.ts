import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

const INSTALLMENT_COUNT = 4;
const BILLING_INTERVAL_WEEKS = 2;

function getStringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const { amount, tripId, tripTitle, firstName, lastName, email, phone } =
      (await request.json()) as {
      amount?: number;
      tripId?: string;
      tripTitle?: string | null;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    };

    if (!amount || !Number.isInteger(amount) || amount <= 0 || !tripId) {
      return NextResponse.json(
        { error: "Invalid installment checkout request." },
        { status: 400 }
      );
    }

    if (amount % INSTALLMENT_COUNT !== 0) {
      return NextResponse.json(
        {
          error:
            "This trip total cannot be evenly divided into four installments.",
        },
        { status: 422 }
      );
    }

    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const userId = authError ? null : authData.user?.id ?? null;
    const contactEmail = getStringValue(email) ?? authData.user?.email ?? undefined;

    const installmentAmount = amount / INSTALLMENT_COUNT;
    const origin = request.headers.get("origin") ?? request.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: contactEmail,
      success_url: `${origin}/application/${tripId}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/application/${tripId}/payment?amount=${
        amount / 100
      }&plan=installments`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: installmentAmount,
            recurring: {
              interval: "week",
              interval_count: BILLING_INTERVAL_WEEKS,
            },
            product_data: {
              name: `${tripTitle ?? "Trip"} installment plan`,
              description: "4 installments charged every 2 weeks.",
            },
          },
        },
      ],
      subscription_data: {
        metadata: {
          trip_id: tripId,
          payment_plan: "installments",
          installment_count: String(INSTALLMENT_COUNT),
          installment_interval_weeks: String(BILLING_INTERVAL_WEEKS),
          installment_amount: String(installmentAmount),
          full_amount: String(amount),
          user_id: userId ?? "",
          applicant_first_name: getStringValue(firstName) ?? "",
          applicant_last_name: getStringValue(lastName) ?? "",
          applicant_email: contactEmail ?? "",
          applicant_phone: getStringValue(phone) ?? "",
        },
      },
      metadata: {
        trip_id: tripId,
        payment_plan: "installments",
        user_id: userId ?? "",
        applicant_first_name: getStringValue(firstName) ?? "",
        applicant_last_name: getStringValue(lastName) ?? "",
        applicant_email: contactEmail ?? "",
        applicant_phone: getStringValue(phone) ?? "",
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Installment checkout error:", error);
    return NextResponse.json(
      { error: "Unable to start installment checkout." },
      { status: 500 }
    );
  }
}
