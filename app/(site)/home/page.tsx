// app/(site)/home/page.tsx
import type { Metadata } from "next";
import Hero from "./Hero";
import FeaturedVideo from "./FeaturedVideo";
import CinematicIntro from "./CinematicIntro";

export const metadata: Metadata = {
  title: "Sakina Wilderness — Tranquility in nature, together.",
  description:
    "Muslim-led wilderness trips in the Pacific Northwest. Beginner-friendly backpacking with spiritual reflection, prayer, and community.",
};

export default function HomePage() {
  return (
    <main className="flex flex-col gap-24 pb-20">
      <CinematicIntro />
      <Hero />
      <FeaturedVideo />
    </main>
  );
}
