import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Dripwriter Origin — Free human typing extension for Google Docs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a0a",
          color: "#ffffff"
        }}
      >
        <div style={{ color: "#c9a84c", fontSize: 28, letterSpacing: 6, textTransform: "uppercase" }}>
          Free · Open Source · Chrome · Edge · Firefox
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, marginTop: 24, lineHeight: 1.05 }}>
          Dripwriter Origin
        </div>
        <div style={{ fontSize: 40, color: "#a0a0a0", marginTop: 16 }}>
          Type into Google Docs like a human.
        </div>
      </div>
    ),
    { ...size }
  );
}
