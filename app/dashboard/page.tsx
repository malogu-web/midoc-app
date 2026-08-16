import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El middleware ya debería haber redirigido si no hay sesión, pero
  // esta es la segunda capa de defensa — nunca confiar solo en el
  // middleware para una vista con datos clínicos.
  if (!user) {
    redirect("/login");
  }

  // Auto-provisionar el perfil de médico en su primer login (magic
  // link no tiene un paso de "registro" separado). Si ya existe, esto
  // no hace nada gracias al onConflict.
  // La tabla medicos ya existía en el esquema original con "email" como
  // columna obligatoria — antes este upsert no la mandaba, así que
  // fallaba en silencio en cada login y ningún médico llegaba a tener
  // fila propia (lo que después tronaba cualquier alta de paciente con
  // un error de llave foránea, un 409).
  await supabase.from("medicos").upsert(
    { id: user.id, nombre: user.email, email: user.email },
    { onConflict: "id", ignoreDuplicates: true }
  );

  return <DashboardClient medicoId={user.id} medicoEmail={user.email ?? ""} />;
}
