"use server";

import { updateUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export async function updateProfileAction(payload: {
  bio_text: string;
  name_first: string;
  name_last: string | null;
  name_middle: string | null;
  avatar_url?: string | null;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { error: "You must be logged in to update your profile." };
  }

  try {
    await updateUserProfile(data.user.id, payload);
    return { error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to update profile.";
    return { error: message };
  }
}
