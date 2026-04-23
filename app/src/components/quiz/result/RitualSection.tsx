"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RitualMoment } from "@/lib/archetypesMock";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

function Moment({ moment, index }: { moment: RitualMoment; index: number }) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const st = gsap.fromTo(row,
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0,
        duration: 1.0,
        ease: "power2.out",
        scrollTrigger: { trigger: row, start: "top 78%", toggleActions: "play none none none" },
      },
    );
    return () => { st.scrollTrigger?.kill(); st.kill(); };
  }, []);

  return (
    <div ref={rowRef} className="relative pl-10 sm:pl-14 pb-12 last:pb-0">
      {/* Left-aligned vertical aura thread */}
      <div
        aria-hidden="true"
        className="absolute left-3 top-3 bottom-0 w-px bg-cream/25"
        style={{ display: index === 2 ? "none" : undefined }}
      />
      <span
        aria-hidden="true"
        className="absolute left-[10px] top-[10px] block"
        style={{ width: 7, height: 7, background: "#FFEFDE", opacity: 0.85 }}
      />

      <p className="font-label text-[10px] text-cream/60" style={{ letterSpacing: "0.3em" }}>
        {moment.time.toUpperCase()} · {moment.label}
      </p>
      <p
        className="font-serif text-cream mt-3 leading-relaxed"
        style={{ fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)" }}
      >
        {moment.body}
      </p>
      <p className="font-label text-[9px] text-cream/55 mt-5" style={{ letterSpacing: "0.3em" }}>
        WITH
      </p>
      <p
        className="font-serif text-cream mt-1 leading-snug"
        style={{ fontSize: "clamp(1rem, 2.4vw, 1.2rem)" }}
      >
        {moment.botanical.name}
      </p>
      <p
        className="font-serif italic text-cream/65 mt-1 leading-relaxed"
        style={{ fontSize: "clamp(0.92rem, 2.1vw, 1.05rem)" }}
      >
        {moment.botanical.subtitle}
      </p>
    </div>
  );
}

export default function RitualSection({ moments }: { moments: RitualMoment[] }) {
  return (
    <section className="w-full max-w-xl mx-auto px-7 sm:px-10">
      <p
        className="font-label text-[10px] text-cream/55 mb-9 text-center"
        style={{ letterSpacing: "0.3em" }}
      >
        YOUR RITUAL
      </p>
      <div>
        {moments.map((m, i) => (
          <Moment key={m.time} moment={m} index={i} />
        ))}
      </div>
    </section>
  );
}
