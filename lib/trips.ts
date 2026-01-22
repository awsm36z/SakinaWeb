import { createClient } from "@/lib/supabase/server";

export type TripRow = {
  id: string;
  trip_id: string;
  slug: string;
  title: string;
  tagline: string | null;
  dates: string | null;
  start_date: string | null;
  end_date: string | null;
  duration_days: number | null;
  location: string | null;
  fee: number | null;
  banner_image: string | null;
  status: "waitlist" | "open" | "full" | "closed" | null;
  summary: string | null;
  highlights: string[] | null;
  trip_instructors?: TripInstructor[];
};

export type TripUpdatePayload = Omit<TripRow, "id" | "trip_id" | "slug"> & {
  banner_image?: string | null;
  status: "waitlist" | "open" | "full" | "closed";
  highlights: string[];
};

export async function getTrips(): Promise<TripRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(
      "id, trip_id, slug, title, tagline, dates, start_date, end_date, duration_days, location, fee, banner_image, status, summary, highlights"
    )
    .order("start_date", { ascending: true });

  if (error || !data) {
    console.error("getTrips error:", error);
    return [];
  }

  return data as TripRow[];
}

export async function getTripById(tripId: string): Promise<TripRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(
      "id, trip_id, slug, title, tagline, dates, start_date, end_date, duration_days, location, fee, banner_image, status, summary, highlights"
    )
    .eq("trip_id", tripId)
    .maybeSingle();

  if (error || !data) {
    console.error("getTripById error:", error, "tripId:", tripId);
    return null;
  }

  return data as TripRow;
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

  return data.map((item) => ({
    instructor_role: item.instructor_role ?? null,
    profile: item.profiles
      ? {
          id: item.profiles.id,
          name_first: item.profiles.name_first ?? null,
          name_last: item.profiles.name_last ?? null,
          avatar_url: item.profiles.avatar_url ?? null,
          Capacity: item.profiles.Capacity ?? null,
        }
      : null,
  }));

  console.log("mapped Data:", data); // --- IGNORE ---
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
  camperId: string,
  paid: boolean = false
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("trip_applications").insert({
    trip_id: tripId,
    submission,
    paid,
    camper_id: camperId,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export type TripApplication = {
  id: string;
  trip_id: string;
  camper_id: string;
  submission: Record<string, string>;
  paid: boolean;
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
    console.log("\n\n\ntrip Id:", tripId, "applicationId:", applicationId); // --- IGNORE ---
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
