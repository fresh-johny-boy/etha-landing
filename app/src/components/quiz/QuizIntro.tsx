"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

/* ── Nature bezier language ── */
const AIR   = "expo.out";     // enters: quick rush, long float — air element
const WATER  = "sine.inOut";  // breathes: perfectly smooth — water element
const FIRE   = "power4.in";   // exits: sharp acceleration — fire element
const EARTH  = "power1.out";  // blooms: slow, grounded — earth element

/* ── Shared path util ── */
type Pt = [number, number];
function toPath(pts: Pt[]): string {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i += 3)
    d += ` C${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} ${pts[i+1][0].toFixed(1)},${pts[i+1][1].toFixed(1)} ${pts[i+2][0].toFixed(1)},${pts[i+2][1].toFixed(1)}`;
  return d;
}

/* ── CTA Button: wide oval aura, 22 control points ── */
const BTN_CX = 180, BTN_CY = 34;
const BTN_BASE: Pt[] = [
  [170, 4],
  [205, 1],  [252, 2],  [295, 12],
  [328, 20], [358, 28], [356, 42],
  [352, 58], [312, 66], [262, 68],
  [212, 70], [148, 70], [98,  68],
  [48,  66], [14,  56], [6,   42],
  [0,   28], [12,  18], [38,  10],
  [78,   2], [130,  1], [170,  4],
];
const BTN_D = toPath(BTN_BASE);

function distortBtn(nx: number, ny: number): string {
  const angle = Math.atan2(ny, nx);
  const mag   = Math.min(1, Math.sqrt(nx * nx + ny * ny));
  return toPath(
    BTN_BASE.map(([px, py]) => {
      const dx = px - BTN_CX, dy = py - BTN_CY;
      const r  = Math.sqrt(dx * dx + dy * dy) || 1;
      const soft = Math.pow((Math.cos(Math.atan2(dy, dx) - angle) + 1) / 2, 2);
      const push = soft * mag * 14;
      return [px + (dx / r) * push, py + (dy / r) * push] as Pt;
    })
  );
}

/* ── Quiz CTA Button — aura morph on hover ── */
function QuizCTAButton({ label, onClick }: { label: string; onClick: () => void }) {
  const pathRef = useRef<SVGPathElement>(null);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const rafRef  = useRef(0);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const distortFromPoint = useCallback((clientX: number, clientY: number) => {
    if (!btnRef.current || !pathRef.current) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!btnRef.current || !pathRef.current) return;
      const r  = btnRef.current.getBoundingClientRect();
      const nx = ((clientX - r.left) / r.width  - 0.5) * 2;
      const ny = ((clientY - r.top)  / r.height - 0.5) * 2;
      gsap.to(pathRef.current, { attr: { d: distortBtn(nx, ny) }, duration: 0.45, ease: "power3.out", overwrite: true });
    });
  }, []);

  const onMove  = useCallback((e: React.MouseEvent<HTMLButtonElement>) => distortFromPoint(e.clientX, e.clientY), [distortFromPoint]);
  const onTouch = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    const t = e.touches[0];
    if (t) distortFromPoint(t.clientX, t.clientY);
  }, [distortFromPoint]);

  const onRelease = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (pathRef.current)
      gsap.to(pathRef.current, { attr: { d: BTN_D }, duration: 1.1, ease: "elastic.out(1,0.35)", overwrite: true });
  }, []);

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onRelease}
      onTouchStart={onTouch}
      onTouchMove={onTouch}
      onTouchEnd={onRelease}
      className="group relative w-full px-12 py-6 cursor-pointer"
    >
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 360 68"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          d={BTN_D}
          stroke="#FFEFDE"
          strokeWidth="0.9"
          strokeOpacity="0.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "stroke-opacity 500ms ease" }}
        />
      </svg>
      <span
        className="font-label relative z-10 text-[11px] text-cream"
        style={{ transition: "opacity 300ms ease" }}
      >
        {label}
      </span>
    </button>
  );
}

/* ── Screen type definitions ── */
type ScreenDef =
  | { type: "statement"; text: string; size: "massive" | "large" }
  | { type: "twoLine";   line1: string; line2: string }
  | { type: "reflection"; text: string }
  | { type: "value"; headline: string; items: { num: string; text: string }[]; footer: string }
  | { type: "gate"; headline: string; ctaA: string; privacy: string };

const SCREENS: ScreenDef[] = [
  { type: "statement",  size: "massive", text: "Am I who I am supposed to be?" },
  { type: "reflection", text: "If this question has ever moved through you, even once, even briefly, then you already know there is more to you than what the world sees." },
  { type: "reflection", text: "There is a system, older than medicine, older than modern science, that mapped the human body not by disease, but by nature." },
  { type: "twoLine",   line1: "Not who you should become.", line2: "Who you already are." },
  { type: "reflection", text: "Your body has a blueprint. A rhythm it was born with. There is a 5,000-year-old system that mapped it with extraordinary precision. This is what you are about to discover." },
  {
    type: "value",
    headline: "In the next 15 minutes, you will receive:",
    items: [
      { num: "01", text: "Your personal rhythm map, the blueprint your body was born with." },
      { num: "02", text: "A morning-to-night ritual designed for your specific constitution." },
      { num: "03", text: "Botanical recommendations matched to where you are right now." },
    ],
    footer: "43 questions. Three layers. One map that belongs only to you.",
  },
  {
    type: "gate",
    headline: "Are you ready to return to yourself?",
    ctaA: "Yes, begin",
    privacy: "Your answers are private. Be honest. That is the only way this works.",
  },
];

/* ── Per-screen content components ── */

function StatementScreen({ text, size }: { text: string; size: "massive" | "large" }) {
  return (
    <h1
      className="font-serif text-cream text-center"
      style={{
        fontSize: size === "massive" ? "clamp(2.8rem,8vw,6.5rem)" : "clamp(2.2rem,5.5vw,4rem)",
        lineHeight: 1.06,
      }}
    >
      {text}
    </h1>
  );
}

function TwoLineStatement({ line1, line2 }: { line1: string; line2: string }) {
  const l1 = useRef<HTMLParagraphElement>(null);
  const l2 = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!l1.current || !l2.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        [l1.current, l2.current],
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.1, ease: AIR, stagger: 0.42, delay: 0.3 }
      );
    });
    return () => ctx.revert();
  }, []);

  const fs = "clamp(2.4rem,7vw,5rem)";
  return (
    <div className="text-center" style={{ lineHeight: 1.12 }}>
      <p ref={l1} className="font-serif text-cream/60" style={{ fontSize: fs, opacity: 0 }}>
        {line1}
      </p>
      <p ref={l2} className="font-serif text-cream" style={{ fontSize: fs, fontStyle: "italic", opacity: 0 }}>
        {line2}
      </p>
    </div>
  );
}

function ReflectionScreen({ text }: { text: string }) {
  return (
    <p
      className="font-serif text-cream text-center max-w-2xl"
      style={{ fontSize: "clamp(1.7rem,4.5vw,3rem)", lineHeight: 1.45 }}
    >
      {text}
    </p>
  );
}

function ValueScreen({ headline, items, footer }: {
  headline: string; items: { num: string; text: string }[]; footer: string;
}) {
  const listRef   = useRef<HTMLOListElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        Array.from(listRef.current!.children),
        { opacity: 0, x: -22 },
        { opacity: 1, x: 0, duration: 0.9, ease: AIR, stagger: 0.24, delay: 0.35 }
      );
      if (footerRef.current)
        gsap.fromTo(footerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: EARTH, delay: 1.2 });
    }, listRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full max-w-lg">
      <p className="font-label text-[11px] text-cream/65 mb-9">{headline}</p>
      <ol ref={listRef} className="space-y-8">
        {items.map((item) => (
          <li key={item.num} style={{ opacity: 0 }}>
            <span className="font-serif text-cream leading-snug" style={{ fontSize: "clamp(1.35rem,3.5vw,2rem)" }}>
              {item.text}
            </span>
          </li>
        ))}
      </ol>
      <div ref={footerRef} className="mt-10 pt-7 border-t border-cream/15" style={{ opacity: 0 }}>
        <p className="font-serif text-cream/70 leading-relaxed italic" style={{ fontSize: "clamp(0.95rem,2vw,1.1rem)" }}>
          {footer}
        </p>
      </div>
    </div>
  );
}

function GateScreen({ headline }: { headline: string }) {
  return (
    <h2
      className="font-serif text-cream text-center"
      style={{ fontSize: "clamp(2.8rem,8vw,6.5rem)", lineHeight: 1.06 }}
    >
      {headline}
    </h2>
  );
}

function renderScreen(s: ScreenDef) {
  switch (s.type) {
    case "statement":  return <StatementScreen  text={s.text} size={s.size} />;
    case "twoLine":    return <TwoLineStatement  line1={s.line1} line2={s.line2} />;
    case "reflection": return <ReflectionScreen  text={s.text} />;
    case "value":      return <ValueScreen       headline={s.headline} items={s.items} footer={s.footer} />;
    case "gate":       return <GateScreen        headline={s.headline} />;
  }
}

/* ── Main ── */
export default function QuizIntro() {
  const [screen, setScreen] = useState(0);
  const contentRef    = useRef<HTMLDivElement>(null);
  const hintRef       = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const current = SCREENS[screen];
  const isGate  = current.type === "gate";

/* Per-screen enter — AIR element */
  useEffect(() => {
    const content = contentRef.current;
    const hint    = hintRef.current;
    if (!content) return;

    const ctx = gsap.context(() => {
      gsap.killTweensOf([content, hint]);

      gsap.fromTo(
        content,
        { opacity: 0, y: 34 },
        { opacity: 1, y: 0, duration: 1.15, ease: AIR, delay: 0.05 }
      );

      if (hint) {
        gsap.set(hint, { opacity: 0 });
        gsap.to(hint, { opacity: 1, duration: 1.0, ease: EARTH, delay: 2.8 });
      }
    });
    return () => ctx.revert();
  }, [screen, isGate]);

  /* Advance — FIRE exit, AIR enter */
  const advance = useCallback(() => {
    if (isGate) return;
    const content = contentRef.current;
    const hint    = hintRef.current;
    if (!content) return;
    gsap.to(content, {
      opacity: 0, y: -30, duration: 0.36, ease: FIRE,
      onComplete: () => setScreen((s) => Math.min(s + 1, SCREENS.length - 1)),
    });
    if (hint) gsap.to(hint, { opacity: 0, duration: 0.12 });
  }, [isGate]);

  const handleBegin = useCallback(() => {
    const content = contentRef.current;
    const go = () => router.push("/quiz/body");
    if (!content) { go(); return; }
    gsap.to(content, { opacity: 0, y: -30, duration: 0.5, ease: FIRE, onComplete: go });
  }, [router]);


  return (
    <main
      className="relative flex min-h-dvh flex-col overflow-hidden bg-aubergine select-none"
      onClick={advance}
      style={{ cursor: isGate ? "default" : "pointer" }}
    >
      <Nav variant="light" hideLinks progress={screen / (SCREENS.length - 1)} className="pt-10 pb-16 md:pt-14 md:pb-20" />

      {/* Screen content — key forces child remounts for per-screen useEffects */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-1 items-center justify-center px-7 py-16 sm:px-14"
        style={{ opacity: 0 }}
      >
        <div key={screen} className="flex w-full items-center justify-center">
          {renderScreen(current)}
        </div>
      </div>

      {/* Bottom action area — EARTH bloom */}
      <div
        ref={hintRef}
        className="relative z-10 flex flex-col items-center gap-4 px-4 pt-6 pb-10 sm:pb-14"
        style={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {isGate && current.type === "gate" ? (
          <>
            <div className="w-full">
              <QuizCTAButton label={current.ctaA} onClick={handleBegin} />
            </div>
            <p
              className="font-serif text-cream/80 text-center leading-relaxed max-w-sm"
              style={{ fontSize: "clamp(0.95rem,2.2vw,1.1rem)" }}
            >
              {current.privacy}
            </p>
          </>
        ) : (
          <div className="w-full" onClick={(e) => e.stopPropagation()}>
            <QuizCTAButton label="CONTINUE" onClick={advance} />
          </div>
        )}
      </div>
    </main>
  );
}
