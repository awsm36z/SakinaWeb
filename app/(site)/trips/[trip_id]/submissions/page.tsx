import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";
import { getTripApplications, isTripInstructor } from "@/lib/trips";

type Props = {
  params: Promise<{ trip_id: string }>;
};

export default async function TripSubmissionsIndexPage({ params }: Props) {
  const { trip_id: tripId } = await params;
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login");
  }

  const canView =
    (await isAdmin(authData.user.id)) ||
    (await isTripInstructor(tripId, authData.user.id));

  if (!canView) {
    redirect(`/trips/${tripId}`);
  }

  const applications = await getTripApplications(tripId);
  const camperIds = Array.from(
    new Set(applications.map((application) => application.camper_id))
  );
  const { data: camperProfiles } = await supabase
    .from("profiles")
    .select("id, name_first, name_last")
    .in("id", camperIds);
  const camperNameById = new Map(
    (camperProfiles ?? []).map((profile) => [
      profile.id,
      [profile.name_first, profile.name_last].filter(Boolean).join(" ") ||
        profile.id,
    ])
  );

  return (
    <main className="min-h-screen bg-gray-50 px-6 md:px-10 lg:px-20 py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="text-xs font-semibold tracking-[0.3em] text-green-700">
            APPLICATIONS
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
            Trip Submissions
          </h1>
          <p className="mt-2 text-gray-600">
            Select a submission to review details.
          </p>
        </header>

        {applications.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {applications.map((application) => (
              <Link
                key={application.form_id}
                href={`/trips/${tripId}/submissions/${application.form_id}`}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {camperNameById.get(application.camper_id) ??
                        application.camper_id}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Submitted {new Date(application.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {application.paid ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
            No applications submitted yet.
          </div>
        )}
      </div>
    </main>
  );
}
