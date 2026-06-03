import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";

export type PageSeoInput = {
  /** Título corto (el layout añade «| Reto ICFES» vía template). */
  title: string;
  description: string;
  /** Ruta con barra inicial, ej. `/ranking`. */
  path: string;
  /** Si false → noindex (juego, resultado, admin). */
  index?: boolean;
  ogTitle?: string;
};

function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  return path === "/" ? base : `${base}${path}`;
}

/** Metadatos por ruta: canonical, robots, Open Graph y Twitter. */
export function pageMetadata({
  title,
  description,
  path,
  index = true,
  ogTitle,
}: PageSeoInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = `${siteConfig.url.replace(/\/$/, "")}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title: ogTitle ?? `${title} | ${siteConfig.name}`,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} — Simulacro Saber 11`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle ?? title,
      description,
      creator: siteConfig.twitter,
      images: [ogImage],
    },
  };
}

/** Rutas públicas que deben aparecer en sitemap.xml. */
export const SITEMAP_ROUTES: {
  path: string;
  changeFrequency: "weekly" | "daily" | "monthly";
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/ranking", changeFrequency: "daily", priority: 0.9 },
  { path: "/onboarding", changeFrequency: "monthly", priority: 0.85 },
];
