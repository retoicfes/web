# SEO y posicionamiento — Reto ICFES

## Mapa técnico (código)

| Pieza | Archivo | Notas |
|-------|---------|--------|
| Config global | `lib/site.ts` | Nombre, URL, descripción, keywords |
| Metadatos por ruta | `lib/seo.ts` → `pageMetadata()` | Canonical, OG, Twitter, robots |
| Layout raíz | `app/layout.tsx` | Defaults + GTM/GA + JSON-LD |
| Home SSR + FAQ | `app/page.tsx`, `components/seo/HomeSeoContent.tsx` | Texto indexable + preguntas |
| JSON-LD | `components/seo/JsonLd.tsx` | Organization, WebSite, WebApplication, FAQPage |
| Sitemap | `app/sitemap.ts` | Solo rutas públicas (`SITEMAP_ROUTES`) |
| Robots | `app/robots.ts` | Bloquea `/api/`, `/admin/`, `/jugar`, `/resultado` |
| OG imagen | `app/opengraph-image.tsx` | 1200×630 |
| Favicon / Apple | `app/icon.tsx`, `app/apple-icon.tsx` | |
| PWA | `public/manifest.json` | |

### Rutas indexables (sí rankear)

- `/` — landing + FAQ
- `/ranking` — ranking colegios
- `/onboarding` — entrada al juego

### Rutas no indexables (no competir consigo mismas)

- `/jugar`, `/resultado` — `noindex` + fuera del sitemap
- `/admin/*` — privado

## Variables en Vercel (Production)

```env
NEXT_PUBLIC_SITE_URL=https://retoicfes.com
NEXT_PUBLIC_GTM_ID=GTM-WS9J3TRR
# Opcional: verificación Search Console (meta tag)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=xxxxxxxx
# GA4 directo (si no usas solo GTM para GA)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-53L2DLHYFF
```

**Evita doble conteo:** si GA4 está dentro de GTM, no actives también el gtag directo con el mismo ID.

## Checklist operativo (tú, fuera del código)

Marca cuando esté hecho:

- [ ] Dominio `retoicfes.com` (y `www` → apex) en Vercel
- [ ] [Google Search Console](https://search.google.com/search-console): propiedad verificada
- [ ] Enviar sitemap: `https://retoicfes.com/sitemap.xml`
- [ ] [Bing Webmaster](https://www.bing.com/webmasters): mismo sitemap
- [ ] Inspeccionar URL `/` y pedir indexación
- [ ] Probar vista previa OG: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Core Web Vitals en Vercel Speed Insights (móvil)
- [ ] Enlaces desde colegios / WhatsApp / redes (autoridad real)

## Posicionamiento realista

El **SEO técnico** del repo está alineado; **el primer puesto en Google** no se garantiza por código. Depende de:

1. **Intención de búsqueda** — “simulacro saber 11”, “preguntas icfes grado 11”, etc.
2. **Contenido nuevo** — blog o guías (`/guia-saber-11`, páginas por materia)
3. **Autoridad** — backlinks, menciones, tiempo de dominio
4. **Señales de producto** — usuarios, tiempo en sitio, shares

### Próximos pasos de producto que más ayudan

- Landing `/guia-saber-11` (1500+ palabras, indexable)
- Páginas por materia: `/matematicas-saber-11`, `/lectura-critica-icfes`, …
- Más ítems en el banco (ver `docs/FORMATO-PREGUNTAS.md`)
- Enlace visible desde home al ranking y onboarding (ya en FAQ)

## Comprobación local

```bash
pnpm dev
# Abrir:
# http://localhost:3000/robots.txt
# http://localhost:3000/sitemap.xml
# Ver código fuente de / → debe verse HomeSeoContent y JSON-LD
```

```bash
pnpm build
```

## Analytics

| Herramienta | Paquete / componente |
|-------------|----------------------|
| Vercel Analytics | `@vercel/analytics` |
| Speed Insights | `@vercel/speed-insights` |
| GTM | `components/analytics/GoogleTagManager.tsx` |
| GA4 | `components/analytics/GoogleAnalytics.tsx` |
