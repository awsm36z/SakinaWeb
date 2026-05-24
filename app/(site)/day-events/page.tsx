import DayEventCard from "@/app/components/dayeventcard/dayeventcard";
import Link from "next/link";
import { isAdmin } from "@/lib/roles";
import { getDayEventsBucketed } from "@/lib/trips";

export default async function DayEventsPage() {
  const { upcoming, past } = await getDayEventsBucketed();
  const canCreate = await isAdmin();

  // Non-admins never see closed events
  const visibleUpcoming = canCreate
    ? upcoming
    : upcoming.filter((e) => e.status !== "closed");

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="brand-kicker">Day Events</p>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900">
              Upcoming Day Events
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Short single-day gatherings — free to attend, $5–$10 donation
              optional. Looking for multi-day expeditions?{" "}
              <Link href="/trips" className="brand-link">
                See overnight trips
              </Link>
              .
            </p>
          </div>
          {canCreate ? (
            <Link
              href="/trips/create"
              className="brand-button px-4 py-2 text-sm"
            >
              Create Event
            </Link>
          ) : null}
        </div>

        {/* Upcoming events */}
        {visibleUpcoming.length === 0 ? (
          <div className="brand-panel rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-600">
              Nothing scheduled yet.{" "}
              <Link href="/contact-us" className="brand-link">
                Get in touch
              </Link>{" "}
              to be notified when the next one goes up.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleUpcoming.map((event) => (
              <DayEventCard
                key={event.id}
                trip_id={event.trip_id}
                title={event.title}
                startDate={event.start_date}
                startTime={event.start_time}
                location={event.location}
                bannerImage={event.banner_image}
                summary={event.summary}
                genderRestriction={event.gender_restriction}
              />
            ))}
          </div>
        )}

        {/* Past events — always visible to all, but closed events still
            filtered for non-admins inside the past bucket too */}
        {(() => {
          const visiblePast = canCreate
            ? past
            : past.filter((e) => e.status !== "closed");

          if (visiblePast.length === 0) return null;

          return (
            <details className="mt-12 group">
              <summary className="flex cursor-pointer list-none items-center gap-2 select-none">
                <span className="text-sm font-semibold uppercase tracking-wider text-gray-400 group-open:text-gray-600">
                  Past Events
                </span>
                {/* Chevron rotates when open */}
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

              <div className="mt-4 flex flex-col gap-3 opacity-70">
                {visiblePast.map((event) => (
                  <DayEventCard
                    key={event.id}
                    trip_id={event.trip_id}
                    title={event.title}
                    startDate={event.start_date}
                    startTime={event.start_time}
                    location={event.location}
                    bannerImage={event.banner_image}
                    summary={event.summary}
                    genderRestriction={event.gender_restriction}
                  />
                ))}
              </div>
            </details>
          );
        })()}
      </div>
    </main>
  );
}
