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

export function QuizCTAButton({ label, onClick }: { label: string; onClick: () => void }) {
  const pathRef = useRef<SVGPathElement>(null);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const rafRef  = useRef(0);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

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

  const onMove  = useCallback((e: React.MouseEvent<HTMLButtonElement>) => distortFromPoint(e.clientX, e.clientY), [distortFromPoint]);
  const onTouch = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    const t = e.touches[0];
    if (t) distortFromPoint(t.clientX, t.clientY);
  }, [distortFromPoint]);

  const onRelease = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (pathRef.current)
      gsap.to(pathRef.current, { attr: { d: BTN_D }, duration: 1.1, ease: "elastic.out(1,0.35)", overwrite: true });
  }, []);

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onRelease}
      onTouchStart={onTouch}
      onTouchMove={onTouch}
      onTouchEnd={onRelease}
      className="group relative w-full px-12 py-6 cursor-pointer"
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
          stroke="#FFEFDE"
          strokeWidth="0.9"
          strokeOpacity="0.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "stroke-opacity 500ms ease" }}
        />
      </svg>
      <span className="font-label relative z-10 text-[11px] text-cream" style={{ transition: "opacity 300ms ease" }}>
        {label}
      </span>
    </button>
  );
}
