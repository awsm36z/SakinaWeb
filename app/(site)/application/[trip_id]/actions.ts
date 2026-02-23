"use server";

import { createClient } from "@/lib/supabase/server";
import { createTripApplication } from "@/lib/trips";
import { triggerTripRegistrationEmail } from "@/lib/emails";

export async function submitTripApplication(
  tripId: string,
  submission: Record<string, string>,
  paymentId: string
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
    true,
    paymentId
  );

  if (!error && authData.user.email) {
    const { data: trip } = await supabase
      .from("trips")
      .select("title, trip_id")
      .eq("trip_id", tripId)
      .maybeSingle();

    const emailResult = await triggerTripRegistrationEmail({
      recipientEmail: authData.user.email,
      tripTitle: trip?.title ?? "your trip",
      tripId: trip?.trip_id ?? tripId,
    });

    if (emailResult.error) {
      console.error("Trip registration email error:", emailResult.error);
    }
  }

  return { error };
}
