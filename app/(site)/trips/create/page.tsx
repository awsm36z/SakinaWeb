import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";
import { updateTripInstructors } from "@/lib/trips";
import StatusField from "@/app/components/dropdown/status-field";
import InstructorsEditor from "@/app/components/trips/instructors-editor";

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

  const payload = {
    trip_id: tripId,
    slug,
    title: title || "Untitled trip",
    tagline: String(formData.get("tagline") ?? "") || null,
    dates: datesDisplay,
    start_date: startDate,
    end_date: endDate,
    duration_days: durationDays,
    location: String(formData.get("location") ?? "") || null,
    fee: formData.get("fee") ? Number(formData.get("fee")) : null,
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

  redirect(`/trips/${tripId}`);
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

  return (
    <main className="min-h-screen bg-gray-50 px-6 md:px-10 lg:px-20 py-12">
      <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Create Trip</h1>
          <p className="text-sm text-gray-600">
            This form is restricted to Founders and Admins.
          </p>
        </div>

        <form action={createTripAction} className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Title
              <input
                name="title"
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Tagline
              <input
                name="tagline"
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Location
              <input
                name="location"
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Fee (USD)
              <input
                type="number"
                name="fee"
                step="0.01"
                min="0"
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-medium text-gray-700">
              Start date
              <input
                type="date"
                name="start_date"
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
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
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                Auto fields
              </p>
              <p className="mt-2">Dates: TBD</p>
              <p className="mt-1">Duration: TBD</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Banner image
              <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="h-40 w-full rounded-lg bg-gray-200" />
                <input
                  type="file"
                  name="banner_image_file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="mt-3 block w-full text-sm text-gray-600"
                />
              </div>
            </label>
            <StatusField name="status" defaultValue="closed" />
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Summary
            <textarea
              name="summary"
              rows={5}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Highlights (one per line)
            <textarea
              name="highlights"
              rows={6}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <InstructorsEditor options={instructorOptions} initialAssignments={[]} />

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800 transition"
            >
              Create trip
            </button>
            <a
              href="/trips"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
