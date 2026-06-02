import { siteConfig } from "@/lib/site";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/onboarding`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/jugar`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/ranking`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];
}
