import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Jugar ronda",
  description: "Ronda activa del simulacro Reto ICFES.",
  path: "/jugar",
  index: false,
});

export default function JugarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
