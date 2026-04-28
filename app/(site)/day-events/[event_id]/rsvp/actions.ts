"use server";

import { createClient } from "@/lib/supabase/server";
import { createTripApplication } from "@/lib/trips";

// Email confirmation + guest claim-token minting happen entirely in the
// `send-trip-confirmation` edge function, which is called by the
// `on_trip_application_insert` DB trigger after every INSERT into
// trip_applications. Nothing email-related belongs here.

async function ensureGuestCamperId(submission: Record<string, string>) {
  const supabase = await createClient();
  const guestId = crypto.randomUUID();
  const guestFirstName = submission.first_name?.trim() || "Guest";
  const guestLastName = submission.last_name?.trim() || "Attendee";
  const guestEmail = submission.email?.trim().toLowerCase();

  if (!guestEmail) {
    return { camperId: null, error: "Guest RSVP is missing an email." };
  }

  const { error } = await supabase.from("profiles").insert({
    id: guestId,
    email: guestEmail,
    name_first: guestFirstName,
    name_last: guestLastName,
  });

  if (error) {
    return { camperId: null, error: error.message };
  }

  return { camperId: guestId, error: null };
}

async function ensureNoExistingApplicationByPaymentId(paymentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trip_applications")
    .select("form_id")
    .eq("payment_id", paymentId)
    .maybeSingle();
  return data;
}

async function ensureNoExistingApplication(tripId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trip_applications")
    .select("form_id")
    .eq("trip_id", tripId)
    .eq("camper_id", userId)
    .maybeSingle();
  return data;
}

// Returns null if there's room (or this event doesn't loan gear), or an
// error message if the loaner pool is full. Only applies when the RSVP
// did NOT tick "I have my own gear".
async function checkGearCapacity(
  tripId: string,
  hasOwnGear: boolean
): Promise<string | null> {
  if (hasOwnGear) return null;

  const supabase = await createClient();
  const { data: trip } = await supabase
    .from("trips")
    .select("gear_capacity, gear_label")
    .eq("trip_id", tripId)
    .maybeSingle();

  const capacity = trip?.gear_capacity;
  if (typeof capacity !== "number") return null;

  const { count } = await supabase
    .from("trip_applications")
    .select("form_id", { count: "exact", head: true })
    .eq("trip_id", tripId)
    .eq("paid", true)
    .not("submission->>has_own_gear", "eq", "true");

  if ((count ?? 0) >= capacity) {
    const label = trip?.gear_label ?? "I have my own equipment";
    return `Loaner spots are full. Please re-submit and tick "${label}" so you can still join.`;
  }
  return null;
}

type SubmitInput = {
  tripId: string;
  submission: Record<string, string>;
  donationAmount: number; // 0, 5, or 10
  paymentId?: string | null;
};

export async function submitDayEventRsvp({
  tripId,
  submission,
  donationAmount,
  paymentId,
}: SubmitInput): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  let camperId = authError ? null : authData.user?.id ?? null;

  // If we have a paymentId (donation path), make sure we haven't already
  // consumed it — protects against double-submits on page reloads.
  if (paymentId) {
    const existing = await ensureNoExistingApplicationByPaymentId(paymentId);
    if (existing) {
      return { error: null };
    }
  }

  // Logged-in users can only RSVP once per event.
  if (camperId) {
    const existing = await ensureNoExistingApplication(tripId, camperId);
    if (existing) {
      return { error: null };
    }
  }

  // For events that loan equipment, enforce the loaner cap before we
  // create any rows or charge any donation.
  const hasOwnGear = submission.has_own_gear === "true";
  const gearError = await checkGearCapacity(tripId, hasOwnGear);
  if (gearError) {
    return { error: gearError };
  }

  if (!camperId) {
    const guest = await ensureGuestCamperId(submission);
    if (guest.error || !guest.camperId) {
      return {
        error: guest.error ?? "Unable to create a guest RSVP profile.",
      };
    }
    camperId = guest.camperId;
  }

  const enrichedSubmission: Record<string, string> = {
    ...submission,
    payment_plan: donationAmount > 0 ? "donation" : "free_rsvp",
    donation_amount: String(donationAmount),
    event_kind: "day_event",
  };

  const { error } = await createTripApplication(
    tripId,
    enrichedSubmission,
    camperId,
    true, // day events are "paid" the moment they RSVP (no gated spots)
    paymentId ?? null
  );

  return { error };
}
