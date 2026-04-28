import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";
import CompressingImageInput from "@/app/components/image-upload/compressing-image-input";

async function createGuestProfileAction(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login");
  }

  const allowed = await isAdmin(authData.user.id);
  if (!allowed) {
    redirect("/");
  }

  const firstName = String(formData.get("name_first") ?? "").trim();
  const lastName = String(formData.get("name_last") ?? "").trim();
  const capacity = String(formData.get("capacity") ?? "").trim() || null;
  const bioText = String(formData.get("bio_text") ?? "").trim() || null;

  if (!firstName) {
    redirect("/admin/guest-profiles/new?error=missing_name");
  }

  // Guest profiles don't have an auth.users row, so they never receive
  // mail. The profiles table requires email to be NOT NULL — synthesize a
  // unique placeholder so the row is valid and admins can later swap in
  // a real address if needed.
  const guestId = randomUUID();
  const placeholderEmail = `guest-${guestId}@guest.sakinawilderness.org`;

  let avatarUrl: string | null = null;
  const photoFile = formData.get("photo");
  if (photoFile instanceof File && photoFile.size > 0) {
    const filePath = `${guestId}/avatar.jpeg`;
    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(filePath, photoFile, { upsert: true });

    if (uploadError) {
      redirect("/admin/guest-profiles/new?error=photo_upload_failed");
    }

    const { data: publicUrlData } = supabase.storage
      .from("profiles")
      .getPublicUrl(filePath);
    avatarUrl = publicUrlData.publicUrl;
  }

  const { error } = await supabase.from("profiles").insert({
    id: guestId,
    email: placeholderEmail,
    name_first: firstName,
    name_last: lastName || null,
    avatar_url: avatarUrl,
    bio_text: bioText,
    Capacity: capacity,
  });

  if (error) {
    redirect(
      `/admin/guest-profiles/new?error=${encodeURIComponent(error.message)}`
    );
  }

  redirect(`/account/${guestId}?created=guest`);
}

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewGuestProfilePage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login");
  }

  const allowed = await isAdmin(authData.user.id);
  if (!allowed) {
    redirect(`/account/${authData.user.id}`);
  }

  const { error } = await searchParams;
  const errorMessage = decodeURIComponent(error ?? "");

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="brand-panel mx-auto max-w-2xl rounded-2xl p-8">
        <div className="mb-4">
          <Link href="/admin" className="brand-link text-sm">
            ← Back to admin dashboard
          </Link>
        </div>

        <p className="brand-kicker">Guest profile</p>
        <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900">
          Add a leader profile
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          For guest leaders (e.g. spiritual leaders) who won&apos;t register
          themselves. They&apos;ll appear in the trip-instructors picker so you
          can assign them to events.
        </p>

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage === "missing_name"
              ? "First name is required."
              : errorMessage === "photo_upload_failed"
                ? "Photo upload failed. Please try again with a smaller image."
                : errorMessage}
          </div>
        ) : null}

        <form action={createGuestProfileAction} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              First name
              <input
                name="name_first"
                required
                className="brand-input mt-2 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Last name
              <input
                name="name_last"
                className="brand-input mt-2 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Role / capacity
            <input
              name="capacity"
              placeholder="e.g. Spiritual leader · Guest naturalist"
              className="brand-input mt-2 px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-xs font-normal text-gray-500">
              Shown in the trip-instructors picker.
            </span>
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Bio
            <textarea
              name="bio_text"
              rows={5}
              placeholder="A short bio shown on their profile page."
              className="brand-input mt-2 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Photo
            <div className="brand-subtle-block mt-2 p-4">
              <p className="mb-3 text-xs text-gray-500">
                Square photos work best. Compressed automatically before upload.
              </p>
              <CompressingImageInput name="photo" />
            </div>
          </label>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="brand-button rounded-xl px-6 py-3 text-sm"
            >
              Create profile
            </button>
            <Link href="/admin" className="brand-link text-sm">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
