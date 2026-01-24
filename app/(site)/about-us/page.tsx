import Image from "next/image";
import Link from "next/link";
import aboutUs from "@/app/(data)/about_us";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "About Us — Sakina Wilderness",
  description:
    "Learn about Sakina Wilderness, our experience, safety training, and the founder behind the trips.",
};

export default async function AboutUsPage() {
  const {
    organization,
    experience,
    safety_and_training,
    founder,
    what_makes_us_unique,
    target_audience,
    participant_expectations,
  } = aboutUs;

  const supabase = await createClient();
  const { data: founderProfile } = founder.founder_id
    ? await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", founder.founder_id)
        .maybeSingle()
    : { data: null };

  return (
    <main className="min-h-screen bg-gray-50 px-6 md:px-10 lg:px-20 py-12">
      <div className="mx-auto max-w-5xl space-y-12">
        <header className="text-center space-y-4">
          <p className="text-xs font-semibold tracking-[0.3em] text-green-700 uppercase">
            About Us
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
            {organization.name}
          </h1>
          <p className="text-lg text-gray-600">{organization.tagline}</p>
          <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">
            {organization.description}
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              The Experience
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {experience.vibe}
            </p>
            <p className="text-gray-700 leading-relaxed">{experience.type}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Safety & Training
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {safety_and_training.wilderness_safety}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {safety_and_training.spiritual_guidance}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Founder
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              {founderProfile?.avatar_url ? (
                <Image
                  src={founderProfile.avatar_url}
                  alt={founder.name}
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {founder.name}
            </p>
          </div>
          <p className="mt-3 text-gray-700 leading-relaxed">{founder.bio}</p>
          <p className="mt-4 text-gray-700 leading-relaxed">{founder.vision}</p>
          {founder.founder_id ? (
            <Link
              href={`/account/${founder.founder_id}`}
              className="mt-5 inline-flex items-center text-sm font-semibold text-green-700 hover:text-green-800"
            >
              View founder profile
            </Link>
          ) : null}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              What makes us unique?
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              {what_makes_us_unique.core_difference}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {what_makes_us_unique.approach}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Who is it for?
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              {target_audience.primary}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {target_audience.general}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              FAQ
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {participant_expectations.ease_and_support}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
