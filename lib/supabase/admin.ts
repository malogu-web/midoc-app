import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";

// Cliente admin (service role). SALTA RLS por completo — úsalo SOLO en
// código de servidor para operaciones que deliberadamente necesitan
// ignorar los permisos por médico (ej. alta pública a waitlist antes
// de que exista sesión). Nunca importar esto en un componente cliente.
export function createSupabaseAdmin() {
  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
