import { siteConfig } from "@/lib/site";

export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: "es-CO",
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      geographicArea: {
        "@type": "Country",
        name: "Colombia",
      },
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "COP",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
