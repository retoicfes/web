# Banco de preguntas — Saber 11 (grado 11°)

## Fuente actual

Archivo: `data/preguntas-saber11.ts`

- **40 preguntas originales** (8 por área), alineadas con las **5 pruebas** de Saber 11:
  - Matemáticas
  - Lectura Crítica
  - Sociales y Ciudadanas
  - Ciencias Naturales
  - Inglés

## Importante (legal)

No usamos ítems oficiales del ICFES copiados de exámenes pasados. Son preguntas **redactadas por nosotros** con el mismo **tipo de competencia** (formato A–D, explicación breve).

Para escalar el banco:

1. Contratar docentes por área que redacten ítems originales.
2. Revisar con checklist de estilo Saber 11 (contexto colombiano, distractores plausibles).
3. Añadir al array en `data/preguntas-saber11.ts` y ejecutar `pnpm db:seed`.

## Próximo lote sugerido (Día 3–4 del roadmap)

| Materia | Meta ítems |
|---------|------------|
| Matemáticas | 30+ |
| Lectura Crítica | 30+ |
| Sociales y Ciudadanas | 25+ |
| Ciencias Naturales | 25+ |
| Inglés | 25+ |

Total objetivo MVP fuerte: **~150 preguntas** (15 rondas sin repetir).

## Importar desde CSV (futuro)

Esquema sugerido:

```csv
materia,enunciado,opcionA,opcionB,opcionC,opcionD,correcta,explicacion
```

Script `prisma/import-csv.ts` se puede añadir cuando tengan el archivo.
