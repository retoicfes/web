# SEO, analytics y posicionamiento — Reto ICFES

## Ya integrado en el código

| Herramienta | Estado |
|-------------|--------|
| Meta title / description / keywords | `app/layout.tsx` + `lib/site.ts` |
| Open Graph + imagen social | `app/opengraph-image.tsx` |
| `robots.txt` | `app/robots.ts` |
| `sitemap.xml` | `app/sitemap.ts` |
| JSON-LD (WebApplication) | `components/seo/JsonLd.tsx` |
| PWA manifest | `public/manifest.json` |
| Vercel Analytics | `@vercel/analytics` |
| Vercel Speed Insights | `@vercel/speed-insights` |
| Google Tag Manager | `NEXT_PUBLIC_GTM_ID=GTM-WS9J3TRR` |
| Google Analytics 4 (opcional, sin GTM) | `NEXT_PUBLIC_GA_MEASUREMENT_ID` |

## Variables en Vercel (Production)

```env
NEXT_PUBLIC_SITE_URL=https://retoicfes.com
NEXT_PUBLIC_GTM_ID=GTM-WS9J3TRR
```

Configura GA4, conversiones y píxeles **dentro de Tag Manager**, no hace falta `NEXT_PUBLIC_GA_MEASUREMENT_ID` si GA4 ya está en el contenedor GTM.

## Checklist post-deploy (para rankear)

1. **Dominio** `retoicfes.com` apuntando al proyecto Vercel.
2. **Google Search Console** — verificar propiedad, enviar sitemap: `https://retoicfes.com/sitemap.xml`
3. **Bing Webmaster Tools** — mismo sitemap.
4. **GA4** — crear propiedad, pegar ID en `NEXT_PUBLIC_GA_MEASUREMENT_ID`, redeploy.
5. **Contenido** — compartir link en WhatsApp de colegios (señales sociales).
6. **Rendimiento** — revisar pestaña Speed Insights en Vercel (móvil first).

## Posicionamiento realista

El SEO técnico está listo; el **primer lugar** en Google depende de autoridad, backlinks, contenido nuevo y tiempo. Próximos pasos de producto que ayudan:

- Blog o `/guia-saber-11` con texto indexable
- Páginas por materia (`/matematicas-icfes`)
- Más preguntas en el banco (ver `docs/PREGUNTAS.md`)

## Base de datos

```bash
pnpm db:clean   # vacía rankings + preguntas
pnpm db:seed    # carga 40 preguntas grado 11°
pnpm db:reset   # clean + seed
```
