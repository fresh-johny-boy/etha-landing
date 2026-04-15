"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AuraButton from "./AuraButton";

gsap.registerPlugin(ScrollTrigger);

const ritualMoments = [
  { label: "Nourish", imageHint: "Oil pouring on skin, golden light" },
  { label: "Cleanse", imageHint: "Tea ritual, rising steam, morning" },
  { label: "Restore", imageHint: "Hands in self-massage, soft focus" },
];

export default function Rituals(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const morningRef = useRef<HTMLDivElement>(null);
  const eveningRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const trioRef = useRef<HTMLDivElement>(null);

  /* ANIMATIONS DISABLED FOR FIGMA EXPORT
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Morning row — image from left, text from right
      if (morningRef.current) {
        const img = morningRef.current.querySelector(".ritual-image");
        const text = morningRef.current.querySelector(".ritual-text");
        if (img) {
          gsap.from(img, {
            x: -50,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: { trigger: morningRef.current, start: "top 80%" },
          });
        }
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

      // Evening row — reversed
      if (eveningRef.current) {
        const img = eveningRef.current.querySelector(".ritual-image");
        const text = eveningRef.current.querySelector(".ritual-text");
        if (img) {
          gsap.from(img, {
            x: 50,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: { trigger: eveningRef.current, start: "top 80%" },
          });
        }
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

      // Ritual trio stagger
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
  */

  return (
    <section ref={sectionRef} className="relative">
      {/* ── CREAM SECTION: Morning & Evening ── */}
      <div className="bg-cream px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-7xl">
          {/* Section header */}
          <div className="mb-16 max-w-xl md:mb-24">
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
            <div className="ritual-image relative h-[45vh] w-full overflow-hidden md:w-[60%]">
              <div className="absolute inset-0 bg-gradient-to-br from-aubergine/[0.07] via-aubergine/[0.02] to-aubergine/[0.05]" />
              {/* Relaxed aura wrapping from image edge */}
              <svg
                className="pointer-events-none absolute -right-12 -top-8 h-[120%] w-[50%] overflow-visible"
                viewBox="0 0 200 400"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M180,20 C140,40 60,80 40,160 C20,240 80,280 60,340 C40,400 120,380 160,360"
                  stroke="rgba(61,35,59,0.08)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <p className="font-label absolute bottom-4 left-4 text-[9px] text-aubergine/20">
                Hands cupping water, morning light, steam
              </p>
            </div>
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
            <div className="ritual-image relative h-[40vh] w-full overflow-hidden md:w-[55%]">
              <div className="absolute inset-0 bg-gradient-to-bl from-aubergine/[0.07] via-aubergine/[0.02] to-aubergine/[0.05]" />
              <svg
                className="pointer-events-none absolute -left-12 -top-6 h-[110%] w-[45%] overflow-visible"
                viewBox="0 0 180 360"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M20,340 C50,300 140,280 120,200 C100,120 30,100 50,40 C70,-20 140,10 160,60"
                  stroke="rgba(61,35,59,0.08)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <p className="font-label absolute bottom-4 right-4 text-[9px] text-aubergine/20">
                Candle flame, evening sky, hands resting
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── AUBERGINE STRIP: Pull Quote ── */}
      <div className="relative bg-aubergine px-6 py-20 md:px-12 md:py-28">
        {/* Quote aura — cream, flowing behind */}
        <svg
          className="pointer-events-none absolute left-1/2 top-1/2 h-[200%] w-[60vw] -translate-x-1/2 -translate-y-1/2 overflow-visible"
          viewBox="0 0 600 300"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M50,150 C100,50 200,20 300,80 C400,140 500,40 550,150 C500,260 400,280 300,220 C200,160 100,250 50,150"
            stroke="rgba(255,239,222,0.06)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

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
      <div className="bg-cream px-6 py-20 md:px-12 md:py-28">
        <div
          ref={trioRef}
          className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3 md:gap-12"
        >
          {ritualMoments.map((moment) => (
            <div key={moment.label} className="ritual-moment relative">
              {/* Image with aura frame */}
              <div className="relative mb-4">
                <div className="relative h-[280px] w-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-aubergine/[0.05] via-aubergine/[0.02] to-aubergine/[0.04]" />
                  <p className="font-label absolute bottom-3 left-3 text-[8px] text-aubergine/20">
                    {moment.imageHint}
                  </p>
                </div>
                {/* Relaxed aura frame — organic loop around image, slightly offset */}
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
