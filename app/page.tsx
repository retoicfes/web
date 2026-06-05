import { HomePageClient } from "@/components/home/HomePageClient";
import { HomeSeoContent } from "@/components/seo/HomeSeoContent";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: siteConfig.homeTitle,
  description: siteConfig.description,
  path: "/",
  ogTitle: siteConfig.ogTitle,
});

export default function HomePage() {
  return (
    <>
      <HomePageClient />
      <HomeSeoContent />
    </>
  );
}
