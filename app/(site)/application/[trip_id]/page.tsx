"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SubmissionForm, {
  type FormField,
} from "@/app/components/submission_form/submission_form";
import { createClient } from "@/lib/supabase/client";
import applicationForm from "@/app/(data)/application_form";

type Section = {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
};

export default function ApplicationPage() {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [tripCost, setTripCost] = useState<number | null>(null);
  const params = useParams();
  const router = useRouter();
  const sections = applicationForm.sections;
  const currentSection = sections[step];
  const totalSteps = sections.length;
  const tripId = String(params.trip_id ?? "");
  const storageKey = `tripApplication:${tripId}`;

  useEffect(() => {
    if (!tripId) {
      setTripCost(null);
      return;
    }

    let isActive = true;
    const fetchTripCost = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("trips")
        .select("fee")
        .eq("trip_id", tripId)
        .maybeSingle();

      if (!isActive) {
        return;
      }

      if (error) {
        setTripCost(null);
        return;
      }

      setTripCost(data?.fee ?? null);
    };

    fetchTripCost();

    return () => {
      isActive = false;
    };
  }, [tripId]);

  useEffect(() => {
    if (!tripId || typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Record<string, string>;
      setResponses(parsed);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey, tripId]);

  const fieldsWithDefaults = useMemo(() => {
    return currentSection.fields.map((field) => ({
      ...field,
      defaultValue:
        responses[field.name] ??
        (field.defaultValue !== undefined ? field.defaultValue : undefined),
    }));
  }, [currentSection.fields, responses]);

  const progressLabel = useMemo(() => {
    return `Step ${step + 1} of ${totalSteps}`;
  }, [step, totalSteps]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 md:px-10 lg:px-20 py-12">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-green-700">
            APPLICATION
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
            Course Application
          </h1>
          <p className="mt-2 text-gray-600">
            Please complete all sections below. Your responses help us build a
            safe and meaningful experience.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-green-700">
            {progressLabel}
          </p>
        </header>

        <SubmissionForm
          title={currentSection.title}
          description={currentSection.description}
          fields={fieldsWithDefaults}
          submitLabel={
            step === totalSteps - 1 ? "Proceed to payment" : "Continue"
          }
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const nextResponses: Record<string, string> = {};

            for (const [key, value] of formData.entries()) {
              if (typeof value === "string") {
                nextResponses[key] = value;
              }
            }

            const mergedResponses = { ...responses, ...nextResponses };
            setResponses(mergedResponses);
            if (typeof window !== "undefined" && tripId) {
              window.localStorage.setItem(
                storageKey,
                JSON.stringify(mergedResponses)
              );
            }

            if (step < totalSteps - 1) {
              setStep((prev) => prev + 1);
              return;
            }

            setIsSubmitting(false);
            setSubmitError(null);
            const rentalFee =
              mergedResponses.needs_rental_gear === "yes" ? 150 : 0;
            const totalAmount =
              tripCost !== null ? tripCost + rentalFee : null;
            const paymentPath =
              totalAmount !== null
                ? `/application/${tripId}/payment?amount=${totalAmount}`
                : `/application/${tripId}/payment`;
            router.push(paymentPath);
          }}
        />

        {submitError ? (
          <p className="text-sm text-red-600 text-center">{submitError}</p>
        ) : null}

        {isSubmitting ? (
          <p className="text-sm text-gray-500 text-center">
            Submitting your application...
          </p>
        ) : null}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            disabled={step === 0}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            Back
          </button>
          <div className="text-xs text-gray-500">
            {currentSection.title}
          </div>
        </div>
      </div>
    </main>
  );
}
