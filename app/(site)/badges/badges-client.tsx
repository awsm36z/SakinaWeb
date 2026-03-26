"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Modal from "@/app/components/modal/modal";

type BadgeRecord = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string | null;
  awarded_at: string | null;
  earned: boolean;
};

type Props = {
  badges: BadgeRecord[];
};

function isRenderableImageSrc(src: string | null) {
  if (!src) return false;
  if (src.startsWith("/")) return true;

  try {
    const parsed = new URL(src);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isMaterialSymbolName(src: string | null) {
  if (!src) return false;
  return /^[a-z0-9_]+$/i.test(src);
}

function fallbackGlyph(category: string | null) {
  switch ((category ?? "").toLowerCase()) {
    case "foundation":
      return "◌";
    case "skills":
      return "△";
    case "experience":
      return "⛰";
    case "overnight":
      return "☾";
    case "leadership":
      return "⌘";
    case "spiritual":
      return "✦";
    case "community":
      return "◍";
    default:
      return "✦";
  }
}

export default function BadgesClient({ badges }: Props) {
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);

  const selectedBadge = useMemo(
    () => badges.find((badge) => badge.id === selectedBadgeId) ?? null,
    [badges, selectedBadgeId]
  );

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <section className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr,0.85fr]">
          <div>
            <p className="font-inter mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-moss)]">
              Badge Archive
            </p>
            <h1 className="font-headline text-5xl leading-[1.08] text-[var(--brand-ink)] md:text-6xl">
              See every badge in the Sakina journey.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#5f625b]">
              Earned badges appear in full color. Locked ones stay muted until
              you hover or open them, so members can see what is possible next.
            </p>
          </div>

          <div className="rounded-xl bg-[rgba(240,243,255,0.82)] p-8">
            <p className="font-inter text-[11px] uppercase tracking-[0.22em] text-[#72796f]">
              Progress
            </p>
            <div className="mt-4 flex items-end gap-3">
              <p className="font-headline text-5xl text-[var(--brand-ink)]">
                {badges.filter((badge) => badge.earned).length}
              </p>
              <p className="pb-2 text-sm text-[#5f625b]">
                of {badges.length} badges earned
              </p>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#5f625b]">
              Click any badge to read its description and, when earned, the
              date it was awarded.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {badges.map((badge) => {
            const tint = badge.color ?? "#37683b";
            const hasIconImage = isRenderableImageSrc(badge.icon);
            const hasMaterialSymbol = !hasIconImage && isMaterialSymbolName(badge.icon);
            return (
              <button
                key={badge.id}
                type="button"
                onClick={() => setSelectedBadgeId(badge.id)}
                className={`group flex min-h-56 flex-col items-center justify-center rounded-2xl border p-6 text-center transition-all duration-300 ${
                  badge.earned
                    ? "bg-white shadow-[0_18px_50px_rgba(67,49,31,0.08)]"
                    : "bg-[rgba(240,243,255,0.62)] grayscale hover:grayscale-0 hover:bg-white"
                }`}
                style={{
                  borderColor: badge.earned ? `${tint}22` : "rgba(114,121,111,0.12)",
                }}
              >
                <div
                  className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: badge.earned ? `${tint}22` : "rgba(255,255,255,0.9)",
                    color: tint,
                  }}
                >
                  {hasIconImage ? (
                    <Image
                      src={badge.icon as string}
                      alt={badge.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : hasMaterialSymbol ? (
                    <span className="material-symbols-outlined badge-icon-symbol">
                      {badge.icon}
                    </span>
                  ) : (
                    <span className="text-3xl">{fallbackGlyph(badge.category)}</span>
                  )}
                </div>

                <p className="mt-5 font-headline text-xl text-[var(--brand-ink)]">
                  {badge.name}
                </p>
                <p className="mt-2 font-inter text-[11px] uppercase tracking-[0.18em] text-[#72796f]">
                  {badge.category ?? "General"}
                </p>
                <span
                  className={`mt-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                    badge.earned
                      ? "bg-[rgba(55,104,59,0.1)] text-[var(--brand-moss)]"
                      : "bg-[rgba(122,106,88,0.08)] text-[#7a6a58]"
                  }`}
                >
                  {badge.earned ? "Earned" : "Locked"}
                </span>
              </button>
            );
          })}
        </section>
      </div>

      <Modal
        isOpen={Boolean(selectedBadge)}
        onClose={() => setSelectedBadgeId(null)}
        title={selectedBadge?.name}
      >
        {selectedBadge ? (
          <div className="space-y-4">
            {(() => {
              const hasIconImage = isRenderableImageSrc(selectedBadge.icon);
              const hasMaterialSymbol =
                !hasIconImage && isMaterialSymbolName(selectedBadge.icon);
              return (
            <div className="flex items-center gap-4">
              <div
                className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full"
                style={{
                  background: `${selectedBadge.color ?? "#37683b"}22`,
                  color: selectedBadge.color ?? "#37683b",
                }}
              >
                {hasIconImage ? (
                  <Image
                    src={selectedBadge.icon as string}
                    alt={selectedBadge.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : hasMaterialSymbol ? (
                  <span className="material-symbols-outlined badge-icon-symbol">
                    {selectedBadge.icon}
                  </span>
                ) : (
                  <span className="text-2xl">
                    {fallbackGlyph(selectedBadge.category)}
                  </span>
                  )}
              </div>
              <div>
                <p className="font-inter text-[11px] uppercase tracking-[0.2em] text-[#72796f]">
                  {selectedBadge.category ?? "General"}
                </p>
                <p className="mt-1 text-sm text-[#5f625b]">
                  {selectedBadge.earned
                    ? "This badge has been earned."
                    : "This badge has not been earned yet."}
                </p>
              </div>
            </div>
              );
            })()}

            <p className="text-sm leading-7 text-[#5f625b]">
              {selectedBadge.description ?? "No description yet."}
            </p>

            <div className="rounded-xl bg-[rgba(240,243,255,0.72)] px-4 py-3 text-sm">
              <p className="font-inter text-[11px] uppercase tracking-[0.2em] text-[#72796f]">
                Earned Date
              </p>
              <p className="mt-1 text-[var(--brand-ink)]">
                {selectedBadge.awarded_at
                  ? new Date(selectedBadge.awarded_at).toLocaleDateString()
                  : "Not earned yet"}
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
