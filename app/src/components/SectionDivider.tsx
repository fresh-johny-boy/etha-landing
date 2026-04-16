interface SectionDividerProps {
  /** Fill color — matches the PREVIOUS section's background */
  fill: "cream" | "aubergine";
  /** Wave shape variant (0-4) for visual variety across the page */
  variant?: number;
  /** Flip horizontally for additional variety */
  flipX?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// Organic wave paths — cubic bezier curves only for the visible edge.
// viewBox 0 0 1440 120. Top edge is hidden behind previous section.
// Bottom organic edge is the visible transition.
const WAVE_PATHS = [
  // 0: Flowing triple roll
  "M0,0 L1440,0 L1440,50 C1320,85 1180,35 1020,65 C860,95 720,20 560,55 C400,90 240,30 0,65 Z",
  // 1: Asymmetric organic sweep
  "M0,0 L1440,0 L1440,60 C1280,30 1060,95 820,50 C580,5 340,80 0,55 Z",
  // 2: Deep flowing curve
  "M0,0 L1440,0 L1440,35 C1260,95 960,15 660,75 C360,120 180,40 0,70 Z",
  // 3: Gentle undulation
  "M0,0 L1440,0 L1440,55 C1280,40 1100,80 900,50 C700,20 500,75 300,55 C150,42 50,65 0,50 Z",
  // 4: Balanced organic contour
  "M0,0 L1440,0 L1440,45 C1300,80 1100,25 900,60 C700,95 500,15 300,50 C140,78 40,35 0,60 Z",
];

const FILL_COLORS = {
  cream: "#FFEFDE",
  aubergine: "#3D233B",
} as const;

export default function SectionDivider({
  fill,
  variant = 0,
  flipX = false,
  className = "",
}: SectionDividerProps): React.ReactElement {
  const pathIndex = Math.abs(variant) % WAVE_PATHS.length;

  return (
    <div
      className={`pointer-events-none absolute left-0 right-0 top-0 z-20 ${className}`}
      aria-hidden="true"
    >
      <svg
        className={`block h-[50px] w-full md:h-[70px] lg:h-[90px]${flipX ? " -scale-x-100" : ""}`}
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        fill="none"
      >
        <path d={WAVE_PATHS[pathIndex]} fill={FILL_COLORS[fill]} />
      </svg>
    </div>
  );
}
