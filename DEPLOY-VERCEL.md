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

## Variables de entorno (Production)

| Variable | Origen Neon |
|----------|-------------|
| `DATABASE_URL` | `POSTGRES_PRISMA_URL` |
| `DIRECT_URL` | `POSTGRES_URL_NON_POOLING` |

Storage → Neon → **Connect to Project**.

## Después del primer deploy

```bash
pnpm db:push
pnpm db:seed
```
