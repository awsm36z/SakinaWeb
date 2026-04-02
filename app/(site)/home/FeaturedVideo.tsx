// app/(site)/home/FeaturedVideo.tsx
export default function FeaturedVideo() {
  return (
    <section className="px-6 py-20 md:px-10 lg:px-20">
      <div className="brand-panel mx-auto max-w-5xl rounded-[2rem] px-8 py-12 text-center md:px-12">
        
        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
          See Sakina in the wild
        </h2>

        <p className="mx-auto mb-10 max-w-2xl text-gray-600">
          Get a feel for the kind of backpacking, rhythm, and reflection we
          bring to each trip.
        </p>

        {/* Video Container */}
        <div className="relative aspect-video w-full overflow-hidden rounded-[1.5rem] border border-[var(--border-soft)] bg-black shadow-2xl">
          <iframe
            src="https://www.youtube.com/embed/ISLx6AYwEoI"
            title="Sakina Wilderness backpacking introduction"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
