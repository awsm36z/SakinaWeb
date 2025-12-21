// app/(site)/home/FounderSection.tsx
import Image from "next/image";

export default function FounderSection() {
  return (
    <section className="bg-white py-20 px-6 md:px-10 lg:px-20">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* Text */}
        <div>
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
            className="rounded-xl shadow-lg object-cover"
          />
        </div>

      </div>
    </section>
  );
}
