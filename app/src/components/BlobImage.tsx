"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SEED } from "./auraShapes";

gsap.registerPlugin(ScrollTrigger);

type Variant = "on-cream" | "on-aubergine";

type BlobImageProps = {
  /** objectBoundingBox path — blob outline */
  shape: string;
  /** image URL; when omitted, a tinted gradient placeholder fills the blob */
  image?: string;
  alt?: string;
  imageStyle?: CSSProperties;
  /** small italic label for placeholders */
  placeholderHint?: string;
  /** background context — drives stroke color + scrim */
  variant?: Variant;
  /** size utilities on the outer container */
  className?: string;
  /** horizontal breath direction offset */
  breathDir?: "left" | "right";
  /** optional animation delay (seconds) */
  breathDelay?: number;
};

/**
 * Etha blob image: SVG clip-path grows from seed → shape on scroll,
 * with shadow layers, dark scrim + radial vignette, edge stroke draw-in,
 * and a gentle breathing drift on the clipped content.
 */
export default function BlobImage({
  shape,
  image,
  alt = "",
  imageStyle,
  placeholderHint,
  variant = "on-aubergine",
  className = "",
  breathDir = "right",
  breathDelay = 0,
}: BlobImageProps): React.ReactElement {
  const uid = useId().replace(/:/g, "");
  const clipId = `blob-clip-${uid}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<SVGPathElement>(null);
  const strokeRef = useRef<SVGPathElement>(null);
  const innerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const container = containerRef.current;
    const clipPath = clipRef.current;
    const strokePath = strokeRef.current;
    const inner = innerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Clip path morphs from seed → full shape on scroll
      if (clipPath) {
        gsap.fromTo(
          clipPath,
          { attr: { d: SEED } },
          {
            attr: { d: shape },
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top 90%",
              end: "top 40%",
              scrub: 0.4,
            },
          }
        );
      }

      // Edge stroke draws in sync
      if (strokePath) {
        gsap.fromTo(
          strokePath,
          { attr: { d: SEED }, strokeOpacity: 0 },
          {
            attr: { d: shape },
            strokeOpacity: 0.4,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top 90%",
              end: "top 40%",
              scrub: 0.4,
            },
          }
        );
      }

      // Breathing — inner image drifts inside static mask
      if (inner) {
        gsap.to(inner, {
          scale: 1.06,
          y: -8,
          x: breathDir === "right" ? 5 : -5,
          duration: 5.5,
          delay: breathDelay,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
    }, container);

    return () => ctx.revert();
  }, [shape, breathDir, breathDelay]);

  const strokeColor = variant === "on-aubergine" ? "#FFEFDE" : "#3D233B";
  const placeholderBg =
    variant === "on-aubergine"
      ? "bg-gradient-to-br from-cream/[0.06] via-cream/[0.02] to-cream/[0.04]"
      : "bg-gradient-to-br from-aubergine/[0.08] via-aubergine/[0.02] to-aubergine/[0.05]";
  const placeholderText =
    variant === "on-aubergine" ? "text-cream/20" : "text-aubergine/25";
  const vignette =
    variant === "on-aubergine"
      ? "radial-gradient(ellipse at center, transparent 40%, rgba(61,35,59,0.35) 100%)"
      : "radial-gradient(ellipse at center, transparent 55%, rgba(61,35,59,0.18) 100%)";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* SVG clip-path — GSAP morphs d */}
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path ref={clipRef} d={SEED} />
          </clipPath>
        </defs>
      </svg>

      {/* Shadow layers — static, always show the full shape */}
      <svg
        className="pointer-events-none absolute inset-[-4%] h-[108%] w-[108%] translate-x-[1.5%] translate-y-[2%]"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={shape} fill="rgba(0,0,0,0.08)" stroke="none" />
      </svg>
      <svg
        className="pointer-events-none absolute inset-[-4%] h-[108%] w-[108%] translate-x-[3%] translate-y-[4%] blur-[6px]"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={shape} fill="rgba(0,0,0,0.06)" stroke="none" />
      </svg>
      <svg
        className="pointer-events-none absolute inset-[-4%] h-[108%] w-[108%] translate-x-[5%] translate-y-[7%] blur-[14px]"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={shape} fill="rgba(0,0,0,0.04)" stroke="none" />
      </svg>

      {/* Clipped content — image or placeholder */}
      <div
        className="absolute inset-[-4%]"
        style={{ clipPath: `url(#${clipId})` }}
      >
        {image ? (
          <>
            <img
              ref={(node) => {
                innerRef.current = node;
              }}
              src={image}
              alt={alt}
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              style={imageStyle}
            />
            <div className="absolute inset-0 bg-black/[0.12]" />
            <div className="absolute inset-0" style={{ background: vignette }} />
          </>
        ) : (
          <>
            <div
              ref={(node) => {
                innerRef.current = node;
              }}
              className={`absolute inset-0 ${placeholderBg} will-change-transform`}
            />
            <div className="absolute inset-0" style={{ background: vignette }} />
            {placeholderHint && (
              <p
                className={`font-label absolute bottom-[15%] left-[15%] text-[9px] ${placeholderText}`}
              >
                {placeholderHint}
              </p>
            )}
          </>
        )}
      </div>

      {/* Edge stroke — morphs with the clip */}
      <svg
        className="pointer-events-none absolute inset-[-4%] h-[108%] w-[108%]"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          ref={strokeRef}
          d={SEED}
          fill="none"
          stroke={strokeColor}
          strokeWidth="0.0015"
          strokeOpacity="0"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
