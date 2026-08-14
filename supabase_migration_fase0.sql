-- ============================================================
-- MIDOC — Migración Fase 0: autenticación real + segmentación por médico
-- Correr esto completo en Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Tabla de médicos, uno por usuario autenticado de Supabase Auth.
create table if not exists public.medicos (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  cedula_profesional text,
  especialidad text,
  created_at timestamptz not null default now()
);

alter table public.medicos enable row level security;

drop policy if exists "medico_lee_su_propio_perfil" on public.medicos;
create policy "medico_lee_su_propio_perfil"
  on public.medicos for select
  using (auth.uid() = id);

drop policy if exists "medico_actualiza_su_propio_perfil" on public.medicos;
create policy "medico_actualiza_su_propio_perfil"
  on public.medicos for update
  using (auth.uid() = id);

drop policy if exists "medico_crea_su_propio_perfil" on public.medicos;
create policy "medico_crea_su_propio_perfil"
  on public.medicos for insert
  with check (auth.uid() = id);


-- 2) Agregar medico_id a las tablas clínicas (si no existe ya).
alter table public.pacientes    add column if not exists medico_id uuid references public.medicos(id);
alter table public.expedientes  add column if not exists medico_id uuid references public.medicos(id);
alter table public.citas        add column if not exists medico_id uuid references public.medicos(id);

-- 3) Identificador real de paciente para evitar que dos "Juan Pérez"
--    se mezclen (antes solo se comparaba por nombre exacto).
alter table public.pacientes add column if not exists telefono text;

-- 4) Teléfono también en waitlist (el formulario ya lo manda, pero se
--    perdía porque la columna no existía / no se guardaba).
alter table public.waitlist add column if not exists telefono text;


-- 5) RLS en las tablas clínicas: un médico SOLO ve/edita lo suyo.
alter table public.pacientes   enable row level security;
alter table public.expedientes enable row level security;
alter table public.citas       enable row level security;

drop policy if exists "medico_ve_sus_pacientes" on public.pacientes;
create policy "medico_ve_sus_pacientes"
  on public.pacientes for select
  using (auth.uid() = medico_id);

drop policy if exists "medico_crea_sus_pacientes" on public.pacientes;
create policy "medico_crea_sus_pacientes"
  on public.pacientes for insert
  with check (auth.uid() = medico_id);

drop policy if exists "medico_actualiza_sus_pacientes" on public.pacientes;
create policy "medico_actualiza_sus_pacientes"
  on public.pacientes for update
  using (auth.uid() = medico_id);

drop policy if exists "medico_ve_sus_expedientes" on public.expedientes;
create policy "medico_ve_sus_expedientes"
  on public.expedientes for select
  using (auth.uid() = medico_id);

drop policy if exists "medico_crea_sus_expedientes" on public.expedientes;
create policy "medico_crea_sus_expedientes"
  on public.expedientes for insert
  with check (auth.uid() = medico_id);

drop policy if exists "medico_ve_sus_citas" on public.citas;
create policy "medico_ve_sus_citas"
  on public.citas for select
  using (auth.uid() = medico_id);

drop policy if exists "medico_crea_sus_citas" on public.citas;
create policy "medico_crea_sus_citas"
  on public.citas for insert
  with check (auth.uid() = medico_id);

-- ============================================================
-- IMPORTANTE: si ya tienes pacientes/expedientes/citas de prueba
-- cargados SIN medico_id, quedarán invisibles para todos los médicos
-- una vez activado RLS (por diseño: nadie es dueño de esos registros
-- huérfanos). Si son datos de prueba, bórralos. Si necesitas
-- asignárselos a tu propio usuario, avísame y te doy el UPDATE exacto
-- con tu auth.uid().
-- ============================================================
