import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import stripe from "@/lib/stripe";
import { updateTripApplicationInstallmentProgressByPaymentId } from "@/lib/trips";

export const runtime = "nodejs";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
}

const stripeWebhookSecret: string = webhookSecret;

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionDetails = invoice.parent?.subscription_details;
  const subscriptionId =
    typeof subscriptionDetails?.subscription === "string"
      ? subscriptionDetails.subscription
      : subscriptionDetails?.subscription?.id;

  if (!subscriptionId) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const metadata = subscription.metadata ?? {};

  if (metadata.payment_plan !== "installments") {
    return;
  }

  const targetCount = Number(metadata.installment_count ?? "4");
  if (!Number.isFinite(targetCount) || targetCount <= 0) {
    return;
  }

  const invoices = await stripe.invoices.list({
    subscription: subscriptionId,
    status: "paid",
    limit: 100,
  });

  const paidInvoiceCount = invoices.data.length;

  await updateTripApplicationInstallmentProgressByPaymentId(subscriptionId, {
    paidCount: paidInvoiceCount,
    targetCount,
    status: paidInvoiceCount >= targetCount ? "completed" : "active",
    lastPaidAt: new Date(invoice.created * 1000).toISOString(),
  });

  if (paidInvoiceCount >= targetCount && subscription.status !== "canceled") {
    await stripe.subscriptions.cancel(subscriptionId);
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature error:", error);
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handling error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 }
    );
  }
}
