# Desplegar Reto ICFES en Vercel

## Flujo recomendado (producción vs preview)

| Entorno | Cuándo se despliega | URL | Uso |
|---------|---------------------|-----|-----|
| **Production** | Push/merge a `main` | `retoicfes.com` | Usuarios reales |
| **Preview** | PR o push a otra rama | `*.vercel.app` (auto) | Probar antes de merge |
| **Development** | `pnpm dev` local | `localhost:3000` | Desarrollo |

### Trabajar con preview (pre-producción)

```bash
git checkout -b feature/mi-cambio
# ... commits ...
git push -u origin feature/mi-cambio
gh pr create --title "feat: mi cambio" --body "..."
```

Vercel crea automáticamente:

- **URL por commit** — apunta a ese deploy exacto
- **URL por rama** — siempre la última versión de la rama

El enlace aparece en el comentario del PR y en el dashboard de Vercel.

### Checklist antes de merge a `main`

1. Abrir la URL preview del PR
2. `GET /api/health` → `{ "ok": true, ... }`
3. Probar ronda completa: `/onboarding` → `/jugar` → `/resultado` → ranking
4. Confirmar que analytics **no** cargan (solo producción)
5. Merge → deploy automático a producción

---

## Configuración en Vercel Dashboard

### Git

- **Production Branch:** `main`
- Repo conectado: `retoicfes/web`

### Build (recomendaciones Vercel)

En **Project → Settings → General**:

| Ajuste | Recomendación |
|--------|---------------|
| Build Machine | **Standard** o **Large** (build incluye `prisma generate`) |
| Concurrent Builds | Activar si hay varios PRs a la vez (plan Pro) |

En **Settings → Deployment Protection**:

| Ajuste | Recomendación |
|--------|---------------|
| Skew Protection | **Activar** — evita desajustes cliente/servidor durante deploys (importante por `/api/ronda/*`) |

### Variables de entorno por entorno

En **Settings → Environment Variables**, asigna cada variable al scope correcto:

#### Production (obligatorio)

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | = `POSTGRES_PRISMA_URL` (con pooler) |
| `DIRECT_URL` | = `POSTGRES_URL_NON_POOLING` |
| `ROUND_SIGNING_SECRET` | `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | `https://retoicfes.com` |
| `NEXT_PUBLIC_GTM_ID` | ID de GTM producción |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ID GA4 producción |
| `NEXT_PUBLIC_META_PIXEL_ID` | ID Meta Pixel producción |

#### Preview (obligatorio para probar juego)

| Variable | Valor | Notas |
|----------|--------|-------|
| `DATABASE_URL` | Misma Neon prod **o** branch DB de dev | Ver sección DB abajo |
| `DIRECT_URL` | Non-pooling de esa DB | |
| `ROUND_SIGNING_SECRET` | Mismo secret o uno de preview | Sin esto fallan rondas y rankings |

**No configures en Preview** (el código ya los omite, pero evita ruido):

- `NEXT_PUBLIC_SITE_URL` — la URL se toma de `VERCEL_URL` automáticamente
- `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA_*`, `NEXT_PUBLIC_META_PIXEL_ID`

#### Development (local)

Copia `.env.example` → `.env.local`. Analytics desactivados en local.

Storage → Neon → **Connect to Project**.

---

## Comportamiento automático del código

El proyecto detecta el entorno con `VERCEL_ENV` (`lib/env.ts`):

| Entorno | Analytics (GA/GTM/Meta) | SEO indexable | URL canonical |
|---------|-------------------------|---------------|---------------|
| Production | Sí | Sí | `retoicfes.com` |
| Preview | No | No (`noindex`) | URL del preview (`*.vercel.app`) |
| Local | No | No | `retoicfes.com` (fallback) |

Vercel Analytics y Speed Insights siguen activos en todos los entornos.

---

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
vercel               # preview
vercel --prod        # producción
```

Luego en el dashboard: Settings → Git → conectar el repo.

---

## Base de datos en preview

**Opción A — Misma DB de producción (rápido, MVP):**

- Preview usa las mismas variables `DATABASE_URL` / `DIRECT_URL`
- Los rankings de prueba se mezclan con datos reales
- Aceptable para validar funcionalidad antes de merge

**Opción B — Branch de Neon (recomendado a mediano plazo):**

- Crear branch `preview` en Neon
- Asignar esas URLs solo al scope **Preview** en Vercel
- Ejecutar `pnpm db:push && pnpm db:seed` contra esa branch una vez

---

## Verificar después del deploy

### Producción

`https://retoicfes.com/api/health`

### Preview

`https://TU-PREVIEW.vercel.app/api/health`

Respuestas esperadas:

- `{ "ok": true, "preguntas": N, "rankings": N }` → DB bien
- `"Falta DATABASE_URL"` → configura variables arriba
- Error de tabla → ejecuta `pnpm db:push` y `pnpm db:seed` contra esa misma DB

## Después del primer deploy

```bash
pnpm db:push
pnpm db:seed
```
