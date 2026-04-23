"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RitualMoment } from "@/lib/archetypesMock";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const CARD_AURA = "M 190,8 C 268,4 340,12 378,26 C 400,36 404,54 394,70 C 380,88 300,96 196,96 C 92,96 22,88 6,70 C -4,54 2,36 22,24 C 62,10 118,4 190,8 Z";

function BotanicalCard({ moment }: { moment: RitualMoment }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const st = gsap.fromTo(card,
      { opacity: 0, y: 26 },
      {
        opacity: 1, y: 0,
        duration: 1.1,
        ease: "power2.out",
        scrollTrigger: { trigger: card, start: "top 80%", toggleActions: "play none none none" },
      },
    );
    return () => { st.scrollTrigger?.kill(); st.kill(); };
  }, []);

  return (
    <div ref={cardRef} className="relative py-10">
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full overflow-visible"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          d={CARD_AURA}
          stroke="#FFEFDE"
          strokeOpacity="0.22"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="relative px-7 sm:px-10">
        <p className="font-label text-[9px] text-cream/55" style={{ letterSpacing: "0.3em" }}>
          {moment.time.toUpperCase()}
        </p>
        <p
          className="font-serif text-cream mt-2 leading-snug"
          style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)" }}
        >
          {moment.botanical.name}
        </p>
        <p
          className="font-serif italic text-cream/70 mt-4 leading-relaxed"
          style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.1rem)" }}
        >
          {moment.botanical.rationale}
        </p>
      </div>
    </div>
  );
}

export default function BotanicalSection({ moments }: { moments: RitualMoment[] }) {
  return (
    <section className="w-full max-w-xl mx-auto px-7 sm:px-10">
      <p
        className="font-label text-[10px] text-cream/55 mb-4 text-center"
        style={{ letterSpacing: "0.3em" }}
      >
        WHY THIS, FOR YOUR RHYTHM
      </p>
      <div className="space-y-10 mt-8">
        {moments.map((m) => (
          <BotanicalCard key={m.time} moment={m} />
        ))}
      </div>
    </section>
  );
}
