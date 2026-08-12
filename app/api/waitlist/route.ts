import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { email, specialty } = await req.json();

    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Email requerido." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await supabase
      .from("waitlist")
      .insert({ email: email.toLowerCase(), specialty });

    if (error) {
      return NextResponse.json(
        { ok: false, message: "No se pudo guardar tu registro." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Error inesperado." },
      { status: 500 }
    );
  }
}