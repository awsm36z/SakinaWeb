import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";
import MediaGallery from "./media-gallery";

const YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/0M8yDauC0LE";

export default async function MediaPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const canAddMedia = await isAdmin(authData.user?.id);

  const { data: mediaItems } = await supabase.storage
    .from("media")
    .list("", { limit: 200, offset: 0, sortBy: { column: "name", order: "asc" } });

  const gallery =
    mediaItems?.map((item) => ({
      name: item.name,
      url: supabase.storage.from("media").getPublicUrl(item.name).data.publicUrl,
    })) ?? [];

  return (
    <main className="min-h-screen bg-gray-50 px-6 md:px-10 lg:px-20 py-12">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="text-center space-y-3">
          <p className="text-xs font-semibold tracking-[0.3em] text-green-700 uppercase">
            Media
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
            Stories from the trail
          </h1>
          <p className="text-gray-600">
            Watch the latest trip recap and browse highlights from past adventures.
          </p>
          {canAddMedia ? (
            <div className="pt-3">
              <Link
                href="/media/add-media"
                className="inline-flex items-center rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Add media
              </Link>
            </div>
          ) : null}
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Latest video
          </h2>
          <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-black shadow-lg">
            <iframe
              src={YOUTUBE_EMBED_URL}
              title="Sakina Wilderness media"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Gallery</h2>
            <span className="text-sm text-gray-500">
              {gallery.length} photos
            </span>
          </div>
          <MediaGallery items={gallery} />
        </section>
      </div>
    </main>
  );
}
