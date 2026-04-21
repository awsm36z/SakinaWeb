import Link from "next/link";
import { notFound } from "next/navigation";
import { lookupClaimToken } from "@/lib/account-claim";
import ClaimForm from "./claim-form";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function ClaimPage({ params }: Props) {
  const { code } = await params;
  const { token, profile, error } = await lookupClaimToken(code);

  if (!token || !profile) {
    return (
      <main className="brand-shell flex min-h-screen items-center justify-center px-6">
        <div className="brand-panel max-w-md rounded-2xl p-6 text-center">
          <p className="brand-kicker">Claim link</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            This link isn&apos;t valid
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            {error ?? "This claim link may have expired or already been used."}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link href="/login" className="brand-button px-4 py-2 text-sm">
              Log in
            </Link>
            <Link
              href="/contact-us"
              className="brand-button-secondary px-4 py-2 text-sm"
            >
              Get help
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!profile.email) {
    notFound();
  }

  const name = [profile.name_first, profile.name_last].filter(Boolean).join(" ");

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <div className="mx-auto max-w-lg py-12">
        <article className="brand-panel rounded-2xl p-6 md:p-8">
          <p className="brand-kicker">Claim your account</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900">
            Keep track of your trips
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Welcome back{name ? `, ${name}` : ""} — pick a password and your
            RSVP history will follow you to the new account. No re-signup
            needed.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Account email:{" "}
            <span className="font-medium text-gray-700">{profile.email}</span>
          </p>

          <ClaimForm code={token.code} />
        </article>
      </div>
    </main>
  );
}
