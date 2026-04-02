import type { Metadata } from "next";
import Link from "next/link";
import TripCard from "@/app/components/tripcard/tripcard";

export const metadata: Metadata = {
  title: "UI Preview — Sakina Wilderness",
  description:
    "A visual inventory of the current Sakina Wilderness interface styles.",
};

const previewTheme = {
  "--preview-bg": "#F5F1E8",
  "--preview-surface": "rgba(250, 246, 238, 0.9)",
  "--preview-surface-strong": "rgba(255, 251, 244, 0.96)",
  "--preview-border": "rgba(122, 106, 88, 0.24)",
  "--preview-primary": "#2F4F3F",
  "--preview-secondary": "#7A6A58",
  "--preview-accent": "#C9A45C",
  "--preview-dark": "#1B2A23",
} as React.CSSProperties;

const buttonStyles = [
  {
    name: "Primary",
    className:
      "rounded-full bg-[var(--preview-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95",
  },
  {
    name: "Secondary",
    className:
      "rounded-full border border-[var(--preview-border)] bg-white/60 px-5 py-3 text-sm font-semibold text-[var(--preview-dark)] transition hover:bg-white/80",
  },
  {
    name: "Accent",
    className:
      "rounded-full bg-[var(--preview-accent)] px-5 py-3 text-sm font-semibold text-[var(--preview-dark)] transition hover:brightness-95",
  },
];

const badges = [
  { label: "Open", className: "bg-[rgba(47,79,63,0.12)] text-[var(--preview-primary)]" },
  { label: "Waitlist", className: "bg-[rgba(201,164,92,0.16)] text-[var(--preview-secondary)]" },
  { label: "Closed", className: "bg-[rgba(122,106,88,0.12)] text-[var(--preview-secondary)]" },
  { label: "Featured", className: "bg-[rgba(27,42,35,0.1)] text-[var(--preview-dark)]" },
];

const colorTokens = [
  { name: "Warm Sand", hex: "#F5F1E8", className: "bg-[#f5f1e8]" },
  { name: "Deep Olive", hex: "#2F4F3F", className: "bg-[#2f4f3f]" },
  { name: "Earth Brown", hex: "#7A6A58", className: "bg-[#7a6a58]" },
  { name: "Desert Gold", hex: "#C9A45C", className: "bg-[#c9a45c]" },
  { name: "Charcoal Green", hex: "#1B2A23", className: "bg-[#1b2a23]" },
  { name: "Soft Linen", hex: "#FBF7EF", className: "bg-[#fbf7ef]" },
];

const stats = [
  { label: "Trips hosted", value: "18" },
  { label: "Returning hikers", value: "67%" },
  { label: "Avg. group size", value: "12" },
];

const tableRows = [
  {
    trip: "North Cascades Overnight",
    season: "Summer",
    status: "Open",
    spots: "4 left",
  },
  {
    trip: "Coastal Reflection Retreat",
    season: "Fall",
    status: "Waitlist",
    spots: "Join list",
  },
  {
    trip: "Snow Camp Foundations",
    season: "Winter",
    status: "Closed",
    spots: "Sold out",
  },
];

const principles = [
  {
    title: "Quiet Surfaces",
    copy: "Cards should feel like calm layers inside the landscape, not bright boxes pasted onto it.",
  },
  {
    title: "Earth-Led Contrast",
    copy: "Use moss and brass as controlled accents. Let cream and ink do most of the work.",
  },
  {
    title: "Soft Structure",
    copy: "Rounded forms, warm borders, and restrained shadows fit the reflective outdoor tone better than hard edges.",
  },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="brand-panel rounded-3xl p-6 md:p-8">
      <div className="mb-6 max-w-2xl">
        <h2 className="text-2xl font-semibold text-[var(--preview-dark)]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--preview-secondary)]">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function UIPreviewPage() {
  return (
    <main
      className="min-h-screen px-6 py-12 md:px-10 lg:px-20"
      style={{
        ...previewTheme,
        background:
          "radial-gradient(circle at top left, rgba(201,164,92,0.18), transparent 28%), radial-gradient(circle at top right, rgba(47,79,63,0.1), transparent 26%), linear-gradient(180deg, #f8f4eb 0%, #f5f1e8 45%, #f0e9de 100%)",
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section
          className="overflow-hidden rounded-[2rem] border p-0 shadow-[0_28px_70px_rgba(73,58,41,0.1)]"
          style={{
            borderColor: "var(--preview-border)",
            background:
              "linear-gradient(180deg, var(--preview-surface-strong), rgba(243,236,223,0.96))",
          }}
        >
          <div className="grid gap-8 p-8 md:p-12 lg:grid-cols-[1.4fr,0.9fr]">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--preview-primary)]">
                  Brand Direction Preview
                </p>
                <h1 className="text-4xl font-bold tracking-tight text-[var(--preview-dark)] md:text-6xl">
                  Olive, sand, earth, and gold with a calmer tone.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[var(--preview-secondary)] md:text-lg">
                  This version uses your updated palette: a serene sand base,
                  refined olive structure, earthy brown depth, and a muted gold
                  accent that feels deliberate instead of flashy.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {buttonStyles.map((button) => (
                  <button key={button.name} type="button" className={button.className}>
                    {button.name} button
                  </button>
                ))}
                <Link
                  href="/trips"
                  className="rounded-full px-5 py-3 text-sm font-semibold text-[var(--preview-secondary)] underline-offset-4 transition hover:text-[var(--preview-dark)] hover:underline"
                >
                  Compare with trips page
                </Link>
              </div>
            </div>

            <div
              className="rounded-[1.75rem] border p-6"
              style={{
                borderColor: "var(--preview-border)",
                background:
                  "linear-gradient(180deg, rgba(251,247,239,0.96), rgba(238,231,220,0.92))",
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--preview-accent)]">
                Mood
              </p>
              <p className="mt-4 font-anton text-4xl uppercase leading-none text-[var(--preview-dark)] md:text-5xl">
                Grounded
              </p>
              <p className="mt-4 text-sm leading-7 text-[var(--preview-secondary)]">
                Calm, natural, reflective, and editorial. The interface should
                support the photography and story instead of competing with it.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border bg-white/55 p-5"
                    style={{ borderColor: "var(--preview-border)" }}
                  >
                    <p className="text-3xl font-bold text-[var(--preview-dark)]">{stat.value}</p>
                    <p className="mt-1 text-sm text-[var(--preview-secondary)]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Section
          title="Palette Direction"
          description="This is the proposed brand balance: mostly cream and warm neutrals, anchored by moss green and supported by one restrained warm accent."
        >
          <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {colorTokens.map((token) => (
                <div
                  key={token.name}
                className="rounded-2xl border bg-white/60 p-4"
                style={{ borderColor: "var(--preview-border)" }}
              >
                <div
                    className={`h-24 rounded-xl border ${token.className}`}
                    style={{ borderColor: "var(--preview-border)" }}
                  />
                  <div className="mt-3">
                    <p className="font-semibold text-[var(--preview-dark)]">{token.name}</p>
                    <p className="text-sm text-[var(--preview-secondary)]">{token.hex}</p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-[1.75rem] border p-6"
              style={{
                borderColor: "var(--preview-border)",
                background: "rgba(251,247,239,0.78)",
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--preview-primary)]">
                Usage Rule
              </p>
              <p className="mt-4 text-3xl font-bold text-[var(--preview-dark)]">
                70 / 20 / 10
              </p>
              <p className="mt-3 text-base leading-7 text-[var(--preview-secondary)]">
                Let sand and neutral surfaces dominate. Use deep olive for
                structure and primary actions. Use desert gold only as a small
                accent for badges, highlights, and moments of emphasis.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <span
                    key={badge.label}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Typography and Tone"
          description="The type system should stay clean, but feel more editorial and less generic through spacing, contrast, and stronger display moments."
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--preview-primary)]">
                Eyebrow label
              </p>
              <h1 className="text-5xl font-bold tracking-tight text-[var(--preview-dark)]">
                Reflective outdoor design with a softer landing.
              </h1>
              <h2 className="text-3xl font-semibold text-[var(--preview-dark)]">
                Clean hierarchy, warmer contrast
              </h2>
              <p className="max-w-2xl text-base leading-8 text-[var(--preview-secondary)]">
                This is where the website can feel more intentional without
                becoming visually heavy. The typography should stay readable and
                modern, while the surfaces and spacing carry the atmosphere.
              </p>
              <p className="text-sm tracking-[0.2em] text-[var(--preview-accent)] uppercase">
                Calm • Grounded • Intentional
              </p>
            </div>

            <div
              className="rounded-[1.75rem] border p-6 text-white"
              style={{
                borderColor: "rgba(27,42,35,0.26)",
                background:
                  "linear-gradient(180deg, rgba(47,79,63,0.98), rgba(27,42,35,0.98))",
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(255,255,255,0.72)]">
                Editorial Accent
              </p>
              <p className="mt-4 font-anton text-5xl uppercase leading-none">
                Amanah
              </p>
              <p className="mt-4 max-w-sm text-sm leading-7 text-[rgba(255,255,255,0.82)]">
                Use stronger display type sparingly for moments that carry the
                mission, not for every headline.
              </p>
            </div>
          </div>
        </Section>

        <Section
          title="Styling Principles"
          description="These are the rules that keep the palette coherent once it moves into real components and pages."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="rounded-2xl border bg-white/55 p-5"
                style={{ borderColor: "var(--preview-border)" }}
              >
                <p className="text-lg font-semibold text-[var(--preview-dark)]">
                  {principle.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--preview-secondary)]">
                  {principle.copy}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Cards"
          description="Cards should feel lifted from the same material palette as the page. They should not revert to bright white unless there is a strong reason."
        >
          <div className="grid gap-8 xl:grid-cols-[0.9fr,1.1fr]">
            <div
              className="rounded-[1.75rem] border p-6 shadow-[0_18px_50px_rgba(67,49,31,0.08)]"
              style={{
                borderColor: "var(--preview-border)",
                background:
                  "linear-gradient(180deg, rgba(251,247,239,0.94), rgba(240,233,222,0.9))",
              }}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--preview-primary)]">
                Proposed content card
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-[var(--preview-dark)]">
                Warm surface, soft border, restrained depth
              </h3>
              <p className="mt-3 text-base leading-7 text-[var(--preview-secondary)]">
                Instead of plain white, cards can sit slightly above the cream
                background with ivory and sand tones. This keeps the page rich
                without feeling heavy.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="rounded-full bg-[var(--preview-primary)] px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
                >
                  Primary action
                </button>
                <button
                  type="button"
                  className="rounded-full border border-[var(--preview-border)] bg-white/60 px-4 py-2 text-sm font-semibold text-[var(--preview-dark)] hover:bg-white/80"
                >
                  Secondary
                </button>
                <span className="rounded-full bg-[rgba(201,164,92,0.18)] px-3 py-1 text-xs font-semibold text-[var(--preview-secondary)]">
                  Accent badge
                </span>
              </div>
            </div>

            <TripCard
              trip_id="ui-preview"
              title="North Cascades Weekend"
              dates="July 19-21, 2026"
              location="North Cascades, WA"
              durationDays={3}
              difficulty="Moderate"
              bannerImage="/tripBanners/horseShoeBasin.jpeg"
              summary="A production preview of the current trip card with status badge, image treatment, metadata, and hover behavior."
              status="open"
              spotsLeft={4}
            />
          </div>
        </Section>

        <Section
          title="Form Elements"
          description="Inputs, helper text, toggles, and action bars in the current UI mainly follow the signup flow styling."
        >
          <div className="grid gap-8 lg:grid-cols-[1fr,0.95fr]">
            <form
              className="space-y-5 rounded-[1.75rem] border p-6"
              style={{
                borderColor: "var(--preview-border)",
                background:
                  "linear-gradient(180deg, rgba(251,247,239,0.94), rgba(240,233,222,0.88))",
              }}
            >
              <label className="block text-sm font-medium text-gray-700">
                Full name
                <input
                  type="text"
                  placeholder="Amina Hassan"
                  className="mt-2 w-full rounded-xl border border-[var(--preview-border)] bg-white/75 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--preview-primary)]"
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Email address
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-[var(--preview-border)] bg-white/75 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--preview-primary)]"
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Trip interest
                <select className="mt-2 w-full rounded-xl border border-[var(--preview-border)] bg-white/75 px-4 py-3 text-[var(--preview-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--preview-primary)]">
                  <option>Beginner backpacking</option>
                  <option>Day hikes</option>
                  <option>Winter training</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Notes
                <textarea
                  rows={4}
                  placeholder="Share anything relevant for the group or guides."
                  className="mt-2 w-full rounded-xl border border-[var(--preview-border)] bg-white/75 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--preview-primary)]"
                />
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-[var(--preview-border)] bg-white/65 p-4">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 h-4 w-4 accent-[var(--preview-primary)]"
                />
                <span className="text-sm text-gray-600">
                  I understand this is a preview form used to inspect spacing,
                  borders, and field states.
                </span>
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--preview-primary)] px-5 py-3 text-sm font-semibold text-white hover:brightness-95"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-[var(--preview-border)] bg-white/65 px-5 py-3 text-sm font-semibold text-[var(--preview-dark)] hover:bg-white/80"
                >
                  Save draft
                </button>
              </div>
            </form>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[rgba(47,79,63,0.18)] bg-[rgba(47,79,63,0.08)] p-5">
                <p className="text-sm font-semibold text-[var(--preview-primary)]">Success state</p>
                <p className="mt-2 text-sm leading-6 text-[var(--preview-dark)]">
                  Registration saved. The current UI uses soft tinted surfaces
                  for positive feedback.
                </p>
              </div>
              <div className="rounded-2xl border border-[rgba(201,164,92,0.22)] bg-[rgba(201,164,92,0.12)] p-5">
                <p className="text-sm font-semibold text-[var(--preview-accent)]">Warning state</p>
                <p className="mt-2 text-sm leading-6 text-[var(--preview-secondary)]">
                  This trip has limited spots left. Waitlist styling also uses
                  a pale background with stronger text color.
                </p>
              </div>
              <div className="rounded-2xl border border-[rgba(122,106,88,0.2)] bg-[rgba(122,106,88,0.1)] p-5">
                <p className="text-sm font-semibold text-[var(--preview-secondary)]">Error state</p>
                <p className="mt-2 text-sm leading-6 text-[var(--preview-dark)]">
                  Payment could not be completed. Try again or contact the
                  organizers if the issue persists.
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Data Display"
          description="Structured data should still feel integrated with the brand. Use warm headers, soft separators, and let dense data sit on subdued surfaces."
        >
          <div className="overflow-hidden rounded-2xl border border-[var(--preview-border)]">
            <table className="min-w-full divide-y divide-[var(--preview-border)] bg-white/65">
              <thead className="bg-[rgba(251,247,239,0.82)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Trip
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Season
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Capacity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tableRows.map((row) => (
                  <tr key={row.trip}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {row.trip}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{row.season}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{row.status}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{row.spots}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </main>
  );
}
