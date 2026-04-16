"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AuraButton from "./AuraButton";

gsap.registerPlugin(ScrollTrigger);

// Balanced aura — scaled to 65% toward center for compact starting state
// Creates anticipation: small blob → full viewport on scroll
const AURA_SHAPE =
  "M0.652,0.280 C0.594,0.232 0.521,0.226 0.456,0.254 C0.391,0.282 0.333,0.341 0.283,0.412 C0.260,0.445 0.236,0.486 0.235,0.536 C0.235,0.586 0.258,0.629 0.282,0.660 C0.330,0.718 0.389,0.748 0.449,0.759 C0.503,0.768 0.558,0.763 0.611,0.743 C0.652,0.728 0.692,0.702 0.723,0.656 C0.754,0.610 0.772,0.540 0.762,0.476 C0.753,0.422 0.727,0.380 0.698,0.347 C0.682,0.329 0.709,0.326 0.652,0.280 Z";

// Floating variation — same 65% scale, subtle organic drift
const AURA_FLOAT =
  "M0.655,0.274 C0.590,0.236 0.524,0.231 0.460,0.259 C0.396,0.287 0.338,0.338 0.287,0.407 C0.263,0.449 0.239,0.492 0.238,0.540 C0.237,0.590 0.260,0.633 0.286,0.665 C0.335,0.721 0.392,0.750 0.452,0.761 C0.505,0.767 0.561,0.760 0.614,0.740 C0.655,0.724 0.696,0.698 0.727,0.652 C0.756,0.605 0.769,0.536 0.759,0.472 C0.750,0.417 0.724,0.375 0.694,0.343 C0.679,0.325 0.713,0.321 0.655,0.274 Z";

// Mobile paths — X expanded 1.6x, Y compressed 0.50x
// Counters portrait aspect ratio while giving text breathing room
// Screen result on 390x844: ~335px wide, ~229px tall
const AURA_SHAPE_MOBILE =
  "M0.743,0.390 C0.650,0.366 0.534,0.363 0.430,0.377 C0.326,0.391 0.233,0.421 0.153,0.456 C0.116,0.473 0.078,0.493 0.076,0.518 C0.076,0.543 0.113,0.565 0.151,0.580 C0.228,0.609 0.322,0.624 0.418,0.630 C0.505,0.634 0.593,0.632 0.678,0.622 C0.743,0.614 0.807,0.601 0.857,0.578 C0.906,0.555 0.935,0.520 0.919,0.488 C0.905,0.461 0.863,0.440 0.817,0.424 C0.791,0.415 0.834,0.413 0.743,0.390 Z";

const AURA_FLOAT_MOBILE =
  "M0.748,0.387 C0.644,0.368 0.538,0.366 0.436,0.380 C0.334,0.394 0.241,0.419 0.159,0.454 C0.121,0.475 0.082,0.496 0.081,0.520 C0.079,0.545 0.116,0.567 0.158,0.583 C0.236,0.611 0.327,0.625 0.423,0.631 C0.508,0.634 0.598,0.630 0.682,0.620 C0.748,0.612 0.814,0.599 0.863,0.576 C0.910,0.553 0.930,0.518 0.914,0.486 C0.900,0.459 0.858,0.438 0.810,0.422 C0.786,0.413 0.841,0.411 0.748,0.387 Z";

// Oversized rectangle — 10 segments matching the aura
const FULL_RECT =
  "M1.05,-0.05 C1.05,-0.05 0.75,-0.05 0.50,-0.05 C0.25,-0.05 -0.05,-0.05 -0.05,-0.05 C-0.05,-0.05 -0.05,0.167 -0.05,0.333 C-0.05,0.500 -0.05,0.667 -0.05,0.833 C-0.05,1.05 -0.05,1.05 0.167,1.05 C0.333,1.05 0.500,1.05 0.667,1.05 C0.833,1.05 1.05,1.05 1.05,1.05 C1.05,1.05 1.05,0.833 1.05,0.667 C1.05,0.500 1.05,0.333 1.05,0.167 C1.05,-0.05 1.05,-0.05 1.05,-0.05 Z";

export default function Hero(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const clipRef = useRef<SVGPathElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const section = sectionRef.current;
    const clipPath = clipRef.current;
    const maskEl = maskRef.current;
    if (!section || !clipPath || !maskEl) return;

    // Pick mobile vs desktop paths based on viewport
    const isMobile = window.innerWidth < 768;
    const shape = isMobile ? AURA_SHAPE_MOBILE : AURA_SHAPE;
    const float = isMobile ? AURA_FLOAT_MOBILE : AURA_FLOAT;

    // Set correct initial path (SSR default is desktop)
    clipPath.setAttribute("d", shape);

    const ctx = gsap.context(() => {
      if (!prefersReduced) {
        // --- Gentle breathing on the mask container ---
        gsap.to(maskEl, {
          scale: 1.015,
          rotation: 0.3,
          duration: 5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        // --- Path morph float (only at top, before scrolling) ---
        const floatTl = gsap.timeline({ repeat: -1, yoyo: true });
        floatTl.to(clipPath, {
          attr: { d: float },
          duration: 7,
          ease: "sine.inOut",
        });

        // --- Scroll expansion: aura → full viewport ---
        gsap.to(clipPath, {
          attr: { d: FULL_RECT },
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "55% top",
            scrub: 0.3,
            onUpdate: (self) => {
              if (self.progress > 0.03) floatTl.pause();
              else floatTl.resume();
            },
          },
        });

        // --- Text entrance ---
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          delay: 0.3,
        });
        tl.from(labelRef.current, { y: 20, opacity: 0, duration: 0.8 })
          .from(headlineRef.current, { y: 30, opacity: 0, duration: 1 }, "-=0.5")
          .from(bodyRef.current, { y: 20, opacity: 0, duration: 0.8 }, "-=0.6")
          .from(ctaRef.current, { y: 15, opacity: 0, duration: 0.7 }, "-=0.4")
          .from(scrollRef.current, { opacity: 0, duration: 1 }, "-=0.3");
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[115vh] bg-cream md:h-[140vh]">
      <div className="sticky top-0 h-dvh overflow-hidden">
        {/* SVG clipPath — GSAP morphs the d attribute */}
        <svg className="absolute h-0 w-0" aria-hidden="true">
          <defs>
            <clipPath id="hero-aura-clip" clipPathUnits="objectBoundingBox">
              <path ref={clipRef} d={AURA_SHAPE} />
            </clipPath>
          </defs>
        </svg>

        {/* Hero image — aura mask clips it, gentle breathing transform */}
        <div
          ref={maskRef}
          className="absolute inset-[-2%] will-change-transform"
          style={{ clipPath: "url(#hero-aura-clip)" }}
        >
          <img
            src="/images/hero-section.webp"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Contrast scrim */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(61,35,59,0.1) 0%, rgba(61,35,59,0.05) 30%, rgba(61,35,59,0.2) 60%, rgba(61,35,59,0.5) 100%)",
            }}
          />
        </div>

        {/* Text — centered */}
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6 text-center md:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-xl">
              <p
                ref={labelRef}
                className="mb-3 font-serif text-sm italic text-cream/70 md:mb-4"
              >
                — Etha
              </p>
              <h1
                ref={headlineRef}
                className="mb-4 font-serif text-[clamp(2rem,8vw,4.5rem)] font-semibold leading-[1.05] text-cream md:mb-6"
                style={{ textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}
              >
                Return to the source
              </h1>
              <p
                ref={bodyRef}
                className="mx-auto mb-0 max-w-sm font-serif text-[15px] font-light leading-[1.6] text-cream/80 md:mb-8 md:max-w-md"
                style={{ textShadow: "0 1px 16px rgba(0,0,0,0.4)" }}
              >
                Get clarity who you are and what you really need today
              </p>
              <div ref={ctaRef} className="hidden md:block">
                <AuraButton href="#quiz" className="text-cream">
                  BEGIN SELF-DISCOVERY
                </AuraButton>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollRef}
          className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 md:bottom-6"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="h-6 w-[1px] bg-cream/40" />
            <div className="h-1.5 w-1.5 rounded-full bg-cream/50" />
          </div>
        </div>
      </div>
    </section>
  );
}
