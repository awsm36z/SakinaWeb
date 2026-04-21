"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redeemAccountClaim } from "./actions";

type Props = {
  code: string;
};

export default function ClaimForm({ code }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "submitting" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setStatus({ kind: "error", message: "Passwords don't match." });
      return;
    }
    if (password.length < 6) {
      setStatus({
        kind: "error",
        message: "Use at least 6 characters.",
      });
      return;
    }

    setStatus({ kind: "submitting" });
    const { error } = await redeemAccountClaim({ code, password });

    if (error) {
      setStatus({ kind: "error", message: error });
      return;
    }

    router.push("/account?claimed=1");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Password
        <input
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="brand-input mt-2 px-3 py-2 text-sm"
        />
        <span className="mt-1 block text-xs font-normal text-gray-500">
          At least 6 characters.
        </span>
      </label>

      <label className="block text-sm font-medium text-gray-700">
        Confirm password
        <input
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="brand-input mt-2 px-3 py-2 text-sm"
        />
      </label>

      <button
        type="submit"
        disabled={status.kind === "submitting"}
        className="brand-button w-full rounded-xl px-4 py-3 text-sm disabled:opacity-60"
      >
        {status.kind === "submitting"
          ? "Creating account…"
          : "Create account"}
      </button>

      {status.kind === "error" ? (
        <p className="text-sm text-red-600">{status.message}</p>
      ) : null}

      <p className="text-xs text-gray-500">
        Prefer not to create an account? That&apos;s fine — your RSVP is still
        confirmed.
      </p>
    </form>
  );
}
