"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(MorphSVGPlugin);

const WATER = "sine.inOut";

/* Balanced aura — two subtly different organic ovals to morph between. */
const AURA_A =
  "M 220,30 C 300,6 394,38 416,112 C 438,188 410,286 350,344 C 288,400 194,422 118,406 C 46,390 -2,328 4,250 C 10,176 58,92 130,50 C 160,32 198,44 220,30";
const AURA_B =
  "M 215,34 C 294,8 390,44 412,118 C 434,194 404,290 342,348 C 280,404 186,424 112,408 C 40,392 -6,330 2,252 C 8,174 60,88 134,48 C 164,30 194,48 215,34";

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
      /* Aura — gentle morph between two near-identical ovals + slow drift. */
      if (!reduced && auraRef.current) {
        const path = auraRef.current.querySelector("path");
        if (path) {
          gsap.to(path, {
            morphSVG: AURA_B,
            duration: 5.5,
            ease: WATER,
            yoyo: true,
            repeat: -1,
          });
        }
        gsap.to(auraRef.current, {
          x: 6,
          y: -5,
          duration: 7,
          ease: WATER,
          yoyo: true,
          repeat: -1,
          transformOrigin: "center center",
        });
        gsap.to(auraRef.current, {
          rotate: 1.5,
          duration: 9,
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
        style={{ width: "68vw", maxWidth: 520, opacity: 1, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        viewBox="0 0 420 430"
        fill="none"
        aria-hidden="true"
      >
        <path d={AURA_A} stroke="#FFEFDE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <p
        ref={copyRef}
        className="font-serif text-cream leading-snug max-w-xl relative z-10"
        style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", opacity: 0 }}
      >
        {text}
      </p>

    </div>
  );
}
