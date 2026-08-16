"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Ingresa un correo válido.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowser();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (authError) {
      setError("No se pudo enviar el enlace. Intenta de nuevo.");
      return;
    }
    setSent(true);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
        fontFamily: "Arial, sans-serif",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "2rem",
          width: "100%",
          maxWidth: "380px",
        }}
      >
        <div style={{ fontSize: "22px", fontWeight: 700, color: "#1D9E75", marginBottom: "4px" }}>
          MIDOC
        </div>
        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "1.5rem" }}>
          Acceso Médico
        </div>

        {sent ? (
          <div
            style={{
              background: "#E1F5EE",
              color: "#085041",
              borderRadius: "10px",
              padding: "1rem",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            ✅ Te enviamos un enlace de acceso a <strong>{email}</strong>. Ábrelo desde el
            mismo dispositivo para entrar a tu dashboard.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                }}
              >
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@ejemplo.com"
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
            {error && <div style={{ fontSize: "13px", color: "#791F1F" }}>{error}</div>}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#1D9E75",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "12px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Enviando..." : "Enviarme mi enlace de acceso"}
            </button>
            <div style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center" }}>
              Sin contraseña — te llega un enlace de acceso a tu correo.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
