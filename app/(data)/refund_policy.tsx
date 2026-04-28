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
    `45 days or more before course start: Cancel and receive a full refund minus a $150 administrative fee.`,
  paragraphs: [
    `45 days or more before course start: Cancel and receive a full refund minus a $150 administrative fee.\n
    Less than 45 days before course start: Non-refundable and non-transferable.\n
    If Tayseer Wilderness cancels: Full refund or transfer to a future course of your choice.`
  ],
  lastUpdated: "2026-04-21",
};

export default refundPolicy;
