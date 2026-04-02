// app/(site)/home/Hero.tsx
import Link from "next/link";

export default function Hero() {
  return (
    <section className="w-full px-6 py-24 md:px-10 lg:px-20">
      <div className="brand-panel-strong mx-auto max-w-5xl rounded-[2rem] px-8 py-16 text-center md:px-14">
        
        {/* Kicker */}
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[var(--brand-moss)]">
          Sakina Wilderness
        </p>

        {/* Main Heading */}
        <h1 className="mb-6 text-4xl font-bold leading-tight text-[var(--brand-ink)] md:text-6xl">
          Tranquility in nature, together.
        </h1>

        {/* Subheading */}
        <p className="mx-auto mb-10 max-w-3xl text-lg text-gray-700 md:text-xl">
          Muslim-led wilderness trips that connect you to the natural world
          through reflection, prayer, and adventure in the Pacific Northwest.
        </p>

        {/* Actions */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/trips"
            className="rounded-full bg-[var(--brand-moss)] px-8 py-3 text-white font-semibold transition hover:brightness-95"
          >
            Sign up for the next trip
          </Link>

          <Link
            href="/about-us"
            className="rounded-full border border-[var(--border-soft)] bg-white/60 px-8 py-3 font-semibold text-[var(--brand-moss)] transition hover:bg-white/80"
          >
            Learn what we do
          </Link>
        </div>
      </div>
    </section>
  );
}
