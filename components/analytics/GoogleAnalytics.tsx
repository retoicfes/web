import Script from "next/script";
import { shouldEnableMarketingAnalytics } from "@/lib/env";

const GA_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-53L2DLHYFF";

/** Google Analytics 4 (gtag.js). Comparte dataLayer con GTM si ambos están activos. */
export function GoogleAnalytics() {
  if (!GA_ID || !shouldEnableMarketingAnalytics()) return null;

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
