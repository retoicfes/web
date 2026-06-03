import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Empezar simulacro Saber 11",
  description:
    "Configura tu apodo y colegio (DANE) para jugar el simulacro Saber 11 gratis. Sin correo, listo en segundos.",
  path: "/onboarding",
});

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
