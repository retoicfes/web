import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          background: "linear-gradient(135deg, #4338ca, #0f172a)",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 800 }}>R</div>
        <div style={{ fontSize: 16, marginTop: 8, opacity: 0.9 }}>ICFES</div>
      </div>
    ),
    { ...size },
  );
}
