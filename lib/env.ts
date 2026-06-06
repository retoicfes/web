/** Entorno de deployment en Vercel (o local). */
export type DeploymentEnv = "production" | "preview" | "development";

export function getDeploymentEnv(): DeploymentEnv {
  const vercelEnv = process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (vercelEnv === "production" || vercelEnv === "preview") {
    return vercelEnv;
  }
  return "development";
}

export function isProductionDeployment(): boolean {
  return getDeploymentEnv() === "production";
}

export function isPreviewDeployment(): boolean {
  return getDeploymentEnv() === "preview";
}

/** GA, GTM y Meta Pixel solo en producción (retoicfes.com). */
export function shouldEnableMarketingAnalytics(): boolean {
  return isProductionDeployment();
}

/** URL pública del deployment actual (canonical, OG, sitemap). */
export function getPublicSiteUrl(): string {
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  return "https://retoicfes.com";
}
