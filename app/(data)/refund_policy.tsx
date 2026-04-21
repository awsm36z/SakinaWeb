// Single source of truth for the refund policy copy.
// Paste the real text into `paragraphs` below — each array entry renders as
// its own paragraph. `summary` is the short version shown inside the trip
// registration box; keep it to 1–2 sentences.

export type RefundPolicyContent = {
  title: string;
  summary: string;
  paragraphs: string[];
  lastUpdated: string; // ISO yyyy-mm-dd
};

const refundPolicy: RefundPolicyContent = {
  title: "Refund & Cancellation Policy",
  summary:
    "TODO: paste a one-sentence summary here (e.g., full refunds up to 30 days before, partial after, weather-cancellation guarantee).",
  paragraphs: [
    "TODO: paste the full refund policy text here. Each array entry renders as its own paragraph — break your text up by paragraph.",
  ],
  lastUpdated: "2026-04-21",
};

export default refundPolicy;
