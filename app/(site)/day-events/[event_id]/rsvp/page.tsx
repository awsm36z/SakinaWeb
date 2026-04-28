import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripById } from "@/lib/trips";
import { createClient } from "@/lib/supabase/server";
import DayEventRsvpForm from "./rsvp-form";
import AutoRedirectToConfirm from "./auto-redirect-to-confirm";

type Props = {
  params: Promise<{ event_id: string }>;
  searchParams: Promise<{ edit?: string }>;
};

// These four are required server-side before we can skip the form. Name
// is recoverable from the profile, email comes from auth, the rest only
// exist on prior trip submissions — we copy them forward so a signed-in
// user with a previous RSVP can register in basically one click.
const ALWAYS_REQUIRED = [
  "first_name",
  "last_name",
  "gender",
  "age",
  "phone",
  "email",
  "medical_notes",
] as const;

function hasEverything(prefill: Record<string, string>): boolean {
  return ALWAYS_REQUIRED.every((field) => Boolean(prefill[field]?.trim()));
}

async function loadSignedInPrefill(): Promise<{
  prefill: Record<string, string>;
  signedIn: boolean;
  displayName: string | null;
}> {
  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.getUser();
  if (error || !authData.user) {
    return { prefill: {}, signedIn: false, displayName: null };
  }

  const userId = authData.user.id;
  const userEmail = authData.user.email ?? "";

  const { data: profile } = await supabase
    .from("profiles")
    .select("name_first, name_last, Gender, email")
    .eq("id", userId)
    .maybeSingle();

  // Pull the most recent submission for any trip — past answers for
  // age/phone/medical_notes (and gender if not on the profile) get
  // copied forward.
  const { data: lastApplication } = await supabase
    .from("trip_applications")
    .select("submission")
    .eq("camper_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastSubmission =
    (lastApplication?.submission as Record<string, string> | null) ?? {};

  // Profile fields take precedence over the submission for
  // identity-shaped data (name, email, gender) — they're the canonical
  // source. Submission fills in everything else.
  const prefill: Record<string, string> = {
    ...lastSubmission,
    first_name: profile?.name_first ?? lastSubmission.first_name ?? "",
    last_name: profile?.name_last ?? lastSubmission.last_name ?? "",
    email: userEmail || profile?.email || lastSubmission.email || "",
  };

  // The profile Gender enum uses Title Case ("Male" / "Female" /
  // "Prefer Not to Say") but the form's <select> uses short codes.
  const profileGender = profile?.Gender;
  if (typeof profileGender === "string" && profileGender) {
    const normalized = profileGender.toLowerCase();
    if (normalized === "male") prefill.gender = "male";
    else if (normalized === "female") prefill.gender = "female";
    else if (normalized.startsWith("prefer")) prefill.gender = "na";
  }

  // Don't let stale gear-opt-in checkboxes leak between trips.
  delete prefill.has_own_gear;

  const displayName =
    [profile?.name_first, profile?.name_last].filter(Boolean).join(" ") ||
    userEmail ||
    null;

  return { prefill, signedIn: true, displayName };
}

export default async function DayEventRsvpPage({
  params,
  searchParams,
}: Props) {
  const { event_id: eventId } = await params;
  const { edit } = await searchParams;
  const event = await getTripById(eventId);

  if (!event || event.trip_type !== "day_event") {
    notFound();
  }

  const { prefill, signedIn, displayName } = await loadSignedInPrefill();
  const everything = hasEverything(prefill);
  const wantsEdit = edit === "1";
  const fastPath = signedIn && everything && !wantsEdit;

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4">
          <Link
            href={`/day-events/${eventId}`}
            className="brand-link text-sm"
          >
            ← Back to event
          </Link>
        </div>

        <article className="brand-panel rounded-2xl p-6 md:p-8">
          <p className="brand-kicker">RSVP</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900">
            {fastPath
              ? `Welcome back${displayName ? `, ${displayName}` : ""}`
              : "Sign up for this day event"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {fastPath
              ? "We have your info on file — heading straight to the donation step."
              : signedIn
                ? "We've prefilled what we know — just fill in anything that's missing."
                : "A few quick details so we know who's coming."}
            {!fastPath && event.hiking_distance?.trim()
              ? ` This event involves moderate hiking — expect about ${event.hiking_distance.trim()} in one day.`
              : ""}
            {!fastPath ? " If you have any medical concerns please list them below." : ""}
          </p>

          {fastPath ? (
            <AutoRedirectToConfirm tripId={eventId} prefill={prefill} />
          ) : (
            <DayEventRsvpForm
              tripId={eventId}
              gearCapacity={event.gear_capacity ?? null}
              gearLabel={event.gear_label ?? null}
              gearSpotsLeft={event.gear_spots_left ?? null}
              hikingDistance={event.hiking_distance ?? null}
              serverPrefill={prefill}
            />
          )}
        </article>
      </div>
    </main>
  );
}
