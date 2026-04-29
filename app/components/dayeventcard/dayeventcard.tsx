import Link from "next/link";
import Image from "next/image";
import GenderRestrictionChip from "@/app/components/trips/gender-restriction-chip";

type DayEventCardProps = {
  trip_id: string | null;
  title: string | null;
  startDate: string | null;
  startTime?: string | null;
  location: string | null;
  bannerImage: string | null;
  summary: string | null;
  genderRestriction?: string | null;
};

function formatDateTile(startDate: string | null) {
  if (!startDate) return { month: "TBD", day: "—" };
  const parsed = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return { month: "TBD", day: "—" };
  return {
    month: parsed.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: String(parsed.getDate()),
  };
}

export default function DayEventCard({
  trip_id,
  title,
  startDate,
  startTime,
  location,
  bannerImage,
  summary,
  genderRestriction,
}: DayEventCardProps) {
  const { month, day } = formatDateTile(startDate);
  const metaParts = [
    location ?? "TBD",
    startTime?.trim() ? startTime : null,
    "Free · optional donation",
  ].filter(Boolean) as string[];

  return (
    <Link
      href={`/day-events/${trip_id}`}
      className="brand-card-soft group flex items-stretch gap-4 rounded-2xl p-4 transition-shadow duration-200 hover:shadow-[0_12px_32px_rgba(67,49,31,0.10)]"
    >
      {/* Date tile */}
      <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--brand-moss)] px-2 py-3 text-white">
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider opacity-80">
          {month}
        </span>
        <span className="text-2xl font-bold leading-tight">{day}</span>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 truncate text-lg font-semibold text-gray-900 transition-colors group-hover:text-[var(--brand-moss)]">
            {title}
          </h3>
          <GenderRestrictionChip value={genderRestriction} alwaysShow />
        </div>
        <p className="mt-0.5 truncate text-xs text-gray-500">
          {metaParts.join(" · ")}
        </p>
        {summary ? (
          <p className="mt-1 line-clamp-1 text-sm text-gray-600">{summary}</p>
        ) : null}
      </div>

      {/* Optional thumbnail — hidden on narrow screens */}
      {bannerImage ? (
        <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg sm:block">
          <Image src={bannerImage} alt="" fill className="object-cover" />
        </div>
      ) : null}
    </Link>
  );
}
