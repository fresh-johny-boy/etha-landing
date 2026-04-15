"use client";

import { useRef } from "react";
import AuraButton from "./AuraButton";

export default function Hero(): React.ReactElement {
  const labelRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative min-h-dvh bg-cream">
      {/* Hero image placeholder — full width, top portion */}
      <div className="relative h-[55vh] w-full overflow-hidden md:h-[65vh]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(200,190,180,0.4) 0%, rgba(180,170,160,0.6) 30%, rgba(160,155,150,0.5) 60%, rgba(220,210,200,0.3) 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, rgba(160,140,120,0.4) 0%, transparent 70%), radial-gradient(ellipse at 70% 40%, rgba(180,200,210,0.3) 0%, transparent 60%)",
          }}
        />
        <div className="font-label absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-aubergine/30">
          Nature image placeholder
        </div>
      </div>

      {/* Aura line — flows from image area down through the content */}
      <svg
        className="pointer-events-none absolute right-0 top-[30vh] z-10 h-[70vh] w-[60vw] md:w-[45vw]"
        viewBox="0 0 600 700"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M600,50 C500,80 420,160 380,250 C340,340 380,400 350,480 C320,560 240,600 200,650 C160,700 100,700 50,680"
          stroke="rgba(61,35,59,0.08)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Text content — overlaps the bottom of the image */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 md:px-12">
        <div className="-mt-12 max-w-xl md:-mt-20">
          {/* Label */}
          <p
            ref={labelRef}
            className="mb-4 font-serif text-sm italic text-aubergine/60"
          >
            — Etha
          </p>

          {/* Headline */}
          <h1
            ref={headlineRef}
            className="mb-6 font-serif text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1.1] text-aubergine"
          >
            Return to the source
          </h1>

          {/* Body */}
          <p
            ref={bodyRef}
            className="mb-8 max-w-md font-serif text-[15px] font-light leading-[1.6] text-aubergine/70"
          >
            Get clarity who you are and what you really need today
          </p>

          {/* CTA — hidden on mobile, sticky MobileCTA handles it */}
          <div ref={ctaRef} className="hidden md:block">
            <AuraButton href="#quiz" className="text-aubergine">
              BEGIN SELF-DISCOVERY
            </AuraButton>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-1">
          <div className="h-6 w-[1px] bg-aubergine/20" />
          <div className="h-1.5 w-1.5 rounded-full bg-aubergine/30" />
        </div>
      </div>
    </section>
  );
}
