"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function CinematicIntro() {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;

            // stronger parallax multiplier = stronger depth effect
            setOffset(scrollY * 0.3);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* Parallax Background */}
            <div
                className="absolute inset-0 will-change-transform"
                style={{
                    transform: `translateY(${offset}px)`,
                }}
            >
                <Image
                    src="/Adams Thumbnail.jpg"
                    alt="Scenic mountain sunrise"
                    fill
                    priority
                    className="object-cover object-center brightness-[0.85]"
                />
            </div>

            {/* Text Overlay */}
            <div
                className="absolute inset-0 flex items-center justify-center will-change-transform"
                style={{
                    transform: `translateY(${offset * 0.15}px)`,
                    opacity: Math.max(1 - offset / 300, 0),
                }}
            >
                <h1
                    className="
                    text-red-600
                    text-5xl md:text-7xl lg:text-8xl
                    font-anton
                    tracking-tight
                    drop-shadow-2xl
"
                >
                    THIS EARTH IS AN AMANAH
                </h1>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 inset-x-0 flex flex-col items-center text-white/80">
                <span className="animate-bounce text-3xl">▼</span>
                <span className="text-sm tracking-wide mt-1 opacity-80">scroll</span>
            </div>
        </section>
    );
}
