import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getTripById, getTripInstructors, isTripInstructor } from "@/lib/trips";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";

type Props = {
    params: Promise<{ trip_id: string }>;
};

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

    return (
        <div>
            {/* Hero */}
            <section className="relative w-full">
                <div className="relative h-[75vh] md:h-[85vh] w-full overflow-hidden">
                    {trip.banner_image ? (
                        <Image
                            src={trip.banner_image}
                            alt={trip.title}
                            fill
                            sizes="100vw"
                            priority
                            className="object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-gray-200" />
                    )}
                    <div className="absolute inset-0 bg-black/35" />
                </div>

                {/* Title bubble */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-10 w-[min(90vw,44rem)] px-6">
                    <div className="bg-white rounded-2xl px-6 py-5 shadow-xl text-center">
                        <h1 className="text-3xl md:text-5xl font-bold mb-2 text-gray-900">
                            {trip.title}
                        </h1>
                        {trip.tagline ? (
                            <p className="text-base md:text-lg text-gray-700">
                                {trip.tagline}
                            </p>
                        ) : null}
                    </div>
                </div>
            </section>


            {/* Content */}
            <section className="w-full px-6 pt-28 pb-16">
                <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[1.3fr,0.7fr]">
                    <div className="space-y-10">
                    {/* Overview */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Overview
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {trip.summary ?? "Details coming soon."}
                        </p>
                    </div>

                    {/* Instructors */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
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
                                    return (
                                        <div
                                            key={`${profile?.id ?? "instructor"}-${index}`}
                                            className="flex items-center gap-4"
                                        >
                                            <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-gray-200">
                                                {profile?.avatar_url ? (
                                                    <Image
                                                        src={profile.avatar_url}
                                                        alt={name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : null}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {name || "Instructor"}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {instructor.instructor_role ??
                                                        profile?.Capacity ??
                                                        "Instructor"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                Instructor details coming soon.
                            </p>
                        )}
                    </div>

                    {/* Highlights */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Trip Highlights
                        </h2>
                        {highlights.length ? (
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                {highlights.map((h, i) => (
                                    <li key={i}>{h}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">
                                Highlights coming soon.
                            </p>
                        )}
                    </div>

                    {/* Trip Details */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Trip Details
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 text-gray-700">
                            <div className="rounded-xl bg-gray-50 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                                    Dates
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {trip.dates ?? "TBD"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-gray-50 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                                    Location
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {trip.location ?? "TBD"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-gray-50 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                                    Duration
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {trip.duration_days ?? 0} days
                                </p>
                            </div>
                            <div className="rounded-xl bg-gray-50 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                                    Difficulty
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    TBD
                                </p>
                            </div>
                            <div className="rounded-xl bg-gray-50 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                                    Status
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {trip.status ?? "closed"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-gray-50 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                                    Fee (USD)
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {trip.fee != null
                                        ? `$${trip.fee.toFixed(2)}`
                                        : "TBD"}
                                </p>
                            </div>
                        </div>

                        {isClosed ? (
                            <button
                                type="button"
                                disabled
                                className="mt-6 w-full cursor-not-allowed rounded-xl bg-gray-300 px-6 py-3 text-sm font-semibold text-gray-600"
                            >
                                Sign Up Now
                            </button>
                        ) : hasApplied ? (
                            <button
                                type="button"
                                disabled
                                className="mt-6 w-full cursor-not-allowed rounded-xl bg-gray-300 px-6 py-3 text-sm font-semibold text-gray-600"
                            >
                                Already signed up!
                            </button>
                        ) : (
                            <Link
                                href={`/application/${trip.trip_id}`}
                                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
                            >
                                Sign Up Now
                            </Link>
                        )}

                        {canEdit ? (
                            <Link
                                href={`/trips/${trip.trip_id}/edit`}
                                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                            >
                                Edit Trip
                            </Link>
                        ) : null}
                        {canViewApplications ? (
                            <Link
                                href={`/trips/${trip.trip_id}/submissions`}
                                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                            >
                                View Applications
                            </Link>
                        ) : null}
                    </div>
                    </div>

                    <div />
                </div>
            </section>

        </div>
    );
}
