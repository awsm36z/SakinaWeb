import { createClient } from "@/lib/supabase/server";

export async function hasCapacityRoles(
  roles: string[],
  userId?: string
): Promise<boolean> {
  const allowed = new Set(roles.map((role) => role.toLowerCase()));
  const capacity = (await getUserCapacity(userId))?.toLowerCase?.() ?? "";
  return allowed.has(capacity);
}

export async function isAdmin(userId?: string): Promise<boolean> {
  return hasCapacityRoles(["admin", "founder"], userId);
}

export async function isFounder(userId?: string): Promise<boolean> {
  return hasCapacityRoles(["founder"], userId);
}

export async function isLeader(userId?: string): Promise<boolean> {
  return hasCapacityRoles(["wilderness leader", "spiritual leader"], userId);
}

export async function getUserCapacity(userId?: string): Promise<string | null> {
  const supabase = await createClient();
  let id = userId;

  if (!id) {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return null;
    }
    id = authData.user.id;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("Capacity")
    .eq("id", id)
    .maybeSingle();

  return profile?.Capacity ?? null;
}
