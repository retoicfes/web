# Imagen hero — inicio (Mundial + Saber 11)

## Dónde guardar el archivo

Coloca la imagen generada en **una** de estas rutas (recomendado WebP):

```
web/public/images/home-hero-mundial.webp
```

Alternativa PNG:

```
web/public/images/home-hero-mundial.png
```

Si usas PNG, cambia en `components/home/HomeHero.tsx` la constante `HOME_HERO_IMAGE_PATH` a `/images/home-hero-mundial.png`.

## Tamaño recomendado

| Uso | Medidas |
|-----|---------|
| Hero móvil (ideal) | **1024 × 768 px** (relación 4:3) |
| Mínimo aceptable | 800 × 600 px |
| Peso | &lt; 300 KB (WebP calidad 80–85) |

La app la muestra en un contenedor 4:3 con `object-cover`. No incluyas texto en la imagen (el texto va en la UI encima).

## Prompt para generar (copia y pega)

**Español (recomendado):**

```
Ilustración hero para app móvil educativa, relación 4:3. Estudiante colombiano de grado 11 con buzo moderno, sosteniendo un celular donde se ven tarjetas de preguntas tipo examen. Al fondo un balón de fútbol estilizado que se fusiona con libros abiertos y marcas de verificación, sensación de “gol académico”. Energía Mundial 2026: luces de estadio, confeti sutil, ambiente festivo pero enfocado en estudio. Paleta: fondo oscuro índigo (#0f172a / #312e81), acentos cian y dorado, destellos amarillo-azul-rojo muy sutiles (sin bandera literal). Estilo vector flat moderno, amigable, dinámico. Sin texto, sin logos oficiales de FIFA, ICFES ni gobierno. Personaje genérico, inclusivo, sonrisa confiada.
```

**English (si tu generador responde mejor en inglés):**

```
Mobile app hero illustration, 4:3 aspect ratio. Colombian grade-11 student in modern casual clothes holding a smartphone showing swipe-style quiz cards. Background: stylized soccer ball merging with open textbooks and checkmarks, “academic goal” celebration vibe. World Cup 2026 energy: soft stadium lights, subtle confetti, festive but study-focused mood. Palette: dark indigo background (#0f172a, #312e81), cyan and gold accents, very subtle yellow-blue-red light streaks (no literal flag). Modern flat vector, friendly, dynamic. No text, no official FIFA, ICFES or government logos. Generic inclusive character, confident smile.
```

## Después de guardar

1. Commit del archivo en `public/images/` (o súbelo a Vercel con el deploy).
2. Recarga la home: si el archivo existe, reemplaza la ilustración CSS automáticamente.
3. Si no hay archivo, se muestra la ilustración animada por defecto.

## Nota legal

No uses el logo oficial del ICFES ni marcas del Mundial FIFA. Solo referencia visual genérica (balón, estadio, estudio).
