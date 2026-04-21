"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Stored = Record<string, string>;

export default function DayEventRsvpPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = String(params.event_id ?? "");
  const storageKey = `dayEventRsvp:${tripId}`;
  const [initial, setInitial] = useState<Stored>({});

  useEffect(() => {
    if (!tripId || typeof window === "undefined") return;
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;
    try {
      setInitial(JSON.parse(stored) as Stored);
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
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    }
    router.push(`/day-events/${tripId}/rsvp/confirm`);
  }

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4">
          <Link
            href={`/day-events/${tripId}`}
            className="brand-link text-sm"
          >
            ← Back to event
          </Link>
        </div>

        <article className="brand-panel rounded-2xl p-6 md:p-8">
          <p className="brand-kicker">RSVP</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900">
            Sign up for this day event
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            A few quick details so we know who&apos;s coming. This event involves
            moderate hiking — expect to walk about 5 miles in one day. If you
            have any medical concerns please list them below.
          </p>

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
                This event involves ~5 miles of moderate hiking. Let us know
                anything we should be aware of.
              </span>
            </label>

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
        </article>
      </div>
    </main>
  );
}
