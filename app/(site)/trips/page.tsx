import TripCard from "@/app/components/tripcard/tripcard";
import Link from "next/link";
import { isAdmin } from "@/lib/roles";
import { getTrips } from "@/lib/trips";

export default async function TripsPage() {
  const trips = await getTrips();
  const canCreate = await isAdmin();

  const todayStr = new Date().toISOString().slice(0, 10);

  const upcoming = trips.filter(
    (t) => !t.start_date || t.start_date >= todayStr
  );
  const past = trips
    .filter((t) => t.start_date && t.start_date < todayStr)
    .sort((a, b) => (b.start_date ?? "").localeCompare(a.start_date ?? ""));

  // Non-admins never see closed events
  const visibleUpcoming = canCreate
    ? upcoming
    : upcoming.filter((t) => t.status !== "closed");
  const visiblePast = canCreate
    ? past
    : past.filter((t) => t.status !== "closed");

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <p className="brand-kicker">Trips</p>
          <h1 className="text-4xl font-bold text-center text-gray-900">
            Upcoming Overnight Trips
          </h1>
          <p className="max-w-2xl text-sm text-gray-600">
            Multi-day wilderness expeditions. Looking for a single-day program instead? See our{" "}
            <Link href="/day-events" className="brand-link">day events</Link>.
          </p>
          {canCreate ? (
            <Link
              href="/trips/create"
              className="brand-button px-5 py-2 text-sm"
            >
              Create Trip
            </Link>
          ) : null}
        </div>

        {visibleUpcoming.length === 0 ? (
          <div className="brand-panel rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-600">
              Nothing scheduled yet.{" "}
              <Link href="/contact-us" className="brand-link">
                Get in touch
              </Link>{" "}
              to be notified when the next trip goes up.
            </p>
          </div>
        ) : (
          <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {visibleUpcoming.map((trip) => (
              <TripCard
                key={trip.id}
                trip_id={trip.trip_id}
                title={trip.title}
                dates={trip.dates}
                location={trip.location ?? "TBD"}
                durationDays={trip.duration_days ?? 0}
                difficulty="TBD"
                bannerImage={trip.banner_image ?? ""}
                summary={trip.summary}
                status={trip.status ?? "closed"}
                spotsLeft={trip.spots_left ?? 0}
                maxCapacity={trip.max_capacity ?? null}
                genderRestriction={trip.gender_restriction}
              />
            ))}
          </div>
        )}

        {visiblePast.length > 0 && (
          <details className="mt-16 group">
            <summary className="flex cursor-pointer list-none items-center gap-2 select-none">
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-400 group-open:text-gray-600">
                Past Trips
              </span>
              <svg
                className="h-4 w-4 text-gray-400 transition-transform duration-200 group-open:rotate-180"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </summary>

            <div className="mt-6 grid gap-10 opacity-70 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {visiblePast.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip_id={trip.trip_id}
                  title={trip.title}
                  dates={trip.dates}
                  location={trip.location ?? "TBD"}
                  durationDays={trip.duration_days ?? 0}
                  difficulty="TBD"
                  bannerImage={trip.banner_image ?? ""}
                  summary={trip.summary}
                  status={trip.status ?? "closed"}
                  spotsLeft={trip.spots_left ?? 0}
                  maxCapacity={trip.max_capacity ?? null}
                  genderRestriction={trip.gender_restriction}
                />
              ))}
            </div>
          </details>
        )}
      </div>
    </main>
  );
}
