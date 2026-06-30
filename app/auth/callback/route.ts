import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the post-confirmation redirect Supabase sends people to after
// they click the link in their signup / magic-link / password-reset
// email. Supports both flows the project might be on:
//
//   1) PKCE flow (default for @supabase/ssr) — link comes back with
//      ?code=<verifier> that we exchange for a session.
//   2) token_hash flow (used if the email template is customized to
//      `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=...`)
//      — we verify the OTP directly here.
//
// Without this route the email link 404s, which is what was happening
// for new signups.

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  // `type` is one of: signup | invite | magiclink | recovery | email_change
  const type = (searchParams.get("type") ?? "email") as
    | "signup"
    | "invite"
    | "magiclink"
    | "recovery"
    | "email_change"
    | "email";
  const next = searchParams.get("next") ?? "/account";

  // Defensive: never redirect off-domain even if `next` is tampered with.
  const safeNext = next.startsWith("/") ? next : "/account";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}?welcome=1`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        "Confirmation link expired. Try signing up again."
      )}`
    );
  }

  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      type: type === "email" ? "email" : type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}?welcome=1`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        "Confirmation link expired. Try signing up again."
      )}`
    );
  }

  // No code or token — landed here by accident. Send them somewhere
  // sensible instead of 404'ing.
  return NextResponse.redirect(`${origin}/login`);
}
