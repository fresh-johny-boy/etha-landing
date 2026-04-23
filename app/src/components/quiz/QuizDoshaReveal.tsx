"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { DOSHA_THEMES, AURA_PATHS, AURA_VIEWBOXES } from "@/lib/doshaThemes";
import { ARCHETYPES } from "@/lib/archetypesMock";
import { QuizCTAButton } from "./QuizCTAButton";
import type { Archetype } from "@/lib/quizDataContract";

const REFRAME_QUOTES: Record<Archetype, string> = {
  vata:  "You are not scattered. You are alive to everything at once.",
  pitta: "You are not too much. You are exactly enough fire for what you came here to do.",
  kapha: "You are not slow. You are the one thing that actually holds.",
};

export default function QuizDoshaReveal({
  dosha,
  onAdvance,
}: {
  dosha: Archetype;
  onAdvance: () => void;
}) {
  const theme = DOSHA_THEMES[dosha];
  const archetype = ARCHETYPES[dosha];
  const auraPath = AURA_PATHS[dosha];
  const auraViewBox = AURA_VIEWBOXES[dosha];

  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const archetypeRef = useRef<HTMLParagraphElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const els = [
        labelRef.current,
        nameRef.current,
        archetypeRef.current,
        quoteRef.current,
        blurRef.current,
        ctaRef.current,
      ];
      gsap.set(els, { opacity: 0, y: 16 });
      els.forEach((el, i) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: "sine.inOut",
          delay: 0.15 * i,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [dosha]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Aura SVG */}
      <svg
        viewBox={auraViewBox}
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ height: "85vh", width: "auto", overflow: "visible" }}
      >
        <path
          d={auraPath}
          stroke={theme.nameColor}
          strokeWidth="1.5"
          strokeOpacity="0.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-lg w-full gap-6">
        <p
          ref={labelRef}
          className="font-label text-[10px] tracking-widest"
          style={{ color: theme.nameColor, opacity: 0 }}
        >
          YOUR DOSHA
        </p>

        <h1
          ref={nameRef}
          className="font-serif text-5xl md:text-7xl lg:text-8xl"
          style={{ color: theme.nameColor, opacity: 0 }}
        >
          {archetype.name}
        </h1>

        <p
          ref={archetypeRef}
          className="font-label text-[10px] tracking-widest text-cream"
          style={{ opacity: 0 }}
        >
          {archetype.poeticName.toUpperCase()}
        </p>

        <p
          ref={quoteRef}
          className="font-serif text-base md:text-lg max-w-sm"
          style={{ fontStyle: "italic", color: "rgba(255,239,222,0.8)", opacity: 0 }}
        >
          {REFRAME_QUOTES[dosha]}
        </p>

        {/* Blurred preview */}
        <div
          ref={blurRef}
          className="w-full px-4 py-5 mt-2"
          style={{
            filter: "blur(8px)",
            pointerEvents: "none",
            opacity: 0,
            color: "rgba(255,239,222,0.4)",
          }}
          aria-hidden="true"
        >
          <p className="font-serif text-sm leading-relaxed">
            Your complete rhythm map, your morning ritual, your botanical protocol, written for you alone.
          </p>
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="w-full max-w-xs" style={{ opacity: 0 }}>
          <QuizCTAButton
            label="READ MY FULL REPORT"
            onClick={onAdvance}
            strokeColor={theme.nameColor}
            revealMode="fade"
          />
        </div>
      </div>
    </div>
  );
}
