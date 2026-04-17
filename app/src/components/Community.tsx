"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionDivider from "./SectionDivider";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote:
      "I didn\u2019t think a Dosha test would tell me anything new. I\u2019ve done so many wellness things that left me feeling the same. But \u0112tha was different \u2014 it helped me finally understand why I crash every afternoon, and what to actually do about it. I made two tiny changes in my morning and everything feels lighter.",
    name: "Lina",
    location: "31",
    imageHint: "Candid face, real emotion, natural light",
    rotation: "-1.5deg",
    position: "left" as const,
  },
  {
    quote:
      "I\u2019ve never been a \u2018rituals\u2019 person. I thought that stuff was for people with way more time or discipline than me. But starting small, literally just breathing at the window in the morning, gave me a sense of calm I haven\u2019t felt in years. I didn\u2019t need a routine. I needed something real.",
    name: "Maya",
    location: "38",
    imageHint: "Hands making tea, intimate morning moment",
    rotation: "1deg",
    position: "right" as const,
  },
  {
    quote:
      "Honestly, I thought this was just another wellness trend. But I was burnt out and disconnected from myself, so I tried. Learning about my Dosha helped me understand my patterns, my anxiety, even my digestion. I feel more like myself than I have in a long time \u2014 and I didn\u2019t have to become someone new to get here.",
    name: "Anita",
    location: "42",
    imageHint: "Candid group moment, warmth, laughter",
    rotation: "-0.5deg",
    position: "center" as const,
  },
];

const stats = [
  { number: "47,000+", label: "JOURNEYS BEGUN" },
  { number: "85+", label: "COUNTRIES REACHED" },
  { number: "12", label: "LANGUAGES SPOKEN" },
];

export default function Community(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<(HTMLDivElement | null)[]>([]);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Section header floats in
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          y: 25,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
          },
        });
      }

      // Testimonials stagger in from slightly different directions
      testimonialsRef.current.forEach((el, i) => {
        if (!el) return;
        const xOffsets = [-30, 30, 0];
        gsap.from(el, {
          x: xOffsets[i],
          y: 40,
          opacity: 0,
          rotation: Number(testimonials[i].rotation.replace("deg", "")) * 2,
          duration: 0.9,
          delay: i * 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        });
      });

      // Stats — numbers could count up but keeping it simple with fade
      if (statsRef.current) {
        gsap.from(statsRef.current.children, {
          y: 20,
          opacity: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 90%",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-cream px-6 py-24 md:px-12 md:py-32"
    >
      <SectionDivider fill="aubergine" variant={0} />
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div ref={headerRef} className="mb-16 md:mb-24">
          <p className="mb-4 font-serif text-sm italic text-aubergine/50">
            — Our Community
          </p>
          <h2 className="max-w-md font-serif text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.1] text-aubergine">
            Welcome home to yourself
          </h2>
        </div>

        {/* Testimonials — scattered layout */}
        <div className="relative space-y-12 md:space-y-0 md:min-h-[700px]">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              ref={(node) => {
                testimonialsRef.current[i] = node;
              }}
              className={`relative md:absolute ${
                t.position === "left"
                  ? "md:left-0 md:top-0 md:max-w-[480px]"
                  : t.position === "right"
                    ? "md:right-0 md:top-[180px] md:max-w-[440px]"
                    : "md:left-[10%] md:top-[420px] md:max-w-[500px]"
              }`}
              style={{ transform: `rotate(${t.rotation})` }}
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-6">
                {/* Image */}
                <div className="relative z-10 h-[160px] w-[140px] shrink-0 overflow-hidden md:h-[180px] md:w-[150px]">
                  <div className="absolute inset-0 bg-gradient-to-b from-aubergine/[0.06] via-aubergine/[0.02] to-aubergine/[0.04]" />
                  <p className="font-label absolute bottom-2 left-2 text-[7px] text-aubergine/15">
                    {t.imageHint}
                  </p>
                </div>

                {/* Quote */}
                <div>
                  <p className="mb-3 font-serif text-[clamp(1rem,2vw,1.35rem)] font-normal italic leading-[1.4] text-aubergine/80">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p className="font-serif text-[13px] font-light italic text-aubergine/45">
                    — {t.name}, {t.location}
                  </p>

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div
          ref={statsRef}
          className="mt-16 flex flex-col items-center justify-center gap-10 border-t border-aubergine/10 pt-12 md:mt-24 md:flex-row md:gap-20 md:pt-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="mb-1 font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-semibold text-aubergine">
                {stat.number}
              </p>
              <p className="font-label text-[10px] text-aubergine/40">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
