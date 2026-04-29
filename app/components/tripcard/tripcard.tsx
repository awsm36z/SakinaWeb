import Link from "next/link";
import Image from "next/image";
import { formatSpotsAvailability } from "@/lib/trips";
import GenderRestrictionChip from "@/app/components/trips/gender-restriction-chip";

type TripCardProps = {
  trip_id: string | null;
  title: string | null;
  dates: string | null;
  location: string | null;
  durationDays: number | null;
  difficulty: string | null;
  bannerImage: string | null;
  summary: string | null;
  status: "waitlist" | "open" | "full" | "closed";
  spotsLeft: number;
  maxCapacity: number | null;
  genderRestriction?: string | null;
};

export default function TripCard({
  trip_id,
  title,
  dates,
  location,
  durationDays,
  difficulty,
  bannerImage,
  summary,
  status,
  spotsLeft,
  maxCapacity,
  genderRestriction,
}: TripCardProps) {
  const availability = formatSpotsAvailability(spotsLeft, maxCapacity);
  return (
    <Link
      href={`/trips/${trip_id}`}
      className="brand-card-soft group block rounded-[1.75rem] transition-shadow duration-300 hover:shadow-[0_24px_60px_rgba(67,49,31,0.14)]"
    >
      {/* Banner */}
      <div className="relative h-56 w-full overflow-hidden rounded-t-2xl">
        <Image
          src={bannerImage? bannerImage : "/default-trip-banner.jpg"}
          alt={title? title : "Trip Banner"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Status badge */}
        {status && (
          <span
            className={`
              absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full
              ${
                status === "waitlist"
                  ? "bg-[rgba(184,138,82,0.14)] text-[#8a6439]"
                  : status === "open"
                  ? "bg-[rgba(47,93,80,0.12)] text-[var(--brand-moss)]"
                  : "bg-[rgba(92,102,112,0.12)] text-[#5c6670]"
              }
            `}
          >
            {status === "waitlist"
              ? "Join Waitlist"
              : status === "open"
              ? "Open"
              : status === "closed"
              ? "Closed"
              : "Full"}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-2xl font-semibold text-gray-900 transition-colors group-hover:text-[var(--brand-moss)]">
            {title}
          </h3>
          <GenderRestrictionChip value={genderRestriction} alwaysShow />
        </div>

        {/* Meta */}
        <div className="mt-2 text-sm text-gray-500 space-y-1">
          <p className="font-medium">{dates}</p>
          <p>{location}</p>
          <p>
            {durationDays} days · {difficulty}
          </p>
          <p className="font-semibold text-[var(--brand-moss)]">{availability}</p>
        </div>

        {/* Short description */}
        <p className="mt-3 text-gray-700 text-sm line-clamp-3">
          {summary}
        </p>

        {/* CTA */}
        <div className="mt-4 text-sm font-semibold text-[var(--brand-moss)] group-hover:underline">
          Learn more →
        </div>
      </div>
    </Link>
  );
}
