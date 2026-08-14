import { createBrowserClient } from "@supabase/ssr";
import { getClientEnv } from "@/lib/env";

// Cliente de navegador (anon key). Usa @supabase/ssr para que la sesión
// (cookies) quede sincronizada con el servidor — esto es lo que hace
// posible que el middleware y los Server Components sepan quién es el
// médico logueado. NUNCA usar este cliente para escrituras privilegiadas
// que deban saltarse RLS (para eso existe lib/supabase/admin.ts).
export function createSupabaseBrowser() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getClientEnv();
  return createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

