import tripsData from "@/app/(data)/trips.json";
import TripCard from "@/app/components/tripcard/tripcard";
import { Trip } from "@/app/types/trip";
import Link from "next/link";
import { isAdmin } from "@/lib/roles";

const trips = tripsData as Trip[];

export default async function TripsPage() {
  const canCreate = await isAdmin();

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex flex-col items-center gap-4 mb-12">
        <h1 className="text-4xl font-bold text-center text-gray-900">
          Upcoming Trips
        </h1>
        {canCreate ? (
          <Link
            href="/trips/create"
            className="rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800 transition"
          >
            Create Trip
          </Link>
        ) : null}
      </div>

      <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            slug={trip.slug}
            title={trip.title}
            dates={trip.dates}
            location={trip.location}
            durationDays={trip.durationDays}
            difficulty={trip.difficulty}
            bannerImage={trip.bannerImage}
            summary={trip.summary}
            status={trip.status}
          />
        ))}
      </div>
    </div>
  );
}
