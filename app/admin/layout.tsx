import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Administración",
  description: "Panel de administración Reto ICFES.",
  path: "/admin",
  index: false,
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
