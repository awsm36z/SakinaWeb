import DayEventCard from "@/app/components/dayeventcard/dayeventcard";
import Link from "next/link";
import { isAdmin } from "@/lib/roles";
import { getDayEvents } from "@/lib/trips";

export default async function DayEventsPage() {
  const events = await getDayEvents();
  const canCreate = await isAdmin();

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="mx-auto max-w-3xl">
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

        {events.length === 0 ? (
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
            {events.map((event) => (
              <DayEventCard
                key={event.id}
                trip_id={event.trip_id}
                title={event.title}
                startDate={event.start_date}
                location={event.location}
                bannerImage={event.banner_image}
                summary={event.summary}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
