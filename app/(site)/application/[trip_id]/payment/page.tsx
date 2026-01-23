"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import PaymentCard from "@/app/components/payment_card/payment_card";
import { submitTripApplication } from "../actions";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLIC_KEY environment variable");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tripId = String(params.trip_id ?? "");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const storageKey = `tripApplication:${tripId}`;

  useEffect(() => {
    const amountParam = searchParams.get("amount");
    const parsedAmount = amountParam ? Number(amountParam) : null;
    if (parsedAmount && Number.isFinite(parsedAmount)) {
      setAmount(parsedAmount);
    } else {
      setAmount(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!amount) {
      setClientSecret(null);
      return;
    }

    let isActive = true;
    const createPaymentIntent = async () => {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: convertToSubcurrency(amount, 100),
        }),
      });

      if (!isActive) {
        return;
      }

      if (!response.ok) {
        setClientSecret(null);
        return;
      }

      const data = (await response.json()) as { clientSecret?: string };
      setClientSecret(data.clientSecret ?? null);
    };

    createPaymentIntent();

    return () => {
      isActive = false;
    };
  }, [amount]);

  const handlePaymentSuccess = async (paymentId: string) => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      setSubmitError("Missing saved application data.");
      return;
    }

    let payload: Record<string, string> | null = null;
    try {
      payload = JSON.parse(stored) as Record<string, string>;
    } catch {
      window.localStorage.removeItem(storageKey);
      setSubmitError("Saved application data could not be read.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    const { error } = await submitTripApplication(tripId, payload, paymentId);

    if (error) {
      setSubmitError(error);
      setIsSubmitting(false);
      return;
    }

    window.localStorage.removeItem(storageKey);
    setIsSubmitting(false);
    router.push(`/trips/${tripId}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 md:px-10 lg:px-20 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-green-700">
            PAYMENT
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
            Complete your payment
          </h1>
          <p className="mt-2 text-gray-600">
            Your application will be submitted after payment is processed.
          </p>
        </header>

        <div className="rounded-2xl border border-gray-200 bg-white/95 p-6 shadow-xl backdrop-blur">
          <button
            type="button"
            onClick={() => router.push(`/application/${tripId}`)}
            className="mb-4 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            Back to form
          </button>
          {!amount ? (
            <p className="text-sm text-red-600">
              Missing payment amount. Please return to the application form.
            </p>
          ) : null}

          {amount && clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: { theme: "stripe" },
              }}
            >
              <PaymentCard onSuccess={handlePaymentSuccess} />
            </Elements>
          ) : amount ? (
            <p className="text-sm text-gray-500">Preparing payment...</p>
          ) : null}

          {submitError ? (
            <p className="mt-4 text-sm text-red-600">{submitError}</p>
          ) : null}
          {isSubmitting ? (
            <p className="mt-4 text-sm text-gray-500">
              Submitting your application...
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
