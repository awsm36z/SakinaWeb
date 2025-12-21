"use client";

import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // For now, we only show success.
    // Later, you hook this to an API route.
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 md:px-10 lg:px-20 bg-gray-50">
      <div className="max-w-lg w-full bg-white p-10 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Join the Waiting List
        </h1>

        <p className="text-gray-600 mb-8">
          Be the first to know when Sakina Wilderness opens new trips for the
          summer season. Enter your email below and we’ll notify you with
          updates.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full
                px-4 py-3
                border border-gray-300
                rounded-xl
                focus:outline-none
                focus:ring-2 focus:ring-green-700
              "
            />

            <button
              type="submit"
              className="
                w-full
                px-4 py-3
                bg-green-700
                text-white
                font-semibold
                rounded-xl
                hover:bg-green-800
                transition
              "
            >
              Join the waiting list
            </button>
          </form>
        ) : (
          <div className="text-center py-6">
            <h2 className="text-xl font-semibold text-green-700">
              You're on the list! 🌲
            </h2>
            <p className="text-gray-600 mt-2">
              We’ll reach out soon with more information.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
