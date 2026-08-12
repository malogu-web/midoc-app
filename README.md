# MIDOC

## Página de registro

- **Archivo**: `registro.html`
- **Cómo abrirlo**:
  - Doble click en `registro.html`, o
  - Arrástralo al navegador

## Conectar tu API

En `registro.html` cambia:

- **`API_ENDPOINT`**: por tu endpoint real de registro (ej. `https://tu-dominio.com/api/register`)

El formulario envía este JSON:

```json
{
  "firstName": "María",
  "lastName": "Pérez",
  "email": "maria.perez@example.com",
  "username": "maria.perez",
  "password": "M!doc2026"
}
```

