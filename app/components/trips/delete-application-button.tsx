"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTripApplication } from "@/app/(site)/trips/[trip_id]/submissions/actions";

type Props = {
  tripId: string;
  formId: string;
  // Shown in the confirmation modal so the admin can sanity-check
  // they're deleting the right row.
  applicantName: string;
  // Adds a payment warning to the confirmation copy. We don't auto-refund.
  wasPaid?: boolean;
  // Visual treatment. "compact" = small icon-style button for table
  // rows; "full" = primary destructive button for detail pages.
  variant?: "compact" | "full";
  // Where to send the user after a successful delete. Defaults to
  // staying on the current page (just refreshes data).
  redirectTo?: string;
  // When true, also stops link/row click propagation if rendered inside
  // a clickable parent.
  stopPropagation?: boolean;
};

export default function DeleteApplicationButton({
  tripId,
  formId,
  applicantName,
  wasPaid,
  variant = "compact",
  redirectTo,
  stopPropagation = false,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const openModal = (event: React.MouseEvent) => {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }
    setError(null);
    setOpen(true);
  };

  const closeModal = () => {
    if (isPending) return;
    setOpen(false);
    setError(null);
  };

  const confirmDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteTripApplication({ tripId, formId });
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <>
      {variant === "compact" ? (
        <button
          type="button"
          onClick={openModal}
          aria-label={`Remove ${applicantName}`}
          className="inline-flex items-center gap-1 rounded-full border border-transparent px-2.5 py-1 text-xs font-medium text-[#9a3f41] transition hover:border-[rgba(154,63,65,0.32)] hover:bg-[rgba(154,63,65,0.06)]"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden>
            delete
          </span>
          Remove
        </button>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-xl border border-[rgba(154,63,65,0.32)] bg-[rgba(154,63,65,0.06)] px-4 py-2 text-sm font-semibold text-[#9a3f41] transition hover:bg-[rgba(154,63,65,0.12)]"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden>
            delete
          </span>
          Remove application
        </button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="brand-kicker text-[#9a3f41]">Confirm removal</p>
            <h2 className="mt-2 text-xl font-bold text-gray-900">
              Remove {applicantName}&apos;s application?
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              This permanently deletes the application row from the
              database. The applicant will not be notified, and you
              can&apos;t undo this from the website.
            </p>

            {wasPaid ? (
              <div className="mt-4 rounded-xl border border-[rgba(184,138,82,0.32)] bg-[rgba(255,247,232,0.85)] px-4 py-3 text-xs text-[#8a6439]">
                <strong className="block font-semibold">
                  This application was paid.
                </strong>
                Removing it here does <em>not</em> issue a refund. Process
                refunds separately in the Stripe dashboard.
              </div>
            ) : null}

            {error ? (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="brand-button-secondary px-4 py-2 text-sm disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-[#9a3f41] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7d3134] disabled:opacity-60"
              >
                {isPending ? "Removing…" : "Yes, remove"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
