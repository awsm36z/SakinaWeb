import { redirect } from "next/navigation";
import AdminDashboardClient from "./admin-dashboard-client";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login");
  }

  const allowed = await isAdmin(authData.user.id);
  if (!allowed) {
    redirect(`/account/${authData.user.id}`);
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name_first, name_last, avatar_url, Capacity")
    .order("name_first", { ascending: true });

  const { data: badgesData } = await supabase
    .from("badges")
    .select("id, name, description, icon")
    .order("name", { ascending: true });

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <AdminDashboardClient
        profiles={profiles ?? []}
        badges={badgesData ?? []}
      />
    </main>
  );
}
