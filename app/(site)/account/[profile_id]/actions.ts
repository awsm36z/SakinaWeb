"use server";

import { updateUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";

export async function updateProfileAction(
  profileId: string,
  payload: {
  bio_text: string;
  name_first: string;
  name_last: string | null;
  name_middle: string | null;
  avatar_url?: string | null;
  Capacity?: string | null;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { error: "You must be logged in to update your profile." };
  }

  const canEdit =
    data.user.id === profileId || (await isAdmin(data.user.id));

  if (!canEdit) {
    return { error: "You do not have permission to edit this profile." };
  }

  try {
    await updateUserProfile(profileId, payload);
    return { error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to update profile.";
    return { error: message };
  }
}
