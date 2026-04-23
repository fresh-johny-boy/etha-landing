"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(MorphSVGPlugin);

const WATER = "sine.inOut";

/* Balanced aura — horizontal oval, two organic variants to morph between.
   ViewBox 480×300 keeps it wider than tall so it frames the text naturally. */
const AURA_A =
  "M 240,22 C 330,4 442,48 462,128 C 482,210 428,274 326,290 C 224,306 112,292 62,232 C 12,172 16,90 82,46 C 132,14 190,20 240,22";
const AURA_B =
  "M 244,18 C 336,2 448,50 466,132 C 484,214 424,276 320,294 C 216,310 106,294 56,234 C 6,174 12,88 80,42 C 130,10 194,16 244,18";

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
  const pathRef = useRef<SVGPathElement>(null);
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
        { opacity: 0 },
        { opacity: 1, duration: reduced ? 0.01 : 1.1, ease: WATER, delay: reduced ? 0 : 0.3 },
      );

      if (!reduced && pathRef.current) {
        gsap.to(pathRef.current, {
          morphSVG: AURA_B,
          duration: 6,
          ease: WATER,
          yoyo: true,
          repeat: -1,
        });
      }
    });

    const t = setTimeout(go, autoHoldMs);
    return () => { ctx.revert(); clearTimeout(t); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full" style={{ minHeight: "60vh" }}>
      {/* Balanced aura ring — static position, path breathes */}
      <svg
        className="pointer-events-none absolute"
        style={{ width: "min(80vw, 520px)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        viewBox="0 0 480 300"
        fill="none"
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          d={AURA_A}
          stroke="#FFEFDE"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.45"
        />
      </svg>

      <p
        ref={copyRef}
        className="font-serif text-cream leading-snug max-w-xs sm:max-w-sm relative z-10 text-center px-6"
        style={{ fontSize: "clamp(1.6rem, 4.5vw, 2.4rem)", opacity: 0 }}
      >
        {text}
      </p>
    </div>
  );
}
