import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";
import {
  getTripBadgesOffered,
  getTripById,
  getTripInstructors,
  setTripBadgesOffered,
  updateTripById,
  updateTripInstructors,
} from "@/lib/trips";
import StatusField from "@/app/components/dropdown/status-field";
import InstructorsEditor from "@/app/components/trips/instructors-editor";
import BadgesOfferedEditor from "@/app/components/trips/badges-offered-editor";
import CompressingImageInput from "@/app/components/image-upload/compressing-image-input";

type Props = {
  params: Promise<{ trip_id: string }>;
};

async function updateTripAction(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login");
  }

  const canEdit = await isAdmin(authData.user.id);
  if (!canEdit) {
    redirect("/trips");
  }

  const tripId = String(formData.get("trip_id") ?? "");
  const startDateRaw = String(formData.get("start_date") ?? "");
  const endDateRaw = String(formData.get("end_date") ?? "");
  const startDate = startDateRaw || null;
  const endDate = endDateRaw || null;
  const durationDays =
    startDate && endDate
      ? Math.max(
          1,
          Math.floor(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        )
      : null;
  const datesDisplay =
    startDate && endDate ? `${startDate} - ${endDate}` : null;

  const tripTypeRaw = String(formData.get("trip_type") ?? "overnight");
  const tripType: "overnight" | "day_event" =
    tripTypeRaw === "day_event" ? "day_event" : "overnight";

  const startTimeRaw = String(formData.get("start_time") ?? "").trim();
  const gearCapacityRaw = String(formData.get("gear_capacity") ?? "").trim();
  const gearLabelRaw = String(formData.get("gear_label") ?? "").trim();
  const hikingDistanceRaw = String(formData.get("hiking_distance") ?? "").trim();

  const payload = {
    title: String(formData.get("title") ?? ""),
    tagline: String(formData.get("tagline") ?? "") || null,
    dates: datesDisplay,
    start_date: startDate,
    end_date: endDate,
    start_time: startTimeRaw || null,
    duration_days: durationDays,
    location: String(formData.get("location") ?? "") || null,
    fee: formData.get("fee") ? Number(formData.get("fee")) : null,
    gear_capacity:
      tripType === "day_event" && gearCapacityRaw
        ? Number(gearCapacityRaw)
        : null,
    gear_label:
      tripType === "day_event" && gearCapacityRaw && gearLabelRaw
        ? gearLabelRaw
        : null,
    hiking_distance: hikingDistanceRaw || null,
    status: (String(formData.get("status") ?? "closed") as "closed" | "waitlist" | "open" | "full"),
    summary: String(formData.get("summary") ?? "") || null,
    highlights: String(formData.get("highlights") ?? "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    trip_type: tripType,
    banner_image: null,
  };


  const bannerFile = formData.get("banner_image_file");
  const { error } = await updateTripById(
    tripId,
    payload,
    bannerFile instanceof File ? bannerFile : null,
    String(formData.get("previous_banner_url") ?? "") || null
  );

  if (error) {
    redirect(`/trips/${tripId}?error=update_failed`);
  }

  const instructorIds = formData.getAll("instructor_ids").map(String);
  const instructorRoles = formData.getAll("instructor_roles").map(String);
  const assignments = instructorIds.map((id, index) => ({
    instructor_id: id,
    instructor_role: instructorRoles[index] || null,
  }));

  const instructorsResult = await updateTripInstructors(tripId, assignments);
  if (instructorsResult.error) {
    redirect(`/trips/${tripId}?error=instructors_update_failed`);
  }

  const badgeOfferedIds = formData.getAll("badge_offered_ids").map(String);
  const badgesResult = await setTripBadgesOffered(tripId, badgeOfferedIds);
  if (badgesResult.error) {
    redirect(`/trips/${tripId}?error=badges_offered_update_failed`);
  }

  // Day events live under a different URL prefix and have their own UI;
  // bounce admins back to the right detail page after save.
  redirect(
    tripType === "day_event" ? `/day-events/${tripId}` : `/trips/${tripId}`
  );
}

export default async function EditTripPage({ params }: Props) {
  const { trip_id: tripId } = await params;

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login");
  }

  const canEdit = await isAdmin(authData.user.id);
  if (!canEdit) {
    redirect(`/trips/${tripId}`);
  }

  const trip = await getTripById(tripId);
  const instructors = await getTripInstructors(tripId);
  const badgesOffered = await getTripBadgesOffered(tripId);
  if (!trip) {
    redirect("/trips");
  }

  const { data: allBadges } = await supabase
    .from("badges")
    .select("id, name, description, icon")
    .order("name", { ascending: true });
  const badgeOptions = (allBadges ?? []).map((badge) => ({
    id: badge.id as string,
    name: (badge.name as string) ?? "Untitled badge",
    description: (badge.description as string | null) ?? null,
    icon: (badge.icon as string | null) ?? null,
  }));

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name_first, name_last, avatar_url, Capacity")
    .order("name_first", { ascending: true });

  const instructorOptions = (profiles ?? []).map((profile) => ({
    label:
      [profile.name_first, profile.name_last].filter(Boolean).join(" ") ||
      profile.id,
    value: profile.id,
    avatar_url: profile.avatar_url ?? null,
    capacity: profile.Capacity ?? null,
  }));

  const initialAssignments = instructors
    .filter((item) => item.profile)
    .map((item) => ({
      instructor_id: item.profile!.id,
      instructor_role: item.instructor_role ?? "",
    }));

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="brand-panel mx-auto max-w-4xl rounded-2xl p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Edit Trip</h1>
          <p className="text-sm text-gray-600">
            Update every field for this trip.
          </p>
        </div>

        <form action={updateTripAction} className="mt-8 space-y-6">
          <input type="hidden" name="trip_id" value={trip.trip_id} />
          <input
            type="hidden"
            name="previous_banner_url"
            value={trip.banner_image ?? ""}
          />

          <fieldset className="brand-subtle-block rounded-xl px-4 py-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-moss)]">
              Event type
            </legend>
            <div className="mt-2 flex flex-col gap-2 text-sm text-gray-700 sm:flex-row sm:gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="trip_type"
                  value="overnight"
                  defaultChecked={trip.trip_type !== "day_event"}
                />
                Overnight Trip
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="trip_type"
                  value="day_event"
                  defaultChecked={trip.trip_type === "day_event"}
                />
                Day Event (free · optional donation)
              </label>
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Title
              <input
                name="title"
                defaultValue={trip.title}
                className="brand-input mt-2 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Tagline
              <input
                name="tagline"
                defaultValue={trip.tagline ?? ""}
                className="brand-input mt-2 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Location
              <input
                name="location"
                defaultValue={trip.location ?? ""}
                className="brand-input mt-2 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Fee (USD)
              <input
                type="number"
                name="fee"
                step="0.01"
                min="0"
                defaultValue={trip.fee ?? ""}
                className="brand-input mt-2 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-medium text-gray-700">
              Start date
              <input
                type="date"
                name="start_date"
                defaultValue={trip.start_date ?? ""}
                className="brand-input mt-2 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              End date
              <input
                type="date"
                name="end_date"
                defaultValue={trip.end_date ?? ""}
                className="brand-input mt-2 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Start time
              <input
                name="start_time"
                defaultValue={trip.start_time ?? ""}
                placeholder="e.g. Post-Maghrib · 2pm"
                className="brand-input mt-2 px-3 py-2 text-sm"
              />
              <span className="mt-1 block text-xs font-normal text-gray-500">
                Optional. Day events can use prayer-time references.
              </span>
            </label>
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Hiking distance
            <input
              name="hiking_distance"
              defaultValue={trip.hiking_distance ?? ""}
              placeholder="e.g. ~5 miles · 12 km · About 2 hours of walking"
              className="brand-input mt-2 px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-xs font-normal text-gray-500">
              Optional. Shown on the RSVP form so attendees know what to
              expect — leave blank to hide the line.
            </span>
          </label>

          <fieldset className="brand-subtle-block rounded-xl px-4 py-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-moss)]">
              Gear loaning (day events only)
            </legend>
            <p className="mt-1 text-xs text-gray-500">
              Use this for events that loan equipment (e.g. fishing rods at
              Catch &amp; Cook). Leave both fields blank to skip the
              &quot;I have my own gear&quot; checkbox on the RSVP form.
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Gear capacity
                <input
                  type="number"
                  name="gear_capacity"
                  min="0"
                  step="1"
                  defaultValue={trip.gear_capacity ?? ""}
                  className="brand-input mt-2 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Gear-opt-out label
                <input
                  name="gear_label"
                  defaultValue={trip.gear_label ?? ""}
                  placeholder="e.g. I have my own fishing equipment"
                  className="brand-input mt-2 px-3 py-2 text-sm"
                />
              </label>
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Banner image
              <div className="brand-subtle-block mt-2 p-4">
                {trip.banner_image ? (
                  <img
                    src={trip.banner_image}
                    alt={trip.title}
                    className="h-40 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-40 w-full rounded-lg bg-gray-200" />
                )}
                <div className="mt-3">
                  <CompressingImageInput name="banner_image_file" />
                </div>
              </div>
            </label>
            <StatusField
              name="status"
              defaultValue={trip.status ?? "closed"}
            />
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Summary
            <textarea
              name="summary"
              defaultValue={trip.summary ?? ""}
              rows={5}
              className="brand-input mt-2 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Highlights (one per line)
            <textarea
              name="highlights"
              defaultValue={(trip.highlights ?? []).join("\n")}
              rows={6}
              className="brand-input mt-2 px-3 py-2 text-sm"
            />
          </label>

          <InstructorsEditor
            options={instructorOptions}
            initialAssignments={initialAssignments}
          />

          <BadgesOfferedEditor
            options={badgeOptions}
            initialBadgeIds={badgesOffered.map((badge) => badge.id)}
          />

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="brand-button rounded-xl px-6 py-3 text-sm"
            >
              Save changes
            </button>
            <a
              href={
                trip.trip_type === "day_event"
                  ? `/day-events/${trip.trip_id}`
                  : `/trips/${trip.trip_id}`
              }
              className="brand-link text-sm"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
