import TripCard from "@/app/components/tripcard/tripcard";
import Link from "next/link";
import { isAdmin } from "@/lib/roles";
import { getTrips } from "@/lib/trips";

export default async function TripsPage() {
  const trips = await getTrips();
  const canCreate = await isAdmin();


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

      <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
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
      </div>
    </main>
  );
}
