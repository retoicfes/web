/** Configuración central del sitio (SEO, OG, sitemap). */
export const siteConfig = {
  name: "Reto ICFES",
  shortName: "Reto ICFES",
  domain: "retoicfes.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://retoicfes.com",
  description:
    "Prepárate para las Pruebas Saber 11 (grado 11°) con retos rápidos tipo swipe. Practica Matemáticas, Lectura Crítica, Sociales, Ciencias e Inglés y compite en el ranking de tu colegio en Colombia.",
  keywords: [
    "ICFES",
    "Saber 11",
    "grado 11",
    "bachillerato Colombia",
    "simulacro ICFES",
    "preparación Saber 11",
    "preguntas tipo ICFES",
    "reto icfes",
    "práctica ICFES gratis",
    "ranking colegios Colombia",
  ],
  locale: "es_CO",
  twitter: "@retoicfes",
  creator: "Reto ICFES",
} as const;
