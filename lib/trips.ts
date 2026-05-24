import { createClient } from "@/lib/supabase/server";

export type TripType = "overnight" | "day_event";

export type GenderRestriction = "open" | "men_only" | "women_only";

// Pretty label + Tailwind chip class for each restriction. Centralized
// here so the listing card, detail headers, and RSVP banners all stay
// in sync. Wording deliberately uses Sakina's "brothers / sisters"
// framing so the chip reads as an invitation rather than an exclusion.
export function formatGenderRestriction(value: string | null | undefined): {
  label: string;
  // Short sentence used in the RSVP banner. Speaks to who the event
  // is for in a warm, faith-aligned tone.
  bannerSentence: string;
  isRestricted: boolean;
  chipClass: string;
} {
  switch (value) {
    case "men_only":
      return {
        label: "Brother's Event",
        bannerSentence: "This is a Brother's Event.",
        isRestricted: true,
        chipClass:
          "bg-[rgba(47,93,80,0.12)] text-[var(--brand-moss)] border-[rgba(47,93,80,0.28)]",
      };
    case "women_only":
      return {
        label: "Sister's Event",
        bannerSentence: "This is a Sister's Event.",
        isRestricted: true,
        chipClass:
          "bg-[rgba(184,82,138,0.12)] text-[#8a3964] border-[rgba(184,82,138,0.28)]",
      };
    default:
      return {
        label: "Open to All Event",
        bannerSentence: "Everyone is welcome at this event.",
        isRestricted: false,
        // Muted navy that sits alongside the moss-green and rose chips
        // without screaming for attention. Pulled toward the warm side
        // of navy so it lives in the same earthy palette as the rest
        // of the site.
        chipClass:
          "bg-[rgba(30,58,95,0.10)] text-[#1e3a5f] border-[rgba(30,58,95,0.26)]",
      };
  }
}

export type TripRow = {
  id: string;
  trip_id: string;
  slug: string;
  title: string;
  tagline: string | null;
  dates: string | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  duration_days: number | null;
  location: string | null;
  fee: number | null;
  max_capacity: number | null;
  // Optional separate cap for events that loan equipment (e.g. fishing
  // gear at Catch & Cook). When set, RSVPs that don't bring their own
  // equipment count against this cap.
  gear_capacity: number | null;
  gear_label: string | null;
  // Free-text hiking distance descriptor surfaced on day-event RSVP forms
  // ("~5 miles", "12 km", "About 2 hours of walking"). Optional.
  hiking_distance: string | null;
  gender_restriction: GenderRestriction;
  banner_image: string | null;
  status: "waitlist" | "open" | "full" | "closed" | null;
  summary: string | null;
  highlights: string[] | null;
  trip_type: TripType;
  spots_left?: number;
  // Remaining gear loaner slots (only present when gear_capacity is set).
  gear_spots_left?: number;
  trip_instructors?: TripInstructor[];
};

export type TripUpdatePayload = Omit<
  TripRow,
  | "id"
  | "trip_id"
  | "slug"
  | "max_capacity"
  | "spots_left"
  | "gear_spots_left"
> & {
  banner_image?: string | null;
  status: "waitlist" | "open" | "full" | "closed";
  highlights: string[];
  trip_type: TripType;
};

const TRIP_SELECT_COLUMNS =
  "id, trip_id, slug, title, tagline, dates, start_date, end_date, start_time, duration_days, location, fee, max_capacity, gear_capacity, gear_label, hiking_distance, gender_restriction, banner_image, status, summary, highlights, trip_type";

export async function getTrips(
  tripType: TripType = "overnight"
): Promise<TripRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(TRIP_SELECT_COLUMNS)
    .eq("trip_type", tripType)
    .order("start_date", { ascending: true });

  if (error || !data) {
    console.error("getTrips error:", error);
    return [];
  }

  const tripIds = data.map((trip) => trip.trip_id);
  const paidCountByTripId = new Map<string, number>();

  if (tripIds.length) {
    const { data: paidApplications, error: paidError } = await supabase
      .from("trip_applications")
      .select("trip_id")
      .in("trip_id", tripIds)
      .eq("paid", true);

    if (paidError) {
      console.error("getTrips paid count error:", paidError);
    } else {
      for (const application of paidApplications ?? []) {
        const tripId = String(application.trip_id ?? "");
        paidCountByTripId.set(tripId, (paidCountByTripId.get(tripId) ?? 0) + 1);
      }
    }
  }

  return (data as TripRow[]).map((trip) => {
    const paidCount = paidCountByTripId.get(trip.trip_id) ?? 0;
    const effectiveCapacity = trip.max_capacity ?? 0;
    return {
      ...trip,
      spots_left: Math.max(0, effectiveCapacity - paidCount),
    };
  });
}

export async function getDayEvents(): Promise<TripRow[]> {
  return getTrips("day_event");
}

/**
 * Returns day events split into upcoming and past buckets.
 *
 * - "past"     → start_date is before today (date-only comparison, UTC)
 * - "upcoming" → start_date is today or in the future, OR start_date is null
 *
 * Closed events are flagged via the `status` field — callers decide whether
 * to show them based on the viewer's role.
 */
export async function getDayEventsBucketed(): Promise<{
  upcoming: TripRow[];
  past: TripRow[];
}> {
  const all = await getTrips("day_event");
  const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const upcoming: TripRow[] = [];
  const past: TripRow[] = [];

  for (const event of all) {
    if (event.start_date && event.start_date < todayStr) {
      past.push(event);
    } else {
      upcoming.push(event);
    }
  }

  // Past events: most recent first
  past.sort((a, b) => (b.start_date ?? "").localeCompare(a.start_date ?? ""));

  return { upcoming, past };
}

export async function getTripById(tripId: string): Promise<TripRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(TRIP_SELECT_COLUMNS)
    .eq("trip_id", tripId)
    .maybeSingle();

  if (error || !data) {
    console.error("getTripById error:", error, "tripId:", tripId);
    return null;
  }

  const { count, error: paidError } = await supabase
    .from("trip_applications")
    .select("form_id", { count: "exact", head: true })
    .eq("trip_id", tripId)
    .eq("paid", true);

  if (paidError) {
    console.error("getTripById paid count error:", paidError, "tripId:", tripId);
  }

  const paidCount = count ?? 0;
  const trip = data as TripRow;
  const effectiveCapacity = trip.max_capacity ?? 0;

  // For events that loan equipment, count how many paid RSVPs are
  // borrowing gear (i.e. did NOT check "I have my own equipment").
  let gearSpotsLeft: number | undefined;
  if (typeof trip.gear_capacity === "number" && trip.gear_capacity >= 0) {
    const { count: gearBorrowCount, error: gearError } = await supabase
      .from("trip_applications")
      .select("form_id", { count: "exact", head: true })
      .eq("trip_id", tripId)
      .eq("paid", true)
      .not("submission->>has_own_gear", "eq", "true");

    if (gearError) {
      console.error("getTripById gear count error:", gearError);
    }

    gearSpotsLeft = Math.max(0, trip.gear_capacity - (gearBorrowCount ?? 0));
  }

  return {
    ...trip,
    spots_left: Math.max(0, effectiveCapacity - paidCount),
    ...(gearSpotsLeft !== undefined ? { gear_spots_left: gearSpotsLeft } : {}),
  };
}

export async function updateTripById(
  tripId: string,
  payload: TripUpdatePayload,
  bannerFile?: File | null,
  previousBannerUrl?: string | null
): Promise<{ error: string | null; bannerUrl?: string | null }> {
  const supabase = await createClient();
  let nextBannerUrl = payload.banner_image ?? null;

  if (bannerFile && bannerFile.size > 0) {
    if (previousBannerUrl) {
      try {
        const url = new URL(previousBannerUrl);
        const marker = "/storage/v1/object/public/trips/";
        const index = url.pathname.indexOf(marker);
        const objectPath =
          index >= 0 ? url.pathname.slice(index + marker.length) : null;

        if (objectPath) {
          await supabase.storage.from("trips").remove([objectPath]);
        }
      } catch {
        // Ignore malformed URLs.
      }
    }

    const filePath = `/${tripId}/banner.jpeg`;
    const { error: uploadError } = await supabase.storage
      .from("trips")
      .upload(filePath, bannerFile, { upsert: true });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from("trips")
      .getPublicUrl(filePath);
    nextBannerUrl = publicUrlData.publicUrl;
  }

  const updatePayload = {
    ...payload,
    banner_image: nextBannerUrl ?? undefined,
  };

  if (!nextBannerUrl) {
    delete updatePayload.banner_image;
  }

  const { error } = await supabase
    .from("trips")
    .update(updatePayload)
    .eq("trip_id", tripId);

  if (error) {
    return { error: error.message };
  }

  return { error: null, bannerUrl: nextBannerUrl };
}

export type TripInstructor = {
  instructor_role: string | null;
  profile: {
    id: string;
    name_first: string | null;
    name_last: string | null;
    avatar_url: string | null;
    Capacity: string | null;
  } | null;
};

export async function getTripInstructors(
  tripId: string
): Promise<TripInstructor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trip_instructors")
    .select(
      `
      instructor_role,
      profiles:instructor_id (
        id,
        name_first,
        name_last,
        avatar_url,
        "Capacity"
      )
    `
    )
    .eq("trip_id", tripId);

  if (error || !data) {
    return [];
  }

  return data.map((item) => {
    const profile = Array.isArray(item.profiles)
      ? item.profiles[0]
      : item.profiles;

    return {
      instructor_role: item.instructor_role ?? null,
      profile: profile
        ? {
            id: profile.id,
            name_first: profile.name_first ?? null,
            name_last: profile.name_last ?? null,
            avatar_url: profile.avatar_url ?? null,
            Capacity: profile.Capacity ?? null,
          }
        : null,
    };
  });

}

export type TripInstructorAssignment = {
  instructor_id: string;
  instructor_role: string | null;
};

export async function updateTripInstructors(
  tripId: string,
  assignments: TripInstructorAssignment[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("trip_instructors")
    .delete()
    .eq("trip_id", tripId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (!assignments.length) {
    return { error: null };
  }
  const rows = assignments.map((item) => ({
    trip_id: tripId,
    instructor_id: item.instructor_id,
    instructor_role: item.instructor_role,
  }));

  const { error: insertError } = await supabase
    .from("trip_instructors")
    .insert(rows);

  if (insertError) {
    console.error("Failed to insert trip_instructors", insertError);
    throw insertError;
  }

  return { error: null };
}

export async function createTripApplication(
  tripId: string,
  submission: Record<string, string>,
  camperId?: string | null,
  paid: boolean = false,
  paymentId?: string | null
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("trip_applications").insert({
    trip_id: tripId,
    submission,
    paid,
    camper_id: camperId ?? null,
    payment_id: paymentId ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function updateTripApplicationPaidByPaymentId(
  paymentId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("trip_applications")
    .update({ paid: true })
    .eq("payment_id", paymentId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function updateTripApplicationInstallmentProgressByPaymentId(
  paymentId: string,
  progress: {
    paidCount: number;
    targetCount: number;
    status: "active" | "completed";
    lastPaidAt: string;
  }
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: existingApplication, error: fetchError } = await supabase
    .from("trip_applications")
    .select("submission")
    .eq("payment_id", paymentId)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }

  if (!existingApplication) {
    return { error: null };
  }

  const currentSubmission =
    existingApplication.submission &&
    typeof existingApplication.submission === "object" &&
    !Array.isArray(existingApplication.submission)
      ? (existingApplication.submission as Record<string, string>)
      : {};

  const nextSubmission: Record<string, string> = {
    ...currentSubmission,
    payment_plan: "installments",
    installment_paid_count: String(progress.paidCount),
    installment_target_count: String(progress.targetCount),
    installment_status: progress.status,
    installment_last_paid_at: progress.lastPaidAt,
  };

  const { error: updateError } = await supabase
    .from("trip_applications")
    .update({
      submission: nextSubmission,
      paid: progress.status === "completed",
    })
    .eq("payment_id", paymentId);

  if (updateError) {
    return { error: updateError.message };
  }

  return { error: null };
}

export type TripApplication = {
  id: string;
  trip_id: string;
  camper_id: string | null;
  submission: Record<string, string>;
  paid: boolean;
  payment_id: string | null;
  created_at: string;
};

export async function getTripApplicationssss(
  tripId: string
): Promise<TripApplication[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trip_applications")
    .select("id, trip_id, camper_id, submission, paid, created_at")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as TripApplication[];
}

// Bucketed copy for spot availability — we deliberately don't surface
// exact counts on the public site so a "3 left" doesn't feel scarier
// than a "5 left" when both should read as urgent.
export function formatSpotsAvailability(
  spotsLeft: number | null | undefined,
  maxCapacity: number | null | undefined
): string {
  const left = Math.max(0, spotsLeft ?? 0);
  const capacity = maxCapacity ?? 0;

  if (capacity <= 0) {
    // No capacity defined (e.g. day events that don't gate spots).
    return left > 0 ? "Spots available" : "Open";
  }

  if (left === 0) return "Full";

  const percentLeft = (left / capacity) * 100;

  if (percentLeft > 50) return "Spots available";
  if (percentLeft >= 30) return "Few spots left";
  return "Very few remaining";
}

export type TripBadgeOffered = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
};

export async function getTripBadgesOffered(
  tripId: string
): Promise<TripBadgeOffered[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trip_badges_offered")
    .select("badges:badge_id(id, slug, name, description, icon)")
    .eq("trip_id", tripId);

  if (error || !data) return [];

  return data
    .map((row) => {
      const badge = Array.isArray(row.badges) ? row.badges[0] : row.badges;
      return badge ? (badge as TripBadgeOffered) : null;
    })
    .filter((badge): badge is TripBadgeOffered => Boolean(badge));
}

export async function setTripBadgesOffered(
  tripId: string,
  badgeIds: string[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("trip_badges_offered")
    .delete()
    .eq("trip_id", tripId);

  if (deleteError) return { error: deleteError.message };

  if (!badgeIds.length) return { error: null };

  const rows = Array.from(new Set(badgeIds)).map((badgeId) => ({
    trip_id: tripId,
    badge_id: badgeId,
  }));

  const { error: insertError } = await supabase
    .from("trip_badges_offered")
    .insert(rows);

  if (insertError) return { error: insertError.message };
  return { error: null };
}

export async function isTripInstructor(
  tripId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trip_instructors")
    .select("trip_id")
    .eq("trip_id", tripId)
    .eq("instructor_id", userId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return true;
}


//retrieve all trip_applications for the trip by trip_id
export async function getTripApplications(tripId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("trip_applications")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`Error fetching trip applications: ${error.message}`);
    }

    return data;
}

export async function getTripApplicationById(
    tripId: string,
    applicationId: string
) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("trip_applications")
        .select("*")
        .eq("trip_id", tripId)
        .eq("form_id", applicationId)
        .maybeSingle();

    if (error) {
        throw new Error(`Error fetching trip application: ${error.message}`);
    }

    return data;
}
