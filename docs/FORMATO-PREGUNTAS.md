# Formato de preguntas — Reto ICFES

Guía para redactar ítems que funcionen bien en **móvil** (swipe + 60 s por pregunta).

## ¿Contexto + preguntas o todo corto?

**Ambos**, según el área — como el Saber 11 real:

| Área | Contexto | Enunciado | Opciones |
|------|----------|-----------|----------|
| **Lectura Crítica** | Sí, texto 150–400 palabras | Corto: la pregunta concreta | Breves |
| **Sociales / Ciencias** | A menudo un párrafo o caso | 1–2 frases | Breves |
| **Matemáticas** | Rara vez (solo enunciado) | Corto, directo | Números o frases cortas |
| **Inglés** | Texto corto o diálogo | Pregunta clara en ES o EN | Breves |

### Regla de oro

- **El contexto puede ser largo** → en la app se muestra en un bloque con scroll.
- **La pregunta (enunciado) debe ser corta y concreta** → “Según el texto, ¿cuál…?”
- **Las opciones A–D deben caber en 2 líneas** en pantalla (~120 caracteres ideal).

Límites técnicos: ver `lib/admin/preguntas.ts` → `LIMITES_CONTENIDO`.

## Estructura en base de datos

```
ContextoICFES (texto compartido)
  └── PreguntaICFES × N (cada una con enunciado, 4 opciones, correcta, explicación)
```

Un contexto puede tener **varias preguntas** (ítems 1, 2, 3…) vía `ordenEnContexto`.

## Ejemplo bueno (Lectura Crítica)

**Contexto:** párrafo de 180 palabras sobre movilidad en ciudades.

**Pregunta 1:** “¿Cuál es la tesis principal del autor?”  
**Opciones:** 4 frases de ~8–12 palabras cada una.

**Pregunta 2:** “En la línea 3, ‘…’ se refiere a…”

## Ejemplo a evitar

- Contexto de 800 palabras **y** enunciado que repite todo el contexto.
- Opciones A–D con párrafos enteros (no se leen en el celular).
- Preguntas que requieren cálculo largo sin tiempo suficiente (60 s).

## Contenido legal

Usa textos **originales** o de dominio público. No copies ítems oficiales del ICFES.

## Carga en local

Ver [ADMIN-PREGUNTAS.md](./ADMIN-PREGUNTAS.md).
