import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";
import { setTripBadgesOffered, updateTripInstructors } from "@/lib/trips";
import StatusField from "@/app/components/dropdown/status-field";
import InstructorsEditor from "@/app/components/trips/instructors-editor";
import BadgesOfferedEditor from "@/app/components/trips/badges-offered-editor";
import CompressingImageInput from "@/app/components/image-upload/compressing-image-input";

async function createTripAction(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login");
  }

  const canCreate = await isAdmin(authData.user.id);
  if (!canCreate) {
    redirect("/trips");
  }

  const tripId = randomUUID();
  const title = String(formData.get("title") ?? "").trim();
  const slugBase = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const slug = slugBase || tripId;

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
  const genderRestrictionRaw = String(formData.get("gender_restriction") ?? "open");
  const genderRestriction: "open" | "men_only" | "women_only" =
    genderRestrictionRaw === "men_only" || genderRestrictionRaw === "women_only"
      ? genderRestrictionRaw
      : "open";

  const payload = {
    id: slug,
    trip_id: tripId,
    slug,
    title: title || "Untitled trip",
    tagline: String(formData.get("tagline") ?? "") || null,
    dates: datesDisplay,
    start_date: startDate,
    end_date: endDate,
    start_time: startTimeRaw || null,
    duration_days: durationDays,
    location: String(formData.get("location") ?? "") || null,
    fee: formData.get("fee") ? Number(formData.get("fee")) : null,
    max_capacity: formData.get("max_capacity")
      ? Number(formData.get("max_capacity"))
      : null,
    gear_capacity:
      tripType === "day_event" && gearCapacityRaw
        ? Number(gearCapacityRaw)
        : null,
    gear_label:
      tripType === "day_event" && gearCapacityRaw && gearLabelRaw
        ? gearLabelRaw
        : null,
    hiking_distance: hikingDistanceRaw || null,
    gender_restriction: genderRestriction,
    status: String(formData.get("status") ?? "closed") as
      | "closed"
      | "waitlist"
      | "open"
      | "full",
    summary: String(formData.get("summary") ?? "") || null,
    highlights: String(formData.get("highlights") ?? "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    trip_type: tripType,
    banner_image: null as string | null,
  };

  const bannerFile = formData.get("banner_image_file");
  if (bannerFile instanceof File && bannerFile.size > 0) {
    const filePath = `/${tripId}/banner.jpeg`;
    const { error: uploadError } = await supabase.storage
      .from("trips")
      .upload(filePath, bannerFile, { upsert: true });

    if (uploadError) {
      redirect("/trips?error=banner_upload_failed");
    }

    const { data: publicUrlData } = supabase.storage
      .from("trips")
      .getPublicUrl(filePath);
    payload.banner_image = publicUrlData.publicUrl;
  }

  const { error } = await supabase.from("trips").insert(payload);
  if (error) {
    redirect("/trips?error=create_failed");
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
  if (badgeOfferedIds.length) {
    const badgesResult = await setTripBadgesOffered(tripId, badgeOfferedIds);
    if (badgesResult.error) {
      redirect(`/trips/${tripId}?error=badges_offered_update_failed`);
    }
  }

  redirect(tripType === "day_event" ? `/day-events` : `/trips/${tripId}`);
}

export default async function CreateTripPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login");
  }

  const canCreate = await isAdmin(authData.user.id);

  if (!canCreate) {
    redirect("/trips");
  }

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

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="brand-panel mx-auto max-w-4xl rounded-2xl p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Create Trip or Day Event</h1>
          <p className="text-sm text-gray-600">
            This form is restricted to Founders and Admins.
          </p>
        </div>

        <form action={createTripAction} className="mt-8 space-y-6">
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
                  defaultChecked
                />
                Overnight Trip
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="trip_type" value="day_event" />
                Day Event (free · optional donation)
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Day events: leave Fee and Max spots blank. They&apos;re free with an
              optional $5–$10 donation.
            </p>
          </fieldset>

          <fieldset className="brand-subtle-block rounded-xl px-4 py-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-moss)]">
              Who can attend
            </legend>
            <div className="mt-2 flex flex-col gap-2 text-sm text-gray-700 sm:flex-row sm:gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender_restriction"
                  value="open"
                  defaultChecked
                />
                Open to All Event
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender_restriction"
                  value="men_only"
                />
                Brother&apos;s Event
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender_restriction"
                  value="women_only"
                />
                Sister&apos;s Event
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Shown as a chip on listing cards, the detail page, and the
              RSVP form. We trust attendees to self-select.
            </p>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Title
              <input
                name="title"
                className="brand-input mt-2 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Tagline
              <input
                name="tagline"
                className="brand-input mt-2 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-medium text-gray-700">
              Location
              <input
                name="location"
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
                className="brand-input mt-2 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Maximum spots
              <input
                type="number"
                name="max_capacity"
                min="0"
                step="1"
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
                className="brand-input mt-2 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              End date
              <input
                type="date"
                name="end_date"
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Start time
              <input
                name="start_time"
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
                  className="brand-input mt-2 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Gear-opt-out label
                <input
                  name="gear_label"
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
                <div className="h-40 w-full rounded-lg bg-gray-200" />
                <div className="mt-3">
                  <CompressingImageInput name="banner_image_file" />
                </div>
              </div>
            </label>
            <StatusField name="status" defaultValue="closed" />
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Summary
            <textarea
              name="summary"
              rows={5}
              className="brand-input mt-2 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Highlights (one per line)
            <textarea
              name="highlights"
              rows={6}
              className="brand-input mt-2 px-3 py-2 text-sm"
            />
          </label>

          <InstructorsEditor options={instructorOptions} initialAssignments={[]} />

          <BadgesOfferedEditor options={badgeOptions} initialBadgeIds={[]} />

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="brand-button rounded-xl px-6 py-3 text-sm"
            >
              Create trip
            </button>
            <Link href="/trips" className="brand-link text-sm">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
