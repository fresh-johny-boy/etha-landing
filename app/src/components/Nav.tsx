"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";

const WAVE_D = "M 0,5 C 80,3.5 150,6.5 280,5 C 420,3.5 530,6.5 650,5 C 750,3.5 840,6.5 900,5 C 935,4 965,6 1000,5";

interface NavProps {
  variant?: "dark" | "light";
  hideLinks?: boolean;
  className?: string;
  progress?: number; // 0–1
  animated?: boolean; // orchestrated entrance (quiz intro only)
}

export default function Nav({
  variant = "dark",
  hideLinks = false,
  className = "",
  progress,
  animated = false,
}: NavProps): React.ReactElement {
  const isLight = variant === "light";
  const linkClass = `font-label text-[11px] transition-opacity hover:opacity-60 ${
    isLight ? "text-cream/65" : "text-aubergine/70"
  }`;
  const trackColor = isLight ? "#FFEFDE" : "#3D233B";
  const logo = isLight
    ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/etha-logo-light.webp`
    : `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/etha-logo-dark.svg`;

  const p = progress ?? 0;
  const logoRef  = useRef<HTMLDivElement>(null);
  const trackRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!animated) return;
    const ctx = gsap.context(() => {
      // 1. Logo
      if (logoRef.current)
        gsap.fromTo(logoRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.2 }
        );
      // 2. Track draws left → right
      if (trackRef.current) {
        const len = trackRef.current.getTotalLength();
        gsap.set(trackRef.current, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(trackRef.current, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", delay: 0.8 });
      }
    });
    return () => ctx.revert();
  }, [animated]);

  return (
    <nav
      className={`absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-12 md:py-6 ${className}`}
    >
      {hideLinks ? <span /> : <a href="#" className={linkClass}>RITUALS</a>}

      <div
        ref={logoRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
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

      {hideLinks ? <span /> : <a href="#" className={linkClass}>YOUR REPORTS</a>}

      {progress !== undefined && (
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1000 10"
            preserveAspectRatio="none"
            width="100%"
            height="10"
            fill="none"
            aria-hidden="true"
            style={{ display: "block", overflow: "visible" }}
          >
            {/* Track — draws in on first load (animated), static after */}
            <path
              ref={trackRef}
              d={WAVE_D}
              stroke={trackColor}
              strokeWidth="1.5"
              strokeOpacity="0.15"
              strokeLinecap="round"
            />
            {/* Active fill — transitions on screen change */}
            <path
              d={WAVE_D}
              pathLength="1"
              stroke={trackColor}
              strokeWidth="1.5"
              strokeOpacity="0.85"
              strokeLinecap="round"
              strokeDasharray={`${p} 1`}
              style={{ transition: "stroke-dasharray 0.7s cubic-bezier(0.37,0,0.63,1)" }}
            />
          </svg>
        </div>
      )}
    </nav>
  );
}
