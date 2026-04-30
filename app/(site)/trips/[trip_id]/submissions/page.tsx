import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";
import { getTripApplications, isTripInstructor } from "@/lib/trips";
import DeleteApplicationButton from "@/app/components/trips/delete-application-button";

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
    new Set(
      applications
        .map((application) => application.camper_id)
        .filter((camperId): camperId is string => Boolean(camperId))
    )
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
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="brand-kicker">
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
            {applications.map((application) => {
              const displayName = application.camper_id
                ? camperNameById.get(application.camper_id) ??
                  application.camper_id
                : [
                    application.submission?.first_name,
                    application.submission?.last_name,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                  application.submission?.email ||
                  "Guest applicant";

              return (
                <div
                  key={application.form_id}
                  className="brand-panel rounded-2xl p-6 transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(67,49,31,0.12)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      href={`/trips/${tripId}/submissions/${application.form_id}`}
                      className="min-w-0 flex-1"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {displayName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Submitted{" "}
                        {new Date(application.created_at).toLocaleString()}
                      </p>
                    </Link>
                    <div className="flex flex-col items-end gap-2">
                      <span className="rounded-full bg-[rgba(255,250,241,0.78)] px-3 py-1 text-xs font-semibold text-gray-700">
                        {application.paid ? "Paid" : "Unpaid"}
                      </span>
                      {application.submission?.payment_plan === "installments" ? (
                        <span className="rounded-full bg-[rgba(47,93,80,0.1)] px-3 py-1 text-xs font-semibold text-[var(--brand-moss)]">
                          Installments{" "}
                          {application.submission?.installment_paid_count ?? "0"}
                          /
                          {application.submission?.installment_target_count ?? "4"}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end">
                    <DeleteApplicationButton
                      tripId={tripId}
                      formId={application.form_id}
                      applicantName={displayName}
                      wasPaid={Boolean(application.paid)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[rgba(255,250,241,0.72)] p-8 text-center text-sm text-gray-500">
            No applications submitted yet.
          </div>
        )}
      </div>
    </main>
  );
}
