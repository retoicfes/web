import { siteConfig } from "@/lib/site";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #020617 0%, #312e81 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          padding: 48,
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.9, marginBottom: 16 }}>
          Simulacro ICFES · Pruebas Saber 11
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2 }}>Reto ICFES</div>
        <div style={{ fontSize: 32, marginTop: 24, textAlign: "center", maxWidth: 900, opacity: 0.95 }}>
          Simulacros Saber 11 gratis · grado 11° Colombia
        </div>
      </div>
    ),
    { ...size },
  );
}
