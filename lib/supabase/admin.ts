import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service role key. Use ONLY from
// server actions / route handlers — never expose this client to the browser.
// Required env: SUPABASE_SERVICE_ROLE_KEY (set in .env.local).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase admin env vars. Set SUPABASE_SERVICE_ROLE_KEY in .env.local."
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
