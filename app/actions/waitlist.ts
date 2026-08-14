"use server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const WaitlistSchema = z.object({
  email: z.string().email().max(254),
  specialty: z.string().min(2).max(120),
  telefono: z.string().max(30).optional(),
});

export type WaitlistResult =
  | { ok: true }
  | { ok: false; message: string };

export async function addToWaitlist(input: unknown): Promise<WaitlistResult> {
  const parsed = WaitlistSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Datos inválidos." };

  const supabase = createSupabaseAdmin();

  const { error } = await supabase.from("waitlist").insert({
    email: parsed.data.email.toLowerCase(),
    specialty: parsed.data.specialty,
    telefono: parsed.data.telefono || null,
  });

  if (error) return { ok: false, message: "No se pudo guardar tu registro." };
  return { ok: true };
}
