// app/(site)/home/FounderSection.tsx
import Image from "next/image";

export default function FounderSection() {
  return (
    <section className="px-6 py-20 md:px-10 lg:px-20">
      <div className="brand-panel mx-auto grid max-w-5xl items-center gap-12 rounded-[2rem] p-8 md:grid-cols-2 md:p-12">

        {/* Text */}
        <div>
          <p className="brand-kicker mb-4">Founder</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            About the Founder
          </h2>

          <p className="text-gray-700 leading-relaxed text-lg">
            Sakina Wilderness was founded by{" "}
            <span className="font-semibold text-gray-900">Yassine El&nbsp;Yacoubi</span>,
            a software engineer and outdoor educator based in the Pacific Northwest.
            He is passionate about helping Muslims reconnect with nature through
            reflection, community, and meaningful challenge in the backcountry.
          </p>
        </div>

        {/* Photo */}
        <div className="flex justify-center md:justify-end">
          <Image
            src="/yassine.jpg"
            alt="Yassine El Yacoubi, founder of Sakina Wilderness"
            width={320}
            height={320}
            className="rounded-[1.5rem] border border-[var(--border-soft)] object-cover shadow-lg"
          />
        </div>

      </div>
    </section>
  );
}
