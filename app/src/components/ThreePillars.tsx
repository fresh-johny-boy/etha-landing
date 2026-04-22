"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AuraButton from "./AuraButton";

gsap.registerPlugin(ScrollTrigger);

const pillars = [
  {
    label: "A Sea of Calm",
    heading: "Everything is connected",
    body: "Sleep, digestion, energy, emotion, skin \u2014 nothing exists in isolation. Ayurveda reminds us to look at the whole, not the parts.",
    icon: (
      <svg viewBox="0 0 60 60" className="h-12 w-12" aria-hidden="true">
        <path
          d="M10,35 Q20,25 30,35 Q40,45 50,35"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M10,40 Q20,30 30,40 Q40,50 50,40"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
        <circle cx="30" cy="20" r="8" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </svg>
    ),
  },
  {
    label: "Digestive Fire",
    heading: "Well-being starts from within",
    body: "The modern world is loud. It tells you to meditate, to speed up, to chase calm like a checklist. But if a practice isn\u2019t crafted for you, it stays a task.",
    icon: (
      <svg viewBox="0 0 60 60" className="h-12 w-12" aria-hidden="true">
        <path
          d="M30,50 C20,50 12,42 12,32 C12,20 30,8 30,8 C30,8 48,20 48,32 C48,42 40,50 30,50Z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M30,45 C25,45 21,40 21,35 C21,28 30,20 30,20 C30,20 39,28 39,35 C39,40 35,45 30,45Z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          opacity="0.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Night\u2019s Embrace",
    heading: "Balance creates perfection",
    body: "This is not a trend. It\u2019s your bio-individual blueprint. A 5,000-year-old bridge between ancient Ayurvedic truth and our modern chaos.",
    icon: (
      <svg viewBox="0 0 60 60" className="h-12 w-12" aria-hidden="true">
        <path
          d="M35,10 C25,10 17,18 17,28 C17,38 25,46 35,46 C28,44 23,37 23,28 C23,19 28,12 35,10Z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="40" cy="15" r="1" fill="currentColor" opacity="0.4" />
        <circle cx="45" cy="22" r="0.8" fill="currentColor" opacity="0.3" />
        <circle cx="42" cy="30" r="1.2" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
];

export default function ThreePillars(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);

  /* ANIMATIONS DISABLED FOR FIGMA EXPORT
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          delay: i * 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        });
      });

      if (ctaRef.current) {
        gsap.from(ctaRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 90%",
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
      className="relative bg-cream px-6 py-24 md:px-12 md:py-32"
    >
      {/* Aura line continuing from hero */}
      <svg
        className="pointer-events-none absolute left-0 top-0 z-0 h-full w-[50vw] md:w-[35vw]"
        viewBox="0 0 500 800"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M-50,0 C50,100 150,80 120,200 C90,320 20,350 50,450 C80,550 200,520 180,650 C160,780 50,800 -20,780"
          stroke="rgba(61,35,59,0.06)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Three columns */}
        <div className="grid gap-12 md:grid-cols-3 md:gap-16">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.label}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="flex flex-col items-center text-center"
            >
              {/* Icon */}
              <div className="mb-6 text-aubergine/50">{pillar.icon}</div>

              {/* Label */}
              <p className="mb-3 font-serif text-sm italic text-aubergine/50">
                — {pillar.label}
              </p>

              {/* Heading */}
              <h3 className="mb-4 font-serif text-xl font-semibold leading-[1.2] text-aubergine md:text-2xl">
                {pillar.heading}
              </h3>

              {/* Body */}
              <p className="max-w-xs font-serif text-[14px] font-light leading-[1.6] text-aubergine/60">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>

        {/* CTA — hidden on mobile */}
        <div ref={ctaRef} className="mt-16 hidden justify-center md:mt-20 md:flex">
          <AuraButton href="/quiz" className="text-aubergine">
            DISCOVER YOUR DOSHA
          </AuraButton>
        </div>
      </div>
    </section>
  );
}
