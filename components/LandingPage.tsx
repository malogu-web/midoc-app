"use client";

import { Mic, Shield, Zap } from "lucide-react";

type Props = {
  onStartTrial: () => void;
};

export default function LandingPage({ onStartTrial }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between bg-white/80 p-6 backdrop-blur-md lg:px-12">
        <div className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-2xl font-bold text-transparent">
          MiDoc<span className="font-light text-slate-400">.ai</span>
        </div>
        <button onClick={onStartTrial} className="rounded-full bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700">
          Acceso Médico
        </button>
      </nav>

      {/* Hero */}
      <header className="mx-auto max-w-7xl px-6 py-16 text-center lg:py-24">
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight lg:text-7xl">
          Usted hable con su paciente, <br />
          <span className="font-black text-blue-600">MiDoc hace la nota.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-600">
          El primer asistente clínico con IA en México que convierte sus consultas en expedientes estructurados en segundos. Cumplimiento total con la NOM-024.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button onClick={onStartTrial} className="rounded-2xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:shadow-xl hover:shadow-blue-200" type="button">
            Empezar prueba gratuita 14 días
          </button>
          <button className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-lg font-medium text-slate-700 transition hover:bg-slate-50" type="button">
            Ver Demo en Vivo
          </button>
        </div>
      </header>

      {/* Features row 1 */}
      <section className="px-6 py-8">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Mic size={24} />
            </div>
            <h3 className="mb-3 text-xl font-bold">Dictado Inteligente</h3>
            <p className="text-slate-600">Escucha su consulta y redacta automáticamente la nota SOAP con terminología médica precisa.</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Shield size={24} />
            </div>
            <h3 className="mb-3 text-xl font-bold">Seguridad Nivel Hospital</h3>
            <p className="text-slate-600">Datos encriptados de extremo a extremo, cumpliendo con leyes de protección de datos en México.</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Zap size={24} />
            </div>
            <h3 className="mb-3 text-xl font-bold">Receta en 1 Clic</h3>
            <p className="text-slate-600">Genera recetas digitales y envíalas directamente por WhatsApp a tus pacientes.</p>
          </div>
        </div>
      </section>

      {/* Funcionalidades completas */}
      <section className="py-16 px-6 bg-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-4">Todo lo que necesita su consultorio</h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">MIDOC reemplaza el papeleo, la facturación manual y el caos administrativo. Todo en un solo lugar.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="text-lg font-bold mb-2">Expediente NOM-004</h3>
              <p className="text-slate-600 text-sm">Expediente clínico digital completo con cumplimiento total a la NOM-004-SSA3-2012. Con firma electrónica y folio único.</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="text-3xl mb-3">🧾</div>
              <h3 className="text-lg font-bold mb-2">CFDI automático</h3>
              <p className="text-slate-600 text-sm">Cada consulta genera su factura CFDI automáticamente. Sin copiar RFC, sin portales del SAT.</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="text-lg font-bold mb-2">WhatsApp automático</h3>
              <p className="text-slate-600 text-sm">Confirmaciones de cita, recordatorios y recetas llegan al WhatsApp del paciente sin que usted escriba nada.</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="text-lg font-bold mb-2">Agenda inteligente</h3>
              <p className="text-slate-600 text-sm">Los pacientes agendan solos desde su celular. Sin llamadas, sin secretaria.</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="text-3xl mb-3">📹</div>
              <h3 className="text-lg font-bold mb-2">Videoconsulta con IA</h3>
              <p className="text-slate-600 text-sm">Consultas en línea con transcripción automática. La IA genera la nota clínica mientras usted habla.</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="text-3xl mb-3">💊</div>
              <h3 className="text-lg font-bold mb-2">Receta digital NOM-072</h3>
              <p className="text-slate-600 text-sm">Recetas con firma electrónica avanzada y código QR verificable. El paciente la recibe por WhatsApp al instante.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Precio */}
      <section className="py-16 px-6 bg-blue-600 text-white text-center">
        <div className="mx-auto max-w-2xl">
          <div className="inline-block bg-white/20 rounded-full px-4 py-1 text-sm font-medium mb-4">⚡ Solo 100 lugares disponibles</div>
          <h2 className="text-3xl font-bold mb-4">Precio Founders Club</h2>
          <div className="text-6xl font-black mb-2">$2,499</div>
          <div className="text-blue-200 mb-2">MXN/mes + IVA · Congelado para siempre</div>
          <div className="text-blue-300 line-through mb-6">Precio regular: $3,999/mes</div>
          <button onClick={onStartTrial} className="bg-white text-blue-600 rounded-full px-8 py-4 text-lg font-bold hover:shadow-xl transition-all">
            Asegurar mi lugar →
          </button>
          <p className="mt-4 text-blue-200 text-sm">🛡️ Garantía de 30 días sin riesgo</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 px-6 py-12 text-center text-white">
        <p className="mb-6 text-sm uppercase tracking-widest text-slate-400">Diseñado para especialistas en México</p>
        <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale">
          <span className="text-xl font-bold">Cardiología</span>
          <span className="text-xl font-bold">Pediatría</span>
          <span className="text-xl font-bold">Ginecología</span>
          <span className="text-xl font-bold">Dermatología</span>
        </div>
      </footer>
    </div>
  );
}