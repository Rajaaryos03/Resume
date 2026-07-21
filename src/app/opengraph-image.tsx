import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "linear-gradient(135deg, #0B1F3A 0%, #102A43 60%, #0D2137 100%)",
          padding: "80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Glow circle top-right */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background: "rgba(47, 128, 237, 0.15)",
            filter: "blur(80px)",
          }}
        />
        {/* Glow circle bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "100px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(86, 204, 242, 0.08)",
            filter: "blur(60px)",
          }}
        />

        {/* Available badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(47, 128, 237, 0.2)",
            border: "1px solid rgba(47, 128, 237, 0.4)",
            borderRadius: "999px",
            padding: "6px 16px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#10B981",
            }}
          />
          <span style={{ color: "#56CCF2", fontSize: "16px", fontWeight: 600 }}>
            Available for opportunities
          </span>
        </div>

        {/* Name */}
        <div
          style={{
            color: "#ffffff",
            fontSize: "72px",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "16px",
          }}
        >
          Raja <span style={{ color: "#2F80ED" }}>Aryos</span>
        </div>

        {/* Title */}
        <div
          style={{
            color: "#56CCF2",
            fontSize: "28px",
            fontWeight: 600,
            marginBottom: "20px",
          }}
        >
          Power Platform Developer
        </div>

        {/* Skills pills */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {["Power Apps", "Power Automate", "Copilot Studio", "Dataverse"].map((s) => (
            <div
              key={s}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "999px",
                padding: "6px 16px",
                color: "#CBD5E1",
                fontSize: "15px",
              }}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            right: "80px",
            color: "#475569",
            fontSize: "18px",
          }}
        >
          rajaaryos.dev
        </div>
      </div>
    ),
    { ...size }
  );
}
