import { formatGenderRestriction } from "@/lib/trips";

type Props = {
  value: string | null | undefined;
  // Visual treatments. "chip" = small inline pill (cards, headers).
  // "banner" = full-width call-out used at the top of RSVP forms.
  variant?: "chip" | "banner";
  // When true, render even for the default "Open to all" value. Default
  // hides the chip for open events to avoid noise — the absence of a
  // chip is the affirmative signal.
  alwaysShow?: boolean;
};

export default function GenderRestrictionChip({
  value,
  variant = "chip",
  alwaysShow = false,
}: Props) {
  const meta = formatGenderRestriction(value);
  if (!meta.isRestricted && !alwaysShow) return null;

  if (variant === "banner") {
    return (
      <div
        className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-medium ${meta.chipClass}`}
      >
        {/* Single inclusive icon for all variants — no gendered glyphs. */}
        <span
          className="material-symbols-outlined mt-[1px] text-[18px]"
          aria-hidden
        >
          diversity_3
        </span>
        <span>{meta.bannerSentence}</span>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${meta.chipClass}`}
    >
      {meta.label}
    </span>
  );
}
