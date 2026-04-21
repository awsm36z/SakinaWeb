"use client";

import { useState } from "react";
import refundPolicy from "@/app/(data)/refund_policy";

type Props = {
  // "compact" shows the summary with a "Read full policy" toggle — ideal for
  // inline placements like the trip registration box.
  // "full" shows title, summary, and every paragraph by default — for the
  // FAQ or a dedicated policy page.
  variant?: "compact" | "full";
  // Override the surface styling. On dark panels (like the moss registration
  // box), pass "inverse" to swap to light text on a translucent backdrop.
  tone?: "default" | "inverse";
};

export default function RefundPolicy({
  variant = "full",
  tone = "default",
}: Props) {
  const [expanded, setExpanded] = useState(variant === "full");

  const isInverse = tone === "inverse";
  const headingClass = isInverse
    ? "text-sm font-semibold uppercase tracking-[0.2em] text-white/90"
    : "text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-moss)]";
  const bodyClass = isInverse
    ? "text-sm leading-relaxed text-white/85"
    : "text-sm leading-relaxed text-gray-700";
  const linkClass = isInverse
    ? "mt-2 text-xs font-semibold uppercase tracking-wider text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
    : "mt-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-moss)] underline decoration-[var(--brand-moss)]/40 underline-offset-4 hover:decoration-[var(--brand-moss)]";

  return (
    <div
      className={
        isInverse
          ? "rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur"
          : "rounded-2xl border border-[rgba(114,121,111,0.18)] bg-white/70 p-5"
      }
    >
      <p className={headingClass}>{refundPolicy.title}</p>
      <p className={`mt-2 ${bodyClass}`}>{refundPolicy.summary}</p>

      {expanded ? (
        <div className="mt-3 space-y-2">
          {refundPolicy.paragraphs.map((paragraph, index) => (
            <p key={index} className={bodyClass}>
              {paragraph}
            </p>
          ))}
          <p
            className={`pt-1 text-[0.65rem] uppercase tracking-wider ${
              isInverse ? "text-white/60" : "text-gray-500"
            }`}
          >
            Last updated {refundPolicy.lastUpdated}
          </p>
        </div>
      ) : null}

      {variant === "compact" ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={linkClass}
        >
          {expanded ? "Hide full policy" : "Read full policy"}
        </button>
      ) : null}
    </div>
  );
}
