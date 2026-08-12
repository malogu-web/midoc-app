import { z } from "zod";

const ServerEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  // Use service role only on the server (NEVER expose to client).
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
});

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20).optional(),
});

export function getServerEnv() {
  const parsed = ServerEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      "Missing/invalid server env vars. Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return parsed.data;
}

export function getClientEnv() {
  const parsed = ClientEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error("Invalid client env vars (NEXT_PUBLIC_SUPABASE_*).");
  }
  return parsed.data;
}

