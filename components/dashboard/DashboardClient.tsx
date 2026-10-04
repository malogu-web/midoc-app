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
  // Formulario cita
  const [citaPacienteId, setCitaPacienteId] = useState("");
  const [citaFecha, setCitaFecha] = useState("");
  const [citaModalidad, setCitaModalidad] = useState("presencial");
  const [citaMonto, setCitaMonto] = useState("");
  const [citaMsg, setCitaMsg] = useState("");

  // Ficha de paciente
  const [pacienteSel, setPacienteSel] = useState<any>(null);
  const [fichaExp, setFichaExp] = useState<any[]>([]);
  const [fichaCitas, setFichaCitas] = useState<any[]>([]);

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

  async function crearCita() {
    if (!citaPacienteId || !citaFecha) {
      setCitaMsg("Selecciona un paciente y una fecha.");
      return;
    }
    setLoading(true);
    setCitaMsg("");
    const { error } = await supabase.from("citas").insert({
      paciente_id: citaPacienteId,
      medico_id: medicoId,
      fecha_hora: new Date(citaFecha).toISOString(),
      modalidad: citaModalidad,
      monto: citaMonto ? Number(citaMonto) : null,
    });
    setLoading(false);
    if (error) {
      setCitaMsg("Error al guardar: " + error.message);
      return;
    }
    setCitaMsg("Cita guardada.");
    setCitaPacienteId("");
    setCitaFecha("");
    setCitaMonto("");
    await cargarDatos();
  }

  async function abrirPaciente(p: any) {
    setPacienteSel(p);
    setFichaExp([]);
    setFichaCitas([]);
    const [e, c] = await Promise.all([
      supabase
        .from("expedientes")
        .select("*")
        .eq("paciente_id", p.id)
        .eq("medico_id", medicoId)
        .order("created_at", { ascending: false }),
      supabase
        .from("citas")
        .select("*")
        .eq("paciente_id", p.id)
        .eq("medico_id", medicoId)
        .order("fecha_hora", { ascending: false }),
    ]);
    setFichaExp(e.data || []);
    setFichaCitas(c.data || []);
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
    <div className="midoc-shell" style={{ minHeight: "100vh", background: "#f5f3ee", fontFamily: "system-ui, -apple-system, Segoe UI, Arial, sans-serif", color: "#1c2b26" }}>
      {/* Estilos del dashboard */}
        <style>{`
          .midoc-shell { color: #1c2b26; color-scheme: light; }
          .midoc-shell h2 { font-family: Georgia, serif; font-weight: 600; color: #12332b; }
          .midoc-shell input, .midoc-shell select, .midoc-shell textarea { color: #1c2b26; background: #ffffff; }
          .midoc-side { position: fixed; top: 0; left: 0; bottom: 0; width: 232px; background: #12332b; color: #dbe8e2; display: flex; flex-direction: column; padding: 20px 12px; overflow-y: auto; z-index: 10; }
          .midoc-main { margin-left: 232px; }
          .midoc-nav-btn { display: block; width: 100%; text-align: left; border: none; background: none; color: #b9cfc6; font-size: 13px; padding: 8px 10px; border-radius: 6px; cursor: pointer; }
          .midoc-nav-btn:hover { background: rgba(255,255,255,.07); }
          .midoc-nav-btn.active { background: #1f7a63; color: #ffffff; font-weight: 600; }
          .midoc-nav-btn.soon { opacity: .55; cursor: default; }
          .midoc-click { cursor: pointer; }
          .midoc-click:hover { box-shadow: 0 2px 10px rgba(18,51,43,.12); }
          .midoc-back { border: none; background: none; color: #1f7a63; font-size: 14px; cursor: pointer; padding: 0; margin-bottom: 12px; }
          @media (max-width: 800px) {
            .midoc-side { position: static; width: auto; flex-direction: row; flex-wrap: wrap; gap: 4px; padding: 10px; }
            .midoc-main { margin-left: 0; }
          }
        `}</style>

        {/* Barra lateral */}
        <aside className="midoc-side">
          <div style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#ffffff", padding: "4px 10px 18px" }}>
            <span style={{ color: "#d9822b" }}>&bull;</span> MIDOC
          </div>
          {[
            {
              g: "GENERAL",
              items: [
                { id: "inicio", label: "Panel principal", soon: false },
                { id: "citas", label: "Agenda", soon: false },
                { id: "pacientes", label: "Pacientes", soon: false },
              ],
            },
            {
              g: "CL\u00cdNICO",
              items: [
                { id: "expediente", label: "Nuevo expediente", soon: false },
                { id: "expedientes", label: "Expedientes", soon: false },
                { id: "", label: "Recetas digitales", soon: true },
                { id: "", label: "Videoconsulta", soon: true },
              ],
            },
            {
              g: "NEGOCIO",
              items: [
                { id: "", label: "Cobros y CFDI", soon: true },
                { id: "", label: "WhatsApp autom\u00e1tico", soon: true },
              ],
            },
          ].map((grp) => (
            <div key={grp.g} style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "1.5px", color: "#7fa397", padding: "0 10px 6px" }}>{grp.g}</div>
              {grp.items.map((it) => (
                <button
                  key={it.label}
                  className={"midoc-nav-btn" + (it.soon ? " soon" : "") + (!it.soon && tab === it.id ? " active" : "")}
                  onClick={() => {
                    if (!it.soon) { setTab(it.id); setPacienteSel(null); }
                  }}
                >
                  {!it.soon && tab === it.id ? "\u25C6 " : "\u25C7 "}
                  {it.label}
                  {it.soon ? " (pronto)" : ""}
                </button>
              ))}
            </div>
          ))}
          <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,.12)", padding: "12px 10px 0" }}>
            <div style={{ fontSize: "12px", color: "#b9cfc6", wordBreak: "break-all", marginBottom: "8px" }}>{medicoEmail}</div>
            <button
              onClick={handleLogout}
              style={{
                color: "#ffffff",
                fontSize: "13px",
                background: "rgba(255,255,255,.12)",
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              Salir
            </button>
          </div>
        </aside>

        {/* Barra superior con el titulo de la seccion */}
        <div className="midoc-main" style={{ padding: "22px 2rem 0" }}>
          <h2 style={{ margin: 0, fontSize: "24px" }}>
            {(({ inicio: "Panel principal", expediente: "Nuevo expediente", pacientes: "Pacientes", expedientes: "Expedientes", citas: "Agenda" }) as Record<string, string>)[tab] || ""}
          </h2>
        </div>

        <div className="midoc-main" style={{ maxWidth: "1100px", padding: "1.25rem 2rem 2rem" }}>
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
                { label: "Pacientes", go: "pacientes", val: pacientes.length, icon: "👥", color: "#1D9E75" },
                { label: "Citas", go: "citas", val: citas.length, icon: "📅", color: "#185FA5" },
                { label: "Expedientes", go: "expedientes", val: expedientes.length, icon: "📋", color: "#534AB7" },
              ].map((k, i) => (
<div className="midoc-click" onClick={() => { setTab(k.go); setPacienteSel(null); }} key={i}
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
        {tab === "pacientes" && pacienteSel && (
          <div>
            <button className="midoc-back" onClick={() => setPacienteSel(null)}>
              &larr; Volver a pacientes
            </button>
            <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "1.25rem", marginBottom: "1rem" }}>
              <h2 style={{ margin: "0 0 12px", fontSize: "22px" }}>{pacienteSel.nombre}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                {[
                  ["Tel\u00e9fono", pacienteSel.telefono],
                  ["Correo", pacienteSel.email && !String(pacienteSel.email).endsWith("@midoc.temp") ? pacienteSel.email : ""],
                  ["Fecha de nacimiento", pacienteSel.fecha_nacimiento ? String(pacienteSel.fecha_nacimiento).split("-").reverse().join("/") : ""],
                  ["CURP", pacienteSel.curp],
                  ["Tipo de sangre", pacienteSel.tipo_sangre],
                  ["Alergias", pacienteSel.alergias],
                  ["Registrado", pacienteSel.created_at ? new Date(pacienteSel.created_at).toLocaleDateString("es-MX") : ""],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: "11px", letterSpacing: "1px", color: "#6b7280", textTransform: "uppercase" }}>{k}</div>
                    <div style={{ fontSize: "15px" }}>{v || "Sin registrar"}</div>
                  </div>
                ))}
              </div>
            </div>

            <h2 style={{ fontSize: "18px", margin: "0 0 10px" }}>Expedientes</h2>
            {fichaExp.length === 0 ? (
              <div style={{ color: "#6b7280", marginBottom: "1rem" }}>Este paciente a&uacute;n no tiene expedientes.</div>
            ) : (
              fichaExp.map((e) => (
                <div key={e.id} style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "1rem", marginBottom: "10px" }}>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
                    {e.created_at ? new Date(e.created_at).toLocaleString("es-MX") : ""}
                  </div>
                  {[
                    ["Motivo", e.motivo],
                    ["Exploraci\u00f3n", e.exploracion],
                    ["Diagn\u00f3stico", e.diagnostico],
                    ["Plan", e.plan],
                    ["Transcripci\u00f3n", e.transcripcion],
                  ].map(([k, v]) =>
                    v ? (
                      <div key={k} style={{ marginBottom: "6px" }}>
                        <span style={{ fontWeight: 600 }}>{k}: </span>
                        {v}
                      </div>
                    ) : null
                  )}
                </div>
              ))
            )}

            <h2 style={{ fontSize: "18px", margin: "1rem 0 10px" }}>Citas</h2>
            {fichaCitas.length === 0 ? (
              <div style={{ color: "#6b7280" }}>Este paciente a&uacute;n no tiene citas.</div>
            ) : (
              fichaCitas.map((c) => (
                <div key={c.id} style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "1rem", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{c.modalidad === "en_linea" ? "En l\u00ednea" : "Presencial"}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {c.fecha_hora ? new Date(c.fecha_hora).toLocaleString("es-MX") : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 600, color: "#1f7a63" }}>{c.monto != null ? "$" + c.monto + " MXN" : ""}</div>
                    <div style={{ fontSize: "11px" }}>{c.estado}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "pacientes" && !pacienteSel && (
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
<div className="midoc-click" onClick={() => abrirPaciente(p)} key={i}
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
            <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "1rem",
            marginBottom: "1rem",
            display: "grid",
            gap: "10px",
          }}
        >
          <div style={{ fontWeight: "600" }}>Nueva cita</div>
          <select
            value={citaPacienteId}
            onChange={(e) => setCitaPacienteId(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
          >
            <option value="">Selecciona un paciente</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre || p.telefono || p.id}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={citaFecha}
            onChange={(e) => setCitaFecha(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
          />
          <select
            value={citaModalidad}
            onChange={(e) => setCitaModalidad(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
          >
            <option value="presencial">Presencial</option>
            <option value="en_linea">En l&iacute;nea</option>
          </select>
          <input
            type="number"
            placeholder="Monto MXN"
            value={citaMonto}
            onChange={(e) => setCitaMonto(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
          />
          <button
            onClick={crearCita}
            disabled={loading}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              background: "#185FA5",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Guardar cita
          </button>
          {citaMsg && <div style={{ fontSize: "13px" }}>{citaMsg}</div>}
        </div>        {citas.length === 0 ? (
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
