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
            <section className="relative h-[20vh] overflow-visible">
                <div className="max-w-screen-2xl mx-auto px-6 h-full relative overflow-visible">
                    <div className="w-[70%] mx-auto relative rounded-2xl overflow-visible h-full">
                        <Image
                            src={trip.bannerImage}
                            alt={trip.title}
                            width={1920}
                            height={1080}
                            sizes="70vw"
                            priority
                            className="w-full h-full object-cover rounded-2xl"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-2xl" />

                        {/* Title card */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-full z-10">
                            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                                <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">
                                    {trip.title}
                                </h1>
                                <p className="text-lg text-gray-700">
                                    {trip.tagline}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Content */}
            <section className="w-full px-6 pt-24 pb-16">
                <div className="max-w-4xl mx-auto space-y-12">
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

                    {/* Safety */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Safety & Leadership</h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            {trip.safety.map((s, i) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Trip Details */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Trip Details</h2>
                        <div className="text-gray-700 space-y-2">
                            <p><strong>Dates:</strong> {trip.dates}</p>
                            <p><strong>Location:</strong> {trip.location}</p>
                            <p><strong>Duration:</strong> {trip.durationDays} days</p>
                            <p><strong>Difficulty:</strong> {trip.difficulty}</p>
                            <p><strong>Status:</strong> {trip.status}</p>
                        </div>
                    </div>

                    <Link
                        href="/signup"
                        className="inline-block px-6 py-3 rounded-xl font-semibold bg-green-700 text-white hover:bg-green-800 transition"
                    >
                        Sign Up Now
                    </Link>
                </div>
            </section>

        </div>
    );
}
