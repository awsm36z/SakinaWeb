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
            <section className="relative h-[60vh] w-full">
                <Image
                    src={trip.bannerImage}
                    alt={trip.title}
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex items-end">
                    <div className="max-w-screen-2xl mx-auto px-6 pb-12 text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            {trip.title}
                        </h1>
                        <p className="text-lg max-w-2xl">
                            {trip.tagline}
                        </p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="w-full px-6 py-16">
                <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Main content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Overview */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Overview</h2>
                            <p className="text-gray-700 leading-relaxed">
                                {trip.summary}
                            </p>
                        </div>

                        {/* Highlights */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Trip Highlights</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                {trip.highlights.map((h, i) => (
                                    <li key={i}>{h}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Stargazing */}
                        {trip.stargazing && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">
                                    {trip.stargazing.title}
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    {trip.stargazing.description}
                                </p>
                            </div>
                        )}

                        {/* Daily Rhythm */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Daily Rhythm</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                {trip.dailyRhythm.map((d, i) => (
                                    <li key={i}>{d}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Who it's for */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Who This Trip Is For</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                {trip.whoItsFor.map((w, i) => (
                                    <li key={i}>{w}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Safety */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Safety & Leadership</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                {trip.safety.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right: Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-28 bg-gray-50 rounded-2xl p-6 shadow-sm space-y-4">
                            <h3 className="text-xl font-bold">Trip Details</h3>

                            <div className="text-sm text-gray-700 space-y-2">
                                <p><strong>Dates:</strong> {trip.dates}</p>
                                <p><strong>Location:</strong> {trip.location}</p>
                                <p><strong>Duration:</strong> {trip.durationDays} days</p>
                                <p><strong>Difficulty:</strong> {trip.difficulty}</p>
                                <p><strong>Status:</strong> {trip.status}</p>
                            </div>

                            <Link
                                href="/signup"
                                className="block w-full text-center mt-4 px-4 py-3 rounded-xl font-semibold bg-green-700 text-white hover:bg-green-800 transition"
                            >
                                {trip.status === "open"
                                    ? "Apply Now"
                                    : trip.status === "waitlist"
                                        ? "Join Waitlist"
                                        : "Get Updates"}
                            </Link>
                        </div>
                    </aside>
                </div>
            </section>

        </div>
    );
}
