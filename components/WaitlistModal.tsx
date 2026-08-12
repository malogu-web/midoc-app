"use client";

import { useEffect, useMemo, useState } from "react";
import { addToWaitlist } from "@/app/actions/waitlist";

type Props = {
  open: boolean;
  onClose: () => void;
};

const OTHER_SPECIALTY = "Otra especialidad..." as const;

const SPECIALTIES = [
  "Cardiología",
  "Dermatología",
  "Endocrinología",
  "Gastroenterología",
  "Ginecología y Obstetricia",
  "Medicina General",
  "Medicina Interna",
  "Nutrición",
  "Oftalmología",
  "Ortopedia y Traumatología",
  "Otorrinolaringología",
  "Pediatría",
  "Psicología / Psiquiatría",
  "Urología",
  OTHER_SPECIALTY,
] as const;

function isValidEmail(v: string) {
  // Good-enough client validation; server is source of truth.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function WaitlistModal({ open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [specialty, setSpecialty] = useState<(typeof SPECIALTIES)[number] | "">("");
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<{ email: boolean; specialty: boolean; customSpecialty: boolean }>({
    email: false,
    specialty: false,
    customSpecialty: false,
  });

  const specialtyValue = useMemo(() => {
    if (specialty === OTHER_SPECIALTY) return customSpecialty.trim();
    return specialty;
  }, [specialty, customSpecialty]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(false);
    setTouched({ email: false, specialty: false, customSpecialty: false });
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const eTrim = email.trim().toLowerCase();
  const sTrim = specialtyValue.trim();

  const emailError =
    touched.email && !eTrim ? "El email es requerido." : touched.email && !isValidEmail(eTrim) ? "Ingresa un email válido." : null;
  const specialtyError =
    touched.specialty && !specialty ? "Selecciona tu especialidad." : touched.customSpecialty && specialty === OTHER_SPECIALTY && sTrim.length < 2
      ? "Especifica tu especialidad."
      : null;

  const isFormValid = isValidEmail(eTrim) && sTrim.length >= 2;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    setTouched({ email: true, specialty: true, customSpecialty: true });

    if (!isFormValid) return;

    setSubmitting(true);
    try {
      const result = await addToWaitlist({ email: eTrim, specialty: sTrim, telefono: telefono.trim() });
      if (!result.ok) throw new Error(result.message);

      setSuccess(true);
        window.location.href = "/gracias";
      setEmail("");
      setTelefono("");
      setSpecialty("");
      setCustomSpecialty("");

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
        type="button"
      />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">Empezar prueba gratuita</h3>
            <p className="mt-1 text-sm text-slate-600">
              Déjanos tu email y especialidad para habilitarte el acceso.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-800">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              aria-invalid={emailError ? "true" : "false"}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus:ring-rose-200"
              required
            />
            {emailError ? <span className="text-xs text-rose-600">{emailError}</span> : null}
          </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Teléfono (para contactarle)</span>
          <input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            type="tel"
            placeholder="+52 664 123 4567"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Especialidad</span>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value as any)}
              onBlur={() => setTouched((t) => ({ ...t, specialty: true }))}
              aria-invalid={specialtyError ? "true" : "false"}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white bg-[linear-gradient(45deg,transparent_50%,#64748b_50%),linear-gradient(135deg,#64748b_50%,transparent_50%)] bg-[position:calc(100%-18px)_calc(1em+2px),calc(100%-13px)_calc(1em+2px)] bg-[size:5px_5px,5px_5px] bg-no-repeat px-4 py-3 pr-10 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus:ring-rose-200"
              required
            >
              <option value="" className="bg-white">
                Selecciona…
              </option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s} className="bg-white">
                  {s}
                </option>
              ))}
            </select>
            {specialtyError ? <span className="text-xs text-rose-600">{specialtyError}</span> : null}
          </label>

          {specialty === OTHER_SPECIALTY ? (
            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-800">¿Cuál?</span>
              <input
                value={customSpecialty}
                onChange={(e) => setCustomSpecialty(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, customSpecialty: true }))}
                placeholder="Ej. Oncología"
                aria-invalid={specialtyError ? "true" : "false"}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus:ring-rose-200"
                required
              />
            </label>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              ¡Gracias, pronto te contactaremos!
            </div>
          ) : null}

          <button
            disabled={submitting || !isFormValid}
            className="mt-1 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none"
            type="submit"
          >
            {submitting ? "Enviando…" : "Enviar"}
          </button>

          <p className="text-xs text-slate-500">
            Esto es una lista de espera de marketing. No capturamos información médica de pacientes (no PHI).
          </p>
        </form>
      </div>
    </div>
  );
}

