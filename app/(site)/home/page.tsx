import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import aboutUs from "@/app/(data)/about_us";
import { getTrips, type TripRow } from "@/lib/trips";

export const metadata: Metadata = {
  title: "Sakina Wilderness — Tranquility in nature, together.",
  description:
    "Muslim-led wilderness trips in the Pacific Northwest. Beginner-friendly backpacking with spiritual reflection, prayer, and community.",
};

function buildFeaturedTrips(trips: TripRow[]) {
  if (trips.length) {
    return trips.slice(0, 3).map((trip, index) => ({
      id: trip.trip_id,
      title: trip.title,
      tagline: trip.tagline ?? trip.summary ?? "Details coming soon.",
      location: trip.location ?? "Pacific Northwest",
      dates: trip.dates ?? "Dates TBA",
      fee: trip.fee != null ? `$${trip.fee.toFixed(0)}` : "TBD",
      image:
        trip.banner_image ??
        ["/Adams Thumbnail.jpg", "/tripBanners/horseShoeBasin.jpeg", "/wewillbefree.JPG"][index] ??
        "/Adams Thumbnail.jpg",
      href: `/trips/${trip.trip_id}`,
    }));
  }

  return [
    {
      id: "coastal-silence",
      title: "Coastal Silence Retreat",
      tagline:
        "A meditative journey through tide pools and ancient rainforests. Perfect for beginners.",
      location: "Olympic Peninsula",
      dates: "Aug 12 - 18",
      fee: "$1,250",
      image: "/wewillbefree.JPG",
      href: "/trips",
    },
    {
      id: "high-peaks",
      title: "The High Peaks Summit",
      tagline:
        "An advanced mountaineering expedition focusing on resilience and brotherhood.",
      location: "North Cascades",
      dates: "Sept 05 - 12",
      fee: "$2,100",
      image: "/Adams Thumbnail.jpg",
      href: "/trips",
    },
    {
      id: "autumn-reflection",
      title: "Autumn Reflection Walk",
      tagline:
        "Witness the changing seasons as we explore the fire-colored valleys of the Pacific Northwest.",
      location: "Mt. Rainier Wilderness",
      dates: "Oct 20 - 24",
      fee: "$980",
      image: "/tripBanners/horseShoeBasin.jpeg",
      href: "/trips",
    },
  ];
}

export default async function HomePage() {
  const trips = await getTrips();
  const featuredTrips = buildFeaturedTrips(trips);

  return (
    <main className="font-body text-[#151c27]">
      <header className="relative flex min-h-screen items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/Adams Thumbnail.jpg"
            alt="Pacific Northwest wilderness"
            fill
            priority
            className="scale-105 object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(21,28,39,0.52)] via-[rgba(21,28,39,0.22)] to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-8">
          <div className="max-w-3xl">
            <h1 className="font-headline text-6xl leading-[0.98] text-white md:text-8xl">
              Tranquility in <span className="italic">nature</span>, together.
            </h1>
            <p className="mt-6 max-w-2xl text-xl font-light leading-relaxed text-white/90 md:text-2xl">
              Bespoke Muslim-led wilderness expeditions designed to cultivate
              spiritual presence and communal connection in the Pacific
              Northwest&apos;s most restorative landscapes.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/trips"
                className="group inline-flex items-center gap-2 rounded-xl bg-[rgba(255,251,245,0.88)] px-8 py-4 text-lg font-semibold text-[#1f5027] shadow-xl transition-all duration-300 hover:bg-white"
              >
                Explore Expeditions
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/about-us"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-lg font-medium text-white backdrop-blur-md transition-all hover:bg-white/20"
              >
                Our Vision
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce text-4xl text-white/60">
          ↓
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-8 py-32">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div className="order-2 lg:order-1 lg:col-span-5">
            <div className="relative">
              <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-[rgba(185,87,88,0.08)] blur-3xl" />
              <span className="font-inter mb-6 block text-sm uppercase tracking-[0.2em] text-[#9a3f41]">
                The Essence of Sakina
              </span>
              <h2 className="font-headline text-4xl leading-snug text-[#151c27] md:text-5xl">
                A Sanctuary Beyond the{" "}
                <span className="italic text-[var(--brand-moss)]">Noise of Life</span>.
              </h2>
              <div className="mt-8 space-y-6 text-lg leading-relaxed text-[#414940]">
                <p>
                  Derived from the Arabic word for deep tranquility, Sakina
                  Wilderness was founded on the belief that the natural world is
                  a sacred mirror, reflecting divine beauty, peace, and order.
                </p>
                <p>
                  {aboutUs.what_makes_us_unique.approach}
                </p>
              </div>
              <Link
                href="/about-us"
                className="mt-10 inline-flex items-center gap-4 font-semibold text-[var(--brand-moss)] transition-all hover:gap-6"
              >
                Learn about our values
                <span>→</span>
              </Link>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-7">
            <div className="relative flex justify-end">
              <div className="w-4/5 rotate-2 overflow-hidden rounded-[1.5rem] shadow-2xl transition-transform duration-700 hover:rotate-0">
                <Image
                  src="/wewillbefree.JPG"
                  alt="Hikers reflecting by a mountain lake"
                  width={960}
                  height={1200}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-12 -left-8 hidden w-1/2 -rotate-6 overflow-hidden rounded-[1.5rem] border-8 border-white shadow-xl md:block">
                <Image
                  src="/tripBanners/horseShoeBasin.jpeg"
                  alt="Macro forest detail"
                  width={640}
                  height={640}
                  className="aspect-square w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[rgba(231,238,254,0.62)] px-8 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-headline text-4xl italic text-[#151c27] md:text-5xl">
                Upcoming Journeys
              </h2>
              <p className="mt-4 text-lg text-[#414940]">
                Curated paths for every level of experience, from coastal
                wanderings to high-altitude summits.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/trips"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(114,121,111,0.28)] transition-colors hover:bg-[rgba(79,129,82,0.18)]"
              >
                ←
              </Link>
              <Link
                href="/trips"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(114,121,111,0.28)] transition-colors hover:bg-[rgba(79,129,82,0.18)]"
              >
                →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {featuredTrips.map((trip) => (
              <Link
                key={trip.id}
                href={trip.href}
                className="group overflow-hidden rounded-xl border border-[rgba(114,121,111,0.08)] bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={trip.image}
                    alt={trip.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--brand-moss)] backdrop-blur">
                    {trip.dates}
                  </div>
                </div>
                <div className="p-8">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-sm text-[#9a3f41]">◆</span>
                    <span className="font-inter text-xs uppercase tracking-[0.2em] text-[#414940]">
                      {trip.location}
                    </span>
                  </div>
                  <h3 className="font-headline text-2xl text-[#151c27] transition-colors group-hover:text-[var(--brand-moss)]">
                    {trip.title}
                  </h3>
                  <p className="mt-4 leading-relaxed text-[#414940]">
                    {trip.tagline}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-[rgba(114,121,111,0.18)] pt-6">
                    <span className="text-xl font-bold text-[#151c27]">
                      {trip.fee}{" "}
                      <span className="text-sm font-normal text-[#414940]">
                        / person
                      </span>
                    </span>
                    <span className="text-[var(--brand-moss)] transition-transform group-hover:translate-x-2">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-24 bg-[rgba(244,239,230,0.92)] px-8 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-3">
          <div className="flex flex-col gap-6">
            <div className="font-headline text-xl text-[var(--brand-moss)]">
              Sakina Wilderness
            </div>
            <p className="max-w-xs text-sm leading-relaxed tracking-wide text-[#6d665b]">
              Crafting immersive spiritual expeditions in the heart of the
              wild. Follow our journey into the quiet places.
            </p>
            <div className="flex gap-4 text-[var(--brand-moss)]">
              <Link href="/media" className="transition-opacity hover:opacity-70">
                Stories
              </Link>
              <Link href="/about-us" className="transition-opacity hover:opacity-70">
                About
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-moss)]">
                Explore
              </h5>
              <Link href="/trips" className="text-sm text-[#6d665b] transition-colors hover:text-[var(--brand-moss)]">
                Expeditions
              </Link>
              <Link href="/about-us" className="text-sm text-[#6d665b] transition-colors hover:text-[var(--brand-moss)]">
                Philosophy
              </Link>
              <Link href="/media" className="text-sm text-[#6d665b] transition-colors hover:text-[var(--brand-moss)]">
                Stories
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-moss)]">
                Company
              </h5>
              <Link href="/signup" className="text-sm text-[#6d665b] transition-colors hover:text-[var(--brand-moss)]">
                Join Sakina
              </Link>
              <Link href="/login" className="text-sm text-[#6d665b] transition-colors hover:text-[var(--brand-moss)]">
                Log in
              </Link>
              <Link href="/account" className="text-sm text-[#6d665b] transition-colors hover:text-[var(--brand-moss)]">
                Account
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-moss)]">
              Newsletter
            </h5>
            <p className="text-sm text-[#6d665b]">
              Join our list for seasonal dispatch and expedition announcements.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="w-full rounded-lg bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--brand-moss)]"
              />
              <button
                type="button"
                className="rounded-lg bg-[var(--brand-moss)] px-4 py-2 text-white transition-colors hover:bg-[#285345]"
              >
                →
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-6 border-t border-[rgba(114,121,111,0.22)] pt-16 md:flex-row">
          <div className="text-sm tracking-wide text-[#6d665b]">
            © 2026 Sakina Wilderness. Crafted for the modern naturalist.
          </div>
          <div className="flex gap-8">
            <Link href="/about-us" className="text-xs text-[#6d665b] transition-colors hover:text-[var(--brand-moss)]">
              FAQ
            </Link>
            <Link href="/signup" className="text-xs text-[#6d665b] transition-colors hover:text-[var(--brand-moss)]">
              Join Us
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
