"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

const supabase = createSupabaseBrowser();

type Props = {
  medicoId: string;
  medicoEmail: string;
};

export function DashboardClient({ medicoId, medicoEmail }: Props) {
  const [tab, setTab] = useState("inicio");
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [citas, setCitas] = useState<any[]>([]);
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Formulario expediente
  const [pacNombre, setPacNombre] = useState("");
  const [pacTelefono, setPacTelefono] = useState("");
  const [motivo, setMotivo] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [plan, setPlan] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargarDatos() {
    // RLS ya limita esto a los registros del médico logueado, pero
    // filtramos también en la query explícitamente: es más rápido
    // (usa el índice) y hace la intención explícita en el código.
    const [p, c, e] = await Promise.all([
      supabase
        .from("pacientes")
        .select("*")
        .eq("medico_id", medicoId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("citas")
        .select("*")
        .eq("medico_id", medicoId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("expedientes")
        .select("*")
        .eq("medico_id", medicoId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    setPacientes(p.data || []);
    setCitas(c.data || []);
    setExpedientes(e.data || []);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function crearExpediente() {
    const telefonoLimpio = pacTelefono.trim();

    if (!pacNombre.trim() || !telefonoLimpio || !motivo.trim() || !diagnostico.trim()) {
      setMsg("⚠️ Completa nombre, teléfono, motivo y diagnóstico.");
      return;
    }
    setLoading(true);
    setMsg("");

    // Identificar al paciente por TELÉFONO (no por nombre): dos
    // pacientes distintos con el mismo nombre ya no se mezclan. El
    // teléfono se compara solo dentro de los pacientes de ESTE
    // médico (medico_id), así que tampoco cruza expedientes entre
    // doctores distintos.
    let pacId: string | null = null;
    const { data: pacExist } = await supabase
      .from("pacientes")
      .select("id")
      .eq("medico_id", medicoId)
      .eq("telefono", telefonoLimpio)
      .maybeSingle();

    if (pacExist) {
      pacId = pacExist.id;
    } else {
      const { data: nuevoPac, error: pacError } = await supabase
        .from("pacientes")
        .insert({
          medico_id: medicoId,
          nombre: pacNombre.trim(),
          telefono: telefonoLimpio,
          // Ya no derivamos el email del nombre (colisionaba entre
          // pacientes homónimos). Placeholder único real hasta que
          // se capture el email verdadero del paciente.
          email: `paciente-${crypto.randomUUID()}@midoc.temp`,
        })
        .select()
        .single();

      if (pacError || !nuevoPac) {
        setMsg("❌ Error al crear el paciente.");
        setLoading(false);
        return;
      }
      pacId = nuevoPac.id;
    }

    const { error } = await supabase.from("expedientes").insert({
      medico_id: medicoId,
      paciente_id: pacId,
      motivo: motivo.trim(),
      diagnostico: diagnostico.trim(),
      plan: plan.trim(),
    });

    if (error) {
      setMsg("❌ Error al guardar expediente.");
    } else {
      setMsg("✅ ¡Expediente guardado exitosamente!");
      setPacNombre("");
      setPacTelefono("");
      setMotivo("");
      setDiagnostico("");
      setPlan("");
      cargarDatos();
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div
        style={{
          background: "#1D9E75",
          padding: "1rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ color: "white", fontSize: "20px", fontWeight: "700" }}>
          MIDOC <span style={{ fontSize: "13px", opacity: 0.7 }}>· Dashboard Médico</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "white", fontSize: "13px", opacity: 0.85 }}>{medicoEmail}</span>
          <button
            onClick={handleLogout}
            style={{
              color: "white",
              fontSize: "13px",
              opacity: 0.9,
              background: "rgba(255,255,255,.15)",
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Salir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          gap: "0",
          padding: "0 1.5rem",
        }}
      >
        {[
          { id: "inicio", label: "🏠 Inicio" },
          { id: "expediente", label: "📋 Nuevo Expediente" },
          { id: "pacientes", label: "👥 Pacientes" },
          { id: "expedientes", label: "📁 Expedientes" },
          { id: "citas", label: "📅 Citas" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "12px 16px",
              border: "none",
              background: "none",
              cursor: "pointer",
              borderBottom: tab === t.id ? "2px solid #1D9E75" : "2px solid transparent",
              color: tab === t.id ? "#1D9E75" : "#6b7280",
              fontWeight: tab === t.id ? "600" : "400",
              fontSize: "13px",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem" }}>
        {/* INICIO */}
        {tab === "inicio" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "1rem" }}>
              Bienvenido, Doctor 👋
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
                gap: "12px",
                marginBottom: "1.5rem",
              }}
            >
              {[
                { label: "Pacientes", val: pacientes.length, icon: "👥", color: "#1D9E75" },
                { label: "Citas", val: citas.length, icon: "📅", color: "#185FA5" },
                { label: "Expedientes", val: expedientes.length, icon: "📋", color: "#534AB7" },
              ].map((k, i) => (
                <div
                  key={i}
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "1.25rem",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "28px" }}>{k.icon}</div>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: k.color }}>{k.val}</div>
                  <div style={{ fontSize: "13px", color: "#6b7280" }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div
              style={{
                background: "#E1F5EE",
                borderRadius: "12px",
                padding: "1rem",
                fontSize: "14px",
                color: "#085041",
              }}
            >
              💡 <strong>Acción rápida:</strong> Clic en "Nuevo Expediente" para crear tu primer
              expediente clínico digital.
            </div>
          </div>
        )}

        {/* NUEVO EXPEDIENTE */}
        {tab === "expediente" && (
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "1.5rem",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "1.25rem" }}>
              📋 Nuevo expediente clínico
            </h2>
            {msg && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  background: msg.includes("✅") ? "#E1F5EE" : "#FCEBEB",
                  color: msg.includes("✅") ? "#085041" : "#791F1F",
                  fontSize: "14px",
                }}
              >
                {msg}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                  }}
                >
                  Nombre del paciente *
                </label>
                <input
                  value={pacNombre}
                  onChange={(e) => setPacNombre(e.target.value)}
                  placeholder="Ej: Carlos Mendoza"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    color: "#111827",
                    background: "white",
                    fontSize: "14px",
                    marginTop: "4px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                  }}
                >
                  Teléfono del paciente * (identifica al paciente, evita duplicar expedientes)
                </label>
                <input
                  value={pacTelefono}
                  onChange={(e) => setPacTelefono(e.target.value)}
                  placeholder="Ej: 6861234567"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    color: "#111827",
                    background: "white",
                    fontSize: "14px",
                    marginTop: "4px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                  }}
                >
                  Motivo de consulta *
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej: Cefalea tensional de 3 días de evolución"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    color: "#111827",
                    background: "white",
                    fontSize: "14px",
                    marginTop: "4px",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                  }}
                >
                  Diagnóstico *
                </label>
                <input
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  placeholder="Ej: G44.2 - Cefalea tensional"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    color: "#111827",
                    background: "white",
                    fontSize: "14px",
                    marginTop: "4px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                  }}
                >
                  Plan de tratamiento
                </label>
                <textarea
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder="Ej: Paracetamol 500mg c/8hrs por 5 días, reposo relativo"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    color: "#111827",
                    background: "white",
                    fontSize: "14px",
                    marginTop: "4px",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <button
                onClick={crearExpediente}
                disabled={loading}
                style={{
                  background: "#1D9E75",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Guardando..." : "💾 Guardar expediente"}
              </button>
            </div>
          </div>
        )}

        {/* PACIENTES */}
        {tab === "pacientes" && (
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "1rem" }}>
              👥 Pacientes registrados
            </h2>
            {pacientes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                <div style={{ fontSize: "40px", marginBottom: ".5rem" }}>👥</div>
                <div>No hay pacientes aún. Crea tu primer expediente.</div>
              </div>
            ) : (
              pacientes.map((p, i) => (
                <div
                  key={i}
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "1rem",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#E1F5EE",
                      color: "#1D9E75",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "700",
                      fontSize: "14px",
                    }}
                  >
                    {p.nombre?.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "500" }}>{p.nombre}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>{p.telefono}</div>
                  </div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                    {new Date(p.created_at).toLocaleDateString("es-MX")}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* EXPEDIENTES */}
        {tab === "expedientes" && (
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "1rem" }}>
              📁 Expedientes clínicos
            </h2>
            {expedientes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                <div style={{ fontSize: "40px", marginBottom: ".5rem" }}>📋</div>
                <div>No hay expedientes. Crea el primero en "Nuevo Expediente".</div>
              </div>
            ) : (
              expedientes.map((e, i) => (
                <div
                  key={i}
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "1rem",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: ".5rem",
                    }}
                  >
                    <div style={{ fontWeight: "600" }}>📋 Expediente #{i + 1}</div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                      {new Date(e.created_at).toLocaleString("es-MX")}
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151", marginBottom: "4px" }}>
                    <strong>Motivo:</strong> {e.motivo}
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151", marginBottom: "4px" }}>
                    <strong>Diagnóstico:</strong> {e.diagnostico}
                  </div>
                  {e.plan && (
                    <div style={{ fontSize: "13px", color: "#374151" }}>
                      <strong>Plan:</strong> {e.plan}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* CITAS */}
        {tab === "citas" && (
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "1rem" }}>📅 Citas</h2>
            {citas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                <div style={{ fontSize: "40px", marginBottom: ".5rem" }}>📅</div>
                <div>No hay citas registradas aún.</div>
              </div>
            ) : (
              citas.map((c, i) => (
                <div
                  key={i}
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "1rem",
                    marginBottom: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "500" }}>
                      {c.modalidad === "en_linea" ? "💻 En línea" : "🏥 Presencial"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {new Date(c.fecha_hora).toLocaleString("es-MX")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "600", color: "#1D9E75" }}>${c.monto} MXN</div>
                    <div
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        background: c.estado === "confirmada" ? "#E1F5EE" : "#FAEEDA",
                        color: c.estado === "confirmada" ? "#085041" : "#633806",
                      }}
                    >
                      {c.estado}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
