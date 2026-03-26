"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
    setSubmitting(false);
  };

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-6 md:px-10 lg:px-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[rgba(47,93,80,0.12)] blur-3xl" />
        <div className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-[rgba(184,138,82,0.16)] blur-3xl" />
      </div>

      <div className="brand-panel-strong relative w-full max-w-md rounded-[1.75rem] p-8 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(67,49,31,0.14)] sm:p-10">
        <div className="mb-8 text-center">
          <p className="brand-kicker">
            SAKINA
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with your email and password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Email address
            <input
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="brand-input mt-2 px-4 py-3"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="brand-input mt-2 px-4 py-3"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="brand-button w-full rounded-xl px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          New here?{" "}
          <Link
            href="/signup"
            className="brand-link"
          >
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}
