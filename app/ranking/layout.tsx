import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Ranking Saber 11 por colegio",
  description:
    "Consulta el ranking de puntajes Saber 11 por colegio, municipio, departamento y Colombia. Compara tu institución educativa con el Reto ICFES.",
  path: "/ranking",
});

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
