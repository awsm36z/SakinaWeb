import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
 
function getStringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const { amount, tripId, firstName, lastName, email, phone } =
      (await request.json()) as {
        amount?: number;
        tripId?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
      };

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: getStringValue(email),
      metadata: {
        trip_id: getStringValue(tripId) ?? "",
        applicant_first_name: getStringValue(firstName) ?? "",
        applicant_last_name: getStringValue(lastName) ?? "",
        applicant_email: getStringValue(email) ?? "",
        applicant_phone: getStringValue(phone) ?? "",
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Internal Error", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
