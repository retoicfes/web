import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reto ICFES",
  description: "Prepárate para Saber 11 jugando — retos rápidos estilo swipe.",
  applicationName: "Reto ICFES",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Reto ICFES",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#020617",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body>
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col safe-pt safe-pb">
          {children}
        </div>
      </body>
    </html>
  );
}
