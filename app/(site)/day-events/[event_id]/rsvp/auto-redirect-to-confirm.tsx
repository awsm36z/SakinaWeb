"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  tripId: string;
  prefill: Record<string, string>;
};

// Signed-in users with all required RSVP fields already on file shouldn't
// have to re-fill the form. We seed localStorage with their profile data
// and bounce straight to the donation/confirm step. The confirm page's
// "Back to form" link carries ?edit=1, which tells the rsvp page to render
// the form anyway when they want to update something.
export default function AutoRedirectToConfirm({ tripId, prefill }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storageKey = `dayEventRsvp:${tripId}`;
    const existing = window.localStorage.getItem(storageKey);
    let merged: Record<string, string> = { ...prefill };

    if (existing) {
      try {
        const parsed = JSON.parse(existing) as Record<string, string>;
        // Anything they typed earlier wins over the server prefill.
        merged = { ...prefill, ...parsed };
      } catch {
        /* fall back to prefill alone */
      }
    }

    window.localStorage.setItem(storageKey, JSON.stringify(merged));
    router.replace(`/day-events/${tripId}/rsvp/confirm`);
  }, [prefill, router, tripId]);

  return (
    <div className="mt-4 rounded-2xl border border-[rgba(47,93,80,0.18)] bg-[rgba(47,93,80,0.05)] px-4 py-3 text-sm text-[var(--brand-moss)]">
      Loading your details…
    </div>
  );
}
