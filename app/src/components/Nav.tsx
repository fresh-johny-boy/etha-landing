"use client";

import Image from "next/image";

/* 4 gentle undulations, amplitude ±1.5 — aura feel, still reads as one continuous line */
const WAVE_D = "M 0,5 C 80,3.5 150,6.5 280,5 C 420,3.5 530,6.5 650,5 C 750,3.5 840,6.5 900,5 C 935,4 965,6 1000,5";

interface NavProps {
  variant?: "dark" | "light";
  hideLinks?: boolean;
  className?: string;
  progress?: number; // 0–1
}

export default function Nav({
  variant = "dark",
  hideLinks = false,
  className = "",
  progress,
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

  return (
    <nav
      className={`absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-12 md:py-6 ${className}`}
    >
      {hideLinks ? <span /> : <a href="#" className={linkClass}>RITUALS</a>}

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
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
            {/* Track — full width, low opacity */}
            <path
              d={WAVE_D}
              stroke={trackColor}
              strokeWidth="1.5"
              strokeOpacity="0.15"
              strokeLinecap="round"
                          />
            {/* Active — pathLength="1" normalises units; dasharray drives reveal */}
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
