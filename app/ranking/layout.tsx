import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Ranking simulacros ICFES y Saber 11 por colegio",
  description:
    "Ranking de simulacros Saber 11 e ICFES por colegio, municipio, departamento y Colombia. Compara puntajes de Pruebas Saber grado 11 entre instituciones.",
  path: "/ranking",
  ogTitle: "Ranking simulacros ICFES y Saber 11 | Reto ICFES",
});

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
