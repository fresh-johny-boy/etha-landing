"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AuraButton from "./AuraButton";
import BlobImage from "./BlobImage";
import SectionDivider from "./SectionDivider";
import {
  SEED,
  SHAPE_DIVIDER,
  SHAPE_GURU_A,
  SHAPE_GURU_B,
  SHAPE_GURU_C,
  SHAPE_PLAY,
  SHAPE_VIDEO,
} from "./auraShapes";

gsap.registerPlugin(ScrollTrigger);

const GURU_SHAPES = [SHAPE_GURU_A, SHAPE_GURU_B, SHAPE_GURU_C];

const gurus = [
  {
    name: "Dr. Vasant Lad",
    title: "AYURVEDIC PHYSICIAN & AUTHOR",
    imageHint: "Portrait — thinker, direct gaze, editorial lighting",
  },
  {
    name: "Dr. Robert Svoboda",
    title: "AUTHOR & JYOTISH SCHOLAR",
    imageHint: "Portrait — contemplative, natural light",
  },
  {
    name: "Maya Tiwari",
    title: "VEDIC PRACTITIONER & TEACHER",
    imageHint: "Portrait — warm presence, serene authority",
  },
];

const stats = [
  { number: "50+", label: "EXPERTS" },
  { number: "20+", label: "NATIONS" },
  { number: "7+", label: "YEARS OF DEDICATION" },
  { number: "3k+", label: "HOURS OF LEARNING" },
];

export default function Academy(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const guruRowRef = useRef<HTMLDivElement>(null);
  const topicGridRef = useRef<HTMLDivElement>(null);
  const playFillRef = useRef<SVGPathElement>(null);
  const playStrokeRef = useRef<SVGPathElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const dividerPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Header — text slides up
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
          },
        });
      }

      // Organic divider line — draws in via strokeDashoffset
      if (dividerPathRef.current) {
        const path = dividerPathRef.current;
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
          },
        });
      }

      // Video — scales from 95% to 100%
      if (videoRef.current) {
        gsap.from(videoRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: videoRef.current,
            start: "top 80%",
          },
        });
      }

      // Play button — fill and stroke both morph from seed → blob on scroll
      if (playFillRef.current) {
        gsap.fromTo(
          playFillRef.current,
          { attr: { d: SEED } },
          {
            attr: { d: SHAPE_PLAY },
            ease: "none",
            scrollTrigger: {
              trigger: videoRef.current,
              start: "top 85%",
              end: "top 45%",
              scrub: 0.4,
            },
          }
        );
      }
      if (playStrokeRef.current) {
        gsap.fromTo(
          playStrokeRef.current,
          { attr: { d: SEED }, strokeOpacity: 0 },
          {
            attr: { d: SHAPE_PLAY },
            strokeOpacity: 0.65,
            ease: "none",
            scrollTrigger: {
              trigger: videoRef.current,
              start: "top 85%",
              end: "top 45%",
              scrub: 0.4,
            },
          }
        );
      }

      // Gentle breathing for the play button
      if (playBtnRef.current) {
        gsap.to(playBtnRef.current, {
          scale: 1.04,
          duration: 3.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      // Guru portraits stagger
      if (guruRowRef.current) {
        const portraits = guruRowRef.current.querySelectorAll(".guru-card");
        gsap.from(portraits, {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: guruRowRef.current,
            start: "top 85%",
          },
        });
      }

      // Stats stagger
      if (topicGridRef.current) {
        const cards = topicGridRef.current.querySelectorAll(".topic-card");
        gsap.from(cards, {
          y: 25,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: topicGridRef.current,
            start: "top 85%",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-aubergine px-6 py-24 md:px-12 md:py-32"
    >
      <SectionDivider fill="cream" variant={4} />
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div ref={headerRef} className="mb-16 max-w-2xl md:mb-20">
          <p className="font-label mb-6 text-[11px] tracking-[0.3em] text-cream/40">
            ETHA ACADEMY
          </p>
          {/* Organic aura divider — replaces 1px rectangular line */}
          <svg
            className="mb-6 h-3 w-[120px] overflow-visible"
            viewBox="0 0 100 8"
            fill="none"
            aria-hidden="true"
          >
            <path
              ref={dividerPathRef}
              d={SHAPE_DIVIDER}
              stroke="#FFEFDE"
              strokeOpacity="0.35"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <h2 className="mb-6 font-serif text-[clamp(1.75rem,4.5vw,3.25rem)] font-semibold leading-[1.0] text-cream">
            5,000 years of wisdom can feel like a lot
          </h2>
          <p className="max-w-lg font-serif text-[16px] font-light leading-[1.5] text-cream/70">
            But you don&apos;t have to figure it out alone. A space to
            understand the why behind what works — through short lessons rooted
            in Ayurvedic wisdom and shaped for modern life.
          </p>
        </div>

        {/* Video — blob-masked frame with blob-shaped play button inside */}
        <div
          ref={videoRef}
          className="relative z-10 mb-20 aspect-video w-full md:mb-24 md:w-[85%] md:mx-auto"
        >
          <BlobImage
            shape={SHAPE_VIDEO}
            variant="on-aubergine"
            breathDir="right"
            className="h-full w-full"
          />
          {/* Blob-shaped play button — sits above the video blob */}
          <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-4">
            <button
              ref={playBtnRef}
              type="button"
              aria-label="Watch introduction"
              className="group relative flex h-[88px] w-[88px] items-center justify-center will-change-transform"
            >
              <svg
                className="absolute inset-0 h-full w-full overflow-visible"
                viewBox="0 0 1 1"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  ref={playFillRef}
                  d={SEED}
                  fill="rgba(255,239,222,0.10)"
                  stroke="none"
                  className="transition-[fill] duration-300 ease-out group-hover:[fill:rgba(255,239,222,0.18)]"
                />
                <path
                  ref={playStrokeRef}
                  d={SEED}
                  fill="none"
                  stroke="#FFEFDE"
                  strokeWidth="0.008"
                  strokeOpacity="0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <svg
                viewBox="0 0 24 24"
                className="relative z-10 ml-1 h-5 w-5 text-cream/90 transition-colors duration-300 group-hover:text-cream"
                fill="currentColor"
                aria-hidden="true"
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </button>
            <span className="font-label text-[10px] text-cream/60">
              WATCH INTRODUCTION
            </span>
          </div>
        </div>

        {/* Guru row */}
        <div ref={guruRowRef} className="mb-20 md:mb-24">
          <p className="mb-8 font-serif text-[14px] italic text-cream/40">
            Learn from the source
          </p>
          <div className="grid gap-8 md:grid-cols-3 md:gap-10">
            {gurus.map((guru, i) => (
              <div key={guru.name} className="guru-card">
                <BlobImage
                  shape={GURU_SHAPES[i]}
                  variant="on-aubergine"
                  placeholderHint={guru.imageHint}
                  breathDir={i % 2 === 0 ? "right" : "left"}
                  breathDelay={i * 0.3}
                  className="mb-4 h-[300px] w-full md:h-[340px]"
                />
                <p className="mb-1 font-serif text-[18px] text-cream">
                  {guru.name}
                </p>
                <p className="font-label text-[10px] text-cream/40">
                  {guru.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div
          ref={topicGridRef}
          className="mb-16 flex flex-wrap items-center justify-center gap-10 md:mb-20 md:gap-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="topic-card text-center">
              <p className="mb-1 font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-semibold text-cream">
                {stat.number}
              </p>
              <p className="font-label text-[9px] text-cream/40">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="mx-auto max-w-xl text-center">
          <p className="font-serif text-[16px] font-light leading-[1.6] text-cream/60">
            Here, knowledge becomes practice. And learning happens alongside
            others walking the same path.
          </p>
        </div>

        {/* CTA — aura border replaces rectangular button, hidden on mobile */}
        <div className="mt-16 hidden justify-center md:mt-20 md:flex">
          <AuraButton href="#academy" className="text-cream">
            EXPLORE THE ACADEMY
          </AuraButton>
        </div>
      </div>
    </section>
  );
}
