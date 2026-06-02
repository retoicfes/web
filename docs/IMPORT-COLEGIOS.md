# Importar establecimientos y sedes (CSV DANE)

Los archivos oficiales viven en la carpeta `repositories/` (hermana de `web/`), no en git por tamaño (~32 MB):

- `Establecimientos - Establecimientos.csv` (~35k filas)
- `Establecimientos - Sedes.csv.csv` (~68k filas)

Columnas usadas: código departamento/municipio DANE, código establecimiento, nombre, estado (`NUEVO-ACTIVO`, etc.), sedes por establecimiento.

## Pasos locales

```bash
cd web
pnpm db:push          # crea tablas departamentos, municipios, establecimientos, sedes
pnpm db:import-colegios
```

Variable opcional si los CSV están en otra ruta:

```bash
COLEGIOS_CSV_DIR=/ruta/a/carpeta pnpm db:import-colegios
```

El script borra y reimporta solo tablas de colegios (no toca preguntas ni rankings).

## Producción (Neon / Vercel)

1. Sube las variables `DATABASE_URL` y `DIRECT_URL` (o `POSTGRES_*` según tu setup).
2. Desde tu máquina con acceso a Neon:

   ```bash
   cd web
   pnpm db:push
   COLEGIOS_CSV_DIR=.. pnpm db:import-colegios
   ```

3. Redeploy en Vercel. El onboarding consume `/api/colegios/*`.

## APIs

| Ruta | Parámetros |
|------|------------|
| `GET /api/colegios/departamentos` | — |
| `GET /api/colegios/municipios` | `daneDepto` |
| `GET /api/colegios/buscar` | `daneMuni`, `q` (≥2 letras), `activos=1`, `limit` |

## Sesión del jugador

`localStorage` guarda nombres para UI y códigos DANE para rankings futuros:

- `daneDepartamento`, `daneMunicipio`, `codigoEstablecimiento`

Quienes tenían sesión antigua (solo nombres) deben volver a `/onboarding`.
