import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Empezar simulacro ICFES Saber 11 gratis",
  description:
    "Configura apodo y colegio (DANE) para tu simulacro de Pruebas Saber 11. Practica ICFES gratis, sin correo, en menos de un minuto.",
  path: "/onboarding",
  ogTitle: "Simulacro ICFES Saber 11 gratis | Reto ICFES",
});

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
