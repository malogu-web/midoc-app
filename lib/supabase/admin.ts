"use server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const WaitlistSchema = z.object({
  email: z.string().email().max(254),
  specialty: z.string().min(2).max(120),
});

export async function joinWaitlist(formData: FormData) {
  try {
    const input = WaitlistSchema.parse({
      email: formData.get("email"),
      specialty: formData.get("specialty"),
    });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await supabase
      .from("waitlist")
      .insert({ email: input.email.toLowerCase(), specialty: input.specialty });

    if (error) return { ok: false, message: "No se pudo guardar tu registro." };
    return { ok: true };
  } catch {
    return { ok: false, message: "Datos inválidos." };
  }
}