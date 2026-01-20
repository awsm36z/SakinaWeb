import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";

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

  return (
    <main className="min-h-screen bg-gray-50 px-6 md:px-10 lg:px-20 py-12">
      <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Create Trip</h1>
        <p className="mt-2 text-gray-600">
          This form is restricted to Founders and Admins.
        </p>

        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm font-medium text-gray-500">
          Under construction
        </div>
      </div>
    </main>
  );
}
