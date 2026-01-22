import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";
import {
  getTripById,
  getTripInstructors,
  updateTripById,
  updateTripInstructors,
} from "@/lib/trips";
import StatusField from "@/app/components/dropdown/status-field";
import InstructorsEditor from "@/app/components/trips/instructors-editor";

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

  const payload = {
    title: String(formData.get("title") ?? ""),
    tagline: String(formData.get("tagline") ?? "") || null,
    dates: datesDisplay,
    start_date: startDate,
    end_date: endDate,
    duration_days: durationDays,
    location: String(formData.get("location") ?? "") || null,
    fee: formData.get("fee") ? Number(formData.get("fee")) : null,
    status: String(formData.get("status") ?? "closed"),
    summary: String(formData.get("summary") ?? "") || null,
    highlights: String(formData.get("highlights") ?? "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
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

  redirect(`/trips/${tripId}`);
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
  if (!trip) {
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

  const initialAssignments = instructors
    .filter((item) => item.profile)
    .map((item) => ({
      instructor_id: item.profile!.id,
      instructor_role: item.instructor_role ?? "",
    }));

  return (
    <main className="min-h-screen bg-gray-50 px-6 md:px-10 lg:px-20 py-12">
      <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Title
              <input
                name="title"
                defaultValue={trip.title}
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Tagline
              <input
                name="tagline"
                defaultValue={trip.tagline ?? ""}
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Location
              <input
                name="location"
                defaultValue={trip.location ?? ""}
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
                defaultValue={trip.fee ?? ""}
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
                defaultValue={trip.start_date ?? ""}
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              End date
              <input
                type="date"
                name="end_date"
                defaultValue={trip.end_date ?? ""}
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                Auto fields
              </p>
              <p className="mt-2">
                Dates: {trip.dates ?? "TBD"}
              </p>
              <p className="mt-1">
                Duration: {trip.duration_days ?? 0} days
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Banner image
              <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                {trip.banner_image ? (
                  <img
                    src={trip.banner_image}
                    alt={trip.title}
                    className="h-40 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-40 w-full rounded-lg bg-gray-200" />
                )}
                <input
                  type="file"
                  name="banner_image_file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="mt-3 block w-full text-sm text-gray-600"
                />
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
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Highlights (one per line)
            <textarea
              name="highlights"
              defaultValue={(trip.highlights ?? []).join("\n")}
              rows={6}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <InstructorsEditor
            options={instructorOptions}
            initialAssignments={initialAssignments}
          />

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800 transition"
            >
              Save changes
            </button>
            <a
              href={`/trips/${trip.trip_id}`}
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
