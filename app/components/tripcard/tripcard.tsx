import Link from "next/link";
import Image from "next/image";

type TripCardProps = {
  slug: string;
  title: string;
  dates: string;
  location: string;
  durationDays: number;
  difficulty: string;
  bannerImage: string;
  summary: string;
  status: "waitlist" | "open" | "full" | "closed";
};

export default function TripCard({
  slug,
  title,
  dates,
  location,
  durationDays,
  difficulty,
  bannerImage,
  summary,
  status,
}: TripCardProps) {
  return (
    <Link
      href={`/trips/${slug}`}
      className="group block rounded-2xl bg-white shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      {/* Banner */}
      <div className="relative h-56 w-full overflow-hidden rounded-t-2xl">
        <Image
          src={bannerImage}
          alt={title}
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
                  ? "bg-yellow-100 text-yellow-800"
                  : status === "open"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-200 text-gray-700"
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
      <div className="p-6 flex flex-col">
        <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
          {title}
        </h3>

        {/* Meta */}
        <div className="mt-2 text-sm text-gray-500 space-y-1">
          <p className="font-medium">{dates}</p>
          <p>{location}</p>
          <p>
            {durationDays} days · {difficulty}
          </p>
        </div>

        {/* Short description */}
        <p className="mt-3 text-gray-700 text-sm line-clamp-3">
          {summary}
        </p>

        {/* CTA */}
        <div className="mt-4 text-sm font-semibold text-green-700 group-hover:underline">
          Learn more →
        </div>
      </div>
    </Link>
  );
}
