"use server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const WaitlistSchema = z.object({
  email: z.string().email().max(254),
  specialty: z.string().min(2).max(120),
});

export type WaitlistResult =
  | { ok: true }
  | { ok: false; message: string };

export async function addToWaitlist(input: unknown): Promise<WaitlistResult> {
  const parsed = WaitlistSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Datos inválidos." };

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await supabase
    .from("waitlist")
    .insert({
      email: parsed.data.email.toLowerCase(),
      specialty: parsed.data.specialty,
    });

  if (error) return { ok: false, message: "No se pudo guardar tu registro." };
 return { ok: true };
}