"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { QuizCTAButton } from "./QuizCTAButton";

const WATER = "sine.inOut";

/* Ambient balanced aura — same language as Hero / Closure, stroke-only. */
const AURA_PATH =
  "M 220,30 C 300,6 394,38 416,112 C 438,188 410,286 350,344 C 288,400 194,422 118,406 C 46,390 -2,328 4,250 C 10,176 58,92 130,50 C 160,32 198,44 220,30";

export default function QuizInterstitial({
  text,
  onAdvance,
  autoHoldMs = 4500,
}: {
  text: string;
  onAdvance: () => void;
  autoHoldMs?: number;
}) {
  const copyRef = useRef<HTMLParagraphElement>(null);
  const auraRef = useRef<SVGSVGElement>(null);
  const ctaRef  = useRef<HTMLDivElement>(null);
  const advancedRef = useRef(false);

  const go = () => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    onAdvance();
  };

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      gsap.fromTo(copyRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: reduced ? 0.01 : 1.1, ease: WATER, delay: reduced ? 0 : 0.25 },
      );
      gsap.fromTo(ctaRef.current,
        { opacity: 0 },
        { opacity: 1, duration: reduced ? 0.01 : 1.0, ease: WATER, delay: reduced ? 0 : 1.4 },
      );
      /* Aura breath — 1.02 scale loop. */
      if (!reduced && auraRef.current) {
        gsap.to(auraRef.current, {
          scale: 1.02,
          duration: 4,
          ease: WATER,
          yoyo: true,
          repeat: -1,
          transformOrigin: "center center",
        });
      }
    });

    /* Auto-advance hold. */
    const t = setTimeout(go, autoHoldMs);
    return () => { ctx.revert(); clearTimeout(t); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full px-8 sm:px-12 text-center">
      <svg
        ref={auraRef}
        className="pointer-events-none absolute"
        style={{ width: "68vw", maxWidth: 520, opacity: 0.09, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        viewBox="0 0 420 430"
        fill="none"
        aria-hidden="true"
      >
        <path d={AURA_PATH} stroke="#FFEFDE" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <p
        ref={copyRef}
        className="font-serif text-cream leading-snug max-w-xl relative z-10"
        style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", opacity: 0 }}
      >
        {text}
      </p>

      <div
        ref={ctaRef}
        className="mt-14 w-full max-w-sm relative z-10"
        style={{ opacity: 0 }}
      >
        <QuizCTAButton label="CONTINUE" onClick={go} />
      </div>
    </div>
  );
}
