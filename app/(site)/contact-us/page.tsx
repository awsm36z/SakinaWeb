import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us — Sakina Wilderness",
  description:
    "Contact Sakina Wilderness through Instagram or email.",
};

export default function ContactUsPage() {
  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="text-center">
          <p className="brand-kicker">Contact Us</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 md:text-5xl">
            Reach out to Sakina Wilderness
          </h1>
        </header>

        <section className="brand-panel rounded-2xl p-6 md:p-8">
          <div className="space-y-6 text-center">
            <p className="text-lg text-gray-700">
              Check us out on Instagram:
            </p>
            <Link
              href="https://www.instagram.com/sakinawilderness/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--brand-moss)] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#285345]"
            >
              @sakinawilderness
            </Link>

            <p className="text-lg text-gray-700">
              Email us at:{" "}
              <Link
                href="mailto:support@sakinawilderness.org"
                className="font-semibold text-[var(--brand-moss)] transition-colors hover:text-[#285345]"
              >
                support@sakinawilderness.org
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
