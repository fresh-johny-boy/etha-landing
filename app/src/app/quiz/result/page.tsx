"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Nav from "@/components/Nav";

export default function QuizResultPage() {
  const textRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(textRef.current,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 1.4, ease: "expo.out", delay: 0.3 }
      );
      if (lineRef.current)
        gsap.to(lineRef.current, {
          scaleX: 1, duration: 1.8, ease: "expo.out", delay: 1.1,
          transformOrigin: "left center",
        });
    });
    return () => ctx.revert();
  }, []);

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-aubergine">
      <Nav variant="light" hideLinks progress={1} className="pt-10 pb-16 md:pt-14 md:pb-20" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div ref={textRef} style={{ opacity: 0 }}>
          <p
            className="font-serif text-cream"
            style={{ fontSize: "clamp(2.2rem, 7vw, 5rem)", lineHeight: 1.1 }}
          >
            Your map is forming.
          </p>
          <div
            ref={lineRef}
            className="mx-auto mt-8 h-px bg-cream/25"
            style={{ width: 64, transform: "scaleX(0)" }}
          />
          <p
            className="font-serif text-cream/45 mt-8 italic"
            style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.15rem)" }}
          >
            This will take just a moment.
          </p>
        </div>
      </div>
    </main>
  );
}
