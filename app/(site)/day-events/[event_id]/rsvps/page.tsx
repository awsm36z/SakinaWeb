import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";
import {
  getTripApplications,
  getTripById,
  isTripInstructor,
} from "@/lib/trips";

type Props = {
  params: Promise<{ event_id: string }>;
};

export default async function DayEventRsvpsPage({ params }: Props) {
  const { event_id: eventId } = await params;
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login");
  }

  const canView =
    (await isAdmin(authData.user.id)) ||
    (await isTripInstructor(eventId, authData.user.id));

  if (!canView) {
    redirect(`/day-events/${eventId}`);
  }

  const event = await getTripById(eventId);
  if (!event || event.trip_type !== "day_event") {
    redirect("/day-events");
  }

  const applications = await getTripApplications(eventId);
  const camperIds = Array.from(
    new Set(
      applications
        .map((application) => application.camper_id)
        .filter((camperId): camperId is string => Boolean(camperId))
    )
  );
  const { data: camperProfiles } = camperIds.length
    ? await supabase
        .from("profiles")
        .select("id, name_first, name_last, email")
        .in("id", camperIds)
    : { data: [] };
  const camperById = new Map(
    (camperProfiles ?? []).map((profile) => [profile.id, profile])
  );

  const totalRsvps = applications.length;
  const totalDonations = applications.reduce((sum, application) => {
    const submission =
      (application.submission as Record<string, string> | null) ?? {};
    const amount = Number(submission.donation_amount ?? "0");
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  const gearBorrowers = applications.filter((application) => {
    const submission =
      (application.submission as Record<string, string> | null) ?? {};
    return submission.has_own_gear !== "true";
  }).length;

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Link href={`/day-events/${eventId}`} className="brand-link text-sm">
            ← Back to event
          </Link>
        </div>

        <header className="brand-panel rounded-2xl p-6">
          <p className="brand-kicker">RSVPs</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900">
            {event.title}
          </h1>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="RSVPs" value={String(totalRsvps)} />
            <Stat label="Donations" value={`$${totalDonations}`} />
            {typeof event.gear_capacity === "number" ? (
              <Stat
                label="Loaner gear"
                value={`${gearBorrowers} / ${event.gear_capacity}`}
              />
            ) : null}
            {event.max_capacity ? (
              <Stat
                label="Capacity"
                value={`${totalRsvps} / ${event.max_capacity}`}
              />
            ) : null}
          </div>
        </header>

        {applications.length ? (
          <div className="brand-panel overflow-hidden rounded-2xl">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-[rgba(255,250,241,0.72)] text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Donation</th>
                  {typeof event.gear_capacity === "number" ? (
                    <th className="px-4 py-3">Gear</th>
                  ) : null}
                  <th className="px-4 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {applications.map((application) => {
                  const submission =
                    (application.submission as Record<
                      string,
                      string
                    > | null) ?? {};
                  const profile = application.camper_id
                    ? camperById.get(application.camper_id)
                    : null;
                  const displayName =
                    [profile?.name_first, profile?.name_last]
                      .filter(Boolean)
                      .join(" ") ||
                    [submission.first_name, submission.last_name]
                      .filter(Boolean)
                      .join(" ") ||
                    submission.email ||
                    "Guest";
                  const displayEmail = profile?.email ?? submission.email ?? "—";
                  const donation = Number(submission.donation_amount ?? "0");
                  const hasOwnGear = submission.has_own_gear === "true";

                  return (
                    <tr key={application.form_id}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {displayName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div>{displayEmail}</div>
                        {submission.phone ? (
                          <div className="text-xs text-gray-500">
                            {submission.phone}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {donation > 0 ? `$${donation}` : "—"}
                      </td>
                      {typeof event.gear_capacity === "number" ? (
                        <td className="px-4 py-3 text-gray-700">
                          {hasOwnGear ? (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                              Own gear
                            </span>
                          ) : (
                            <span className="rounded-full bg-[rgba(47,93,80,0.1)] px-2 py-0.5 text-xs font-medium text-[var(--brand-moss)]">
                              Loaner
                            </span>
                          )}
                        </td>
                      ) : null}
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(application.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[rgba(255,250,241,0.72)] p-8 text-center text-sm text-gray-500">
            No RSVPs yet.
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="brand-subtle-block rounded-xl px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-moss)]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}
