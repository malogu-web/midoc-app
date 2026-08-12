"use client";

import { useState } from "react";
import { WaitlistModal } from "@/components/WaitlistModal";

export function LandingWithWaitlist() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-sm font-semibold tracking-tight text-white">MIDOC</div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 hover:opacity-95"
        >
          Empezar prueba gratuita
        </button>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Documentación clínica más rápida, con seguridad primero.
          </h1>
          <p className="mt-5 text-pretty text-base text-slate-300 sm:text-lg">
            Conecta el botón de tu landing para capturar <span className="font-semibold">email</span> y{" "}
            <span className="font-semibold">especialidad</span> en Supabase (tabla <code>waitlist</code>).
          </p>
        </div>
      </main>

      <WaitlistModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

