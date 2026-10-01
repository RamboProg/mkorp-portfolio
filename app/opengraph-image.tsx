import { ImageResponse } from "next/og";

export const alt = "mkorp — Mohamed Ismail, full-stack engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Strokes copied from public/assets/brand-logos/A-wordmark-cream.svg.
const WORDMARK_PATH =
  "M0 40V14a14 14 0 0 1 28 0V40M28 14a14 14 0 0 1 28 0V40M72 -26V40M100 2L74 26M86 16L102 40M118 20a20 20 0 1 0 40 0a20 20 0 1 0 -40 0M174 40V18a18 18 0 0 1 18 -18h6M212 0V66M212 20a20 20 0 1 0 40 0a20 20 0 1 0 -40 0";

export default function Image(): ImageResponse {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#231c17" }}>
        <svg width={620} height={216} viewBox="-8 -34 310 108">
          <path d={WORDMARK_PATH} fill="none" stroke="#fdf8f2" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          <rect x={268} y={30} width={26} height={15} rx={7.5} fill="#ed2020" />
        </svg>
      </div>
    ),
    size,
  );
}
