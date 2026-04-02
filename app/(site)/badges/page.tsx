import BadgesClient from "./badges-client";
import { createClient } from "@/lib/supabase/server";

export default async function BadgesPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;

  const { data: badges } = await supabase
    .from("badges")
    .select("id, slug, name, description, icon, color, category")
    .order("name", { ascending: true });

  let earnedByBadgeId = new Map<string, string>();

  if (userId) {
    const { data: earnedBadges } = await supabase
      .from("profile_badges")
      .select("badge_id, awarded_at")
      .eq("profile_id", userId);

    earnedByBadgeId = new Map(
      (earnedBadges ?? []).map((record) => [
        String(record.badge_id),
        String(record.awarded_at),
      ])
    );
  }

  const mergedBadges = (badges ?? []).map((badge) => ({
    ...badge,
    earned: earnedByBadgeId.has(badge.id),
    awarded_at: earnedByBadgeId.get(badge.id) ?? null,
  }));

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <BadgesClient badges={mergedBadges} />
    </main>
  );
}
