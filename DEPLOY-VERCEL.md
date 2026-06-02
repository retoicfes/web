# Desplegar Reto ICFES en Vercel

## Si el botón "Deploy" está gris / no hace clic

### 1. Permisos GitHub (lo más común)

1. [github.com/settings/installations](https://github.com/settings/installations) → **Vercel** → **Configure**
2. En **Repository access**, elige **All repositories** o al menos `retoicfes/web`
3. Si el repo está en la **organización** `retoicfes`:
   - [github.com/organizations/retoicfes/settings/installations](https://github.com/organizations/retoicfes/settings/installations)
   - Aprueba Vercel para la org (a veces un admin debe aprobar)

### 2. Pantalla de importación

- **Repository:** `retoicfes/web` (no la carpeta `repositories` del disco)
- **Root Directory:** dejar **vacío** o `./`
- **Framework Preset:** Next.js (debe detectarse solo)
- **Team:** selecciona tu equipo personal u org (obligatorio)

### 3. Nombre del proyecto

- Solo letras minúsculas, números y guiones: `retoicfes` o `web`

### 4. Deploy por CLI (si la UI sigue bloqueada)

```bash
cd repositories/web
pnpm add -g vercel   # o: npx vercel@latest
vercel login
vercel link          # elige org retoicfes, proyecto nuevo
vercel --prod
```

Luego en el dashboard: Settings → Git → conectar el repo.

## Variables de entorno (Production) — obligatorio

Vercel suele inyectar solo `POSTGRES_*`. **Añade también** (copiar valores):

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | = `POSTGRES_PRISMA_URL` (con pooler) |
| `DIRECT_URL` | = `POSTGRES_URL_NON_POOLING` |

Marca **Production**, **Preview** y **Development**. Sin `DATABASE_URL`, el POST del ranking falla en silencio.

Storage → Neon → **Connect to Project**.

## Verificar después del deploy

Abre `https://TU-DOMINIO.vercel.app/api/health`

- `{ "ok": true, "preguntas": 12, "rankings": N }` → DB bien
- `"Falta DATABASE_URL"` → configura variables arriba
- Error de tabla → ejecuta `pnpm db:push` y `pnpm db:seed` contra esa misma DB

## Después del primer deploy

```bash
pnpm db:push
pnpm db:seed
```
