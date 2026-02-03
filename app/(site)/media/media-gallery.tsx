"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type MediaItem = {
  name: string;
  url: string;
};

type MediaGalleryProps = {
  items: MediaItem[];
};

export default function MediaGallery({ items }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!items.length) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((prev) =>
          prev === null ? null : (prev + 1) % items.length
        );
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((prev) =>
          prev === null ? null : (prev - 1 + items.length) % items.length
        );
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setActiveIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, items.length]);

  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  return (
    <>
      {items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item, index) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 text-left"
            >
              <Image
                src={item.url}
                alt={item.name}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No media uploaded yet.</p>
      )}

      {activeItem ? (
        <div
          role="button"
          tabIndex={-1}
          onClick={() => setActiveIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            role="presentation"
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-black"
          >
            <Image
              src={activeItem.url}
              alt={activeItem.name}
              width={1600}
              height={1200}
              className="h-auto max-h-[90vh] w-auto max-w-[90vw] object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
