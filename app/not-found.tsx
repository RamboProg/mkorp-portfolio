import Link from "next/link";
import type { ReactElement } from "react";
import { BrandModel } from "./components/brand-model";

export default function NotFound(): ReactElement {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: "48px 16px",
        textAlign: "center",
        fontFamily: "var(--font-manrope), system-ui, sans-serif",
      }}
    >
      <BrandModel
        src="/assets/3d-models/mkorp-red-pill-mascot.glb"
        label="Red pill mascot looking around"
        motion="sway"
        tilt
        style={{ width: "min(100%,360px)", aspectRatio: "3 / 2" }}
      />
      <h1 style={{ margin: 0, font: "800 clamp(36px,6vw,72px)/1 var(--font-sora), sans-serif", letterSpacing: "-.05em" }}>
        This page took the red pill.
      </h1>
      <p style={{ margin: 0, maxWidth: 420, fontSize: 17, lineHeight: 1.6, color: "#4a3f37" }}>
        It&apos;s gone somewhere I can&apos;t follow. Let&apos;s get you back to the work.
      </p>
      <Link href="/" style={{ padding: "16px 26px", borderRadius: 999, background: "#231c17", color: "#fdf8f2", fontWeight: 700 }}>
        Back home
      </Link>
    </main>
  );
}
