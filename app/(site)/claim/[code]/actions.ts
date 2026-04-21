"use server";

import { createClient } from "@/lib/supabase/server";
import { redeemClaimToken } from "@/lib/account-claim";

type Input = {
  code: string;
  password: string;
};

export async function redeemAccountClaim({
  code,
  password,
}: Input): Promise<{ error: string | null; email: string | null }> {
  const { email, error } = await redeemClaimToken({ code, password });

  if (error || !email) {
    return { error: error ?? "Unable to claim account.", email: null };
  }

  // Log the user in right away so they can land on their account page.
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: signInError.message, email };
  }

  return { error: null, email };
}
