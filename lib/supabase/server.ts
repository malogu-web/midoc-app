import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getClientEnv } from "@/lib/env";

// Cliente para Server Components / Route Handlers. Usa la anon key +
// la sesión del médico (leída de cookies), así que respeta RLS igual
// que el cliente de navegador — un médico solo puede leer/escribir lo
// que sus propias políticas de RLS le permiten.
export async function createSupabaseServer() {
  const cookieStore = await cookies();
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getClientEnv();

  return createServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Se puede ignorar si se llama desde un Server Component sin
          // permiso de escritura de cookies — el middleware ya refresca
          // la sesión en cada request.
        }
      },
    },
  });
}
