"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";

export async function createBadgeAction(formData: FormData) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { error: "You must be logged in to create badges." };
  }

  const allowed = await isAdmin(authData.user.id);
  if (!allowed) {
    return { error: "You do not have permission to create badges." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const iconFile = formData.get("icon");

  if (!name) {
    return { error: "Badge name is required." };
  }

  if (!description) {
    return { error: "Badge description is required." };
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  if (!slug) {
    return { error: "Badge name must contain letters or numbers." };
  }

  let iconUrl: string | null = null;

  if (iconFile instanceof File && iconFile.size > 0) {
    const ext = iconFile.name.split(".").pop()?.toLowerCase() || "png";
    const filePath = `${slug}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("badge-icons")
      .upload(filePath, iconFile, { upsert: true });

    if (uploadError) {
      return {
        error:
          "Badge icon upload failed. Make sure the `badge-icons` storage bucket exists and accepts uploads.",
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from("badge-icons")
      .getPublicUrl(filePath);
    iconUrl = publicUrlData.publicUrl;
  }

  const { error } = await supabase.from("badges").insert({
    slug,
    name,
    description,
    icon: iconUrl,
  });

  if (error) {
    return {
      error:
        "Badge creation failed. Make sure the `badges` table exists with `slug`, `name`, `description`, and `icon` columns.",
    };
  }

  return { error: null };
}

export async function awardBadgeAction(formData: FormData) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { error: "You must be logged in to award badges." };
  }

  const allowed = await isAdmin(authData.user.id);
  if (!allowed) {
    return { error: "You do not have permission to award badges." };
  }

  const profileId = String(formData.get("profile_id") ?? "").trim();
  const badgeId = String(formData.get("badge_id") ?? "").trim();

  if (!profileId) {
    return { error: "A member must be selected." };
  }

  if (!badgeId) {
    return { error: "Select a badge to award." };
  }

  const { error } = await supabase.from("profile_badges").insert({
    profile_id: profileId,
    badge_id: badgeId,
    awarded_by: authData.user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "This member already has that badge." };
    }

    return { error: "Unable to award badge." };
  }

  return { error: null };
}
