"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";

/* Journey-shape wave: starts low (y=7), ascends through the middle (y=3 at 55%)
   and settles at y=4. Reads as ascent, not flat timeline. pathLength="1"
   keeps the progress-dasharray math unchanged. */
const WAVE_D = "M 0,7 C 100,7.5 200,5.5 300,5 C 380,4.5 470,3.2 550,3 C 620,2.8 700,4.5 750,5 C 840,5.5 930,3.8 1000,4";

const SECTION_ICONS = {
  BODY: {
    viewBox: "22 8 66 76",
    paths: [
      { d: "M 55 12 C 45 10 38 18 38 28 C 38 38 46 44 55 44 C 64 44 72 38 72 28 C 72 18 65 10 55 12 Z", sw: 1.8 },
      { d: "M 28 62 C 36 52 46 48 55 48 C 64 48 74 52 82 62", sw: 1.8 },
      { d: "M 55 44 C 55 50 54 56 55 64", sw: 1.8 },
    ],
  },
  MIND: {
    viewBox: "18 6 74 60",
    paths: [
      { d: "M 24 36 C 32 12 78 12 86 36", sw: 1.8 },
      { d: "M 24 36 C 32 60 78 60 86 36", sw: 1.8 },
      { d: "M 51 36 C 51 30 59 30 59 36 C 59 42 51 42 51 36 Z", sw: 1.8 },
    ],
  },
  SPIRIT: {
    viewBox: "18 10 74 78",
    paths: [
      { d: "M 55 80 C 47 66 43 48 55 32 C 67 48 63 66 55 80 Z", sw: 1.8 },
      { d: "M 55 80 C 40 70 30 54 38 38 C 46 50 52 66 55 80 Z", sw: 1.8 },
      { d: "M 55 80 C 70 70 80 54 72 38 C 64 50 58 66 55 80 Z", sw: 1.8 },
      { d: "M 26 84 C 36 80 46 82 55 80 C 64 82 74 80 84 84", sw: 1.8 },
    ],
  },
} as const;

interface NavProps {
  variant?: "dark" | "light";
  hideLinks?: boolean;
  className?: string;
  progress?: number;
  animated?: boolean;
  quizMilestones?: { currentLayer: 1 | 2 | 3 };
  leftSlot?: React.ReactNode;
}

export default function Nav({
  variant = "dark",
  hideLinks = false,
  className = "",
  progress,
  animated = false,
  quizMilestones,
  leftSlot,
}: NavProps): React.ReactElement {
  const isLight    = variant === "light";
  const linkClass  = `font-label text-[11px] transition-opacity hover:opacity-60 ${isLight ? "text-cream/65" : "text-aubergine/70"}`;
  const trackColor = isLight ? "#FFEFDE" : "#3D233B";
  const logo       = isLight
    ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/etha-logo-cream.svg`
    : `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/etha-logo-dark.svg`;

  const p               = progress ?? 0;
  const logoRef         = useRef<HTMLDivElement>(null);
  const trackRef        = useRef<SVGPathElement>(null);
  const checkpointsRef  = useRef<HTMLDivElement>(null);
  const leftSlotRef     = useRef<HTMLSpanElement>(null);
  const revealedRef     = useRef(!animated);
  const [visibleP, setVisibleP] = useState(animated ? 0 : p);

  /* After initial reveal, keep visibleP in sync with p */
  useEffect(() => {
    if (revealedRef.current) setVisibleP(p);
  }, [p]);

  useEffect(() => {
    if (!animated) return;
    const ctx = gsap.context(() => {
      // 1. Logo fades in
      if (logoRef.current)
        gsap.fromTo(logoRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.9, ease: "power2.out", delay: 0.2 },
        );
      // 2. Wave track draws
      if (trackRef.current) {
        const len = trackRef.current.getTotalLength();
        gsap.set(trackRef.current, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(trackRef.current, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", delay: 0.8 });
      }
      // 3. Checkpoints container fades up after wave finishes
      if (checkpointsRef.current)
        gsap.to(checkpointsRef.current, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", delay: 1.85 });
      // 4. Left slot (back button) fades in last, matching checkpoints timing
      if (leftSlotRef.current)
        gsap.fromTo(leftSlotRef.current, { opacity: 0 }, { opacity: 1, duration: 0.65, ease: "power2.out", delay: 1.85 });
    });
    // 4. Reveal progress fill after wave draw completes
    const t = setTimeout(() => {
      revealedRef.current = true;
      setVisibleP(p);
    }, 1900);
    return () => { ctx.revert(); clearTimeout(t); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated]);

  return (
    <nav className={`absolute left-0 right-0 top-0 z-50 flex flex-col items-stretch ${className}`}>

      {/* Logo row — equal py gives visual balance above and below logo */}
      <div className="relative flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
        <span
          ref={leftSlot ? leftSlotRef : undefined}
          className="flex-1"
          style={animated && leftSlot ? { opacity: 0 } : undefined}
        >
          {leftSlot ?? (hideLinks ? null : <a href="#" className={linkClass}>RITUALS</a>)}
        </span>

        <div
          ref={logoRef}
          className="pointer-events-none absolute inset-x-0 flex justify-center"
          style={{ opacity: animated ? 0 : undefined }}
        >
          <Image
            src={logo}
            alt="ĒTHA"
            width={100}
            height={32}
            preload
            className="h-auto w-[80px] md:w-[100px]"
          />
        </div>

        <span className="flex-1 text-right">{hideLinks ? null : <a href="#" className={linkClass}>YOUR REPORTS</a>}</span>
      </div>

      {/* Wave + checkpoints inline below logo row */}
      {progress !== undefined && (
        <div className="relative" style={{ paddingBottom: quizMilestones ? 64 : 0 }}>
          <svg
            viewBox="0 0 1000 10"
            preserveAspectRatio="none"
            width="100%"
            height="10"
            fill="none"
            aria-hidden="true"
            style={{ display: "block", overflow: "visible" }}
          >
            <path
              ref={trackRef}
              d={WAVE_D}
              stroke={trackColor}
              strokeWidth="1.5"
              strokeOpacity="0.15"
              strokeLinecap="round"
            />
            <path
              d={WAVE_D}
              pathLength="1"
              stroke={trackColor}
              strokeWidth="1.5"
              strokeOpacity="0.85"
              strokeLinecap="round"
              strokeDasharray={`${visibleP} 1`}
              style={{ transition: "stroke-dasharray 0.7s cubic-bezier(0.37,0,0.63,1)" }}
            />
          </svg>

          {quizMilestones && (
            <div
              ref={checkpointsRef}
              className="absolute left-0 right-0 grid grid-cols-3"
              style={{ top: 0, opacity: animated ? 0 : undefined, transform: animated ? "translateY(8px)" : undefined }}
            >
              {(["BODY", "MIND", "SPIRIT"] as const).map((name, i) => {
                const layer     = (i + 1) as 1 | 2 | 3;
                const cur       = quizMilestones.currentLayer;
                const isCurrent = layer === cur;
                const isDone    = layer < cur;
                const iconOp    = isCurrent ? 0.85 : isDone ? 0.60 : 0.2;
                const textOp    = isCurrent ? 0.7  : isDone ? 0.52 : 0.2;
                const icon      = SECTION_ICONS[name];

                return (
                  <div key={name} className="flex flex-col items-center" style={{ paddingTop: 16 }}>
                    <svg width="28" height="28" viewBox={icon.viewBox} fill="none" aria-hidden="true">
                      {icon.paths.map((p, pi) => (
                        <path
                          key={pi}
                          d={p.d}
                          stroke={trackColor}
                          strokeWidth={p.sw}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity={iconOp}
                        />
                      ))}
                    </svg>
                    <span
                      className="font-label"
                      style={{ fontSize: 10, color: trackColor, opacity: textOp, letterSpacing: "0.18em" }}
                    >
                      {name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
