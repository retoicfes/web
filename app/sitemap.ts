import { isProductionDeployment } from "@/lib/env";
import { SITEMAP_ROUTES } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isProductionDeployment()) {
    return [];
  }

  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  return SITEMAP_ROUTES.map((route) => ({
    url: route.path === "/" ? base : `${base}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
