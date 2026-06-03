import { HOME_FAQ_SCHEMA } from "@/components/seo/HomeSeoContent";
import { siteConfig } from "@/lib/site";

function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd() {
  const base = siteConfig.url.replace(/\/$/, "");

  const graph = [
    {
      "@type": "Organization",
      "@id": `${base}/#organization`,
      name: siteConfig.name,
      url: base,
      description: siteConfig.description,
    },
    {
      "@type": "WebSite",
      "@id": `${base}/#website`,
      url: base,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: "es-CO",
      publisher: { "@id": `${base}/#organization` },
    },
    {
      "@type": "WebApplication",
      "@id": `${base}/#app`,
      name: siteConfig.name,
      url: base,
      description: siteConfig.description,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript",
      inLanguage: "es-CO",
      isAccessibleForFree: true,
      audience: {
        "@type": "EducationalAudience",
        educationalRole: "student",
        geographicArea: { "@type": "Country", name: "Colombia" },
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "COP",
      },
      publisher: { "@id": `${base}/#organization` },
    },
    {
      "@type": "FAQPage",
      "@id": `${base}/#faq`,
      mainEntity: HOME_FAQ_SCHEMA.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
