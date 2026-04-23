"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function ScienceSection({ paragraphs }: { paragraphs: string[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const items = Array.from(wrap.querySelectorAll("[data-reveal]"));
    const st = gsap.fromTo(items,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 1.0,
        ease: "power2.out",
        stagger: 0.22,
        scrollTrigger: { trigger: wrap, start: "top 75%", toggleActions: "play none none none" },
      },
    );
    return () => { st.scrollTrigger?.kill(); st.kill(); };
  }, []);

  return (
    <section ref={wrapRef} className="w-full max-w-xl mx-auto px-7 sm:px-10">
      <p
        data-reveal
        className="font-label text-[10px] text-cream/55 mb-7 text-center"
        style={{ letterSpacing: "0.3em" }}
      >
        WHY THIS, IN MODERN TERMS
      </p>
      <div className="space-y-7">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            data-reveal
            className="font-serif text-cream/90 leading-relaxed"
            style={{ fontSize: "clamp(1.05rem, 2.6vw, 1.3rem)" }}
          >
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
