import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params;
  const dim = size === "512" ? 512 : 192;
  const radius = Math.round(dim * 0.22);

  return new ImageResponse(
    (
      <div
        style={{
          width: dim,
          height: dim,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e3a5f 0%, #0a0f1e 100%)",
          borderRadius: radius,
        }}
      >
        {/* W shape */}
        <svg width={dim * 0.62} height={dim * 0.62} viewBox="0 0 320 320">
          <path
            d="M 30 60 L 90 260 L 160 140 L 230 260 L 290 60"
            fill="none"
            stroke="white"
            strokeWidth="36"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="160" cy="140" r="18" fill="#f59e0b" />
        </svg>
      </div>
    ),
    { width: dim, height: dim }
  );
}
