import { HomePageClient } from "@/components/home/HomePageClient";
import { HomeSeoContent } from "@/components/seo/HomeSeoContent";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Simulacro Saber 11 Grado 11 Colombia",
  description: siteConfig.description,
  path: "/",
  ogTitle: `${siteConfig.name} | Practica Saber 11 gratis`,
});

export default function HomePage() {
  return (
    <>
      <HomePageClient />
      <HomeSeoContent />
    </>
  );
}
