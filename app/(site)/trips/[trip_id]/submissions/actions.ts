"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";
import { isTripInstructor } from "@/lib/trips";

type DeleteInput = {
  tripId: string;
  formId: string;
};

// Removes a single trip_applications row. Available to admins and trip
// instructors (same set of people who can view the submissions list).
// The 2-step confirmation lives in the client UI; the server side just
// re-checks auth and deletes — no soft-delete or undo. If the row was
// paid we still delete it without touching Stripe; refunds remain a
// separate manual step in the Stripe dashboard.
export async function deleteTripApplication({
  tripId,
  formId,
}: DeleteInput): Promise<{ error: string | null }> {
  if (!tripId || !formId) {
    return { error: "Missing trip or application id." };
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { error: "You must be logged in to do that." };
  }

  const userId = authData.user.id;
  const allowed =
    (await isAdmin(userId)) || (await isTripInstructor(tripId, userId));

  if (!allowed) {
    return { error: "You don't have permission to remove applications." };
  }

  const { error } = await supabase
    .from("trip_applications")
    .delete()
    .eq("trip_id", tripId)
    .eq("form_id", formId);

  if (error) {
    return { error: error.message };
  }

  // Refresh both the submissions list and the day-event RSVPs view so
  // the deleted row falls off without a manual reload.
  revalidatePath(`/trips/${tripId}/submissions`);
  revalidatePath(`/day-events/${tripId}/rsvps`);
  return { error: null };
}
