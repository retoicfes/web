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

## APIs (referencia)

| Método | Ruta | Uso |
|--------|------|-----|
| POST | `/api/admin/contextos` | Contexto + preguntas |
| GET | `/api/admin/contextos` | Listar contextos |
| POST | `/api/admin/preguntas` | Pregunta suelta sin contexto |
| GET | `/api/admin/stats` | Totales por materia |

Todas requieren header `x-admin-key` en producción.

## Dificultad (metadata interna)

Opcional por pregunta: `"dificultad": "facil" | "media" | "dificil"` (default `media`).

No afecta puntaje ni ranking; solo sirve para estadísticas del banco.

## Formato recomendado

Ver [FORMATO-PREGUNTAS.md](./FORMATO-PREGUNTAS.md).

## Producción

- `/admin/` está en `robots.txt` disallow.
- **No despliegues** el admin abierto: siempre configura `ADMIN_SECRET`.
- Trabajar en **local** contra Neon es el flujo recomendado por ahora.
