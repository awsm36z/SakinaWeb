import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getTripById, getTripInstructors, isTripInstructor } from "@/lib/trips";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";

type Props = {
  params: Promise<{ trip_id: string }>;
};

const fallbackLandmarks = [
  {
    title: "The Altar of Granite",
    description:
      "A natural cathedral of stone designated for dawn reflection and quiet prayer as the first light reaches the ridge.",
    station: "Overview",
    icon: "terrain",
  },
  {
    title: "Whispering Pines",
    description:
      "The grove where the group settles into stillness, journaling, and shared conversation beneath the canopy.",
    station: "Featured",
    icon: "landscape",
  },
  {
    title: "The Still Waters",
    description:
      "A protected stretch of water and meadow used for evening reflection, recovery, and communal grounding.",
    station: "Details",
    icon: "waves",
  },
];

function formatMoney(value: number | null) {
  if (value == null) return "Fee TBA";
  return `$${value.toFixed(2)}`;
}

function formatStatus(status: string | null) {
  if (!status) return "Closed";
  if (status === "waitlist") return "Join Waitlist";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusPill(status: string | null) {
  if (status === "open") {
    return "bg-[rgba(47,93,80,0.12)] text-[var(--brand-moss)]";
  }

  if (status === "waitlist") {
    return "bg-[rgba(184,138,82,0.14)] text-[#8a6439]";
  }

  return "bg-[rgba(92,102,112,0.12)] text-[#5c6670]";
}

export default async function TripDetailPage({ params }: Props) {
  const { trip_id: tripId } = await params;
  const trip = await getTripById(tripId);
  const instructors = await getTripInstructors(tripId);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? "";
  const { data: existingApplication } = userId
    ? await supabase
        .from("trip_applications")
        .select("form_id")
        .eq("trip_id", tripId)
        .eq("camper_id", userId)
        .maybeSingle()
    : { data: null };
  const canEdit = await isAdmin();
  const canViewApplications =
    canEdit || (userId ? await isTripInstructor(tripId, userId) : false);

  if (!trip) notFound();

  const highlights = trip.highlights ?? [];
  const isClosed = trip.status?.toLowerCase() === "closed";
  const hasApplied = Boolean(existingApplication);
  const heroImage = trip.banner_image || "/Adams Thumbnail.jpg";
  const landmarkCards = [
    {
      title: trip.location ?? fallbackLandmarks[0].title,
      description: trip.summary ?? fallbackLandmarks[0].description,
      station: fallbackLandmarks[0].station,
      icon: fallbackLandmarks[0].icon,
    },
    {
      title: trip.title,
      description:
        trip.tagline ??
        "A featured wilderness passage designed to create space for challenge, silence, and reflection.",
      station: fallbackLandmarks[1].station,
      icon: fallbackLandmarks[1].icon,
    },
    {
      title:
        trip.duration_days != null
          ? `${trip.duration_days}-Day Rhythm`
          : fallbackLandmarks[2].title,
      description: highlights[0] ?? fallbackLandmarks[2].description,
      station: fallbackLandmarks[2].station,
      icon: "route",
    },
  ];

  const itineraryRows = [
    {
      number: "01",
      label: "Arrival",
      title: "Basecamp Gathering",
      description:
        trip.summary ??
        "Arrival, orientation, and community setup with a focus on safety, pace, and shared intention.",
      tags: [trip.location ?? "Basecamp", trip.dates ?? "Dates TBA"],
    },
    {
      number: "02",
      label: "The Ascent",
      title: "Crossing the Threshold",
      description:
        highlights[0] ??
        "The main movement of the trip, where the group enters the landscape more fully and settles into the expedition rhythm.",
      tags: [
        trip.duration_days != null ? `${trip.duration_days} days` : "Duration TBA",
        formatStatus(trip.status ?? null),
      ],
    },
    {
      number: "03",
      label: "Return",
      title: "Coming Back with New Eyes",
      description:
        highlights[1] ??
        "The descent and integration phase, carrying the experience back into everyday life with clarity and gratitude.",
      tags: [formatMoney(trip.fee), `${trip.spots_left ?? 0} spots left`],
    },
  ];

  return (
    <main className="font-body text-[var(--brand-ink)]">
      <header className="relative flex h-screen w-full items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt={trip.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,28,24,0.28)_0%,rgba(18,28,24,0.2)_24%,rgba(245,241,232,0)_55%,rgba(245,241,232,0.92)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(32,54,46,0.08),rgba(32,54,46,0.36)_58%,rgba(18,28,24,0.5)_100%)] mix-blend-multiply" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(108,84,52,0.22),rgba(35,55,49,0.12)_48%,rgba(16,24,21,0.4))]" />
        </div>

        <div className="relative z-10 max-w-4xl px-6 text-center">
          <span className="font-inter mb-4 block text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(255,248,236,0.9)]">
            {trip.dates ?? "Dates TBA"}
          </span>
          <h1 className="font-headline text-6xl leading-[1.05] text-[#fffaf0] drop-shadow-[0_18px_42px_rgba(16,24,21,0.45)] md:text-8xl">
            {trip.title}
          </h1>
          <p className="font-headline mx-auto mt-6 max-w-2xl text-xl italic leading-relaxed text-[rgba(255,244,228,0.88)] drop-shadow-[0_10px_26px_rgba(16,24,21,0.3)] md:text-2xl">
            {trip.tagline ??
              "A transformative journey into the silent heart of the wilderness, where challenge and reflection move together."}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusPill(
                trip.status ?? null
              )} shadow-[0_10px_30px_rgba(16,24,21,0.16)]`}
            >
              {formatStatus(trip.status ?? null)}
            </span>
            <span className="rounded-full bg-white/18 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(255,244,228,0.9)] backdrop-blur-md shadow-[0_10px_30px_rgba(16,24,21,0.14)]">
              {trip.location ?? "Location TBA"}
            </span>
            <span className="rounded-full bg-white/18 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(255,244,228,0.9)] backdrop-blur-md shadow-[0_10px_30px_rgba(16,24,21,0.14)]">
              {trip.duration_days != null ? `${trip.duration_days} days` : "Duration TBA"}
            </span>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <span className="material-symbols-outlined text-4xl">expand_more</span>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-8 py-24 md:grid-cols-12">
        <div className="md:col-span-7">
          <span className="font-inter mb-6 block text-xs font-semibold uppercase tracking-[0.24em] text-[#9a3f41]">
            Expedition Overview
          </span>
          <h2 className="font-headline mb-8 text-4xl leading-tight text-[var(--brand-moss)] md:text-5xl">
            Beyond the trail, this trip creates space for presence.
          </h2>
          <div className="space-y-6 text-lg leading-relaxed text-[#5f625b]">
            <p>
              {trip.summary ??
                "This expedition is designed to move beyond logistics and into a more attentive, intentional experience of the outdoors."}
            </p>
            <p>
              {highlights[0] ??
                "Guided by experienced leaders, the route balances physical effort with stillness, conversation, and the kind of shared rhythm that makes a trip memorable."}
            </p>
          </div>
        </div>

        <div className="relative md:col-span-5">
          <div className="aspect-[4/5] overflow-hidden rounded-xl shadow-xl md:translate-y-12">
            <Image
              src={heroImage}
              alt={`${trip.title} preview`}
              width={720}
              height={900}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden max-w-[220px] rounded-xl bg-white p-6 shadow-lg md:block">
            <p className="font-headline text-sm italic text-[var(--brand-moss)]">
              &ldquo;Each trip should leave you with clearer sight, steadier
              footing, and a quieter heart.&rdquo;
            </p>
          </div>
        </div>
      </section>

      <section className="bg-stone-100/50 py-24">
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-16">
            <span className="font-inter mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-[#9a3f41]">
              Inner Compass
            </span>
            <h2 className="font-headline text-4xl text-[var(--brand-moss)]">
              Trip Landmarks
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {landmarkCards.map((card, index) =>
              index === 1 ? (
                <div
                  key={card.title}
                  className="group relative overflow-hidden rounded-xl md:row-span-2"
                >
                  <Image
                    src={heroImage}
                    alt={trip.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[rgba(47,79,63,0.82)] to-transparent p-8">
                    <div className="text-white">
                      <h3 className="font-headline mb-2 text-3xl italic">
                        {card.title}
                      </h3>
                      <p className="text-sm text-stone-200">{card.description}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={card.title}
                  className="flex h-[400px] flex-col justify-between rounded-xl border border-[rgba(193,201,189,0.25)] bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div>
                    <span className="material-symbols-outlined mb-6 text-4xl text-[var(--brand-moss)]">
                      {card.icon}
                    </span>
                    <h3 className="font-headline mb-4 text-2xl text-[var(--brand-moss)]">
                      {card.title}
                    </h3>
                    <p className="leading-relaxed text-[#5f625b]">
                      {card.description}
                    </p>
                  </div>
                  <div className="font-inter text-xs uppercase tracking-[0.2em] text-[#8b8f88]">
                    {card.station}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-8 py-24">
        <h2 className="font-headline mb-16 text-center text-4xl text-[var(--brand-moss)]">
          Trip Details
        </h2>
        <div className="space-y-16">
          {itineraryRows.map((row, index) => (
            <div
              key={row.number}
              className="relative flex flex-col gap-8 md:flex-row md:gap-24"
            >
              <div className="md:w-1/4">
                <span className="font-headline text-6xl text-[rgba(47,79,63,0.18)]">
                  {row.number}
                </span>
                <h4 className="font-inter mt-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8b8f88]">
                  {row.label}
                </h4>
              </div>
              <div
                className={`md:w-3/4 ${index < itineraryRows.length - 1 ? "border-b border-stone-200 pb-8" : ""}`}
              >
                <h3 className="font-headline mb-4 text-2xl text-[var(--brand-moss)]">
                  {row.title}
                </h3>
                <p className="mb-6 leading-relaxed text-[#5f625b]">
                  {row.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  {row.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[rgba(240,243,255,0.9)] px-4 py-1 text-xs uppercase tracking-[0.16em] text-[var(--brand-moss)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-8 pb-20 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-8">
          <div className="rounded-[1.5rem] bg-[rgba(240,243,255,0.72)] p-8">
            <h2 className="font-headline mb-6 text-3xl text-[var(--brand-moss)]">
              Instructors
            </h2>
            {instructors.length ? (
              <div className="space-y-5">
                {instructors.map((instructor, index) => {
                  const profile = instructor.profile;
                  const name = profile
                    ? [profile.name_first, profile.name_last]
                        .filter(Boolean)
                        .join(" ")
                    : "Instructor";

                  const content = (
                    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md">
                      <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-[rgba(216,198,165,0.38)]">
                        {profile?.avatar_url ? (
                          <Image
                            src={profile.avatar_url}
                            alt={name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[var(--brand-moss)]">
                            <span className="material-symbols-outlined text-3xl">
                              person
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--brand-ink)]">
                          {name || "Instructor"}
                        </p>
                        <p className="text-sm text-[#5f625b]">
                          {instructor.instructor_role ??
                            profile?.Capacity ??
                            "Instructor"}
                        </p>
                      </div>
                    </div>
                  );

                  return profile?.id ? (
                    <Link
                      key={`${profile.id}-${index}`}
                      href={`/account/${profile.id}`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={`${name}-${index}`}>{content}</div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[#5f625b]">
                Instructor details coming soon.
              </p>
            )}
          </div>

          <div className="rounded-[1.5rem] bg-white p-8 shadow-sm">
            <h2 className="font-headline mb-6 text-3xl text-[var(--brand-moss)]">
              Highlights
            </h2>
            {highlights.length ? (
              <ul className="space-y-3 text-[#5f625b]">
                {highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3">
                    <span className="mt-1 text-[var(--brand-moss)]">◆</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#5f625b]">Highlights coming soon.</p>
            )}
          </div>
        </div>

        <aside className="space-y-8">
          <div className="rounded-[1.5rem] bg-[rgba(240,243,255,0.82)] p-8">
            <h2 className="font-headline mb-8 text-3xl text-[var(--brand-moss)]">
              Expedition Facts
            </h2>
            <div className="grid gap-4 text-sm text-[#5f625b]">
              {[
                ["Dates", trip.dates ?? "TBD"],
                ["Location", trip.location ?? "TBD"],
                [
                  "Duration",
                  trip.duration_days != null ? `${trip.duration_days} days` : "TBD",
                ],
                ["Status", formatStatus(trip.status ?? null)],
                ["Fee", formatMoney(trip.fee)],
                ["Spots Left", String(trip.spots_left ?? 0)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-white px-4 py-3">
                  <p className="font-inter text-[11px] uppercase tracking-[0.2em] text-[var(--brand-moss)]">
                    {label}
                  </p>
                  <p className="mt-1 font-medium text-[var(--brand-ink)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] bg-[var(--brand-moss)] px-6 py-12 md:px-8">
            <div className="absolute inset-0 opacity-20">
              <Image
                src={heroImage}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
            <div className="relative z-10">
              <h2 className="font-headline text-4xl text-white">
                Ready for this trip?
              </h2>
              <p className="mt-4 text-lg text-emerald-100/80">
                {trip.spots_left ?? 0} spots remain for this expedition.
              </p>
              <div className="mt-8 space-y-3">
                {isClosed ? (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-full bg-white/30 px-8 py-4 text-lg font-bold text-white"
                  >
                    Sign Up Closed
                  </button>
                ) : hasApplied ? (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-full bg-white/30 px-8 py-4 text-lg font-bold text-white"
                  >
                    Already signed up
                  </button>
                ) : (
                  <Link
                    href={`/application/${trip.trip_id}`}
                    className="inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-bold text-[var(--brand-moss)] transition-transform hover:scale-[1.02]"
                  >
                    Book Your Spot
                    {trip.fee != null ? ` — ${formatMoney(trip.fee)}` : ""}
                  </Link>
                )}

                {canEdit ? (
                  <Link
                    href={`/trips/${trip.trip_id}/edit`}
                    className="inline-flex w-full items-center justify-center rounded-full border border-white/30 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Edit Trip
                  </Link>
                ) : null}
                {canViewApplications ? (
                  <Link
                    href={`/trips/${trip.trip_id}/submissions`}
                    className="inline-flex w-full items-center justify-center rounded-full border border-white/30 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    View Applications
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
