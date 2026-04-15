"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const elements = [
  {
    name: "EARTH",
    tagline: "Stability. Structure. The ground you stand on.",
    imageHint: "Landscape — rock formations, raw earth texture, geological weight",
    align: "left" as const,
  },
  {
    name: "WATER",
    tagline: "Flow. Cohesion. The force that binds and moves.",
    imageHint: "Ocean swell, waterfall force, rain macro on stone",
    align: "right" as const,
  },
  {
    name: "FIRE",
    tagline: "Transformation. Digestion. The heat that changes everything.",
    imageHint: "Flames, ember macro, molten glow, candle intensity",
    align: "left" as const,
  },
  {
    name: "AIR",
    tagline: "Movement. Breath. The invisible force you feel.",
    imageHint: "Wind in grass, clouds racing, mist through trees",
    align: "right" as const,
  },
  {
    name: "SPACE",
    tagline: "Expansion. Connection. Where everything begins.",
    imageHint: "Cosmos, light rays, ethereal abstraction, dawn sky",
    align: "center" as const,
  },
];

export default function FiveElements(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const auraRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Aura thread draws as you scroll through the section
      if (auraRef.current) {
        const length = auraRef.current.getTotalLength();
        gsap.set(auraRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        gsap.to(auraRef.current, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "bottom 40%",
            scrub: 1,
          },
        });
      }

      // Each panel fades in from its image side
      panelsRef.current.forEach((panel, i) => {
        if (!panel) return;
        const isCenter = elements[i].align === "center";
        const isRight = elements[i].align === "right";

        gsap.from(panel, {
          x: isCenter ? 0 : isRight ? 60 : -60,
          opacity: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: panel,
            start: "top 85%",
          },
        });

        // Parallax on image placeholder
        const img = panel.querySelector(".element-image");
        if (img) {
          gsap.to(img, {
            yPercent: -15,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-aubergine py-24 md:py-32">
      {/* Intro */}
      <div className="mx-auto max-w-3xl px-6 pb-20 text-center md:px-12 md:pb-28">
        <p className="mb-6 font-serif text-sm italic text-cream/50">
          — The Five Elements
        </p>
        <h2 className="mb-6 font-serif text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.1] text-cream">
          Do you know you&apos;re made
          <br />
          of five elements?
        </h2>
        <p className="mx-auto max-w-xl font-serif text-[15px] font-light leading-[1.6] text-cream/60">
          Not metaphorically. Literally. Each element shapes how you think,
          feel, eat, love, and break down. When they&apos;re off, you feel off.
          When they&apos;re in rhythm, you feel you again.
        </p>
      </div>

      {/* Energised aura thread — weaves through the section */}
      <svg
        className="pointer-events-none absolute left-1/2 top-0 z-0 h-full w-[80vw] -translate-x-1/2 overflow-visible"
        viewBox="0 0 800 2400"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path
          ref={auraRef}
          d="M700,20 C620,80 200,120 150,300 C100,480 650,420 680,600 C710,780 180,750 120,950 C60,1150 700,1100 720,1300 C740,1500 150,1450 100,1650 C50,1850 600,1800 650,2000 C700,2200 300,2250 250,2380"
          stroke="rgba(255,239,222,0.12)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Element panels */}
      <div className="relative z-10 space-y-16 md:space-y-24">
        {elements.map((el, i) => (
          <div
            key={el.name}
            ref={(node) => {
              panelsRef.current[i] = node;
            }}
            className={`flex flex-col gap-8 px-6 md:px-12 ${
              el.align === "center"
                ? "items-center text-center"
                : el.align === "right"
                  ? "items-end md:flex-row-reverse md:items-center"
                  : "items-start md:flex-row md:items-center"
            } mx-auto max-w-7xl`}
          >
            {/* Image placeholder */}
            <div
              className={`element-image relative overflow-hidden ${
                el.align === "center"
                  ? "h-[40vh] w-full max-w-4xl"
                  : "h-[35vh] w-full md:w-[60%]"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cream/[0.06] via-cream/[0.02] to-cream/[0.04]" />
              <p className="font-label absolute bottom-4 left-4 text-[9px] text-cream/20">
                {el.imageHint}
              </p>
            </div>

            {/* Text */}
            <div
              className={`${
                el.align === "center"
                  ? "max-w-lg"
                  : "max-w-md px-0 md:px-8"
              }`}
            >
              <p className="font-label mb-4 text-[11px] tracking-[0.3em] text-cream/40">
                {el.name}
              </p>
              <h3 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.1] text-cream">
                {el.tagline}
              </h3>
            </div>
          </div>
        ))}

        {/* Element marque after Ether */}
        <div className="flex justify-center pt-8">
          <span className="font-serif text-3xl text-cream/20">~</span>
        </div>
      </div>
    </section>
  );
}
