"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AuraButton from "./AuraButton";
import SectionDivider from "./SectionDivider";
import BlobImage from "./BlobImage";
import {
  SHAPE_MORNING,
  SHAPE_EVENING,
  SHAPE_NOURISH,
  SHAPE_CLEANSE,
  SHAPE_RESTORE,
} from "./auraShapes";

gsap.registerPlugin(ScrollTrigger);

const ritualMoments = [
  { label: "Nourish", imageHint: "Oil pouring on skin, golden light", shape: SHAPE_NOURISH },
  { label: "Cleanse", imageHint: "Tea ritual, rising steam, morning", shape: SHAPE_CLEANSE },
  { label: "Restore", imageHint: "Hands in self-massage, soft focus", shape: SHAPE_RESTORE },
];

export default function Rituals(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const morningRef = useRef<HTMLDivElement>(null);
  const eveningRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const trioRef = useRef<HTMLDivElement>(null);

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

      // Morning row — text slides in from right (image animation handled by BlobImage)
      if (morningRef.current) {
        const text = morningRef.current.querySelector(".ritual-text");
        if (text) {
          gsap.from(text, {
            x: 40,
            opacity: 0,
            duration: 1,
            delay: 0.15,
            ease: "power2.out",
            scrollTrigger: { trigger: morningRef.current, start: "top 80%" },
          });
        }
      }

      // Evening row — reversed text slide
      if (eveningRef.current) {
        const text = eveningRef.current.querySelector(".ritual-text");
        if (text) {
          gsap.from(text, {
            x: -40,
            opacity: 0,
            duration: 1,
            delay: 0.15,
            ease: "power2.out",
            scrollTrigger: { trigger: eveningRef.current, start: "top 80%" },
          });
        }
      }

      // Pull quote
      if (quoteRef.current) {
        gsap.from(quoteRef.current, {
          opacity: 0,
          y: 20,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: quoteRef.current, start: "top 85%" },
        });
      }

      // Ritual trio stagger — text only; images morph via BlobImage
      if (trioRef.current) {
        const labels = trioRef.current.querySelectorAll(".ritual-moment .ritual-label");
        gsap.from(labels, {
          y: 20,
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
      {/* ── CREAM SECTION: Morning & Evening ── */}
      <div className="bg-cream px-6 py-24 md:px-12 md:py-32">
        <div className="relative z-10 mx-auto max-w-7xl">
          {/* Section header */}
          <div ref={headerRef} className="mb-16 max-w-xl md:mb-24">
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

          {/* Row 1: Morning — image left, text right */}
          <div
            ref={morningRef}
            className="mb-16 flex flex-col gap-8 md:mb-24 md:flex-row md:items-center md:gap-12"
          >
            <BlobImage
              shape={SHAPE_MORNING}
              variant="on-cream"
              placeholderHint="Hands cupping water, morning light, steam"
              breathDir="right"
              className="ritual-image h-[45vh] w-full md:w-[60%]"
            />
            <div className="ritual-text max-w-md md:w-[40%]">
              <h3 className="mb-4 font-serif text-[clamp(1.25rem,2.5vw,1.75rem)] font-semibold leading-[1.2] text-aubergine">
                Your morning can shape your entire day
              </h3>
              <p className="font-serif text-[15px] font-light leading-[1.6] text-aubergine/60">
                What if something as simple as drinking a cup of your
                Dosha&apos;s tea could shift everything — your mood, your focus,
                your pace? Small rituals. Big impact.
              </p>
            </div>
          </div>

          {/* Row 2: Evening — text left, image right */}
          <div
            ref={eveningRef}
            className="flex flex-col-reverse gap-8 md:flex-row md:items-center md:gap-12"
          >
            <div className="ritual-text max-w-md md:w-[40%]">
              <h3 className="mb-4 font-serif text-[clamp(1.25rem,2.5vw,1.75rem)] font-semibold leading-[1.2] text-aubergine">
                Your evening sets the tone for your inner world
              </h3>
              <p className="font-serif text-[15px] font-light leading-[1.6] text-aubergine/60">
                Lighting a candle before bed. Let it be a signal — the day is
                done. No more giving, no more noise. Small ritual. Deep release.
              </p>
            </div>
            <BlobImage
              shape={SHAPE_EVENING}
              variant="on-cream"
              placeholderHint="Candle flame, evening sky, hands resting"
              breathDir="left"
              breathDelay={0.4}
              className="ritual-image h-[40vh] w-full md:w-[55%]"
            />
          </div>
        </div>
      </div>

      {/* ── AUBERGINE STRIP: Pull Quote ── */}
      <div className="relative bg-aubergine px-6 py-20 md:px-12 md:py-28">
        <SectionDivider fill="cream" variant={2} />
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
        <SectionDivider fill="aubergine" variant={3} flipX />
        <div
          ref={trioRef}
          className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3 md:gap-12"
        >
          {ritualMoments.map((moment, i) => (
            <div key={moment.label} className="ritual-moment relative">
              <BlobImage
                shape={moment.shape}
                variant="on-cream"
                placeholderHint={moment.imageHint}
                breathDir={i % 2 === 0 ? "right" : "left"}
                breathDelay={i * 0.25}
                className="mb-4 h-[280px] w-full"
              />
              <p className="ritual-label font-serif text-[14px] italic text-aubergine/60">
                — {moment.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA — hidden on mobile */}
        <div className="mt-16 hidden justify-center md:mt-20 md:flex">
          <AuraButton href="#rituals" className="text-aubergine">
            FIND YOUR RITUALS
          </AuraButton>
        </div>
      </div>
    </section>
  );
}
