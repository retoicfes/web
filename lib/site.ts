import { getPublicSiteUrl } from "@/lib/env";

/** Configuración central del sitio (SEO, OG, sitemap). */
export const siteConfig = {
  name: "Reto ICFES",
  shortName: "Reto ICFES",
  domain: "retoicfes.com",
  /** URL del deployment actual (prod, preview o local). */
  get url() {
    return getPublicSiteUrl();
  },
  description:
    "Simulacro ICFES y Pruebas Saber 11 gratis en Colombia. Preguntas tipo Saber 11 para grado 11°, ranking por colegio y retos rápidos en el celular.",
  /** Título SEO home (≤60 caracteres ideal). */
  homeTitle: "Simulacro ICFES y Saber 11 Gratis — Grado 11",
  ogTitle: "Simulacro ICFES y Pruebas Saber 11 Gratis | Reto ICFES",
  keywords: [
    "ICFES",
    "icfes",
    "Saber 11",
    "saber 11",
    "saber11",
    "Pruebas Saber",
    "pruebas saber",
    "prueba Saber 11",
    "pruebas Saber 11",
    "simulacro ICFES",
    "simulacro icfes",
    "simulacros ICFES",
    "simulacros icfes",
    "simulacro Saber 11",
    "simulacros Saber 11",
    "simulacro pruebas saber",
    "preguntas ICFES",
    "preguntas icfes",
    "preguntas Saber 11",
    "preguntas tipo ICFES",
    "examen ICFES",
    "examen icfes",
    "ICFES grado 11",
    "icfes grado 11",
    "grado 11",
    "bachillerato Colombia",
    "preparación ICFES",
    "preparación Saber 11",
    "práctica ICFES gratis",
    "simulacro ICFES gratis",
    "ICFES en línea",
    "icfes online",
    "reto icfes",
    "reto ICFES",
    "ranking colegios Colombia",
    "pruebas de estado Colombia",
    "Pruebas Saber 11 Colombia",
  ],
  locale: "es_CO",
  twitter: "@retoicfes",
  creator: "Reto ICFES",
};
