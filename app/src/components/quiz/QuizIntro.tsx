"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { quizSounds } from "@/lib/quizSounds";
import { QuizCTAButton } from "./QuizCTAButton";
import { QuizBackButton } from "./QuizBackButton";
import { writeQuizState } from "@/lib/quizState";

/* ── Nature bezier language ── */
const AIR   = "expo.out";
const WATER  = "sine.inOut";
const FIRE   = "power4.in";
const EARTH  = "power1.out";

/* ── Screen type definitions ── */
type ScreenDef =
  | { type: "statement"; text: string; size: "massive" | "large" }
  | { type: "twoLine";   line1: string; line2: string }
  | { type: "reflection"; text: string }
  | { type: "value"; headline: string; items: { num: string; text: string }[] }
  | { type: "gate"; headline: string; ctaA: string; privacy: string };

const SCREENS: ScreenDef[] = [
  {
    type: "statement",
    size: "massive",
    text: "Am I who I am supposed to be?",
  },
  {
    type: "reflection",
    text: "There is a system older than modern medicine that mapped the human body not by disease, but by nature. Not who you should become. Who you already are.",
  },
  {
    type: "value",
    headline: "In the next 15 minutes, you will receive",
    items: [
      { num: "01", text: "Your personal rhythm map, a blueprint your body was born with." },
      { num: "02", text: "A morning-to-night ritual designed for your specific constitution." },
      { num: "03", text: "Botanical recommendations matched to where you are right now." },
    ],
  },
  {
    type: "gate",
    headline: "Are you ready to return to yourself?",
    ctaA: "Yes, begin.",
    privacy: "Your answers are private. Be honest. That is the only way this works.",
  },
];

/* ── Per-screen content components ── */

function StatementScreen({ text, size, entranceDelay = 0 }: { text: string; size: "massive" | "large"; entranceDelay?: number }) {
  const l1Ref = useRef<HTMLSpanElement>(null);
  const l2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const base = reduced ? 0 : entranceDelay;
    const gap  = reduced ? 0 : 0.5;
    const ctx = gsap.context(() => {
      gsap.fromTo(l1Ref.current, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: WATER, delay: base });
      gsap.fromTo(l2Ref.current, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: WATER, delay: base + gap });
    });
    return () => ctx.revert();
  }, [entranceDelay]);

  const words = text.split(" ");
  const split = Math.ceil(words.length * 0.6);
  const line1 = words.slice(0, split).join(" ");
  const line2 = words.slice(split).join(" ");

  return (
    <h1
      className="font-serif text-cream text-center"
      style={{
        fontSize: size === "massive" ? "clamp(2.8rem,8vw,6.5rem)" : "clamp(2.2rem,5.5vw,4rem)",
        lineHeight: 1.15,
        textShadow: "0 2px 18px rgba(15,5,15,0.75)",
      }}
    >
      <span ref={l1Ref} className="block opacity-0">{line1}</span>
      <span ref={l2Ref} className="block opacity-0">{line2}</span>
    </h1>
  );
}

function TwoLineStatement({ line1, line2 }: { line1: string; line2: string }) {
  const l1 = useRef<HTMLParagraphElement>(null);
  const l2 = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!l1.current || !l2.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d1 = reduced ? 0 : 0.2;
    const d2 = reduced ? 0 : 1.0;
    const ctx = gsap.context(() => {
      gsap.fromTo(l1.current, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: WATER, delay: d1 });
      gsap.fromTo(l2.current, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: WATER, delay: d2 });
    });
    return () => ctx.revert();
  }, []);

  const fs = "clamp(2.4rem,7vw,5rem)";
  const shadow = "0 2px 18px rgba(15,5,15,0.75)";
  return (
    <div className="text-center" style={{ lineHeight: 1.12 }}>
      <p ref={l1} className="font-serif text-cream/60 opacity-0" style={{ fontSize: fs, textShadow: shadow }}>
        {line1}
      </p>
      <p ref={l2} className="font-serif text-cream opacity-0" style={{ fontSize: fs, fontStyle: "italic", textShadow: shadow }}>
        {line2}
      </p>
    </div>
  );
}

function ReflectionScreen({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: reduced ? 0.01 : 0.8, ease: WATER, delay: reduced ? 0 : 0.15 });
    });
    return () => ctx.revert();
  }, []);

  return (
    <p
      ref={ref}
      className="font-serif text-cream text-center max-w-2xl"
      style={{ fontSize: "clamp(1.7rem,4.5vw,3rem)", lineHeight: 1.45, opacity: 0, textShadow: "0 2px 18px rgba(15,5,15,0.75)" }}
    >
      {text}
    </p>
  );
}

function ValueScreen({ headline, items }: {
  headline: string; items: { num: string; text: string }[];
}) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        Array.from(listRef.current!.children),
        { opacity: 0 },
        { opacity: 1, duration: 1.0, ease: WATER, stagger: 0.35, delay: 0.3 }
      );
    }, listRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full max-w-lg">
      <p className="font-serif text-cream mb-6 sm:mb-12" style={{ fontSize: "clamp(2rem,6vw,3.5rem)", lineHeight: 1.3, textShadow: "0 2px 18px rgba(15,5,15,0.75)" }}>{headline}</p>
      <ol ref={listRef} className="space-y-8 sm:space-y-16">
        {items.map((item, idx) => {
          const align = (["text-left", "text-right", "text-center"] as const)[idx % 3];
          return (
            <li key={item.num} className={align} style={{ opacity: 0 }}>
              <span className="font-serif text-cream leading-snug" style={{ fontSize: "clamp(1.7rem,5vw,2.8rem)", textShadow: "0 2px 18px rgba(15,5,15,0.75)" }}>
                {item.text}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function GateScreen({ headline }: { headline: string }) {
  const l1 = useRef<HTMLSpanElement>(null);
  const l2 = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(l1.current, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: WATER, delay: 0.3 });
      gsap.fromTo(l2.current, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: WATER, delay: 1.1 });
    });
    return () => ctx.revert();
  }, []);

  const words = headline.split(" ");
  const split = Math.ceil(words.length / 2);

  return (
    <h2
      className="font-serif text-cream text-center"
      style={{ fontSize: "clamp(2.8rem,8vw,6.5rem)", lineHeight: 1.06, textShadow: "0 2px 18px rgba(15,5,15,0.75)" }}
    >
      <span ref={l1} className="block opacity-0">{words.slice(0, split).join(" ")}</span>
      <span ref={l2} className="block opacity-0">{words.slice(split).join(" ")}</span>
    </h2>
  );
}

function GateActions({ ctaA, privacy, onBegin }: { ctaA: string; privacy: string; onBegin: () => void }) {
  const [softExit, setSoftExit] = useState(false);
  const softRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (softExit && softRef.current) {
      gsap.fromTo(softRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: WATER });
    }
  }, [softExit]);

  if (softExit) {
    return (
      <>
        <p
          ref={softRef}
          className="font-serif text-cream/80 text-center leading-relaxed max-w-sm"
          style={{ fontSize: "clamp(1.1rem,2.5vw,1.35rem)", opacity: 0 }}
        >
          This will be here. Come back when the moment is right.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="w-full">
        <QuizCTAButton label={ctaA} onClick={onBegin} />
      </div>
      <p
        className="font-serif text-cream/80 text-center leading-relaxed max-w-sm"
        style={{ fontSize: "clamp(0.95rem,2.2vw,1.1rem)" }}
      >
        {privacy}
      </p>
    </>
  );
}

function renderScreen(s: ScreenDef) {
  switch (s.type) {
    case "statement":  return <StatementScreen  text={s.text} size={s.size} />;
    case "twoLine":    return <TwoLineStatement  line1={s.line1} line2={s.line2} />;
    case "reflection": return <ReflectionScreen  text={s.text} />;
    case "value":      return <ValueScreen       headline={s.headline} items={s.items} />;
    case "gate":       return <GateScreen        headline={s.headline} />;
  }
}


/* ── Water ripple ring generator ──
   Near-perfect concentric ovals. 1% perturbation only — enough to read as
   hand-drawn but reads as still water, not chaotic aura art. ── */
function makeRippleRing(i: number, rx: number, ry: number, cx: number, cy: number): string {
  const k = 0.5523;
  /* 1 % perturbation — just enough to feel organic */
  const p = (n: number) => Math.sin(n * 11.3 + i * 5.7 + 0.9) * 0.01;
  const f = (v: number) => +v.toFixed(2);
  const x0 = f(cx);
  const y0 = f(cy - ry);
  return (
    `M${x0},${y0}` +
    `C${f(cx+rx*(k+p(1)))},${f(cy-ry+ry*p(2))} ${f(cx+rx*(1+p(3)))},${f(cy-ry*k+ry*p(4))} ${f(cx+rx)},${f(cy+ry*p(5))}` +
    `C${f(cx+rx*(1+p(6)))},${f(cy+ry*k+ry*p(7))} ${f(cx+rx*(k+p(8)))},${f(cy+ry*(1+p(9)))} ${f(cx+rx*p(10))},${f(cy+ry)}` +
    `C${f(cx-rx*(k+p(11)))},${f(cy+ry*(1+p(12)))} ${f(cx-rx*(1+p(13)))},${f(cy+ry*k+ry*p(14))} ${f(cx-rx)},${f(cy+ry*p(15))}` +
    `C${f(cx-rx*(1+p(16)))},${f(cy-ry*k+ry*p(17))} ${f(cx-rx*(k+p(18)))},${f(cy-ry*(1+p(19)))} ${x0},${y0}Z`
  );
}

const RING_N = 14;
const DROP_CX = 50;
/* Drop point sits at ~47% of viewport height so ring bullseye aligns
   with the text, which is centred in the space below Nav (not full screen) */
const DROP_CY = 47;

const RING_DATA = Array.from({ length: RING_N }, (_, i) => {
  /* Linear spacing = even ripple bands */
  const t = (i + 1) / RING_N;
  const rx = 3.5 + t * 68;           /* 3.5 → 71.5 */
  const ry = rx * 0.84;               /* slight horizontal stretch, water-surface perspective */
  /* Tiny centre drift — max 0.4 units so rings stay concentric */
  const cx = DROP_CX + Math.sin(i * 1.618) * 0.35;
  const cy = DROP_CY + Math.cos(i * 2.618) * 0.25;
  const inner = 1 - t;
  return {
    d:   makeRippleRing(i, rx, ry, cx, cy),
    sOp: +(0.04 + inner * 0.18).toFixed(4),  /* 0.22 → 0.04  — light */
    sw:  +(0.18 + inner * 0.34).toFixed(3),  /* 0.52 → 0.18  — thin  */
    cx, cy,
  };
});

const ARC_PATH_ID  = "etha-arc-text-path";
const ARC_RING_IDX = 10;

function AuraRippleBackground({ rippleTrigger }: { rippleTrigger: number }) {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  /* Reveal: inner rings first, then ambient slow breath */
  useEffect(() => {
    const reduced = typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = pathRefs.current;
    const ctx = gsap.context(() => {
      gsap.set(els, { opacity: 0 });
      els.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          opacity: 1,
          duration: reduced ? 0 : 2.0,
          ease: EARTH,
          delay: reduced ? 0 : 0.2 + i * 0.055,
        });
        if (!reduced) {
          /* Very slow breathing — imperceptible individually, mesmerising together */
          gsap.to(el, {
            scale: 1 + 0.004 * ((RING_N - i) / RING_N),
            transformOrigin: `${DROP_CX} ${DROP_CY}`,
            duration: 6 + i * 0.35,
            ease: WATER,
            yoyo: true,
            repeat: -1,
            delay: i * 0.18 + 3.0,
          });
        }
      });
    });
    return () => ctx.revert();
  }, []);

  /* Water-droplet ripple — smooth sine physics, no elastic spring */
  useEffect(() => {
    if (rippleTrigger === 0) return;
    const reduced = typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const tl = gsap.timeline();
    RING_DATA.forEach((ring, i) => {
      const el = pathRefs.current[i];
      if (!el) return;
      /* Amplitude decays exponentially from centre outward */
      const amp = 1 + 0.045 * Math.exp(-i * 0.14);
      const d = i * 0.048;
      tl
        .to(el, {
          scale: amp,
          strokeOpacity: Math.min(ring.sOp * 2.4, 0.55),
          transformOrigin: `${DROP_CX} ${DROP_CY}`,
          duration: 0.28,
          ease: "sine.out",
        }, d)
        .to(el, {
          scale: 1,
          strokeOpacity: ring.sOp,
          transformOrigin: `${DROP_CX} ${DROP_CY}`,
          duration: 0.9,
          ease: "sine.inOut",
        }, d + 0.28);
    });
    return () => { tl.kill(); };
  }, [rippleTrigger]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <path id={ARC_PATH_ID} d={RING_DATA[ARC_RING_IDX].d} />
          <radialGradient id="centre-veil" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#3D233B" stopOpacity="0.72" />
            <stop offset="60%"  stopColor="#3D233B" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3D233B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ring-fade" cx={DROP_CX} cy={DROP_CY} r="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="white" stopOpacity="1" />
            <stop offset="40%"  stopColor="white" stopOpacity="0.7" />
            <stop offset="75%"  stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="ring-mask">
            <rect x="0" y="0" width="100" height="100" fill="url(#ring-fade)" />
          </mask>
        </defs>

        <g mask="url(#ring-mask)">
          {RING_DATA.map((r, i) => (
            <path
              key={i}
              ref={el => { pathRefs.current[i] = el; }}
              d={r.d}
              fill="none"
              stroke="#FFEFDE"
              strokeWidth={r.sw}
              strokeOpacity={r.sOp}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* Darken centre so text pops over rings */}
        <ellipse cx="50" cy="50" rx="52" ry="46" fill="url(#centre-veil)" />

        <text
          fill="#FFEFDE"
          fillOpacity={0.09}
          fontSize="1.9"
          letterSpacing="0.22"
          style={{ fontFamily: "var(--font-plantin), Georgia, serif", fontStyle: "italic" }}
        >
          <textPath href={`#${ARC_PATH_ID}`} startOffset="8%">
            A 5,000-year-old system for understanding
          </textPath>
        </text>
      </svg>
    </div>
  );
}

/* ── Dev jump targets ── */
const DEV_JUMPS = SCREENS.map((s, i) => {
  const colors: Record<string, string> = {
    statement:  "#f97316",
    reflection: "#60a5fa",
    twoLine:    "#a78bfa",
    value:      "#34d399",
    gate:       "#fbbf24",
  };
  const labels: Record<string, string> = {
    statement:  "STATEMENT",
    reflection: `REFLECT·${i}`,
    twoLine:    "TWOLINES",
    value:      "VALUE",
    gate:       "GATE",
  };
  return { label: labels[s.type] ?? s.type.toUpperCase(), idx: i, color: colors[s.type] ?? "#f87171" };
});


/* ── Main ── */
export default function QuizIntro() {
  const [screen, setScreen] = useState(0);
  const [rippleTrigger, setRippleTrigger] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const hintRef    = useRef<HTMLDivElement>(null);
  const router     = useRouter();

  /* Play screen 0 sound only if AudioContext was already primed (came from landing page).
     Direct URL loads stay silent until first CONTINUE click. */
  useEffect(() => {
    if (quizSounds.isRunning()) {
      quizSounds.playIntroMelody(0);
    }
  }, []);

  /* Keyboard back navigation - Escape or ArrowLeft goes to previous screen */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === "Escape" || e.key === "ArrowLeft") && screen > 0) {
        setScreen((s) => Math.max(0, s - 1));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [screen]);

  const current = SCREENS[screen];
  const isGate  = current.type === "gate";

  /* Per-screen enter - WATER element */
  useEffect(() => {
    const content = contentRef.current;
    const hint    = hintRef.current;
    if (!content) return;

    const ctx = gsap.context(() => {
      gsap.killTweensOf([content, hint]);

      const isFirst = screen === 0;

      if (isFirst) {
        // Reveal content after nav logo + track draw
        gsap.set(content, { opacity: 0 });
        gsap.to(content, { opacity: 1, duration: 0.01, delay: 1.3 });
      } else {
        gsap.fromTo(
          content,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 1.1, ease: WATER, delay: 0.05 }
        );
      }

      if (hint) {
        gsap.set(hint, { opacity: 0 });
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const hintDelay = reduced ? 0 : (isFirst ? 3.0 : isGate ? 2.0 : 1.4);
        gsap.to(hint, { opacity: 1, duration: reduced ? 0.01 : 1.4, ease: EARTH, delay: hintDelay });
      }
    });
    return () => ctx.revert();
  }, [screen, isGate]);

  /* Advance - FIRE exit, AIR enter */
  const advance = useCallback(() => {
    if (isGate) return;
    const content = contentRef.current;
    const hint    = hintRef.current;
    if (!content) return;
    const nextScreen = Math.min(screen + 1, SCREENS.length - 1);
    setRippleTrigger(t => t + 1);
    quizSounds.playIntroMelody(nextScreen);
    gsap.to(content, {
      opacity: 0, y: -30, duration: 0.36, ease: FIRE,
      onComplete: () => setScreen(nextScreen),
    });
    if (hint) gsap.to(hint, { opacity: 0, duration: 0.12 });
  }, [isGate, screen]);

  const handleBegin = useCallback(() => {
    quizSounds.playIntroMelody(6);
    writeQuizState({});
    const content = contentRef.current;
    const go = () => router.push("/quiz/body");
    if (!content) { go(); return; }
    gsap.to(content, { opacity: 0, y: -30, duration: 0.5, ease: FIRE, onComplete: go });
  }, [router]);

  const handleDevJump = useCallback((idx: number) => {
    gsap.killTweensOf([contentRef.current, hintRef.current]);
    setScreen(idx);
  }, []);

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-aubergine select-none">
      <AuraRippleBackground rippleTrigger={rippleTrigger} />
      <Nav
        variant="light"
        hideLinks
        animated
        progress={screen / (SCREENS.length - 1)}
        leftSlot={
          <QuizBackButton
            onClick={() => setScreen((s) => Math.max(0, s - 1))}
            disabled={screen === 0}
          />
        }
      />

      {/* Screen content - key forces child remounts for per-screen useEffects */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-1 items-center justify-center px-7 pt-24 pb-16 sm:px-14 sm:pt-20"
        style={{ opacity: 0 }}
      >
        <div key={screen} className="flex w-full items-center justify-center">
          {screen === 0 && current.type === "statement"
            ? <StatementScreen text={current.text} size={current.size} entranceDelay={1.3} />
            : renderScreen(current)}
        </div>
      </div>

      {/* ── Dev toolbar ── */}
      {process.env.NODE_ENV === "development" && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[999] flex gap-1.5 flex-wrap items-center p-2"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
        >
          {DEV_JUMPS.map((j) => (
            <button
              key={j.idx}
              onClick={() => handleDevJump(j.idx)}
              style={{ color: j.color, borderColor: `${j.color}55`, fontSize: 10 }}
              className="px-2 py-1 border hover:opacity-70 transition-opacity font-mono cursor-pointer"
            >
              {j.label}
            </button>
          ))}
          <button
            onClick={() => { writeQuizState({}); router.push("/quiz/body"); }}
            style={{ color: "#f472b6", borderColor: "#f472b655", fontSize: 10 }}
            className="px-2 py-1 border hover:opacity-70 transition-opacity font-mono cursor-pointer"
          >
            → BODY
          </button>
          <button
            onClick={() => quizSounds.play("intro")}
            style={{ color: "#facc15", borderColor: "#facc1555", fontSize: 10 }}
            className="px-2 py-1 border hover:opacity-70 transition-opacity font-mono cursor-pointer"
          >
            ♪ TEST
          </button>
          <span style={{ color: "#666", fontSize: 10 }} className="self-center ml-auto font-mono">
            intro {screen}/{SCREENS.length - 1}
          </span>
        </div>
      )}

      {/* Bottom action area - EARTH bloom */}
      <div
        ref={hintRef}
        className="relative z-10 flex flex-col items-center gap-4 px-4 pt-6 pb-10 sm:pb-14"
        style={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {isGate && current.type === "gate" ? (
          <GateActions ctaA={current.ctaA} privacy={current.privacy} onBegin={handleBegin} />
        ) : (
          <div className="w-full" onClick={(e) => e.stopPropagation()}>
            <QuizCTAButton label="CONTINUE" onClick={advance} />
          </div>
        )}
      </div>
    </main>
  );
}
