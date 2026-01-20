"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/account`;
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 md:px-10 lg:px-20 bg-gray-50">
      <div className="max-w-lg w-full bg-white p-10 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign up</h1>

        <p className="text-gray-600 mb-8">
          Create your account with an email and password. You’ll receive a
          confirmation email to complete the signup.
        </p>

        {success ? (
          <div className="text-center py-6">
            <h2 className="text-xl font-semibold text-green-700">
              Check your email to confirm
            </h2>
            <p className="text-gray-600 mt-2">
              Once confirmed, you can log in anytime.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Email address
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Password
              <input
                type="password"
                required
                autoComplete="new-password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700"
              />
              <span className="mt-2 block text-xs text-gray-500">
                Use at least 6 characters.
              </span>
            </label>

            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Creating account..." : "Sign up"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-green-700 hover:text-green-800">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
