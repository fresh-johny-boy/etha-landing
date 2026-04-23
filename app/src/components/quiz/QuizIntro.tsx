"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { quizSounds } from "@/lib/quizSounds";
import { QuizCTAButton } from "./QuizCTAButton";

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
  | { type: "value"; headline: string; items: { num: string; text: string }[]; footer?: string }
  | { type: "gate"; headline: string; ctaA: string; privacy: string };

const SCREENS: ScreenDef[] = [
  { type: "statement",  size: "massive", text: "Am I who I am supposed to be?" },
  { type: "reflection", text: "If this question has ever moved through you, even once, even briefly, then you already know there is more to you than what the world sees." },
  { type: "reflection", text: "There is a system, older than medicine, older than modern science, that mapped the human body not by disease, but by nature." },
  { type: "twoLine",   line1: "Not who you should become.", line2: "Who you already are." },
  { type: "reflection", text: "Your body has a blueprint. A rhythm it was born with. There is a 5,000-year-old system that mapped it with extraordinary precision. This is what you are about to discover." },
  {
    type: "value",
    headline: "You are about to receive:",
    items: [
      { num: "01", text: "Your personal rhythm map, the blueprint your body was born with." },
      { num: "02", text: "A morning-to-night ritual designed for your specific constitution." },
      { num: "03", text: "Botanical recommendations matched to where you are right now." },
    ],
  },
  {
    type: "gate",
    headline: "Are you ready to return to yourself?",
    ctaA: "Begin your remembering",
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
  return (
    <div className="text-center" style={{ lineHeight: 1.12 }}>
      <p ref={l1} className="font-serif text-cream/60 opacity-0" style={{ fontSize: fs }}>
        {line1}
      </p>
      <p ref={l2} className="font-serif text-cream opacity-0" style={{ fontSize: fs, fontStyle: "italic" }}>
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
      style={{ fontSize: "clamp(1.7rem,4.5vw,3rem)", lineHeight: 1.45, opacity: 0 }}
    >
      {text}
    </p>
  );
}

function ValueScreen({ headline, items, footer }: {
  headline: string; items: { num: string; text: string }[]; footer?: string;
}) {
  const listRef   = useRef<HTMLOListElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        Array.from(listRef.current!.children),
        { opacity: 0 },
        { opacity: 1, duration: 1.0, ease: WATER, stagger: 0.35, delay: 0.3 }
      );
      if (footer && footerRef.current)
        gsap.fromTo(footerRef.current, { opacity: 0 }, { opacity: 1, duration: 1.0, ease: WATER, delay: 1.6 });
    }, listRef);
    return () => ctx.revert();
  }, [footer]);

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
      {footer && (
        <div ref={footerRef} className="mt-10 pt-7 border-t border-cream/15" style={{ opacity: 0 }}>
          <p className="font-serif text-cream/70 leading-relaxed italic" style={{ fontSize: "clamp(0.95rem,2vw,1.1rem)" }}>
            {footer}
          </p>
        </div>
      )}
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
      style={{ fontSize: "clamp(2.8rem,8vw,6.5rem)", lineHeight: 1.06 }}
    >
      <span ref={l1} className="block opacity-0">{words.slice(0, split).join(" ")}</span>
      <span ref={l2} className="block opacity-0">{words.slice(split).join(" ")}</span>
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

  const current = SCREENS[screen];
  const isGate  = current.type === "gate";

  /* Per-screen enter — WATER element */
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

  /* Advance — FIRE exit, AIR enter */
  const advance = useCallback(() => {
    if (isGate) return;
    const content = contentRef.current;
    const hint    = hintRef.current;
    if (!content) return;
    const nextScreen = Math.min(screen + 1, SCREENS.length - 1);
    quizSounds.playIntroMelody(nextScreen);
    gsap.to(content, {
      opacity: 0, y: -30, duration: 0.36, ease: FIRE,
      onComplete: () => setScreen(nextScreen),
    });
    if (hint) gsap.to(hint, { opacity: 0, duration: 0.12 });
  }, [isGate, screen]);

  const handleBegin = useCallback(() => {
    quizSounds.playIntroMelody(6);
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
      <Nav variant="light" hideLinks animated progress={screen / (SCREENS.length - 1)} />

      {/* Screen content — key forces child remounts for per-screen useEffects */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-1 items-center justify-center px-7 py-16 sm:px-14"
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
            onClick={() => router.push("/quiz/body")}
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
