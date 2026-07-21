import { ImageResponse } from "next/og";
import { getBlogBySlug } from "@/lib/db";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  const title = blog?.title ?? "Raja Aryos — Blog";
  const category = blog?.category ?? "";
  const excerpt = blog?.excerpt ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #0B1F3A 0%, #102A43 60%, #0D2137 100%)",
          padding: "64px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative circle */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(47, 128, 237, 0.12)",
            filter: "blur(60px)",
          }}
        />

        {/* Category badge */}
        {category && (
          <div
            style={{
              display: "flex",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                background: "rgba(47, 128, 237, 0.25)",
                border: "1px solid rgba(47, 128, 237, 0.4)",
                color: "#56CCF2",
                fontSize: "14px",
                fontWeight: 600,
                padding: "6px 16px",
                borderRadius: "999px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {category}
            </span>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            color: "#ffffff",
            fontSize: title.length > 60 ? "40px" : "52px",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: "20px",
            maxWidth: "900px",
          }}
        >
          {title}
        </div>

        {/* Excerpt */}
        {excerpt && (
          <div
            style={{
              color: "#94A3B8",
              fontSize: "20px",
              lineHeight: 1.5,
              maxWidth: "800px",
              marginBottom: "40px",
              overflow: "hidden",
              display: "-webkit-box",
            }}
          >
            {excerpt.length > 120 ? excerpt.slice(0, 120) + "…" : excerpt}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2F80ED, #56CCF2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: "14px",
            }}
          >
            RA
          </div>
          <span style={{ color: "#2F80ED", fontWeight: 700, fontSize: "18px" }}>
            Raja Aryos
          </span>
          <span style={{ color: "#475569", fontSize: "16px" }}>·</span>
          <span style={{ color: "#475569", fontSize: "16px" }}>raja-aryos.dev</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
