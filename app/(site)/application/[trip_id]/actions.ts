"use server";

import { createClient } from "@/lib/supabase/server";
import { createTripApplication } from "@/lib/trips";

export async function submitTripApplication(
  tripId: string,
  submission: Record<string, string>
) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { error: "You must be logged in to submit." };
  }

  const { error } = await createTripApplication(
    tripId,
    submission,
    authData.user.id,
    false
  );

  return { error };
}
