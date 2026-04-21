import DayEventCard from "@/app/components/dayeventcard/dayeventcard";
import Link from "next/link";
import { isAdmin } from "@/lib/roles";
import { getDayEvents } from "@/lib/trips";

export default async function DayEventsPage() {
  const events = await getDayEvents();
  const canCreate = await isAdmin();

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <p className="brand-kicker">Day Events</p>
          <h1 className="text-4xl font-bold text-center text-gray-900">
            Upcoming Day Events
          </h1>
          <p className="max-w-2xl text-sm text-gray-600">
            Single-day gatherings — workshops, talks, and outings. Free to join,
            with an optional donation ($5–$10) to help cover costs. Looking for
            longer wilderness expeditions instead? See our{" "}
            <Link href="/trips" className="brand-link">
              overnight trips
            </Link>
            .
          </p>
          {canCreate ? (
            <Link href="/trips/create" className="brand-button px-5 py-2 text-sm">
              Create Event
            </Link>
          ) : null}
        </div>

        {events.length === 0 ? (
          <div className="brand-panel mx-auto max-w-2xl rounded-2xl p-10 text-center">
            <p className="brand-kicker mb-3">Nothing scheduled yet</p>
            <p className="text-sm text-gray-600">
              We haven&apos;t posted any upcoming day events. Check back soon — or{" "}
              <Link href="/contact-us" className="brand-link">
                get in touch
              </Link>{" "}
              if you&apos;d like to be notified when one goes up.
            </p>
          </div>
        ) : (
          <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <DayEventCard
                key={event.id}
                trip_id={event.trip_id}
                title={event.title}
                dates={event.dates}
                location={event.location ?? "TBD"}
                bannerImage={event.banner_image ?? ""}
                summary={event.summary}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
