// app/(site)/home/Hero.tsx
import Link from "next/link";

export default function Hero() {
  return (
    <section className="w-full bg-gradient-to-b from-white to-gray-50 py-24 px-6 md:px-10 lg:px-20">
      <div className="max-w-3xl mx-auto text-center">
        
        {/* Kicker */}
        <p className="text-green-700 font-semibold tracking-wide uppercase mb-3">
          Sakina Wilderness
        </p>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900 mb-6">
          Tranquility in nature, together.
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-gray-600 mb-10">
          Muslim-led wilderness trips that connect you to the natural world
          through reflection, prayer, and adventure in the Pacific Northwest.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/trips"
            className="px-8 py-3 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition"
          >
            Sign up for the next trip
          </Link>

          <Link
            href="/about-us"
            className="px-8 py-3 rounded-lg border border-green-700 text-green-700 font-semibold hover:bg-green-50 transition"
          >
            Learn what we do
          </Link>
        </div>
      </div>
    </section>
  );
}
