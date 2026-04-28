import Image from "next/image";
import type { TripBadgeOffered } from "@/lib/trips";

type Props = {
  badges: TripBadgeOffered[];
  // Visual treatment. "sidebar" is the compact card meant to sit in a
  // narrow sidebar; "panel" is the wider full-width version used inline.
  variant?: "sidebar" | "panel";
  // When the viewer is already signed in we drop the "create an account"
  // nudge — they don't need it. Public/unauthed viewers still see it.
  signedIn?: boolean;
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

function BadgeIcon({ icon, name }: { icon: string | null; name: string }) {
  if (isRenderableImageSrc(icon)) {
    return (
      <Image
        src={icon as string}
        alt={name}
        fill
        className="object-cover"
        sizes="56px"
      />
    );
  }
  if (isMaterialSymbolName(icon)) {
    return (
      <span className="material-symbols-outlined text-[28px] text-[var(--brand-moss)]">
        {icon}
      </span>
    );
  }
  return <span className="text-2xl text-[var(--brand-moss)]">✦</span>;
}

export default function BadgesOfferedCard({
  badges,
  variant = "panel",
  signedIn = false,
}: Props) {
  if (!badges.length) return null;

  if (variant === "sidebar") {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[rgba(47,93,80,0.12)]">
        <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-moss)]">
          Earn these badges on this trip
        </p>
        {!signedIn ? (
          <p className="mt-2 text-xs leading-relaxed text-[#5f625b]">
            Create a Sakina account after you register and we&apos;ll
            automatically credit your progress toward each one.
          </p>
        ) : null}
        <ul className={signedIn ? "mt-3 space-y-3" : "mt-4 space-y-3"}>
          {badges.map((badge) => (
            <li key={badge.id} className="flex items-start gap-3">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[rgba(185,240,184,0.42)]">
                <BadgeIcon icon={badge.icon} name={badge.name} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--brand-ink)]">
                  {badge.name}
                </span>
                {badge.description ? (
                  <span className="mt-0.5 block text-xs leading-snug text-[#5f625b] line-clamp-2">
                    {badge.description}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] bg-white p-6 shadow-sm md:p-8">
      <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-moss)]">
        Badges
      </p>
      <h2 className="font-headline mt-2 text-2xl text-[var(--brand-moss)] md:text-3xl">
        Earn these badges on this trip
      </h2>
      {!signedIn ? (
        <p className="mt-2 max-w-2xl text-sm text-[#5f625b]">
          Create a Sakina account after registering and we&apos;ll
          automatically credit your progress toward each badge below.
        </p>
      ) : null}
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {badges.map((badge) => (
          <li
            key={badge.id}
            className="flex items-start gap-3 rounded-2xl border border-[rgba(47,93,80,0.12)] bg-[rgba(255,250,241,0.6)] p-3"
          >
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[rgba(185,240,184,0.42)]">
              <BadgeIcon icon={badge.icon} name={badge.name} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[var(--brand-ink)]">
                {badge.name}
              </span>
              {badge.description ? (
                <span className="mt-0.5 block text-xs leading-snug text-[#5f625b]">
                  {badge.description}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
