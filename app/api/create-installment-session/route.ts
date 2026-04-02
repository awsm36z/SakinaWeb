import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

const INSTALLMENT_COUNT = 4;
const BILLING_INTERVAL_WEEKS = 2;

export async function POST(request: NextRequest) {
  try {
    const { amount, tripId, tripTitle } = (await request.json()) as {
      amount?: number;
      tripId?: string;
      tripTitle?: string | null;
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

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "You must be logged in to start installments." },
        { status: 401 }
      );
    }

    const installmentAmount = amount / INSTALLMENT_COUNT;
    const origin = request.headers.get("origin") ?? request.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: authData.user.email ?? undefined,
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
          user_id: authData.user.id,
        },
      },
      metadata: {
        trip_id: tripId,
        payment_plan: "installments",
        user_id: authData.user.id,
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
