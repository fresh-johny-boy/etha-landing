"use client";

import { useRef, useCallback, useEffect } from "react";
import { gsap } from "gsap";

interface AuraButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/* ── Balanced oval decomposed into 22 control points ── */
const CX = 140; // viewBox center (280/2)
const CY = 40; //  viewBox center (80/2)

type Pt = [number, number];

const BASE: Pt[] = [
  [108, 4], // M
  [148, 2],
  [210, 5],
  [248, 18], // C1
  [268, 26],
  [276, 36],
  [272, 46], // C2
  [266, 58],
  [238, 68],
  [198, 74], // C3
  [168, 78],
  [130, 78],
  [100, 76], // C4
  [60, 72],
  [28, 64],
  [14, 52], // C5
  [4, 44],
  [2, 34],
  [8, 24], // C6
  [16, 12],
  [52, 6],
  [108, 4], // C7 (close)
];

function toPath(pts: Pt[]): string {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i += 3) {
    d += ` C${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} ${pts[i + 1][0].toFixed(1)},${pts[i + 1][1].toFixed(1)} ${pts[i + 2][0].toFixed(1)},${pts[i + 2][1].toFixed(1)}`;
  }
  return d;
}

const BASE_D = toPath(BASE);

/**
 * Distort the balanced oval toward the cursor direction.
 * Pure radial push — no perpendicular displacement, so curves stay smooth.
 * Uses a raised-cosine falloff for a soft, organic bulge with no sharp corners.
 */
function distort(normX: number, normY: number): string {
  const mouseAngle = Math.atan2(normY, normX);
  const intensity = Math.min(1, Math.sqrt(normX * normX + normY * normY));

  const pts: Pt[] = BASE.map(([px, py]) => {
    const dx = px - CX;
    const dy = py - CY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const ptAngle = Math.atan2(dy, dx);

    // Raised cosine: 0 at opposite side, smooth peak at aligned side
    // (cos+1)/2 maps -1…1 → 0…1, then square it for extra-soft falloff
    const raw = (Math.cos(ptAngle - mouseAngle) + 1) / 2; // 0…1
    const soft = raw * raw; // squaring = very smooth bell curve, no corners

    // Radial push only — keeps all curves smooth
    const push = soft * intensity * 16;

    const radX = dx / dist;
    const radY = dy / dist;

    return [px + radX * push, py + radY * push] as Pt;
  });

  return toPath(pts);
}

export default function AuraButton({
  href,
  children,
  className = "",
}: AuraButtonProps): React.ReactElement {
  const pathRef = useRef<SVGPathElement>(null);
  const wrapRef = useRef<HTMLAnchorElement>(null);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!wrapRef.current || !pathRef.current) return;
    activeRef.current = true;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!wrapRef.current || !pathRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      // Normalize to -1…1 relative to button center
      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      const targetD = distort(normX, normY);
      gsap.to(pathRef.current, {
        attr: { d: targetD },
        duration: 0.45,
        ease: "power3.out",
        overwrite: true,
      });
    });
  }, []);

  const handleLeave = useCallback(() => {
    activeRef.current = false;
    cancelAnimationFrame(rafRef.current);
    if (!pathRef.current) return;
    gsap.to(pathRef.current, {
      attr: { d: BASE_D },
      duration: 0.9,
      ease: "elastic.out(1, 0.4)",
      overwrite: true,
    });
  }, []);

  return (
    <a
      ref={wrapRef}
      href={href}
      className={`group relative inline-flex items-center justify-center px-14 py-6 ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 280 80"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          d={BASE_D}
          stroke="currentColor"
          strokeWidth="0.75"
          strokeOpacity="0.45"
          fill="none"
          strokeLinecap="round"
          className="transition-[stroke-opacity,stroke-width] duration-500 ease-out group-hover:[stroke-opacity:0.75] group-hover:[stroke-width:0.9]"
        />
      </svg>
      <span className="font-label relative z-10 text-[11px]">{children}</span>
    </a>
  );
}
