import { createClient } from "@supabase/supabase-js";
import { getClientEnv } from "@/lib/env";

// Browser client (anon). Useful for auth or public reads.
// DO NOT use it for privileged writes of medical data.
export function createSupabaseBrowser() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getClientEnv();
  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

