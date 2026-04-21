"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AuraButton from "./AuraButton";
import SectionDivider from "./SectionDivider";

gsap.registerPlugin(ScrollTrigger);

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const ritualMoments = [
  {
    label: "Nourish",
    image: `${BASE_PATH}/images/rituals-nourish.webp`,
    alt: "Morning dew on blades of grass",
  },
  {
    label: "Cleanse",
    image: `${BASE_PATH}/images/rituals-cleanse.webp`,
    alt: "Soft morning light on rumpled linen",
  },
  {
    label: "Restore",
    image: `${BASE_PATH}/images/rituals-restore.webp`,
    alt: "Silhouettes through a sunlit window",
  },
];

export default function Rituals(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const trioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          y: 25,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: headerRef.current, start: "top 80%" },
        });
      }

      if (quoteRef.current) {
        gsap.from(quoteRef.current, {
          opacity: 0,
          y: 20,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: quoteRef.current, start: "top 85%" },
        });
      }

      if (trioRef.current) {
        const items = trioRef.current.querySelectorAll(".ritual-moment");
        gsap.from(items, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: { trigger: trioRef.current, start: "top 85%" },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative">
      {/* ── CREAM: Section header ── */}
      <div className="bg-cream px-6 pb-10 pt-24 md:px-12 md:pb-14 md:pt-32">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div ref={headerRef} className="max-w-xl">
            <p className="mb-4 font-serif text-sm italic text-aubergine/50">
              — Rituals
            </p>
            <h2 className="mb-6 font-serif text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.1] text-aubergine">
              Rituals feel right
            </h2>
            <p className="max-w-md font-serif text-[15px] font-light leading-[1.6] text-aubergine/60">
              Rituals are small, easy acts with quiet power. Simple rituals can
              help you get back your balance. But how to find out what are the
              right rituals for you?
            </p>
          </div>
        </div>
      </div>

      {/* ── FULL-BLEED: Morning × Evening scroll-driven split ── */}
      <MorningEveningSplit />

      {/* ── AUBERGINE STRIP: Pull Quote ── */}
      <div className="relative bg-aubergine px-6 py-20 md:px-12 md:py-28">
        <div
          ref={quoteRef}
          className="relative z-10 mx-auto max-w-3xl text-center"
        >
          <p className="font-serif text-[clamp(1.25rem,3vw,2rem)] font-normal italic leading-[1.3] text-cream">
            The modern world is loud. It tells you to meditate, to speed up,
            to chase calm like a checklist. But if a practice isn&apos;t
            crafted for your Dosha, it stays a task — not a ritual.
          </p>
        </div>
      </div>

      {/* ── CREAM SECTION: Ritual Trio ── */}
      <div className="relative bg-cream px-6 py-20 md:px-12 md:py-28">
        <SectionDivider fill="aubergine" variant={3} />
        <div
          ref={trioRef}
          className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3 md:gap-12"
        >
          {ritualMoments.map((moment) => (
            <div key={moment.label} className="ritual-moment relative">
              <div className="relative mb-4">
                <div className="relative z-10 h-[280px] w-full overflow-hidden">
                  <img
                    src={moment.image}
                    alt={moment.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <svg
                  className="pointer-events-none absolute -left-3 -top-3 h-[calc(100%+24px)] w-[calc(100%+24px)] overflow-visible"
                  viewBox="0 0 260 320"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d={
                      moment.label === "Nourish"
                        ? "M130,8 C190,5 240,40 248,100 C256,160 245,220 230,270 C215,300 170,315 130,312 C90,309 40,295 22,260 C4,225 8,160 12,100 C16,40 70,11 130,8"
                        : moment.label === "Cleanse"
                          ? "M125,12 C185,8 245,45 250,110 C255,175 240,230 220,275 C200,305 155,315 120,310 C85,305 35,285 18,245 C1,205 5,145 15,95 C25,45 65,16 125,12"
                          : "M135,10 C195,12 248,50 252,115 C256,180 238,235 218,278 C198,310 160,318 125,315 C90,312 38,290 20,250 C2,210 8,150 18,95 C28,40 75,8 135,10"
                    }
                    stroke="rgba(61,35,59,0.1)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
              <p className="font-serif text-[14px] italic text-aubergine/60">
                — {moment.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 hidden justify-center md:mt-20 md:flex">
          <AuraButton href="#rituals" className="text-aubergine">
            FIND YOUR RITUALS
          </AuraButton>
        </div>
      </div>
    </section>
  );
}

/* ── Helpers for the split hero ── */

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Morning × Evening split hero — pinned scroll scrub drives a soft
 * mask-gradient crossfade. No hard seam line; the boundary is a wide
 * feather band that sweeps across.
 *
 * Progress 0: morning fills viewport.
 * Progress 1: evening fills viewport.
 * The crossfade is spatial (mask position) AND temporal (text opacity).
 */
function MorningEveningSplit(): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const morningLayerRef = useRef<HTMLDivElement>(null);
  const morningTextRef = useRef<HTMLDivElement>(null);
  const eveningTextRef = useRef<HTMLDivElement>(null);
  const progressRingRef = useRef<SVGPathElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const morning = morningLayerRef.current;
    const morningText = morningTextRef.current;
    const eveningText = eveningTextRef.current;
    if (!container || !morning || !morningText || !eveningText) return;

    let progress = 0;

    const apply = (p: number): void => {
      // Soft feather band sweeps from off-right to off-left as p: 0 → 1.
      // Feather width 38% of section width gives a gentle wash, no visible line.
      const F = 38;
      const start = 100 - p * (100 + F); // black-end  (100 → -F)
      const end = start + F;             // transparent-start (100+F → 0)

      // Subtle diagonal (93deg) for organic imperfection vs pure vertical.
      const gradient =
        `linear-gradient(93deg,` +
        ` rgba(0,0,0,1) 0%,` +
        ` rgba(0,0,0,1) ${start}%,` +
        ` rgba(0,0,0,0) ${end}%,` +
        ` rgba(0,0,0,0) 100%)`;
      morning.style.webkitMaskImage = gradient;
      morning.style.maskImage = gradient;

      // Text crossfade — wide window for smoothness (0.3–0.7 = 40% of scroll).
      const mOp = smoothstep(0.62, 0.3, p); // 1 → 0 across 0.3..0.62
      const eOp = smoothstep(0.38, 0.7, p); // 0 → 1 across 0.38..0.7
      morningText.style.opacity = String(mOp);
      eveningText.style.opacity = String(eOp);
      morningText.style.transform = `translate3d(0, ${(1 - mOp) * -16}px, 0)`;
      eveningText.style.transform = `translate3d(0, ${(1 - eOp) * 16}px, 0)`;

      // Aura progress ring — strokes around the button as scroll advances
      if (progressRingRef.current) {
        progressRingRef.current.style.strokeDashoffset = String(1 - p);
      }
      // Fade the scroll hint as progress completes
      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = String(smoothstep(0.9, 0.7, p));
      }
    };

    apply(0);

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "+=110%",
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 1.2,
      onUpdate: (self) => {
        progress = self.progress;
        apply(progress);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-aubergine"
      style={{ height: "100vh", minHeight: "600px" }}
      role="img"
      aria-label="Morning dissolving into evening — scroll to reveal"
    >
      <SectionDivider fill="cream" variant={2} />
      {/* EVENING base layer */}
      <img
        src={`${BASE_PATH}/images/rituals-evening.webp`}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(61,35,59,0.38) 0%, rgba(61,35,59,0.1) 45%, rgba(61,35,59,0.58) 100%)",
        }}
      />

      {/* MORNING top layer — soft-masked crossfade */}
      <div
        ref={morningLayerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          willChange: "mask-image, -webkit-mask-image",
          WebkitMaskImage:
            "linear-gradient(93deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 100%, rgba(0,0,0,0) 138%, rgba(0,0,0,0) 200%)",
          maskImage:
            "linear-gradient(93deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 100%, rgba(0,0,0,0) 138%, rgba(0,0,0,0) 200%)",
        }}
      >
        <img
          src={`${BASE_PATH}/images/rituals-morning.webp`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(61,35,59,0.3) 0%, rgba(61,35,59,0.08) 45%, rgba(61,35,59,0.5) 100%)",
          }}
        />
      </div>

      {/* MORNING copy */}
      <div
        ref={morningTextRef}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{ willChange: "opacity, transform" }}
      >
        <p className="font-label mb-6 text-[10px] text-cream/75">MORNING</p>
        <h2 className="mb-6 font-serif text-[clamp(2.25rem,5.5vw,4.25rem)] font-light leading-[1.02] text-cream">
          Rise awake,
          <br />
          <em className="italic font-light">with intention</em>
        </h2>
        <p className="max-w-md font-serif text-[clamp(0.95rem,1.5vw,1.125rem)] font-light italic leading-[1.55] text-cream/85">
          Your body speaks before the world does.
        </p>
      </div>

      {/* EVENING copy */}
      <div
        ref={eveningTextRef}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity: 0, willChange: "opacity, transform" }}
      >
        <p className="font-label mb-6 text-[10px] text-cream/75">EVENING</p>
        <h2 className="mb-6 font-serif text-[clamp(2.25rem,5.5vw,4.25rem)] font-light leading-[1.02] text-cream">
          Settle soft,
          <br />
          <em className="italic font-light">held with care</em>
        </h2>
        <p className="max-w-md font-serif text-[clamp(0.95rem,1.5vw,1.125rem)] font-light italic leading-[1.55] text-cream/85">
          The day is done. No more giving, no more noise.
        </p>
      </div>

      {/* AURA-RING progress indicator */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{ bottom: "clamp(56px, 9vh, 104px)" }}
      >
        <div className="relative flex flex-col items-center">
          <svg
            viewBox="0 0 72 72"
            className="h-[72px] w-[72px] overflow-visible"
            fill="none"
            aria-hidden="true"
          >
            {/* Ghost aura — faint oval at rest */}
            <path
              d="M 26,4 C 48,2 66,14 70,32 C 72,52 56,68 40,70 C 22,70 6,58 2,40 C 2,20 12,6 26,4 Z"
              stroke="rgba(255,239,222,0.28)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Progress aura — draws around the oval as scroll advances */}
            <path
              ref={progressRingRef}
              d="M 26,4 C 48,2 66,14 70,32 C 72,52 56,68 40,70 C 22,70 6,58 2,40 C 2,20 12,6 26,4 Z"
              stroke="rgba(255,239,222,0.95)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
              style={{ willChange: "stroke-dashoffset" }}
            />
            {/* Down chevron inside */}
            <g
              stroke="rgba(255,239,222,0.88)"
              strokeWidth="1.3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="29 32 36 40 43 32" />
            </g>
          </svg>
          <div
            ref={scrollHintRef}
            className="mt-3"
            style={{ willChange: "opacity" }}
          >
            <p className="font-label text-[8px] text-cream/55">SCROLL</p>
          </div>
        </div>
      </div>
    </div>
  );
}
