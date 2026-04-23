"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const AURA_PATH =
  "M210,25 C290,5 370,35 378,95 C386,155 350,215 270,238 C190,260 110,245 65,195 C20,145 28,72 95,44 C135,26 155,38 210,25 Z";

export default function QuizSent({ onAdvance }: { onAdvance: () => void }) {
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);
  const line3Ref = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calledRef = useRef(false);

  function advance() {
    if (calledRef.current) return;
    calledRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    onAdvance();
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(
        [headlineRef.current, line1Ref.current, line2Ref.current, line3Ref.current],
        { opacity: 0, y: 18 }
      );

      gsap.to(headlineRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "power2.out",
        delay: 0.3,
      });

      gsap.to(line1Ref.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        delay: 0.9,
      });

      gsap.to(line2Ref.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        delay: 1.5,
      });

      gsap.to(line3Ref.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        delay: 2.1,
      });
    });

    timerRef.current = setTimeout(advance, 8000);

    return () => {
      ctx.revert();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#3D233B" }}
      onClick={advance}
    >
      {/* Decorative balanced aura */}
      <svg
        viewBox="0 0 430 270"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          pointerEvents: "none",
        }}
      >
        <path
          d={AURA_PATH}
          fill="none"
          stroke="#FFEFDE"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.06"
        />
      </svg>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full px-8 text-center">
        <h1
          ref={headlineRef}
          className="font-serif text-cream"
          style={{ fontSize: "clamp(1.75rem, 5vw, 2.75rem)", lineHeight: 1.2, marginBottom: "2rem" }}
        >
          Your map is on its way.
        </h1>

        <p
          ref={line1Ref}
          className="font-serif text-cream"
          style={{
            fontStyle: "italic",
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            lineHeight: 1.6,
            opacity: 0,
            marginBottom: "1.5rem",
            color: "rgba(255,239,222,0.65)",
          }}
        >
          Check your inbox. Something made for you alone is arriving.
        </p>

        <p
          ref={line2Ref}
          className="font-serif"
          style={{
            fontStyle: "italic",
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            lineHeight: 1.6,
            opacity: 0,
            marginBottom: "1.5rem",
            color: "rgba(255,239,222,0.65)",
          }}
        >
          Take a breath. You just did something most people never do.
        </p>

        <p
          ref={line3Ref}
          className="font-serif"
          style={{
            fontStyle: "italic",
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            lineHeight: 1.6,
            opacity: 0,
            color: "rgba(255,239,222,0.65)",
          }}
        >
          You listened.
        </p>
      </div>
    </div>
  );
}
