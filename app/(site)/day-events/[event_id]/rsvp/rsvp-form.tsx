"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Stored = Record<string, string>;

type Props = {
  tripId: string;
  gearCapacity: number | null;
  gearLabel: string | null;
  gearSpotsLeft: number | null;
  hikingDistance: string | null;
  // Server-rendered initial values pulled from the signed-in user's
  // profile + most recent submission. Field-by-field localStorage wins
  // because that captures whatever they explicitly typed in this session.
  serverPrefill?: Stored;
};

export default function DayEventRsvpForm({
  tripId,
  gearCapacity,
  gearLabel,
  gearSpotsLeft,
  hikingDistance,
  serverPrefill,
}: Props) {
  const router = useRouter();
  const storageKey = `dayEventRsvp:${tripId}`;
  // Start with the server prefill so the very first paint already has
  // the right defaults; localStorage gets layered on top after mount.
  const [initial, setInitial] = useState<Stored>(() => serverPrefill ?? {});
  const showGearCheckbox =
    typeof gearCapacity === "number" && gearCapacity >= 0;
  const gearOpenSlots = showGearCheckbox
    ? typeof gearSpotsLeft === "number"
      ? gearSpotsLeft
      : gearCapacity
    : null;
  const gearFull = showGearCheckbox && (gearOpenSlots ?? 0) <= 0;

  useEffect(() => {
    if (!tripId || typeof window === "undefined") return;
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Stored;
      // Local entries win field-by-field over the server prefill.
      setInitial((prev) => ({ ...prev, ...parsed }));
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey, tripId]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Stored = {};
    for (const [key, value] of data.entries()) {
      if (typeof value === "string") next[key] = value;
    }
    // Normalize the checkbox into a stable string flag the server action
    // can read regardless of whether the box was unchecked.
    if (showGearCheckbox) {
      next.has_own_gear = data.get("has_own_gear") === "on" ? "true" : "false";
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    }
    router.push(`/day-events/${tripId}/rsvp/confirm`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">
          First name
          <input
            name="first_name"
            required
            defaultValue={initial.first_name}
            className="brand-input mt-2 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Last name
          <input
            name="last_name"
            required
            defaultValue={initial.last_name}
            className="brand-input mt-2 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-medium text-gray-700">
          Gender
          <select
            name="gender"
            required
            defaultValue={initial.gender ?? ""}
            className="brand-input mt-2 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="na">Prefer not to say</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Age
          <input
            name="age"
            type="number"
            min={0}
            max={120}
            required
            defaultValue={initial.age}
            className="brand-input mt-2 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Phone
          <input
            name="phone"
            type="tel"
            required
            defaultValue={initial.phone}
            className="brand-input mt-2 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-gray-700">
        Email
        <input
          name="email"
          type="email"
          required
          defaultValue={initial.email}
          className="brand-input mt-2 px-3 py-2 text-sm"
        />
        <span className="mt-1 block text-xs font-normal text-gray-500">
          We&apos;ll send your confirmation here.
        </span>
      </label>

      <label className="block text-sm font-medium text-gray-700">
        Medical concerns
        <textarea
          name="medical_notes"
          rows={4}
          defaultValue={initial.medical_notes}
          placeholder="List any medical concerns (injuries, allergies, conditions). Write “None” if nothing applies."
          className="brand-input mt-2 px-3 py-2 text-sm"
          required
        />
        <span className="mt-1 block text-xs font-normal text-gray-500">
          {hikingDistance?.trim()
            ? `Expect about ${hikingDistance.trim()} of moderate hiking. Let us know anything we should be aware of.`
            : "Let us know anything we should be aware of."}
        </span>
      </label>

      {showGearCheckbox ? (
        <fieldset className="brand-subtle-block rounded-xl px-4 py-3">
          <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-moss)]">
            Equipment
          </legend>
          <p className="mt-1 text-xs text-gray-600">
            We have{" "}
            <strong>
              {gearOpenSlots} of {gearCapacity}
            </strong>{" "}
            loaner spot{gearCapacity === 1 ? "" : "s"} left. If you bring
            your own, you don&apos;t take one of those spots.
          </p>
          <label className="mt-3 flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="has_own_gear"
              defaultChecked={initial.has_own_gear === "true"}
              className="mt-1"
            />
            <span>
              {gearLabel ?? "I have my own equipment"}
              {gearFull ? (
                <span className="mt-0.5 block text-xs text-amber-700">
                  All loaner spots are taken — please tick this if you can
                  bring your own.
                </span>
              ) : null}
            </span>
          </label>
        </fieldset>
      ) : null}

      <div className="flex items-center justify-between pt-2">
        <Link
          href={`/day-events/${tripId}`}
          className="brand-button-secondary px-4 py-2 text-sm"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="brand-button rounded-xl px-5 py-2 text-sm"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
