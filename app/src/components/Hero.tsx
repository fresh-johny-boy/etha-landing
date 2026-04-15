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
    <section className="relative h-dvh bg-cream">
      {/* Hero image placeholder — full viewport */}
      <div className="absolute inset-0 overflow-hidden">
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
      </div>

      {/* Text content — absolutely positioned over the image */}
      <div className="absolute bottom-[12vh] left-0 z-20 w-full px-6 md:bottom-[14vh] md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-xl">
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
              className="mb-6 font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.05] text-aubergine"
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
