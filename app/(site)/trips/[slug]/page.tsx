import { notFound } from "next/navigation";
import tripsData from "@/app/(data)/trips.json";
import type { Trip } from "@/app/types/trip";
import Image from "next/image";
import Link from "next/link";

const trips = tripsData as Trip[];

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function TripDetailPage({ params }: Props) {
    const { slug } = await params;
    const trip = trips.find((t) => t.slug === slug);

    if (!trip) notFound();

    return (
        <div>
            {/* Hero */}
            <section className="relative w-full">
                <div className="relative h-[75vh] md:h-[85vh] w-full overflow-hidden">
                    <Image
                        src={trip.bannerImage}
                        alt={trip.title}
                        fill
                        sizes="100vw"
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/35" />
                </div>

                {/* Title bubble */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-10 w-[min(90vw,44rem)] px-6">
                    <div className="bg-white rounded-2xl px-6 py-5 shadow-xl text-center">
                        <h1 className="text-3xl md:text-5xl font-bold mb-2 text-gray-900">
                            {trip.title}
                        </h1>
                        <p className="text-base md:text-lg text-gray-700">
                            {trip.tagline}
                        </p>
                    </div>
                </div>
            </section>


            {/* Content */}
            <section className="w-full px-6 pt-28 pb-16">
                <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
                    <div className="space-y-10">
                    {/* Overview */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Overview
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {trip.summary}
                        </p>
                    </div>

                    {/* Highlights */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Trip Highlights
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            {trip.highlights.map((h, i) => (
                                <li key={i}>{h}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Safety */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Safety & Leadership
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            {trip.safety.map((s, i) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ul>
                    </div>
                    </div>

                    {/* Sticky Trip Details */}
                    <aside className="lg:sticky lg:top-28 h-fit">
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                Trip Details
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 text-gray-700">
                                <div className="rounded-xl bg-gray-50 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                                        Dates
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                        {trip.dates}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-gray-50 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                                        Location
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                        {trip.location}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-gray-50 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                                        Duration
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                        {trip.durationDays} days
                                    </p>
                                </div>
                                <div className="rounded-xl bg-gray-50 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                                        Difficulty
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                        {trip.difficulty}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-gray-50 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                                        Status
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                        {trip.status}
                                    </p>
                                </div>
                            </div>

                            {trip.status.toLowerCase() === "closed" ? (
                                <button
                                    type="button"
                                    disabled
                                    className="mt-6 w-full cursor-not-allowed rounded-xl bg-gray-300 px-6 py-3 text-sm font-semibold text-gray-600"
                                >
                                    Sign Up Now
                                </button>
                            ) : (
                                <Link
                                    href="/signup"
                                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
                                >
                                    Sign Up Now
                                </Link>
                            )}
                        </div>
                    </aside>
                </div>
            </section>

        </div>
    );
}
