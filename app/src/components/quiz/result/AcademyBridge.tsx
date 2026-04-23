"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { QuizCTAButton } from "../QuizCTAButton";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function AcademyBridge() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const items = Array.from(wrap.querySelectorAll("[data-reveal]"));
    const st = gsap.fromTo(items,
      { opacity: 0, y: 18 },
      {
        opacity: 1, y: 0,
        duration: 1.0,
        ease: "power2.out",
        stagger: 0.18,
        scrollTrigger: { trigger: wrap, start: "top 82%", toggleActions: "play none none none" },
      },
    );
    return () => { st.scrollTrigger?.kill(); st.kill(); };
  }, []);

  const onAcademy = () => { window.location.href = "/#academy"; };
  const onRetake  = () => { window.location.href = "/quiz"; };

  return (
    <section ref={wrapRef} className="w-full max-w-md mx-auto px-7 sm:px-10 text-center">
      <h2
        data-reveal
        className="font-serif text-cream leading-[1.05]"
        style={{ fontSize: "clamp(2rem, 6vw, 3.4rem)" }}
      >
        This was the first returning.
      </h2>
      <p
        data-reveal
        className="font-serif italic text-cream/70 mt-5 leading-relaxed"
        style={{ fontSize: "clamp(1rem, 2.4vw, 1.15rem)" }}
      >
        There is more. Slow, patient, honest. When you are ready.
      </p>

      <div data-reveal className="mt-10">
        <QuizCTAButton label="CONTINUE YOUR REMEMBERING" onClick={onAcademy} />
      </div>

      <button
        data-reveal
        onClick={onRetake}
        className="font-label text-[10px] text-cream/55 mt-10 hover:text-cream/85 transition-colors cursor-pointer"
        style={{ letterSpacing: "0.3em" }}
      >
        TAKE THE MAPPING AGAIN
      </button>
    </section>
  );
}
