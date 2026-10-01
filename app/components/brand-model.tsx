"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactElement } from "react";
import type { BrandMotion, DisposeScene } from "../lib/brand-scene";

type BrandModelProps = {
  src: string;
  label: string;
  motion?: BrandMotion;
  tilt?: boolean;
  style?: CSSProperties;
};

/** Lazy three.js viewer for the mkorp GLB brand objects. Loads only once scrolled near. */
export function BrandModel({ src, label, motion = "spin", tilt = false, style }: BrandModelProps): ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let dispose: DisposeScene | undefined;
    let cancelled = false;

    const nearby = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        nearby.disconnect();
        import("../lib/brand-scene")
          .then(({ mountBrandScene }) => mountBrandScene(host, { src, motion, tilt }))
          .then((d) => {
            if (cancelled) d();
            else dispose = d;
          })
          .catch((err: unknown) => console.error(`BrandModel: could not render ${src}`, err));
      },
      { rootMargin: "300px" },
    );
    nearby.observe(host);

    return () => {
      cancelled = true;
      nearby.disconnect();
      dispose?.();
    };
  }, [src, motion, tilt]);

  return <div ref={hostRef} role="img" aria-label={label} style={{ position: "relative", ...style }} />;
}
