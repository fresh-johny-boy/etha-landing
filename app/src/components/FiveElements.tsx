"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Shapes reflect dosha energy mapping from brand guide
const AURA_SHAPES = [
  // Fire — Balanced/Pitta: tight intense oval, pinched waist
  "M0.52,0.08 C0.64,0.08 0.76,0.16 0.84,0.28 C0.90,0.38 0.88,0.46 0.86,0.52 C0.84,0.58 0.88,0.66 0.84,0.76 C0.78,0.88 0.66,0.94 0.52,0.94 C0.38,0.94 0.26,0.88 0.20,0.76 C0.16,0.66 0.18,0.58 0.16,0.52 C0.14,0.46 0.14,0.38 0.20,0.28 C0.28,0.16 0.40,0.08 0.52,0.08 Z",
  // Earth — Relaxed/Kapha: wide, heavy, flowing, grounded
  "M0.12,0.40 C0.14,0.26 0.26,0.16 0.40,0.14 C0.52,0.12 0.60,0.16 0.68,0.12 C0.78,0.10 0.88,0.18 0.92,0.32 C0.94,0.44 0.90,0.56 0.88,0.66 C0.86,0.78 0.76,0.88 0.62,0.90 C0.50,0.92 0.40,0.88 0.30,0.90 C0.20,0.92 0.10,0.84 0.08,0.72 C0.06,0.60 0.10,0.50 0.12,0.40 Z",
  // Space — Energised/Vata: angular, restless edges
  "M0.54,0.06 C0.68,0.04 0.84,0.14 0.90,0.26 C0.96,0.38 0.88,0.46 0.92,0.54 C0.96,0.64 0.90,0.78 0.78,0.86 C0.66,0.94 0.52,0.92 0.42,0.96 C0.30,1.00 0.16,0.90 0.10,0.76 C0.04,0.64 0.10,0.54 0.06,0.44 C0.02,0.34 0.08,0.20 0.22,0.12 C0.34,0.06 0.44,0.08 0.54,0.06 Z",
  // Air — Energised/Vata: asymmetric, sharp kinks
  "M0.58,0.10 C0.72,0.08 0.86,0.18 0.90,0.30 C0.94,0.42 0.86,0.50 0.88,0.58 C0.92,0.68 0.82,0.80 0.70,0.84 C0.58,0.88 0.46,0.82 0.36,0.86 C0.24,0.92 0.12,0.82 0.08,0.68 C0.04,0.56 0.12,0.46 0.08,0.36 C0.04,0.26 0.14,0.14 0.30,0.10 C0.42,0.08 0.50,0.12 0.58,0.10 Z",
  // Water — Relaxed/Kapha: undulating, horizontal flow
  "M0.10,0.42 C0.10,0.28 0.20,0.18 0.32,0.16 C0.42,0.14 0.48,0.20 0.56,0.16 C0.64,0.12 0.76,0.14 0.86,0.24 C0.94,0.34 0.94,0.46 0.90,0.56 C0.86,0.66 0.78,0.74 0.68,0.80 C0.58,0.86 0.50,0.82 0.42,0.86 C0.32,0.90 0.20,0.86 0.12,0.76 C0.06,0.66 0.06,0.54 0.10,0.42 Z",
];

// Seed: all points collapsed to center — the blob grows FROM this
const SEED = "M0.50,0.50 C0.50,0.50 0.50,0.50 0.50,0.50 C0.50,0.50 0.50,0.50 0.50,0.50 C0.50,0.50 0.50,0.50 0.50,0.50 C0.50,0.50 0.50,0.50 0.50,0.50 C0.50,0.50 0.50,0.50 0.50,0.50 C0.50,0.50 0.50,0.50 0.50,0.50 C0.50,0.50 0.50,0.50 0.50,0.50 C0.50,0.50 0.50,0.50 0.50,0.50 Z";

const elements = [
  {
    name: "Fire",
    tagline: "Heat. Transformation. The spark that changes everything.",
    imageHint: "Flames, ember macro, molten glow, candle intensity",
    image: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/fire.webp`,
    imageStyle: { objectPosition: "center 40%" },
    align: "left" as const,
  },
  {
    name: "Earth",
    tagline: "Weight. Foundation. The ground beneath everything.",
    imageHint: "Landscape — rock formations, raw earth texture, geological weight",
    image: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/earth.webp`,
    imageStyle: { objectPosition: "center center" },
    align: "right" as const,
  },
  {
    name: "Space",
    tagline: "Space. Connection. The source from which everything flows.",
    imageHint: "Cosmos, light rays, ethereal abstraction, dawn sky",
    image: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/space.webp`,
    imageStyle: { objectPosition: "center center" },
    align: "left" as const,
  },
  {
    name: "Air",
    tagline: "Movement. Breath. The invisible force you feel but never see.",
    imageHint: "Wind in grass, clouds racing, mist through trees",
    image: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/air.webp`,
    imageStyle: { objectPosition: "center center" },
    align: "right" as const,
  },
  {
    name: "Water",
    tagline: "Force. Flow. The current that never stops.",
    imageHint: "Ocean swell, waterfall force, rain macro on stone",
    image: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/water.webp`,
    imageStyle: { objectPosition: "center center" },
    align: "center" as const,
  },
];

export default function FiveElements(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const clipRefs = useRef<(SVGPathElement | null)[]>([]);
  const strokeRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Intro header — scrub-linked
      if (introRef.current) {
        const introChildren = Array.from(introRef.current.children);
        introChildren.forEach((child, ci) => {
          gsap.fromTo(
            child,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: introRef.current,
                start: `top ${85 - ci * 5}%`,
                end: `top ${55 - ci * 5}%`,
                scrub: 0.5,
              },
            }
          );
        });
      }

      // Each panel — blob grows from seed, text fades in
      panelsRef.current.forEach((panel, i) => {
        if (!panel) return;
        const clipPath = clipRefs.current[i];
        const strokePath = strokeRefs.current[i];
        const textEl = panel.querySelector("[data-element-text]");
        const isCenter = elements[i].align === "center";
        const isRight = elements[i].align === "right";

        // Blob clip path morphs from seed → full shape on scroll
        if (clipPath) {
          gsap.fromTo(
            clipPath,
            { attr: { d: SEED } },
            {
              attr: { d: AURA_SHAPES[i] },
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top 90%",
                end: "top 40%",
                scrub: 0.4,
              },
            }
          );
        }

        // Edge stroke draws in sync with the clip morph
        if (strokePath) {
          gsap.fromTo(
            strokePath,
            { attr: { d: SEED }, strokeOpacity: 0 },
            {
              attr: { d: AURA_SHAPES[i] },
              strokeOpacity: 0.4,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top 90%",
                end: "top 40%",
                scrub: 0.4,
              },
            }
          );
        }

        // Text slides in from the side, slightly delayed
        if (textEl) {
          gsap.fromTo(
            textEl,
            {
              x: isCenter ? 0 : isRight ? -60 : 60,
              opacity: 0,
            },
            {
              x: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top 80%",
                end: "top 40%",
                scrub: 0.5,
              },
            }
          );
        }

        // Breathing — image drifts inside the static mask
        const inner = panel.querySelector("[data-aura-inner]");
        if (inner) {
          const dur = 5 + i * 0.8;
          gsap.to(inner, {
            scale: 1.06,
            y: -8,
            x: i % 2 === 0 ? 5 : -5,
            duration: dur,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-aubergine py-24 md:py-32">
      {/* Intro */}
      <div ref={introRef} className="mx-auto max-w-3xl px-6 pb-20 text-center md:px-12 md:pb-28">
        <p className="mb-6 font-serif text-sm italic text-cream/50">
          — The Five Elements
        </p>
        <h2 className="mb-6 font-serif text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.1] text-cream">
          Do you know you&apos;re made
          <br />
          of five elements?
        </h2>
        <p className="mx-auto max-w-xl font-serif text-[15px] font-light leading-[1.6] text-cream/60">
          Not metaphorically. Literally. Fire. Earth. Space. Water. Air.
          Each element shapes how you think, feel, eat, love, and break
          down. When they&apos;re off, you feel off. Anxious. Stuck. Numb.
          Scattered. When they&apos;re in rhythm, you feel you again.
        </p>
      </div>

      {/* Element panels */}
      <div className="relative z-10 space-y-20 md:space-y-32">
        {elements.map((el, i) => (
          <div
            key={el.name}
            ref={(node) => {
              panelsRef.current[i] = node;
            }}
            className={`flex flex-col gap-8 px-6 md:gap-12 md:px-12 ${
              el.align === "center"
                ? "items-center text-center"
                : el.align === "right"
                  ? "md:flex-row-reverse md:items-center"
                  : "md:flex-row md:items-center"
            } mx-auto max-w-7xl`}
          >
            {/* Blob container */}
            <div
              className={`relative ${
                el.align === "center"
                  ? "h-[40vh] w-full max-w-4xl"
                  : "h-[35vh] w-full md:w-[55%]"
              }`}
            >
              {/* SVG defs */}
              <svg className="absolute h-0 w-0" aria-hidden="true">
                <defs>
                  <clipPath
                    id={`element-clip-${i}`}
                    clipPathUnits="objectBoundingBox"
                  >
                    <path
                      ref={(node) => { clipRefs.current[i] = node; }}
                      d={SEED}
                    />
                  </clipPath>
                </defs>
              </svg>

              {/* Shadow layers */}
              <svg
                className="pointer-events-none absolute inset-[-4%] h-[108%] w-[108%] translate-x-[1.5%] translate-y-[2%]"
                viewBox="0 0 1 1"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d={AURA_SHAPES[i]} fill="rgba(0,0,0,0.08)" stroke="none" />
              </svg>
              <svg
                className="pointer-events-none absolute inset-[-4%] h-[108%] w-[108%] translate-x-[3%] translate-y-[4%] blur-[6px]"
                viewBox="0 0 1 1"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d={AURA_SHAPES[i]} fill="rgba(0,0,0,0.06)" stroke="none" />
              </svg>
              <svg
                className="pointer-events-none absolute inset-[-4%] h-[108%] w-[108%] translate-x-[5%] translate-y-[7%] blur-[14px]"
                viewBox="0 0 1 1"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d={AURA_SHAPES[i]} fill="rgba(0,0,0,0.04)" stroke="none" />
              </svg>

              {/* Clipped image */}
              <div
                data-aura-blob
                className="absolute inset-[-4%]"
                style={{ clipPath: `url(#element-clip-${i})` }}
              >
                {el.image ? (
                  <>
                    <img
                      data-aura-inner
                      src={el.image}
                      alt={el.name}
                      className="absolute inset-0 h-full w-full object-cover will-change-transform"
                      style={el.imageStyle}
                    />
                    <div className="absolute inset-0 bg-black/[0.12]" />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(ellipse at center, transparent 40%, rgba(61,35,59,0.35) 100%)",
                      }}
                    />
                  </>
                ) : (
                  <>
                    <div data-aura-inner className="absolute inset-0 bg-gradient-to-br from-cream/[0.06] via-cream/[0.02] to-cream/[0.04] will-change-transform" />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(ellipse at center, transparent 50%, rgba(61,35,59,0.2) 100%)",
                      }}
                    />
                  </>
                )}
                {!el.image && (
                  <p className="font-label absolute bottom-[15%] left-[15%] text-[9px] text-cream/20">
                    {el.imageHint}
                  </p>
                )}
              </div>

              {/* Edge stroke — morphs with the clip */}
              <svg
                className="pointer-events-none absolute inset-[-4%] h-[108%] w-[108%]"
                viewBox="0 0 1 1"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  ref={(node) => { strokeRefs.current[i] = node; }}
                  d={SEED}
                  fill="none"
                  stroke="#FFEFDE"
                  strokeWidth="0.0015"
                  strokeOpacity="0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Text */}
            <div
              data-element-text
              className={`${
                el.align === "center"
                  ? "max-w-lg"
                  : "max-w-md px-0 md:px-8"
              }`}
            >
              <p className="mb-4 font-serif text-sm italic text-cream/50">
                — {el.name}
              </p>
              <h3 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.1] text-cream">
                {el.tagline}
              </h3>
            </div>
          </div>
        ))}

        {/* Element marque */}
        <div className="flex justify-center pt-8">
          <span className="font-serif text-3xl text-cream/20">~</span>
        </div>
      </div>
    </section>
  );
}
