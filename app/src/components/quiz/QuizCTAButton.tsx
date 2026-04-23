"use client";
import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";

type Pt = [number, number];
function toPath(pts: Pt[]): string {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i += 3)
    d += ` C${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} ${pts[i+1][0].toFixed(1)},${pts[i+1][1].toFixed(1)} ${pts[i+2][0].toFixed(1)},${pts[i+2][1].toFixed(1)}`;
  return d;
}

const BTN_CX = 180, BTN_CY = 34;
const BTN_BASE: Pt[] = [
  [170,  4],
  [205,  1], [252,  2], [295, 12],
  [328, 20], [358, 28], [356, 42],
  [352, 58], [312, 66], [262, 68],
  [212, 70], [148, 70], [98,  68],
  [48,  66], [14,  56], [6,   42],
  [0,   28], [12,  18], [38,  10],
  [78,   2], [130,  1], [170,  4],
];
export const BTN_D = toPath(BTN_BASE);

export function distortBtn(nx: number, ny: number): string {
  const angle = Math.atan2(ny, nx);
  const mag   = Math.min(1, Math.sqrt(nx * nx + ny * ny));
  return toPath(
    BTN_BASE.map(([px, py]) => {
      const dx = px - BTN_CX, dy = py - BTN_CY;
      const r  = Math.sqrt(dx * dx + dy * dy) || 1;
      const soft = Math.pow((Math.cos(Math.atan2(dy, dx) - angle) + 1) / 2, 2);
      const push = soft * mag * 14;
      return [px + (dx / r) * push, py + (dy / r) * push] as Pt;
    })
  );
}

export function QuizCTAButton({
  label,
  onClick,
  disabled = false,
  revealMode = "fade",
  strokeColor = "#FFEFDE",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  revealMode?: "fade" | "draw";
  strokeColor?: string;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const rafRef  = useRef(0);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  /* Reveal animation on mount - "draw" traces the aura outline; "fade" is CSS-only */
  useEffect(() => {
    if (disabled) return;
    const path = pathRef.current;
    if (!path) return;
    if (revealMode === "draw") {
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, strokeOpacity: 0 });
      gsap.to(path, {
        strokeDashoffset: 0,
        strokeOpacity: 0.4,
        duration: 0.6,
        ease: "power2.inOut",
      });
    }
  // Reveal fires once on mount for the intended variant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const distortFromPoint = useCallback((clientX: number, clientY: number) => {
    if (!btnRef.current || !pathRef.current) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!btnRef.current || !pathRef.current) return;
      const r  = btnRef.current.getBoundingClientRect();
      const nx = ((clientX - r.left) / r.width  - 0.5) * 2;
      const ny = ((clientY - r.top)  / r.height - 0.5) * 2;
      gsap.to(pathRef.current, { attr: { d: distortBtn(nx, ny) }, duration: 0.45, ease: "power3.out", overwrite: true });
    });
  }, []);

  const onMove  = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    distortFromPoint(e.clientX, e.clientY);
  }, [distortFromPoint, disabled]);
  const onTouch = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const t = e.touches[0];
    if (t) distortFromPoint(t.clientX, t.clientY);
  }, [distortFromPoint, disabled]);

  const onRelease = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (pathRef.current)
      gsap.to(pathRef.current, { attr: { d: BTN_D }, duration: 0.9, ease: "power3.out", overwrite: true });
  }, []);

  return (
    <button
      ref={btnRef}
      onClick={disabled ? undefined : onClick}
      onMouseMove={onMove}
      onMouseLeave={onRelease}
      onTouchStart={onTouch}
      onTouchMove={onTouch}
      onTouchEnd={onRelease}
      aria-disabled={disabled || undefined}
      className={`group relative block mx-auto w-full max-w-[360px] px-12 py-6 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 360 68"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          d={BTN_D}
          stroke={strokeColor}
          strokeWidth="0.9"
          strokeOpacity={disabled ? 0.28 : 0.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "stroke-opacity 500ms ease" }}
        />
      </svg>
      <span
        className="font-label relative z-10 text-[11px] text-cream"
        style={{ transition: "opacity 300ms ease", opacity: disabled ? 0.55 : 1 }}
      >
        {label}
      </span>
    </button>
  );
}
