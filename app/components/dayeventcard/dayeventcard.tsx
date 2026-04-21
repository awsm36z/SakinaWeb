import Link from "next/link";
import Image from "next/image";

type DayEventCardProps = {
  trip_id: string | null;
  title: string | null;
  dates: string | null;
  location: string | null;
  bannerImage: string | null;
  summary: string | null;
};

export default function DayEventCard({
  trip_id,
  title,
  dates,
  location,
  bannerImage,
  summary,
}: DayEventCardProps) {
  return (
    <Link
      href={`/day-events/${trip_id}`}
      className="brand-card-soft group block rounded-[1.75rem] transition-shadow duration-300 hover:shadow-[0_24px_60px_rgba(67,49,31,0.14)]"
    >
      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
        <Image
          src={bannerImage ? bannerImage : "/default-trip-banner.jpg"}
          alt={title ? title : "Day event banner"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Day-event badge — replaces the overnight "status" chip */}
        <span className="absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full bg-[rgba(184,138,82,0.14)] text-[#8a6439]">
          Day Event
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col p-6">
        <h3 className="text-2xl font-semibold text-gray-900 transition-colors group-hover:text-[var(--brand-moss)]">
          {title}
        </h3>

        <div className="mt-2 text-sm text-gray-500 space-y-1">
          <p className="font-medium">{dates}</p>
          <p>{location}</p>
          <p className="font-semibold text-[var(--brand-moss)]">
            Free · optional donation
          </p>
        </div>

        <p className="mt-3 text-gray-700 text-sm line-clamp-3">{summary}</p>

        <div className="mt-4 text-sm font-semibold text-[var(--brand-moss)] group-hover:underline">
          Learn more →
        </div>
      </div>
    </Link>
  );
}
