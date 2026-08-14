import { z } from "zod";

// NOTA: la URL de Supabase no es secreta (por eso vive en NEXT_PUBLIC_*),
// pero el server SÍ la necesita para crear el cliente admin con la service role key.
// Antes este archivo pedía una variable "SUPABASE_URL" que nunca existió en Vercel
// (solo existe NEXT_PUBLIC_SUPABASE_URL) — por eso getServerEnv() nunca pudo pasar
// y nadie lo terminó usando en el código real.
const ServerEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  // Use service role only on the server (NEVER expose to client).
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
});

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

export function getServerEnv() {
  const parsed = ServerEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      "Faltan/son inválidas las env vars de servidor. Requeridas: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. Revisa Vercel → Settings → Environment Variables."
    );
  }
  return parsed.data;
}

export function getClientEnv() {
  const parsed = ClientEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      "Faltan/son inválidas las env vars de cliente. Requeridas: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return parsed.data;
}

