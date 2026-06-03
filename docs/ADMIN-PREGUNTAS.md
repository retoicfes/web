# Admin — subir preguntas (local)

Panel en **`/admin/preguntas`** para cargar contextos e ítems por área.

## Requisitos

```bash
cd web
pnpm db:push          # crea tablas contextos_icfes + campos nuevos
pnpm dev
```

Abre: [http://localhost:3000/admin/preguntas](http://localhost:3000/admin/preguntas)

## Autenticación

| Entorno | Comportamiento |
|---------|----------------|
| **Local** (`NODE_ENV=development`) | Entra sin clave (o con cualquier valor) |
| **Producción** | Requiere `ADMIN_SECRET` en Vercel |

En `.env.local`:

```bash
ADMIN_SECRET=tu-clave-larga-aqui
```

La UI guarda la clave en `sessionStorage` y la envía como header `x-admin-key`.

## Modos de carga

### 1. Contexto + ítems (formulario)

1. Elige **materia** (una de las 5 áreas Saber 11).
2. Pega el **contexto** (texto base, artículo, gráfico descrito, etc.).
3. Añade **1 o más preguntas** ligadas a ese contexto.
4. Guardar → crea `ContextoICFES` + `PreguntaICFES` en Neon.

### 2. Importar JSON

```json
{
  "materia": "Lectura Crítica",
  "titulo": "Título opcional",
  "contenido": "Texto del contexto…",
  "preguntasItems": [
    {
      "orden": 1,
      "enunciado": "¿Cuál es la idea central?",
      "opcionA": "…",
      "opcionB": "…",
      "opcionC": "…",
      "opcionD": "…",
      "correcta": "B",
      "explicacion": "…",
      "dificultad": "media"
    }
  ]
}
```

### 3. Ver y editar

Pestaña **Ver / editar**: lista el banco, filtra por área o busca en el enunciado, y abre cada ítem para corregir texto, opciones, correcta, dificultad y orden (si tiene contexto).

API: `GET /api/admin/preguntas/[id]` · `PATCH /api/admin/preguntas/[id]`

## Reset (banco y estudiantes)

Pestaña **Reset** en `/admin/preguntas` o por terminal:

| Acción | Admin (confirmación) | Terminal |
|--------|----------------------|----------|
| Vaciar banco ICFES | `BORRAR-PREGUNTAS` | `pnpm db:reset-banco` |
| Vaciar rankings | `BORRAR-RANKINGS` | `pnpm db:reset-banco-full` (solo rankings: ver script) |
| Ambos | `BORRAR-TODO` | `pnpm db:reset-banco --rankings` |

Flujo típico para **nuevo banco ICFES**:

1. Reset → borrar preguntas (+ contextos)
2. Importar JSON o formulario por área
3. (Opcional) Reset rankings si empiezas competencia nueva

**Estudiantes:** en el servidor solo existen como filas en `rankings` (apodo + colegio + puntaje). No hay cuentas. Borrar rankings = empezar de cero en el ranking.

**Intentos en el celular:** el límite de rondas (2 por defecto) vive en `localStorage` del dispositivo. Tras reset de rankings, pide a los estudiantes cerrar pestaña o borrar datos del sitio si quieres reiniciar intentos también.

## Intentos por estudiante (app)

Constante `MAX_INTENTOS_RONDA` en `lib/game.ts` (default **2**). Cambiar a `3` si quieres más repaso.

- Intento 1: primera ronda
- Intento 2: botón «Intentar de nuevo» (preguntas distintas)
- Tras el máximo: solo ranking, sin nueva ronda

## APIs (referencia)

| Método | Ruta | Uso |
|--------|------|-----|
| GET | `/api/admin/preguntas` | Listar (filtro `materia`, `q`, `limit`) |
| GET | `/api/admin/preguntas/[id]` | Detalle para editar |
| PATCH | `/api/admin/preguntas/[id]` | Guardar cambios |
| POST | `/api/admin/contextos` | Contexto + preguntas |
| GET | `/api/admin/contextos` | Listar contextos |
| POST | `/api/admin/preguntas` | Pregunta suelta sin contexto |
| GET | `/api/admin/stats` | Totales por materia |
| POST | `/api/admin/reset` | Borrar banco y/o rankings |

## Dificultad (metadata interna)

Opcional por pregunta: `"dificultad": "facil" | "media" | "dificil"` (default `media`).

No afecta puntaje ni ranking; solo sirve para estadísticas del banco.

## Formato recomendado

Ver [FORMATO-PREGUNTAS.md](./FORMATO-PREGUNTAS.md).

## Producción

- `/admin/` está en `robots.txt` disallow.
- **No despliegues** el admin abierto: siempre configura `ADMIN_SECRET`.
- Trabajar en **local** contra Neon es el flujo recomendado por ahora.
