import tripsData from "@/app/(data)/trips.json";
import TripCard from "@/app/components/tripcard/tripcard";
import { Trip } from "@/app/types/trip";

const trips = tripsData as Trip[];

export default function TripsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
        Upcoming Trips
      </h1>

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
