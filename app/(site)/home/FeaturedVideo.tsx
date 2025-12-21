// app/(site)/home/FeaturedVideo.tsx
export default function FeaturedVideo() {
  return (
    <section className="bg-gray-50 py-20 px-6 md:px-10 lg:px-20">
      <div className="max-w-4xl mx-auto text-center">
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          See Sakina in the wild
        </h2>

        <p className="text-gray-600 mb-10">
          Get a feel for the kind of backpacking, rhythm, and reflection we
          bring to each trip.
        </p>

        {/* Video Container */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-xl bg-black">
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
