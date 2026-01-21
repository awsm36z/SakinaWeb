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
  banner_image: string | null;
  status: "waitlist" | "open" | "full" | "closed" | null;
  summary: string | null;
  highlights: string[] | null;
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
      "id, trip_id, slug, title, tagline, dates, start_date, end_date, duration_days, location, banner_image, status, summary, highlights"
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
      "id, trip_id, slug, title, tagline, dates, start_date, end_date, duration_days, location, banner_image, status, summary, highlights"
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
