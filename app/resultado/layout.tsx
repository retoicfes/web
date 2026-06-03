import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Resultado de la ronda",
  description: "Resultado personal de tu ronda en Reto ICFES.",
  path: "/resultado",
  index: false,
});

export default function ResultadoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
