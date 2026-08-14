---
name: health-data-compliance
description: >
  Revisa manejo de datos de pacientes y expediente clínico electrónico
  contra los criterios de NOM-024-SSA3 y buenas prácticas de protección
  de datos personales sensibles en México (LFPDPPP), adaptado a MIDOC
  (SaaS HealthTech: expedientes clínicos, recetas digitales, facturación
  electrónica, telemedicina). Úsalo cuando el cambio toque expediente
  clínico, historial médico, datos de pacientes, o cualquier flujo que
  almacene/transmita información de salud.
---

# Cumplimiento de datos de salud — NOM-024 y datos sensibles (MIDOC)

## Pregunta central
**"¿Este dato de salud está protegido igual de bien en tránsito, en
reposo y en los logs — o solo en la pantalla donde el usuario lo ve?"**

Los datos de salud son "datos personales sensibles" bajo la ley mexicana
(LFPDPPP) y el expediente clínico electrónico tiene requisitos
específicos bajo NOM-024-SSA3. El estándar no es "el usuario final ve
sus datos correctamente" — es que el dato esté protegido en cada etapa
del ciclo de vida.

> Nota: esta skill NO sustituye asesoría legal. Es una guía técnica de
> ingeniería para no dejar huecos obvios; la validación legal formal de
> cumplimiento normativo debe hacerla un especialista.

## Proceso (checkpoints obligatorios)

### 1. Identificar si el cambio toca datos de salud
Antes de aplicar el resto de la skill, confirma el alcance:
- ¿Toca expediente clínico, historial médico, diagnósticos, recetas,
  resultados de laboratorio, notas de consulta, datos de telemedicina?
- Si la respuesta es sí a cualquiera, aplica el checklist completo.
  Si es un dato administrativo no clínico (ej. nombre de contacto para
  facturación), el estándar de protección general de datos personales
  aplica, pero no todo el checklist de expediente clínico.

### 2. Integridad y trazabilidad del expediente (núcleo de NOM-024)
- ¿Cada modificación al expediente clínico queda registrada con quién,
  cuándo y qué cambió (bitácora de auditoría), en vez de sobrescribir
  el dato anterior sin rastro?
- ¿El expediente conserva el historial completo, o es posible borrar/
  editar registros pasados sin dejar evidencia?
- ¿Hay forma de vincular cada entrada del expediente a un profesional
  de salud identificado (no un usuario genérico del sistema)?

### 3. Confidencialidad en tránsito y en reposo
- ¿Los datos clínicos viajan cifrados (TLS) en cada llamada, incluidas
  las internas entre servicios?
- ¿Están cifrados en la base de datos, o al menos los campos más
  sensibles (diagnósticos, notas clínicas)?
- ¿Los backups también quedan protegidos con el mismo nivel de
  cifrado y control de acceso que la base de datos principal?

### 4. Minimización y propósito
- ¿El sistema pide/guarda solo los datos de salud necesarios para el
  propósito declarado, o se está guardando "por si acaso" información
  que no se usa?
- ¿Hay un campo de consentimiento explícito del paciente antes de
  recolectar datos sensibles, especialmente en telemedicina?

### 5. Acceso y autorización granular
- ¿El acceso al expediente está limitado al personal de salud
  directamente involucrado en la atención de ESE paciente, no a
  cualquier usuario autenticado del sistema?
- ¿Existen roles diferenciados (médico, administrativo, paciente) con
  permisos distintos sobre qué parte del expediente pueden ver/editar?
- ¿El paciente puede ver quién ha accedido a su expediente
  (transparencia), como suele exigir la normativa de datos sensibles?

### 6. Retención y eliminación
- ¿Hay una política clara de cuánto tiempo se conserva el expediente
  clínico (la norma suele exigir conservación mínima, no eliminación
  libre)?
- ¿Si un paciente ejerce su derecho ARCO (acceso, rectificación,
  cancelación, oposición) bajo LFPDPPP, el sistema tiene forma técnica
  de atenderlo sin romper la integridad del expediente clínico?

### 7. Datos de salud en lugares donde no deberían estar
- Logs de aplicación, mensajes de error, analytics de terceros,
  herramientas de monitoreo: ¿se cuelan ahí diagnósticos, nombres de
  pacientes junto con su condición, o notas clínicas?
- Entornos de desarrollo/pruebas: ¿se usan datos reales de pacientes
  como datos de prueba? (No debería pasar nunca — usar datos
  sintéticos.)

## Labels de severidad

- 🔴 **CRÍTICO** — datos clínicos sin cifrar en tránsito o reposo, sin
  control de acceso por paciente, o expuestos en logs/entornos de
  prueba. Bloquea el merge.
- 🟠 **ALTO** — falta trazabilidad/bitácora de cambios al expediente,
  o falta consentimiento explícito antes de recolectar datos sensibles.
- 🟡 **MEDIO** — falta política de retención definida, o falta el
  mecanismo técnico para atender derechos ARCO.
- 🟢 **INFO** — mejora de buena práctica, no urgente.

## Tabla de excusas comunes (anti-racionalización)

| Excusa | Contraargumento |
|---|---|
| "Es solo para pruebas internas" | Si son datos reales de pacientes, el requisito de protección aplica igual en desarrollo que en producción — usa datos sintéticos. |
| "Ya lo vemos cuando saquemos el certificado/cumplimiento formal" | Los huecos técnicos (logs con datos clínicos, falta de cifrado) son mucho más caros de corregir después que de diseñar bien desde ahora. |
| "El proveedor de hosting ya cifra todo" | Cifrado de disco del proveedor no es lo mismo que cifrado a nivel de aplicación de campos sensibles específicos; verifica qué cubre realmente. |
| "Nadie deja de ser médico, no necesita bitácora de quién editó qué" | NOM-024 pide trazabilidad para proteger tanto al paciente como al profesional de salud ante disputas. |
| "El paciente no va a pedir sus derechos ARCO" | El sistema debe poder atenderlo si se pide, no depender de que nadie lo pida. |

## Criterio de salida (evidencia requerida)

No cierres esta revisión con "parece estar bien protegido". Cierra con:
- Checklist recorrida explícitamente (qué aplicó, qué no, y por qué).
- Lista de hallazgos con severidad y ubicación exacta (archivo, tabla,
  endpoint).
- Para cada 🔴/🟠: recomendación técnica concreta (ej. "cifrar el campo
  `diagnostico` con AES a nivel de aplicación", no solo "cifrar más").
- Nota explícita de qué partes de este checklist requieren validación
  legal formal antes de considerar el cumplimiento normativo completo.

## Notas de personalización
- Ajusta la sección de cifrado/bitácora según el stack real de MIDOC
  una vez definido (ej. si la base de datos ya ofrece row-level
  encryption o audit log nativo).
- Si se define el proveedor de telemedicina, agrega aquí sus
  requisitos específicos de consentimiento y grabación de sesiones.
