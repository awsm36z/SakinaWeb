"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { submitInstallmentTripApplication } from "../../actions";

export default function InstallmentPaymentSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tripId = String(params.trip_id ?? "");
  const sessionId = searchParams.get("session_id");
  const storageKey = `tripApplication:${tripId}`;
  const [message, setMessage] = useState("Finalizing your installment plan...");
  const [error, setError] = useState<string | null>(null);
  const missingSessionDetails =
    !tripId || !sessionId || typeof window === "undefined";

  useEffect(() => {
    if (missingSessionDetails) {
      return;
    }

    const submit = async () => {
      const stored = window.localStorage.getItem(storageKey);

      if (!stored) {
        setError("Missing saved application data.");
        return;
      }

      let payload: Record<string, string>;
      try {
        payload = JSON.parse(stored) as Record<string, string>;
      } catch {
        window.localStorage.removeItem(storageKey);
        setError("Saved application data could not be read.");
        return;
      }

      const { error: submitError } = await submitInstallmentTripApplication(
        tripId,
        payload,
        sessionId
      );

      if (submitError) {
        setError(submitError);
        return;
      }

      window.localStorage.removeItem(storageKey);
      setMessage("Installment plan started. Redirecting you back to the trip...");
      router.replace(`/trips/${tripId}`);
    };

    submit();
  }, [missingSessionDetails, router, sessionId, storageKey, tripId]);

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="mx-auto max-w-2xl rounded-[1.75rem] bg-white/75 p-8 text-center shadow-[0_20px_50px_rgba(67,49,31,0.08)]">
        <p className="brand-kicker">INSTALLMENTS</p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">
          Confirming your plan
        </h1>
        <p className="mt-4 text-gray-600">
          {missingSessionDetails
            ? "Missing installment session details."
            : error ?? message}
        </p>
      </div>
    </main>
  );
}
