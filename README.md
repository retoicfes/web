# Reto ICFES — MVP Web

Plataforma móvil-first para practicar preguntas tipo Saber 11 con mecánica rápida (tap / swipe) y rankings por ubicación.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- PostgreSQL (Vercel Postgres / Neon) + Prisma
- Deploy: Vercel (`retoicfes/web`)

## Día 1 — Infra y base de datos

1. Clona y entra al repo:
   ```bash
   cd web
   pnpm install
   ```

2. Copia variables **reales** desde Vercel (Storage → Postgres → `.env.local`):
   ```bash
   cp .env.example .env.local
   ```
   Pega `POSTGRES_PRISMA_URL` y `POSTGRES_URL_NON_POOLING`, o como mínimo:
   ```env
   DATABASE_URL="postgresql://..."   # pooled (Prisma en la app)
   DIRECT_URL="postgresql://..."     # non-pooling (db push); puede ser la misma en Neon dev
   ```
   **No dejes** los placeholders `USER:PASSWORD@HOST` del ejemplo.

3. Crea tablas y datos de prueba:
   ```bash
   pnpm db:push
   pnpm db:seed
   ```

4. Arranca en local:
   ```bash
   pnpm dev
   ```
   Abre http://localhost:3000 en el celular (misma red) o DevTools móvil.

## Día 2 — Flujos del MVP

| Ruta | Qué hace |
|------|----------|
| `/` | Landing + CTA |
| `/onboarding` | Apodo + Departamento → Municipio → Colegio (localStorage) |
| `/jugar` | 15 preguntas (3 por área), feedback, puntaje |
| `/resultado` | Puntaje final + guardar en Postgres |
| `/ranking` | Top por colegio / municipio / departamento |

### APIs

- `GET /api/preguntas?limit=10`
- `POST /api/rankings` — body: `{ apodo, departamento, municipio, colegio, puntaje }`
- `GET /api/rankings?scope=colegio|municipio|departamento&...`

## Deploy en Vercel

1. Importa el repo `retoicfes/web`.
2. Framework: Next.js (detectado).
3. Variables de entorno: `DATABASE_URL`, `DIRECT_URL` desde Vercel Postgres.
4. Build: `pnpm build` (incluye `prisma generate`).
5. Tras el primer deploy, ejecuta en local contra prod o usa Vercel CLI:
   ```bash
   pnpm db:push
   pnpm db:seed
   ```

## Próximos días (roadmap 5 días)

- **Día 3:** Más preguntas (CSV/import), animaciones swipe con Framer Motion, OG image para WhatsApp.
- **Día 4:** Ranking intercolegial (promedio por institución), rate limit API, PWA manifest.
- **Día 5:** QA móvil, métricas Vercel Analytics, copy viral y prueba piloto en un colegio.

## Nota

El template admin anterior (`legacy/pages`) se conservó fuera del router por referencia; el MVP vive en `app/`.
