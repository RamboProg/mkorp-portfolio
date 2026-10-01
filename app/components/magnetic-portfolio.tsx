"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import { initMotion } from "../lib/motion";
import { BrandModel } from "./brand-model";
import { ContactForm } from "./contact-form";

/** Extends CSSProperties with CSS features not yet in the bundled csstype version. */
type Style = CSSProperties & { containerType?: string; textWrap?: string };

type NavItem = { href: string; label: string };
type Project = {
  name: string;
  url?: string;
  img: string;
  bg: string;
  fit: "contain" | "cover";
  chips: string[];
  line: string;
  role: string;
};
type Job = { org: string; role: string; when: string; points: string[] };
type MagnetEl = HTMLElement & { __on?: boolean };

const ROTATING_WORDS: readonly [string, number][] = [
  ["solutions", 4.8],
  ["web apps", 4.4],
  ["mobile apps", 5.9],
  ["enterprise", 5.1],
  ["AI products", 5.6],
];

const PROJECTS: Project[] = [
  {
    name: "Dealtable.ai",
    url: "https://dealtable.ai",
    img: "/assets/dealtable-lockup.png",
    bg: "#fff",
    fit: "contain",
    chips: ["Enterprise", "AI", "Web"],
    line: "An AI analyst for venture funds that cuts the time VCs spend researching a company.",
    role: "Lead Software Engineer · Develo",
  },
  {
    name: "KLIK",
    img: "/assets/klik-wordmark.png",
    bg: "#fff451",
    fit: "cover",
    chips: ["Mobile", "Booking"],
    line: "An all-in-one booking app, from discovery to confirmed appointment.",
    role: "Lead Software Engineer · Develo",
  },
  {
    name: "Kashfety",
    url: "https://kashfety.com",
    img: "/assets/kashfety-icon.png",
    bg: "#4fbcc5",
    fit: "contain",
    chips: ["Mobile", "Health"],
    line: "A doctor-booking app for patients and clinics in Syria.",
    role: "Lead Software Engineer · Develo",
  },
  {
    name: "Rymx EG",
    url: "https://rymx-eg.com",
    img: "/assets/rymx-logo.png",
    bg: "#fff",
    fit: "contain",
    chips: ["E-commerce", "Brand"],
    line: "A local clothing brand in Egypt. I designed the product and built the store.",
    role: "Lead SWE & Product Designer · Independent",
  },
  {
    name: "Locate App NZ",
    url: "https://muslimdirectory.co.nz/",
    img: "/assets/locate-mark.png",
    bg: "#efe8f6",
    fit: "contain",
    chips: ["Mobile", "Community"],
    line: "Helps Muslims in New Zealand find the services and places they need.",
    role: "Software Engineer · Develo",
  },
];

const JOBS: Job[] = [
  {
    org: "Develo Systems",
    role: "Lead Software Engineer",
    when: "2025 — now",
    points: [
      "Built and delivered 12+ SEO- and GEO-optimised e-commerce websites.",
      "Shipped 5+ mobile apps to production on the stores.",
      "Managed 5+ projects, including an enterprise platform ranked top 3 in NZ and Australia.",
      "Worked with the AI team on AI products.",
    ],
  },
  {
    org: "GMind",
    role: "Player Mechanics",
    when: "2023",
    points: ["Built, tested and debugged gameplay features in Unity."],
  },
  {
    org: "German International University",
    role: "CS Junior TA",
    when: "2023",
    points: ["Assisted with CS lessons and supported student projects."],
  },
];

const STACK = [
  "Next.js", "React", "TypeScript", "Vite", "Flutter", "React Native", "Node", "Nest.js",
  "PostgreSQL", "Redis", "Supabase", "Firebase", "NeonDB", "AWS", "Vercel", "Railway",
];

const TICKER_BASE = [
  "20+ products shipped",
  "12+ e-commerce sites",
  "5+ apps on the stores",
  "5+ projects managed",
  "Top 3 startup in NZ & AU",
];

const ORBIT_LABELS = ["Enterprise", "Mobile apps", "Websites", "AI", "E-commerce"];

const WAVE_KEYFRAMES: Keyframe[] = [
  { d: "path('M0 40 C 240 0, 480 80, 720 40 S 1200 0, 1440 40 L1440 80 L0 80 Z')" },
  { d: "path('M0 40 C 240 70, 480 10, 720 40 S 1200 70, 1440 40 L1440 80 L0 80 Z')" },
  { d: "path('M0 40 C 240 0, 480 80, 720 40 S 1200 0, 1440 40 L1440 80 L0 80 Z')" },
];

export function MagneticPortfolio(): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  const [width, setWidth] = useState(1200);
  const [openJob, setOpenJob] = useState(-1);
  const [wordIndex, setWordIndex] = useState(0);
  const [metrics, setMetrics] = useState<{ ws: number[] | null; fsk: number }>({ ws: null, fsk: 1 });

  useEffect(() => {
    const id = window.setInterval(() => setWordIndex((w) => (w + 1) % 5), 2600);
    return () => window.clearInterval(id);
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return initMotion(root);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const cursor = cursorRef.current;
    const rail = railRef.current;
    const hero = heroRef.current;
    if (!root || !cursor || !rail) return;

    const resizeObserver = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    resizeObserver.observe(root);

    root
      .querySelectorAll<SVGPathElement>("[data-wave]")
      .forEach((el) => el.animate(WAVE_KEYFRAMES, { duration: 9000, iterations: Infinity, easing: "ease-in-out" }));

    const pos = { x: 0, y: 0, tx: 0, ty: 0 };
    let bgSwapAt = 0;
    let curLabel = "";
    let tilted: HTMLElement | null = null;
    let drag: { x: number; sl: number; v: number; lx: number; moved: boolean } | null = null;
    let lastMoved = false;
    let inertia = 0;

    const setCursor = (label: string) => {
      if (curLabel === label) return;
      curLabel = label;
      const span = cursor.querySelector<HTMLElement>("[data-cursor-label]");
      if (span) span.textContent = label;
      const w = label ? Math.max(64, label.length * 9 + 36) : 16;
      const h = label ? 64 : 16;
      cursor.style.width = `${w}px`;
      cursor.style.height = `${h}px`;
      cursor.style.margin = `${-h / 2}px 0 0 ${-w / 2}px`;
    };

    const untilt = (card: HTMLElement) => {
      card.style.transition = "transform .9s cubic-bezier(.34,1.56,.64,1),box-shadow .6s";
      card.style.transform = "";
      card.style.boxShadow = "";
      const shine = card.querySelector<HTMLElement>("[data-shine]");
      if (shine) shine.style.opacity = "0";
      tilted = null;
    };

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const scale = rect.width / root.offsetWidth || 1;
      pos.tx = (e.clientX - rect.left) / scale;
      pos.ty = (e.clientY - rect.top) / scale;
      cursor.style.opacity = "1";

      if (!(bgSwapAt > performance.now())) {
        bgSwapAt = performance.now() + 60;
        let isRed = false;
        for (const el of document.elementsFromPoint(e.clientX, e.clientY)) {
          const m = getComputedStyle(el).backgroundColor.match(/\d+(\.\d+)?/g);
          if (!m || (m[3] !== undefined && Number(m[3]) < 0.3)) continue;
          isRed = Number(m[0]) > 180 && Number(m[1]) < 90 && Number(m[2]) < 90;
          break;
        }
        cursor.style.background = isRed ? "#231c17" : "#ed2020";
      }

      const cardAt = Array.from(root.querySelectorAll<HTMLElement>("[data-tilt]")).find((card) => {
        const b = card.getBoundingClientRect();
        return e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom;
      });
      const visitAt = Array.from(root.querySelectorAll<HTMLElement>("[data-visit]")).find((el) => {
        const b = el.getBoundingClientRect();
        return e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom;
      });
      const target = e.target as HTMLElement | null;
      const hit = visitAt ?? cardAt ?? target?.closest<HTMLElement>("[data-cursor]");
      setCursor(hit ? hit.dataset.cursor ?? "" : "");

      root.querySelectorAll<MagnetEl>("[data-magnet]").forEach((m) => {
        const b = m.getBoundingClientRect();
        const cx = b.left + b.width / 2;
        const cy = b.top + b.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const d = Math.hypot(dx, dy);
        const reach = Math.max(b.width, b.height) * 0.9 + 30;
        const force = Number(m.dataset.magnet);
        if (d < reach) {
          const p = 1 - d / reach;
          m.style.transform = `translate(${(dx / (b.width / 2 + 20)) * force * p}px,${(dy / (b.height / 2 + 20)) * force * p}px)`;
          m.style.transition = "transform .25s cubic-bezier(.22,.61,.36,1)";
          m.__on = true;
        } else if (m.__on) {
          m.style.transform = "";
          m.style.transition = "transform .9s cubic-bezier(.34,1.56,.64,1)";
          m.__on = false;
        }
      });

      if (hero) {
        const heroRect = hero.getBoundingClientRect();
        const nx = (e.clientX - heroRect.left) / heroRect.width - 0.5;
        const ny = (e.clientY - heroRect.top) / heroRect.height - 0.5;
        if (ny > -0.6 && ny < 0.6) {
          hero.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => {
            const z = Number(el.dataset.depth);
            el.style.translate = `${nx * z}px ${ny * z}px`;
          });
        }
      }

      if (tilted && tilted !== cardAt) untilt(tilted);
      if (cardAt && !drag?.moved) {
        const b = cardAt.getBoundingClientRect();
        const px = (e.clientX - b.left) / b.width;
        const py = (e.clientY - b.top) / b.height;
        cardAt.style.transition = "transform .15s linear,box-shadow .6s";
        cardAt.style.transform = `rotateY(${(px - 0.5) * 14}deg) rotateX(${(0.5 - py) * 12}deg) translateY(-6px)`;
        cardAt.style.boxShadow = "0 40px 70px -40px rgba(35,28,23,.55)";
        const shine = cardAt.querySelector<HTMLElement>("[data-shine]");
        if (shine) {
          shine.style.opacity = "1";
          shine.style.setProperty("--mx", `${px * 100}%`);
          shine.style.setProperty("--my", `${py * 100}%`);
        }
        tilted = cardAt;
      }
    };

    const onLeave = () => {
      cursor.style.opacity = "0";
      if (tilted) untilt(tilted);
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);

    let raf = requestAnimationFrame(function loop() {
      pos.x += (pos.tx - pos.x) * 0.18;
      pos.y += (pos.ty - pos.y) * 0.18;
      cursor.style.transform = `translate(${pos.x}px,${pos.y}px)`;
      raf = requestAnimationFrame(loop);
    });

    const onRailClick = (e: MouseEvent) => {
      const moved = lastMoved;
      lastMoved = false;
      if (moved) return;
      const target = e.target as HTMLElement;
      const link = Array.from(rail.querySelectorAll<HTMLElement>("[data-visit]")).find((el) => {
        const b = el.getBoundingClientRect();
        return e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom;
      });
      if (link && !target.closest("[data-visit]")) {
        window.open(link.getAttribute("href") ?? "", "_blank", "noopener");
      }
    };
    const onRailDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-visit]")) return;
      drag = { x: e.clientX, sl: rail.scrollLeft, v: 0, lx: e.clientX, moved: false };
      cancelAnimationFrame(inertia);
    };
    const onWindowMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      rail.scrollLeft = drag.sl - dx;
      drag.v = e.clientX - drag.lx;
      drag.lx = e.clientX;
    };
    const onWindowUp = () => {
      if (!drag) return;
      lastMoved = drag.moved;
      let v = drag.v * 1.6;
      drag = null;
      const step = () => {
        rail.scrollLeft -= v;
        v *= 0.94;
        if (Math.abs(v) > 0.4) inertia = requestAnimationFrame(step);
      };
      step();
    };

    rail.addEventListener("click", onRailClick);
    rail.addEventListener("pointerdown", onRailDown);
    window.addEventListener("pointermove", onWindowMove);
    window.addEventListener("pointerup", onWindowUp);

    const scrambleFrames = new Map<HTMLElement, number>();
    const scramble = (el: HTMLElement) => {
      const text = el.dataset.scramble ?? "";
      const glyphs = "!<>-_/[]{}=+*^?#%&";
      let frame = 0;
      const total = text.length * 3;
      const prev = scrambleFrames.get(el);
      if (prev !== undefined) cancelAnimationFrame(prev);
      const run = () => {
        el.textContent = [...text]
          .map((c, i) => (frame > i * 3 + 4 ? c : c === " " ? " " : glyphs[(Math.random() * glyphs.length) | 0]))
          .join("");
        if (frame++ < total + 4) {
          scrambleFrames.set(el, requestAnimationFrame(run));
        } else {
          el.textContent = text;
        }
      };
      run();
    };
    root.querySelectorAll<HTMLElement>("[data-scramble]").forEach((el) => {
      el.addEventListener("mouseenter", () => scramble(el));
    });

    let measureScheduled = false;
    const measure = () => {
      if (measureScheduled) return;
      measureScheduled = true;
      requestAnimationFrame(() => {
        measureScheduled = false;
        doMeasure();
      });
    };
    const doMeasure = () => {
      const line = root.querySelector<HTMLElement>("[data-rollline]");
      if (!line) return;
      setMetrics((prev) => {
        const k = prev.fsk || 1;
        const fontSize = parseFloat(getComputedStyle(line).fontSize);
        const bases = Array.from(root.querySelectorAll<HTMLElement>("[data-word]")).map((n) => n.offsetWidth / k);
        if (!bases.length) return prev;
        const maxBase = Math.max(...bases);
        if (!Number.isFinite(maxBase)) return prev;
        const fsk = Math.min(1, ((line.parentElement?.clientWidth ?? 0) - 8) / (maxBase + (fontSize / k) * 1.12));
        if (!Number.isFinite(fsk) || fsk <= 0) return prev;
        const ws = bases.map((b) => Math.ceil(b * fsk));
        if (ws.join() !== (prev.ws ?? []).join() || Math.abs(fsk - k) > 0.005) return { ws, fsk };
        return prev;
      });
    };
    document.fonts?.ready.then(measure);
    const measureTimeout = window.setTimeout(measure, 300);
    const h1 = root.querySelector("h1");
    const measureObserver = new ResizeObserver(measure);
    if (h1) measureObserver.observe(h1);

    return () => {
      resizeObserver.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      rail.removeEventListener("click", onRailClick);
      rail.removeEventListener("pointerdown", onRailDown);
      window.removeEventListener("pointermove", onWindowMove);
      window.removeEventListener("pointerup", onWindowUp);
      cancelAnimationFrame(inertia);
      scrambleFrames.forEach((id) => cancelAnimationFrame(id));
      measureObserver.disconnect();
      window.clearTimeout(measureTimeout);
    };
    // Mount-only: this wires up long-lived imperative DOM listeners; reactive
    // values it needs (metrics/openJob) are read via functional setState, not closures.
  }, []);

  const fine = width > 760;
  const words = ROTATING_WORDS.map(([t], i) => {
    const d = (i - wordIndex + 5) % 5;
    return {
      t,
      c: i === 0 ? "inherit" : "#ed2020",
      y: d === 0 ? "0%" : d === 4 ? "-110%" : "110%",
      o: d === 0 ? 1 : 0,
      b: d === 0 ? "0px" : "8px",
    };
  });
  const wordW = metrics.ws ? `${metrics.ws[wordIndex] + 4}px` : `${ROTATING_WORDS[wordIndex][1] + 0.6}em`;
  const lineFs = `${metrics.fsk}em`;
  const nav: NavItem[] =
    width < 560
      ? [{ href: "#work", label: "Work" }, { href: "#contact", label: "Contact" }]
      : [
          { href: "#work", label: "Work" },
          { href: "#about", label: "About" },
          { href: "#stack", label: "Stack" },
          { href: "#contact", label: "Contact" },
        ];
  const orbit = ORBIT_LABELS.map((label, i) => {
    const t = (i / 5) * Math.PI * 2 - Math.PI / 2;
    return { label, depth: 24 + i * 8, x: `${50 + Math.cos(t) * 46}%`, y: `${50 + Math.sin(t) * 46}%` };
  });
  const ticker = [...TICKER_BASE, ...TICKER_BASE].map((s, i) => ({
    s,
    bg: i % 5 === 4 ? "#ed2020" : "#fdf8f2",
    fg: i % 5 === 4 ? "#fff" : "#231c17",
  }));
  const projects = PROJECTS.map((p, i) => ({
    ...p,
    delay: i * 90,
    cursorCss: p.url && !fine ? "pointer" : "inherit",
    imgW: p.fit === "cover" ? "100%" : i === 0 ? "96%" : "58%",
  }));
  const jobs = JOBS.map((j, i) => ({
    ...j,
    delay: i * 100,
    open: openJob === i,
  }));

  const cursorDisplay = fine ? "flex" : "none";
  const noCursorFlag = fine ? "1" : "0";
  const rootCursorStyle = fine ? "none" : "auto";
  const railCursorStyle = fine ? "none" : "grab";

  const rootStyle: Style = {
    containerType: "inline-size",
    background: "#efe6da",
    color: "#231c17",
    fontFamily: "var(--font-manrope), system-ui, sans-serif",
    overflow: "hidden",
    position: "relative",
    cursor: rootCursorStyle,
  };

  return (
    <div ref={rootRef} data-pm data-nocursor={noCursorFlag} style={rootStyle}>
      <div
        ref={cursorRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 30,
          pointerEvents: "none",
          width: 16,
          height: 16,
          margin: "-8px 0 0 -8px",
          borderRadius: 999,
          background: "#ed2020",
          color: "#fff",
          display: cursorDisplay,
          alignItems: "center",
          justifyContent: "center",
          font: "700 13px var(--font-sora), sans-serif",
          whiteSpace: "nowrap",
          overflow: "hidden",
          opacity: 0,
          transition:
            "width .5s cubic-bezier(.34,1.56,.64,1),height .5s cubic-bezier(.34,1.56,.64,1),margin .5s cubic-bezier(.34,1.56,.64,1),opacity .3s,background .4s",
        }}
      >
        <span data-cursor-label="1" />
      </div>

      <nav
        style={{
          position: "sticky",
          top: 12,
          zIndex: 5,
          margin: "12px auto 0",
          width: "max-content",
          maxWidth: "calc(100% - 24px)",
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: 6,
          borderRadius: 999,
          background: "rgba(255,252,248,.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 10px 30px -18px rgba(35,28,23,.4)",
        }}
      >
        <a
          href="#top"
          data-magnet={8}
          aria-label="mkorp home"
          style={{ display: "flex", alignItems: "center", padding: "8px 14px", borderRadius: 999, background: "#231c17" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG; next/image adds nothing for vector logos */}
          <img src="/assets/brand-logos/A-monogram-cream.svg" alt="" width={46} height={24} style={{ display: "block" }} />
        </a>
        {nav.map((n) => (
          <a
            key={n.href}
            href={n.href}
            data-scramble={n.label}
            data-magnet={6}
            className="nav-link"
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              color: "#231c17",
              fontVariantNumeric: "tabular-nums",
              transition: "background .4s",
            }}
          >
            {n.label}
          </a>
        ))}
      </nav>

      <header
        id="top"
        ref={heroRef}
        style={{
          position: "relative",
          maxWidth: 1360,
          margin: "0 auto",
          padding: "clamp(40px,7cqi,100px) clamp(20px,5cqi,72px) clamp(56px,8cqi,110px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
          gap: "clamp(40px,5cqi,72px)",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            data-rv="up"
            style={{
              alignSelf: "flex-start",
              padding: "8px 14px",
              borderRadius: 999,
              background: "#fdf8f2",
              fontSize: 14,
              fontWeight: 600,
              color: "#5b4f45",
            }}
          >
            Hi, I&apos;m Mohamed Ismail
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-sora), sans-serif",
              fontWeight: 800,
              fontSize: "clamp(50px,8.4cqi,128px)",
              lineHeight: 0.92,
              letterSpacing: "-.06em",
            }}
          >
            <span data-rv="up" data-d={80} style={{ display: "block" }}>
              A broker
            </span>
            <span data-rv="up" data-d={200} style={{ display: "block" }}>
              to all the
            </span>
            <span
              data-rv="up"
              data-d={320}
              data-rollline="1"
              style={{ display: "flex", alignItems: "center", gap: ".18em", fontSize: lineFs }}
            >
              <span
                data-magnet={30}
                data-cursor="Hey!"
                style={{ display: "inline-block", width: ".9em", height: ".62em", borderRadius: 999, background: "#ed2020", flex: "none" }}
              />
              <span
                style={{
                  position: "relative",
                  flex: "none",
                  display: "inline-grid",
                  overflow: "hidden",
                  height: "1.05em",
                  width: wordW,
                  transition: "width .8s cubic-bezier(.65,0,.35,1)",
                }}
              >
                {words.map((w, i) => (
                  <span
                    key={ROTATING_WORDS[i][0]}
                    data-word="1"
                    style={{
                      gridArea: "1 / 1",
                      justifySelf: "start",
                      paddingRight: ".08em",
                      whiteSpace: "nowrap",
                      color: w.c,
                      transform: `translateY(${w.y})`,
                      opacity: w.o,
                      filter: `blur(${w.b})`,
                      transition: "transform .9s cubic-bezier(.65,0,.35,1),opacity .9s,filter .9s",
                    }}
                  >
                    {w.t}
                  </span>
                ))}
              </span>
            </span>
          </h1>
          <p
            data-rv="up"
            data-d={440}
            style={{ margin: 0, maxWidth: 500, fontSize: "clamp(17px,1.5cqi,20px)", lineHeight: 1.6, color: "#4a3f37", textWrap: "pretty" } as Style}
          >
            Full-stack engineer in Cairo. I connect what you need with the tech that gets it done, across web, mobile, enterprise and AI, and I stay on it
            until it ships.
          </p>
          <div data-rv="up" data-d={560} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a
              href="#contact"
              data-magnet={16}
              data-cursor="Say hi"
              style={{ padding: "16px 26px", borderRadius: 999, background: "#231c17", color: "#fdf8f2", fontWeight: 700 }}
            >
              Let&apos;s talk
            </a>
            <a
              href="#work"
              data-magnet={16}
              data-cursor="Scroll"
              style={{ padding: "16px 26px", borderRadius: 999, background: "#fdf8f2", color: "#231c17", fontWeight: 700 }}
            >
              See projects
            </a>
          </div>
        </div>
        <div
          data-rv="scale"
          data-d={150}
          data-parallax="1"
          style={{ position: "relative", width: "min(100%,520px)", aspectRatio: "1", justifySelf: "center" }}
        >
          <div data-morph="1" data-depth={-18} style={{ position: "absolute", inset: "8%", background: "#ed2020", opacity: 0.9 }} />
          <div
            data-morph="1"
            data-depth={10}
            data-cursor="That's me"
            style={{
              position: "absolute",
              inset: "14%",
              overflow: "hidden",
              background: "#e7dccd",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- morphing clip container; next/image fill fights absolute inset layout */}
            <img
              src="/assets/Headshot.jpeg"
              alt="Mohamed Ismail"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 60%", display: "block", pointerEvents: "none" }}
            />
          </div>
          {orbit.map((o) => (
            <span
              key={o.label}
              data-depth={o.depth}
              style={{ position: "absolute", left: o.x, top: o.y, margin: "-20px 0 0 -60px", width: 120, display: "flex", justifyContent: "center" }}
            >
              <span
                data-magnet={14}
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  background: "#fdf8f2",
                  fontWeight: 700,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  boxShadow: "0 12px 30px -16px rgba(35,28,23,.5)",
                }}
              >
                {o.label}
              </span>
            </span>
          ))}
        </div>
      </header>

      <section style={{ padding: "0 0 clamp(64px,8cqi,110px)" }}>
        <div style={{ display: "flex", width: "max-content", gap: 12 }} data-marquee={38000}>
          {ticker.map((t, i) => (
            <span
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 22px",
                borderRadius: 999,
                background: t.bg,
                color: t.fg,
                font: "700 clamp(18px,1.8cqi,24px) var(--font-sora), sans-serif",
                letterSpacing: "-.02em",
                whiteSpace: "nowrap",
              }}
            >
              {t.s}
            </span>
          ))}
        </div>
      </section>

      <section id="work" style={{ padding: "0 0 clamp(72px,9cqi,130px)" }}>
        <div
          data-rv="up"
          style={{
            maxWidth: 1360,
            margin: "0 auto 32px",
            padding: "0 clamp(20px,5cqi,72px)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
          }}
        >
          <h2 style={{ margin: 0, font: "800 clamp(40px,6cqi,88px)/.95 var(--font-sora), sans-serif", letterSpacing: "-.055em" }}>
            Things I&apos;ve
            <br />
            helped build
          </h2>
          <p style={{ margin: 0, maxWidth: 280, color: "#5b4f45", lineHeight: 1.55 }}>Drag the row, or hover a card to tilt it.</p>
        </div>
        <div
          ref={railRef}
          data-cursor="Drag"
          style={{
            display: "flex",
            gap: 20,
            overflowX: "auto",
            padding: "24px clamp(20px,5cqi,72px) 32px",
            scrollbarWidth: "none",
            cursor: railCursorStyle,
            userSelect: "none",
            perspective: 1200,
          }}
        >
          {projects.map((p) => (
            <article
              key={p.name}
              data-tilt="1"
              data-rv="up"
              data-d={p.delay}
              style={{
                cursor: p.cursorCss,
                position: "relative",
                flex: "none",
                width: "min(84cqi,440px)",
                borderRadius: 36,
                background: "#fdf8f2",
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 18,
                transformStyle: "preserve-3d",
                transition: "transform .6s cubic-bezier(.22,.61,.36,1),box-shadow .6s",
              }}
            >
              <div
                style={{
                  aspectRatio: "1 / .82",
                  borderRadius: 26,
                  background: p.bg,
                  overflow: "hidden",
                  display: "grid",
                  placeItems: "center",
                  transform: "translateZ(30px)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- dynamic per-project object-fit/size, not suited to next/image */}
                <img
                  src={p.img}
                  alt={p.name}
                  draggable={false}
                  style={{ width: p.imgW, height: p.imgW, objectFit: p.fit, objectPosition: "center", pointerEvents: "none" }}
                />
              </div>
              <div style={{ padding: "0 12px 14px", display: "flex", flexDirection: "column", gap: 10, transform: "translateZ(50px)" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {p.chips.map((c) => (
                    <span key={c} style={{ padding: "5px 11px", borderRadius: 999, background: "#efe6da", fontSize: 12, fontWeight: 700, color: "#5b4f45" }}>
                      {c}
                    </span>
                  ))}
                </div>
                <h3 style={{ margin: 0, font: "800 28px/1.05 var(--font-sora), sans-serif", letterSpacing: "-.04em" }}>{p.name}</h3>
                <p style={{ margin: 0, color: "#4a3f37", lineHeight: 1.55, textWrap: "pretty" } as Style}>{p.line}</p>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#d01715" }}>{p.role}</div>
              </div>
              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener"
                  data-visit="1"
                  data-cursor="Visit me ↗"
                  draggable={false}
                  className="visit-btn"
                  style={{
                    position: "absolute",
                    top: 26,
                    right: 26,
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#231c17",
                    color: "#fdf8f2",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 18,
                    transform: "translateZ(60px)",
                    boxShadow: "0 10px 24px -12px rgba(35,28,23,.6)",
                    transition: "background .3s",
                  }}
                >
                  ↗
                </a>
              )}
              <div
                data-shine="1"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 36,
                  pointerEvents: "none",
                  opacity: 0,
                  transition: "opacity .4s",
                  background: "radial-gradient(420px circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.55),rgba(255,255,255,0) 60%)",
                }}
              />
            </article>
          ))}
        </div>
      </section>

      <section id="about" style={{ position: "relative", background: "#231c17", color: "#fdf8f2" }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ position: "absolute", top: -79, left: 0, width: "100%", height: 80, display: "block" }}>
          <path
            data-wave="1"
            d="M0 40 C 240 0, 480 80, 720 40 S 1200 0, 1440 40 L1440 80 L0 80 Z"
            fill="#231c17"
          />
        </svg>
        <div
          style={{
            maxWidth: 1360,
            margin: "0 auto",
            padding: "clamp(64px,9cqi,120px) clamp(20px,5cqi,72px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))",
            gap: "clamp(40px,6cqi,90px)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div data-rv="scale">
              <BrandModel
                src="/assets/3d-models/mkorp-monogram-coin.glb"
                label="Spinning mkorp monogram coin"
                motion="spin"
                style={{ width: 132, height: 132 }}
              />
            </div>
            <h2 data-rv="up" style={{ margin: 0, font: "800 clamp(36px,5cqi,72px)/.98 var(--font-sora), sans-serif", letterSpacing: "-.05em" }}>
              A bit about me
            </h2>
            <p
              data-rv="up"
              data-d={100}
              style={{ margin: 0, color: "#d8cdc2", fontSize: 18, lineHeight: 1.7, textWrap: "pretty" } as Style}
            >
              I got into this by teaching it, as a junior TA at GIU, then spent a summer on game mechanics in Unity at GMind. At Develo Systems I found the
              work I like most: sitting with a client, working out what they actually need, and leading a team to build it. That&apos;s meant 20+ products
              and five projects I managed myself.
            </p>
            <div data-rv="up" data-d={200} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <span style={{ padding: "12px 18px", borderRadius: 999, background: "#ed2020", color: "#fff", fontWeight: 700 }}>
                BSc Software Engineering · GIU
              </span>
              <span style={{ padding: "12px 18px", borderRadius: 999, background: "rgba(253,248,242,.1)", fontWeight: 600 }}>
                Graduated Feb 2026 · Very Good
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {jobs.map((j, i) => (
              <div
                key={j.org}
                data-rv="up"
                data-d={j.delay}
                data-cursor={j.open ? "Close" : "Open"}
                onClick={() => setOpenJob((cur) => (cur === i ? -1 : i))}
                style={{
                  cursor: "pointer",
                  borderRadius: 28,
                  background: j.open ? "rgba(253,248,242,.1)" : "rgba(253,248,242,.04)",
                  padding: "24px 26px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  transition: "background .6s cubic-bezier(.22,.61,.36,1)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ font: "700 22px/1.15 var(--font-sora), sans-serif", letterSpacing: "-.02em" }}>{j.org}</span>
                    <span style={{ fontSize: 14, color: "#cfc3b7" }}>
                      {j.role} · {j.when}
                    </span>
                  </div>
                  <span
                    style={{
                      flex: "none",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "rgba(253,248,242,.12)",
                      display: "grid",
                      placeItems: "center",
                      transform: `rotate(${j.open ? "45deg" : "0deg"})`,
                      transition: "transform .6s cubic-bezier(.34,1.56,.64,1)",
                    }}
                  >
                    +
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateRows: j.open ? "1fr" : "0fr", transition: "grid-template-rows .7s cubic-bezier(.22,.61,.36,1)" }}>
                  <ul style={{ overflow: "hidden", margin: 0, padding: "0 0 0 18px", color: "#cfc3b7", lineHeight: 1.65, display: "flex", flexDirection: "column", gap: 4 }}>
                    {j.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="stack" style={{ background: "#231c17", color: "#fdf8f2" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 clamp(20px,5cqi,72px) clamp(72px,9cqi,130px)" }}>
          <h2 data-rv="up" style={{ margin: "0 0 28px", font: "800 clamp(32px,4.4cqi,60px)/1 var(--font-sora), sans-serif", letterSpacing: "-.05em" }}>
            What I build with
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {STACK.map((s, i) => (
              <span key={s} data-rv="scale" data-d={i * 40} style={{ display: "inline-flex" }}>
                <span
                  data-magnet={12}
                  className="stack-pill"
                  style={{
                    padding: "14px 22px",
                    borderRadius: 999,
                    border: "1px solid rgba(253,248,242,.16)",
                    fontWeight: 700,
                    fontSize: 16,
                    transition: "background .5s,color .5s",
                  }}
                >
                  {s}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" style={{ position: "relative", padding: "clamp(72px,10cqi,150px) clamp(20px,5cqi,72px) 36px", overflow: "hidden" }}>
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{ position: "absolute", top: -1, left: 0, width: "100%", height: 80, display: "block", transform: "scaleY(-1)" }}
        >
          <path d="M0 40 C 240 0, 480 80, 720 40 S 1200 0, 1440 40 L1440 80 L0 80 Z" fill="#231c17" />
        </svg>
        <div data-morph="1" data-float={50} style={{ position: "absolute", right: "-8%", bottom: "-20%", width: "min(70cqi,720px)", aspectRatio: "1", background: "#ed2020" }} />
        <div style={{ position: "relative", maxWidth: 1360, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
              alignItems: "center",
              gap: "clamp(24px,4cqi,56px)",
            }}
          >
            <h2 data-rv="up" style={{ margin: 0, font: "800 clamp(48px,9cqi,140px)/.9 var(--font-sora), sans-serif", letterSpacing: "-.06em", maxWidth: 900 }}>
              Tell me what you need.
            </h2>
            <div data-rv="scale" data-d={120}>
              <BrandModel
                src="/assets/3d-models/mkorp-hero-wordmark.glb"
                label="3D mkorp wordmark on a sand plinth"
                motion="sway"
                tilt
                style={{ width: "100%", aspectRatio: "16 / 9" }}
              />
            </div>
          </div>
          <div data-rv="up" data-d={80}>
            <ContactForm />
          </div>
          <div data-rv="up" data-d={120} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a
              href="mailto:mohamed.ismail@develosystmes.com"
              data-magnet={18}
              data-cursor="Write"
              style={{ padding: "18px 28px", borderRadius: 999, background: "#231c17", color: "#fdf8f2", fontWeight: 700 }}
            >
              Email me
            </a>
            <a
              href="https://www.linkedin.com/in/mohamedismailcs"
              data-magnet={18}
              data-cursor="Connect"
              style={{ padding: "18px 28px", borderRadius: 999, background: "#fdf8f2", color: "#231c17", fontWeight: 700 }}
            >
              LinkedIn
            </a>
            <a
              href="https://www.github.com/RamboProg"
              data-magnet={18}
              data-cursor="Code"
              style={{ padding: "18px 28px", borderRadius: 999, background: "#fdf8f2", color: "#231c17", fontWeight: 700 }}
            >
              GitHub
            </a>
          </div>
          <div
            style={{
              marginTop: "clamp(80px,10cqi,160px)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG; next/image adds nothing for vector logos */}
              <img src="/assets/brand-logos/A-wordmark-ink.svg" alt="mkorp" width={124} height={43} style={{ display: "block" }} />
              © 2026 Mohamed Ismail
            </span>
            <span>Made in Cairo</span>
          </div>
        </div>
      </section>
    </div>
  );
}
