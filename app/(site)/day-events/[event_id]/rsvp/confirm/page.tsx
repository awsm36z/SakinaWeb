"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import PaymentCard from "@/app/components/payment_card/payment_card";
import { createClient } from "@/lib/supabase/client";
import { submitDayEventRsvp } from "../actions";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLIC_KEY environment variable");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

type Stored = Record<string, string>;
type DonationChoice = 0 | 5 | 10;

function readStored(storageKey: string): Stored | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Stored;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export default function DayEventRsvpConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = String(params.event_id ?? "");
  const storageKey = `dayEventRsvp:${tripId}`;

  const [submission, setSubmission] = useState<Stored | null>(null);
  const [donation, setDonation] = useState<DonationChoice>(0);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState<string | null>(null);
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "submitting" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  // Pull the saved form data.
  useEffect(() => {
    if (!tripId) return;
    const stored = readStored(storageKey);
    if (!stored) {
      // If they land here without completing the form, bounce back.
      router.replace(`/day-events/${tripId}/rsvp`);
      return;
    }
    setSubmission(stored);
  }, [router, storageKey, tripId]);

  // Look up the event title for a friendlier header.
  useEffect(() => {
    if (!tripId) return;
    let active = true;
    const run = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("trips")
        .select("title")
        .eq("trip_id", tripId)
        .maybeSingle();
      if (active) setEventTitle(data?.title ?? null);
    };
    run();
    return () => {
      active = false;
    };
  }, [tripId]);

  // Create a payment intent whenever a donation amount is picked.
  useEffect(() => {
    if (donation === 0 || !submission) {
      setClientSecret(null);
      return;
    }

    let active = true;
    const run = async () => {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: convertToSubcurrency(donation, 100),
          tripId,
          firstName: submission.first_name ?? "",
          lastName: submission.last_name ?? "",
          email: submission.email ?? "",
          phone: submission.phone ?? "",
        }),
      });

      if (!active) return;

      if (!response.ok) {
        setClientSecret(null);
        setStatus({
          kind: "error",
          message: "Couldn't start donation checkout. Try again.",
        });
        return;
      }

      const data = (await response.json()) as { clientSecret?: string };
      setClientSecret(data.clientSecret ?? null);
    };

    run();
    return () => {
      active = false;
    };
  }, [donation, submission, tripId]);

  const finalize = async (paymentId: string | null) => {
    if (!submission) return;
    setStatus({ kind: "submitting" });
    const { error } = await submitDayEventRsvp({
      tripId,
      submission,
      donationAmount: donation,
      paymentId,
    });
    if (error) {
      setStatus({ kind: "error", message: error });
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
      // Flag used by the day-event detail page to show "You're registered"
      // for guests who don't have an auth session.
      window.localStorage.setItem(`dayEventRsvp:done:${tripId}`, "1");
    }
    router.push(`/day-events/${tripId}?rsvp=success`);
  };

  const handleFreeRegister = async () => {
    await finalize(null);
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    await finalize(paymentId);
  };

  const donationOptions: { value: DonationChoice; label: string }[] = useMemo(
    () => [
      { value: 0, label: "No thanks" },
      { value: 5, label: "$5" },
      { value: 10, label: "$10" },
    ],
    []
  );

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4">
          <Link
            href={`/day-events/${tripId}/rsvp`}
            className="brand-link text-sm"
          >
            ← Back to form
          </Link>
        </div>

        <article className="brand-panel rounded-2xl p-6 md:p-8">
          <p className="brand-kicker">Confirm RSVP</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900">
            You&apos;re almost in
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Registering{" "}
            <span className="font-semibold text-gray-900">
              {submission?.first_name ?? ""} {submission?.last_name ?? ""}
            </span>{" "}
            for{" "}
            <span className="font-semibold text-gray-900">
              {eventTitle ?? "this day event"}
            </span>
            . It&apos;s free — no payment required.
          </p>

          <div className="mt-6 rounded-2xl border border-[rgba(114,121,111,0.16)] bg-white/60 p-5">
            <p className="text-sm font-semibold text-gray-900">
              Donate to help us organize more trips!
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Completely optional — covers gas, permits, and food for future
              events.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {donationOptions.map((option) => {
                const isSelected = donation === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setDonation(option.value);
                      setStatus({ kind: "idle" });
                    }}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      isSelected
                        ? "border-[var(--brand-moss)] bg-[var(--brand-moss)] text-white"
                        : "border-[rgba(114,121,111,0.24)] bg-white text-gray-700 hover:border-[var(--brand-moss)]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            {donation === 0 ? (
              <button
                type="button"
                onClick={handleFreeRegister}
                disabled={!submission || status.kind === "submitting"}
                className="brand-button w-full rounded-xl px-5 py-3 text-sm disabled:opacity-60"
              >
                {status.kind === "submitting"
                  ? "Registering..."
                  : "Register — $0"}
              </button>
            ) : clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: { theme: "stripe" },
                }}
              >
                <p className="mb-3 text-xs text-gray-500">
                  Donating ${donation}.00 and registering in one step.
                </p>
                <PaymentCard onSuccess={handlePaymentSuccess} />
              </Elements>
            ) : (
              <p className="text-sm text-gray-500">
                Preparing donation checkout…
              </p>
            )}
          </div>

          {status.kind === "error" ? (
            <p className="mt-4 text-sm text-red-600">{status.message}</p>
          ) : null}
        </article>
      </div>
    </main>
  );
}
