import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripById } from "@/lib/trips";
import { isAdmin } from "@/lib/roles";

type Props = {
  params: Promise<{ event_id: string }>;
};

export default async function DayEventDetailPage({ params }: Props) {
  const { event_id: eventId } = await params;
  const event = await getTripById(eventId);
  const canEdit = await isAdmin();

  if (!event || event.trip_type !== "day_event") {
    notFound();
  }

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/day-events" className="brand-link text-sm">
            ← All day events
          </Link>
        </div>

        <article className="brand-panel overflow-hidden rounded-2xl">
          <div className="relative h-64 w-full sm:h-80">
            <Image
              src={event.banner_image || "/default-trip-banner.jpg"}
              alt={event.title ?? "Day event banner"}
              fill
              className="object-cover"
              priority
            />
            <span className="absolute top-4 left-4 rounded-full bg-[rgba(184,138,82,0.2)] px-3 py-1 text-xs font-semibold text-[#8a6439]">
              Day Event
            </span>
          </div>

          <div className="p-8">
            <p className="brand-kicker">Day Event</p>
            <h1 className="mt-2 text-4xl font-bold text-gray-900">
              {event.title}
            </h1>
            {event.tagline ? (
              <p className="mt-3 text-lg italic text-gray-600">
                {event.tagline}
              </p>
            ) : null}

            <div className="mt-6 grid gap-4 text-sm text-gray-700 sm:grid-cols-2">
              <div className="brand-subtle-block rounded-xl px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-moss)]">
                  When
                </p>
                <p className="mt-1">{event.dates ?? "TBD"}</p>
              </div>
              <div className="brand-subtle-block rounded-xl px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-moss)]">
                  Where
                </p>
                <p className="mt-1">{event.location ?? "TBD"}</p>
              </div>
              <div className="brand-subtle-block rounded-xl px-4 py-3 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-moss)]">
                  Cost
                </p>
                <p className="mt-1">
                  Free to attend · optional donation of $5–$10 appreciated to
                  help cover costs.
                </p>
              </div>
            </div>

            {event.summary ? (
              <section className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">About</h2>
                <p className="mt-3 whitespace-pre-line text-gray-700">
                  {event.summary}
                </p>
              </section>
            ) : null}

            {event.highlights && event.highlights.length > 0 ? (
              <section className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">
                  Highlights
                </h2>
                <ul className="mt-3 list-disc space-y-1 pl-6 text-gray-700">
                  {event.highlights.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {canEdit ? (
              <div className="mt-10 flex items-center gap-4">
                <Link
                  href={`/trips/${event.trip_id}/edit`}
                  className="brand-button-secondary rounded-xl px-5 py-2 text-sm"
                >
                  Edit event
                </Link>
              </div>
            ) : null}
          </div>
        </article>
      </div>
    </main>
  );
}
