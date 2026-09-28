export type StopMotion = () => void;

const EASE = "cubic-bezier(.22,.61,.36,1)";
const SPRING = "cubic-bezier(.34,1.56,.64,1)";

type RevealPreset = readonly [Keyframe, Keyframe, number, string];

const REVEAL_PRESETS: Record<string, RevealPreset> = {
  up: [{ opacity: 0, transform: "translateY(56px)", filter: "blur(10px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }, 1300, EASE],
  scale: [{ opacity: 0, transform: "scale(.92)", filter: "blur(12px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }, 1300, EASE],
  left: [{ opacity: 0, transform: "translateX(-48px)", filter: "blur(6px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }, 1300, EASE],
  fade: [{ opacity: 0 }, { opacity: 1 }, 1300, EASE],
  char: [{ transform: "translateY(105%) rotate(8deg)" }, { transform: "none" }, 1100, SPRING],
  pop: [{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "none" }, 900, SPRING],
  wipe: [{ clipPath: "circle(0% at 50% 0%)" }, { clipPath: "circle(150% at 50% 0%)" }, 1600, "cubic-bezier(.65,0,.35,1)"],
  rise: [{ clipPath: "inset(100% 0 0 0 round 40px)", transform: "translateY(80px)" }, { clipPath: "inset(0% 0 0 0 round 40px)", transform: "none" }, 1400, "cubic-bezier(.65,0,.35,1)"],
};

/** Ported 1:1 from the Claude Design export's motion.js (window.PMotion). */
export function initMotion(root: HTMLElement & { __pm?: boolean }): StopMotion {
  if (!root || root.__pm) return () => {};
  root.__pm = true;

  const anims = new Map<Element, Animation>();
  root.querySelectorAll<HTMLElement>("[data-rv]").forEach((el) => {
    const [from, to, duration, easing] = REVEAL_PRESETS[el.dataset.rv ?? "up"] ?? REVEAL_PRESETS.up;
    const anim = el.animate([from, to], { duration, delay: Number(el.dataset.d ?? 0), easing, fill: "both" });
    anim.onfinish = () => anim.cancel();
    anim.pause();
    anims.set(el, anim);
  });

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          anims.get(entry.target)?.play();
          io.unobserve(entry.target);
        }
      }),
    { threshold: 0.1 }
  );
  anims.forEach((_anim, el) => io.observe(el));

  const fallback = window.setTimeout(() => {
    anims.forEach((anim) => anim.playState === "paused" && anim.play());
  }, 2600);

  const loopingAnims: Animation[] = [];

  root.querySelectorAll<HTMLElement>("[data-float]").forEach((el, i) => {
    const r = Number(el.dataset.float ?? 30);
    loopingAnims.push(
      el.animate(
        [
          { transform: "translate(0,0) scale(1) rotate(0deg)" },
          { transform: `translate(${r}px,${-r * 0.6}px) scale(1.08) rotate(10deg)` },
          { transform: `translate(${-r * 0.7}px,${r * 0.5}px) scale(.94) rotate(-8deg)` },
          { transform: "translate(0,0) scale(1) rotate(0deg)" },
        ],
        { duration: 16000 + i * 3500, iterations: Infinity, easing: "ease-in-out", composite: "add" }
      )
    );
  });

  root.querySelectorAll<HTMLElement>("[data-morph]").forEach((el, i) =>
    loopingAnims.push(
      el.animate(
        [
          { borderRadius: "42% 58% 70% 30% / 45% 45% 55% 55%" },
          { borderRadius: "70% 30% 46% 54% / 30% 29% 71% 70%" },
          { borderRadius: "28% 72% 36% 64% / 58% 38% 62% 42%" },
          { borderRadius: "42% 58% 70% 30% / 45% 45% 55% 55%" },
        ],
        { duration: 13000 + i * 2000, iterations: Infinity, easing: "ease-in-out" }
      )
    )
  );

  root.querySelectorAll<HTMLElement>("[data-marquee]").forEach((el) =>
    loopingAnims.push(
      el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }], {
        duration: Number(el.dataset.marquee ?? 40000),
        iterations: Infinity,
      })
    )
  );

  root.querySelectorAll<SVGPathElement>("[data-draw]").forEach((path, i) => {
    const length = path.getTotalLength ? path.getTotalLength() : 600;
    path.style.strokeDasharray = String(length);
    loopingAnims.push(
      path.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
        duration: 2000,
        delay: 400 + i * 160,
        easing: EASE,
        fill: "both",
      })
    );
  });

  // Lift CSS pre-hide gate; WAAPI fill:"both" now holds each element's from frame.
  root.dataset.pmReady = "";

  return () => {
    io.disconnect();
    window.clearTimeout(fallback);
    anims.forEach((anim) => anim.cancel());
    loopingAnims.forEach((anim) => anim.cancel());
    delete root.dataset.pmReady;
    // Allow a later real init (e.g. Strict Mode's post-cleanup remount) to run again.
    delete root.__pm;
  };
}
