# Fase 0 — instrucciones de aplicación (CMD)

Ya está probado con `npm run build` real y compila sin errores. Esto es lo que trae:

- Login real con magic link (`/login`)
- `/dashboard` protegido — nadie entra sin sesión
- Cada médico solo ve sus propios pacientes/expedientes/citas (RLS)
- Ya no se mezclan expedientes de pacientes con el mismo nombre (ahora se identifican por teléfono)
- Se arregló `lib/env.ts` (pedía una variable que nunca existió — por eso nunca se pudo usar, y probablemente esa era una de las causas del bug de build)
- Se unificó waitlist en un solo archivo (antes había 3 versiones distintas) y se arregló que el campo teléfono se perdía silenciosamente
- 1 archivo `.sql` que tienes que correr tú en Supabase (ver abajo)

## Paso 1 — Aplicar los archivos a tu proyecto local

Abre CMD y ve a tu carpeta del proyecto:

```
cd "C:\Users\venen\OneDrive\Documents\MIDOC"
```

Copia estos archivos de la entrega a las mismas rutas dentro de tu proyecto (sobrescribiendo donde ya existan):

- `lib/env.ts`
- `lib/supabase/browser.ts`
- `lib/supabase/server.ts` ← nuevo
- `lib/supabase/admin.ts`
- `middleware.ts` ← nuevo, va en la raíz del proyecto (mismo nivel que `package.json`)
- `app/login/page.tsx` ← nuevo
- `app/auth/callback/route.ts` ← nuevo
- `app/dashboard/page.tsx`
- `components/dashboard/DashboardClient.tsx` ← nuevo
- `app/actions/waitlist.ts`

**Borra este archivo, ya no se usa** (quedó reemplazado, la ruta duplicada de waitlist):
```
del "app\api\waitlist\route.ts"
```

## Paso 2 — Instalar la dependencia nueva

```
npm install @supabase/ssr --legacy-peer-deps
```

## Paso 3 — Correr la migración SQL en Supabase

1. Entra a https://supabase.com/dashboard → tu proyecto (`msjxipjhoioynmlsjdhz`)
2. Ve a **SQL Editor** → **New query**
3. Copia y pega TODO el contenido de `supabase_migration_fase0.sql`
4. Dale **Run**

Esto crea la tabla `medicos`, agrega la columna `medico_id` a `pacientes`/`expedientes`/`citas`, agrega `telefono` a `pacientes` y `waitlist`, y activa las políticas de seguridad (RLS) para que cada médico solo vea lo suyo.

⚠️ Si ya tienes pacientes de prueba cargados sin `medico_id`, se volverán invisibles (no se borran, solo quedan huérfanos). Si son datos de prueba, ignóralo. Si quieres recuperarlos bajo tu usuario, dímelo y te doy el `UPDATE` exacto.

## Paso 4 — Habilitar Email Auth en Supabase (si no está ya)

1. Supabase Dashboard → **Authentication** → **Providers**
2. Confirma que **Email** esté habilitado
3. En **Authentication** → **URL Configuration**, agrega esta URL en "Redirect URLs":
   ```
   https://midoc-app.vercel.app/auth/callback
   ```
   (y también `http://localhost:3000/auth/callback` si vas a probar en tu máquina)

## Paso 5 — Probar localmente antes de subir

```
npm run dev
```

Abre `http://localhost:3000/dashboard` en el navegador — debería mandarte a `/login` automáticamente (antes no lo hacía, entraba directo). Métete tu correo, revisa tu bandeja de entrada, haz clic en el enlace, y deberías caer en el dashboard ya logueado.

## Paso 6 — Subir a GitHub y desplegar

```
git add .
git commit -m "Fase 0: auth real con magic link, RLS por medico, fix bug dashboard"
git push
```

Vercel debería desplegar automáticamente al hacer push (ya tienes la integración conectada).

## Nota sobre las env vars de Vercel

No se necesita ninguna variable nueva — todo esto usa las que ya tenías configuradas (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
