"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AuraButton from "./AuraButton";

gsap.registerPlugin(ScrollTrigger);

export default function Closure(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<SVGPathElement>(null);

  /* ANIMATIONS DISABLED FOR FIGMA EXPORT
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Gentle text fade
      if (textRef.current) {
        gsap.from(textRef.current.children, {
          y: 20,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 80%",
          },
        });
      }

      // Closing aura draws its final stroke
      if (auraRef.current) {
        const length = auraRef.current.getTotalLength();
        gsap.set(auraRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        gsap.to(auraRef.current, {
          strokeDashoffset: 0,
          duration: 2,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);
  */

  return (
    <section ref={sectionRef} className="relative">
      {/* ── CREAM: Closing text + CTA ── */}
      <div className="relative bg-cream px-6 pb-16 pt-32 md:px-12 md:pb-24 md:pt-40">
        {/* Closing aura — balanced oval completing its loop */}
        <svg
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 overflow-visible md:h-[500px] md:w-[650px]"
          viewBox="0 0 500 350"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <path
            ref={auraRef}
            d="M250,25 C340,18 430,60 460,130 C490,200 455,270 380,310 C305,350 200,345 130,305 C60,265 15,200 25,130 C35,60 110,20 175,18 C210,17 235,22 250,25"
            stroke="rgba(61,35,59,0.12)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        <div
          ref={textRef}
          className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          {/* Element marque */}
          <span className="mb-6 font-serif text-2xl text-aubergine/30">~</span>

          {/* Closing headline */}
          <h2 className="mb-6 font-serif text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.1] text-aubergine">
            Nature is not a trend
          </h2>

          {/* Closing line */}
          <p className="mb-10 max-w-md font-serif text-[16px] font-light leading-[1.6] text-aubergine/70">
            It is the original healer.
            <br />
            Etha simply translates her language.
          </p>

          {/* Final CTA — hidden on mobile */}
          <div className="hidden md:block">
            <AuraButton href="#quiz" className="text-aubergine">
              BEGIN SELF-DISCOVERY
            </AuraButton>
          </div>
        </div>
      </div>

      {/* ── NATURE IMAGE ECHO ── */}
      <div className="relative h-[35vh] w-full overflow-hidden md:h-[40vh]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(200,190,180,0.3) 0%, rgba(170,165,160,0.5) 40%, rgba(190,185,180,0.4) 70%, rgba(61,35,59,0.6) 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(160,150,140,0.4) 0%, transparent 70%)",
          }}
        />
        <p className="font-label absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-cream/30">
          Nature image — still water, sunset, mist, dawn
        </p>
      </div>
    </section>
  );
}
