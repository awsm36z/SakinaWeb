"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  tripId: string;
  hasAppliedAuth: boolean;
};

export default function DayEventRsvpCta({ tripId, hasAppliedAuth }: Props) {
  // Auth state is the source of truth when present. Otherwise we fall back to
  // a localStorage flag that the RSVP confirm flow sets after a successful
  // submission — that way guests also see the registered state.
  const [guestRegistered, setGuestRegistered] = useState(false);

  useEffect(() => {
    if (hasAppliedAuth || typeof window === "undefined") return;
    const flag = window.localStorage.getItem(`dayEventRsvp:done:${tripId}`);
    if (flag === "1") setGuestRegistered(true);
  }, [hasAppliedAuth, tripId]);

  const isRegistered = hasAppliedAuth || guestRegistered;

  if (isRegistered) {
    return (
      <button
        type="button"
        disabled
        className="cursor-not-allowed rounded-xl bg-[rgba(47,93,80,0.15)] px-6 py-3 text-sm font-semibold text-[var(--brand-moss)]"
      >
        You&apos;re registered
      </button>
    );
  }

  return (
    <Link
      href={`/day-events/${tripId}/rsvp`}
      className="brand-button rounded-xl px-6 py-3 text-sm"
    >
      RSVP — it&apos;s free
    </Link>
  );
}
