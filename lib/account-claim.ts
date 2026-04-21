import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// How long a claim link stays valid. 30 days is generous but still expires
// eventually so abandoned tokens get purged.
const CLAIM_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function generateClaimCode() {
  // 24 bytes → 32-character base64url. URL-safe and plenty of entropy.
  return randomBytes(24).toString("base64url");
}

export function buildClaimUrl(code: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return `${base.replace(/\/$/, "")}/claim/${code}`;
}

type CreateInput = {
  profileId: string;
  email: string;
};

// Create a single-use claim token for a guest profile. Called from the RSVP
// server actions whenever a new guest profile row is created.
export async function createClaimToken({
  profileId,
  email,
}: CreateInput): Promise<{
  code: string | null;
  claimUrl: string | null;
  error: string | null;
}> {
  const admin = createAdminClient();
  const code = generateClaimCode();
  const expiresAt = new Date(Date.now() + CLAIM_TTL_MS).toISOString();

  const { error } = await admin.from("account_claim_tokens").insert({
    code,
    profile_id: profileId,
    email: email.toLowerCase(),
    expires_at: expiresAt,
  });

  if (error) {
    return { code: null, claimUrl: null, error: error.message };
  }

  return { code, claimUrl: buildClaimUrl(code), error: null };
}

export type ClaimTokenRecord = {
  token_id: string;
  code: string;
  profile_id: string;
  email: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

// Look up a claim token and validate it. Returns the token + guest profile
// data, or an error if the token is unknown, expired, or already used.
export async function lookupClaimToken(code: string): Promise<{
  token: ClaimTokenRecord | null;
  profile: {
    id: string;
    email: string | null;
    name_first: string | null;
    name_last: string | null;
  } | null;
  error: string | null;
}> {
  const admin = createAdminClient();

  const { data: token, error } = await admin
    .from("account_claim_tokens")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) return { token: null, profile: null, error: error.message };
  if (!token) {
    return { token: null, profile: null, error: "Claim link not found." };
  }
  if (token.used_at) {
    return {
      token: null,
      profile: null,
      error: "This claim link has already been used.",
    };
  }
  if (new Date(token.expires_at).getTime() < Date.now()) {
    return {
      token: null,
      profile: null,
      error: "This claim link has expired.",
    };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, name_first, name_last")
    .eq("id", token.profile_id)
    .maybeSingle();

  return { token: token as ClaimTokenRecord, profile: profile ?? null, error: null };
}

type RedeemInput = {
  code: string;
  password: string;
};

// Convert a guest profile into a real auth user. Flow:
//   1. Create Supabase auth user with email_confirm=true (they proved
//      ownership by clicking the link).
//   2. UPDATE profiles SET id = <new_user_id> WHERE id = <guest_id>.
//      All FKs referencing profiles(id) cascade, so trip_applications,
//      trip_instructors, profile_badges, etc. re-point automatically.
//   3. Mark token used.
export async function redeemClaimToken({
  code,
  password,
}: RedeemInput): Promise<{
  userId: string | null;
  email: string | null;
  error: string | null;
}> {
  const admin = createAdminClient();
  const { token, profile, error: lookupError } = await lookupClaimToken(code);

  if (lookupError || !token || !profile) {
    return {
      userId: null,
      email: null,
      error: lookupError ?? "Invalid claim link.",
    };
  }

  if (password.length < 6) {
    return {
      userId: null,
      email: null,
      error: "Password must be at least 6 characters.",
    };
  }

  const email = (profile.email ?? token.email).toLowerCase();

  // If a Supabase auth user already exists for this email, don't blow up —
  // tell the visitor to log in instead.
  const { data: existing } = await admin.auth.admin.listUsers();
  const alreadyExists = existing?.users?.some(
    (user) => user.email?.toLowerCase() === email
  );
  if (alreadyExists) {
    return {
      userId: null,
      email,
      error:
        "An account already exists for this email. Please log in instead.",
    };
  }

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name_first: profile.name_first ?? undefined,
        name_last: profile.name_last ?? undefined,
      },
    });

  if (createError || !created.user) {
    return {
      userId: null,
      email,
      error: createError?.message ?? "Unable to create account.",
    };
  }

  const newUserId = created.user.id;

  // Re-point the profile row. Because every referencing FK has ON UPDATE
  // CASCADE, trip_applications / trip_instructors / etc. follow along.
  const { error: updateError } = await admin
    .from("profiles")
    .update({ id: newUserId })
    .eq("id", profile.id);

  if (updateError) {
    // Best-effort cleanup so we don't strand an auth user without a profile.
    await admin.auth.admin.deleteUser(newUserId);
    return {
      userId: null,
      email,
      error: `Unable to link account: ${updateError.message}`,
    };
  }

  // Burn the token.
  await admin
    .from("account_claim_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("token_id", token.token_id);

  return { userId: newUserId, email, error: null };
}
