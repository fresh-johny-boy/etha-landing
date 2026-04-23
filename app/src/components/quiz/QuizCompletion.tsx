"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function QuizCompletion({ onAdvance }: { onAdvance: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linesRef = useRef<HTMLParagraphElement[]>([]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const delay = prefersReduced ? 10 : 3000;
    const timer = setTimeout(onAdvance, delay);

    if (!prefersReduced) {
      const ctx = gsap.context(() => {
        gsap.set([headingRef.current, ...linesRef.current], { opacity: 0, y: 12 });
        gsap.to(headingRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "sine.inOut",
          delay: 0,
        });
        linesRef.current.forEach((el, i) => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "sine.inOut",
            delay: 0.3 * (i + 1),
          });
        });
      }, containerRef);
      return () => {
        ctx.revert();
        clearTimeout(timer);
      };
    }

    return () => clearTimeout(timer);
  }, [onAdvance]);

  const bodyLines = [
    "Forty-three answers. Three layers.",
    "Something rare has been assembled here,",
    "a map that belongs only to you.",
    "It is almost ready.",
  ];

  return (
    <div
      ref={containerRef}
      onClick={onAdvance}
      className="fixed inset-0 flex items-center justify-center cursor-pointer select-none"
      style={{ backgroundColor: "#3D233B" }}
    >
      {/* Decorative aura SVG */}
      <svg
        viewBox="0 0 420 270"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ width: "min(90vw, 560px)", overflow: "visible" }}
      >
        <path
          d="M200,30 C280,10 360,40 370,100 C380,160 340,220 260,240 C180,260 100,240 60,190 C20,140 30,70 100,45 C140,28 160,42 200,30 Z"
          stroke="#FFEFDE"
          strokeWidth="1.5"
          strokeOpacity="0.08"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-xl">
        <h1
          ref={headingRef}
          className="font-serif text-cream text-3xl md:text-4xl lg:text-5xl mb-8"
          style={{ fontStyle: "normal" }}
        >
          Your rhythm has been heard.
        </h1>
        <div className="flex flex-col gap-1">
          {bodyLines.map((line, i) => (
            <p
              key={i}
              ref={(el) => {
                if (el) linesRef.current[i] = el;
              }}
              className="font-serif text-cream text-base md:text-lg"
              style={{ opacity: 0, fontStyle: "italic", color: "rgba(255,239,222,0.7)" }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
