// app/(site)/home/AboutSakina.tsx
export default function AboutSakina() {
  return (
    <section className="px-6 md:px-10 lg:px-20 py-20 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          What is Sakina Wilderness?
        </h2>

        <p className="text-gray-700 leading-relaxed mb-4">
          Sakina Wilderness opens the outdoors to help Muslims experience the
          natural world as it was in the time of the Prophet Muhammad
          (peace be upon him). We design welcoming, spiritually grounded trips
          that cultivate calm, courage, and connection to creation.
        </p>

        <p className="text-gray-700 leading-relaxed">
          Our mission is to connect Muslims with our planet so we understand the{" "}
          <em className="italic text-gray-900">amanah</em>
          —the trust we hold to protect our land—motivate activism, and ignite
          curiosity in people who feel stagnant or too comfortable.
        </p>
      </div>
    </section>
  );
}
