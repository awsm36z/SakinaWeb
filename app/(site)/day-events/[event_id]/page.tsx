import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripById } from "@/lib/trips";
import { isAdmin } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import DayEventRsvpCta from "@/app/components/dayeventcard/rsvp-cta";

type Props = {
  params: Promise<{ event_id: string }>;
  searchParams: Promise<{ rsvp?: string }>;
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

export default async function DayEventDetailPage({
  params,
  searchParams,
}: Props) {
  const { event_id: eventId } = await params;
  const { rsvp } = await searchParams;
  const event = await getTripById(eventId);
  const canEdit = await isAdmin();

  if (!event || event.trip_type !== "day_event") {
    notFound();
  }

  const { month, day } = formatDateTile(event.start_date);
  const showRsvpSuccess = rsvp === "success";

  // Mirror the overnight trip page: for signed-in users, look up whether they
  // already have a trip_applications row for this event. Guests are handled
  // client-side via a localStorage flag set after a successful RSVP.
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? "";
  const { data: existingApplication } = userId
    ? await supabase
        .from("trip_applications")
        .select("form_id")
        .eq("trip_id", event.trip_id)
        .eq("camper_id", userId)
        .maybeSingle()
    : { data: null };
  const hasAppliedAuth = Boolean(existingApplication);

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4">
          <Link href="/day-events" className="brand-link text-sm">
            ← All day events
          </Link>
        </div>

        {showRsvpSuccess ? (
          <div className="mb-4 rounded-2xl border border-[rgba(47,93,80,0.24)] bg-[rgba(47,93,80,0.08)] px-4 py-3 text-sm text-[var(--brand-moss)]">
            You&apos;re registered! We sent a confirmation to your email — see
            you there.
          </div>
        ) : null}

        <article className="brand-panel rounded-2xl p-6 md:p-8">
          {/* Header — date tile + title side by side */}
          <div className="flex items-start gap-5">
            <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--brand-moss)] px-2 py-3 text-white">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider opacity-80">
                {month}
              </span>
              <span className="text-2xl font-bold leading-tight">{day}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="brand-kicker">Day Event</p>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900">
                {event.title}
              </h1>
              {event.tagline ? (
                <p className="mt-1 text-sm italic text-gray-600">
                  {event.tagline}
                </p>
              ) : null}
            </div>
          </div>

          {/* Inline meta row */}
          <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
            <span>{event.dates ?? "TBD"}</span>
            <span className="text-gray-300">·</span>
            <span>{event.location ?? "TBD"}</span>
            <span className="text-gray-300">·</span>
            <span className="font-medium text-[var(--brand-moss)]">
              Free · optional donation ($5–$10)
            </span>
          </div>

          {/* Slim banner strip (only if an image exists) */}
          {event.banner_image ? (
            <div className="relative mt-5 h-40 w-full overflow-hidden rounded-xl sm:h-48">
              <Image
                src={event.banner_image}
                alt={event.title ?? "Day event banner"}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : null}

          {event.summary ? (
            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {event.summary}
            </p>
          ) : null}

          {event.highlights && event.highlights.length > 0 ? (
            <ul className="mt-5 grid gap-1.5 text-sm text-gray-700 sm:grid-cols-2">
              {event.highlights.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex items-start gap-2"
                >
                  <span className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-moss)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <DayEventRsvpCta
              tripId={event.trip_id}
              hasAppliedAuth={hasAppliedAuth}
            />
            {canEdit ? (
              <Link
                href={`/trips/${event.trip_id}/edit`}
                className="brand-button-secondary rounded-xl px-5 py-2 text-sm"
              >
                Edit event
              </Link>
            ) : null}
          </div>
        </article>
      </div>
    </main>
  );
}
