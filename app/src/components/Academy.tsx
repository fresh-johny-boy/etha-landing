"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

  /* ANIMATIONS DISABLED FOR FIGMA EXPORT
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Header — text slides up, hr draws across
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

      // Topic cards stagger — crisper, shorter duration
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
  */

  return (
    <section
      ref={sectionRef}
      className="relative bg-aubergine px-6 py-24 md:px-12 md:py-32"
    >
      {/* Restrained aura — barely visible single line */}
      <svg
        className="pointer-events-none absolute right-[10%] top-0 z-0 h-full w-[40vw] overflow-visible"
        viewBox="0 0 400 1200"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M350,0 C320,100 280,200 300,400 C320,600 280,800 260,1000 C240,1200 300,1100 280,1200"
          stroke="rgba(255,239,222,0.04)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div ref={headerRef} className="mb-16 max-w-2xl md:mb-20">
          <p className="font-label mb-6 text-[11px] tracking-[0.3em] text-cream/40">
            ETHA ACADEMY
          </p>
          <div className="mb-6 h-[1px] w-[100px] bg-cream/20" />
          <h2 className="mb-6 font-serif text-[clamp(1.75rem,4.5vw,3.25rem)] font-semibold leading-[1.0] text-cream">
            5,000 years of wisdom can feel like a lot
          </h2>
          <p className="max-w-lg font-serif text-[16px] font-light leading-[1.5] text-cream/70">
            But you don&apos;t have to figure it out alone. A space to
            understand the why behind what works — through short lessons rooted
            in Ayurvedic wisdom and shaped for modern life.
          </p>
        </div>

        {/* Video placeholder */}
        <div
          ref={videoRef}
          className="relative mb-20 aspect-video w-full overflow-hidden md:mb-24 md:w-[85%] md:mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cream/[0.04] via-cream/[0.01] to-cream/[0.03]" />
          {/* Play button */}
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center border border-cream/30">
              <svg
                viewBox="0 0 24 24"
                className="ml-1 h-5 w-5 text-cream/60"
                fill="currentColor"
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
            <span className="font-label text-[10px] text-cream/40">
              WATCH INTRODUCTION
            </span>
          </div>
          {/* Subtle aura tracing top edge */}
          <svg
            className="pointer-events-none absolute -top-2 left-0 h-8 w-full overflow-visible"
            viewBox="0 0 1000 30"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,15 C200,5 400,25 600,10 C800,-5 1000,20 1000,15"
              stroke="rgba(255,239,222,0.08)"
              strokeWidth="0.75"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Guru row */}
        <div ref={guruRowRef} className="mb-20 md:mb-24">
          <p className="mb-8 font-serif text-[14px] italic text-cream/40">
            Learn from the source
          </p>
          <div className="grid gap-8 md:grid-cols-3 md:gap-10">
            {gurus.map((guru) => (
              <div key={guru.name} className="guru-card">
                {/* Sharp rectangular portrait */}
                <div className="relative mb-4 h-[300px] w-full overflow-hidden md:h-[340px]">
                  <div className="absolute inset-0 bg-gradient-to-b from-cream/[0.04] via-cream/[0.01] to-cream/[0.03]" />
                  <p className="font-label absolute bottom-3 left-3 text-[8px] text-cream/15">
                    {guru.imageHint}
                  </p>
                </div>
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

        {/* CTA — hidden on mobile */}
        <div className="mt-16 hidden justify-center md:mt-20 md:flex">
          <a
            href="#academy"
            className="font-label group relative inline-flex items-center justify-center border border-cream/30 px-8 py-4 text-[11px] text-cream transition-colors duration-300 hover:bg-cream/[0.06]"
          >
            EXPLORE THE ACADEMY
          </a>
        </div>
      </div>
    </section>
  );
}
