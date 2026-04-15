"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Full-page continuous aura line — a single organic SVG path that weaves
 * from the very top to the very bottom of the site.
 *
 * Fixed SVG that pans its viewBox with scroll. Stroke draws via GSAP
 * at ~60-70% ahead of viewport. Color switches dynamically based on
 * which section background is dominant.
 */

const AUBERGINE = "#3D233B";
const CREAM = "#FFEFDE";

/** Check if a background color is dark (aubergine-like). */
function isDarkBg(color: string): boolean {
  // Match rgb(r, g, b) format from getComputedStyle
  const m = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!m) return false;
  const luminance = (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255;
  return luminance < 0.4;
}

/** Walk up the DOM from an element to find the first visible background color. */
function getEffectiveBg(el: Element | null): string {
  while (el && el !== document.documentElement) {
    const bg = getComputedStyle(el).backgroundColor;
    // Skip transparent / rgba with 0 alpha
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
      return bg;
    }
    el = el.parentElement;
  }
  return "rgb(255, 239, 222)"; // default cream
}

/** Sample the background at the viewport center and return the contrasting stroke color. */
function getStrokeColorFromDOM(): string {
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;
  // Temporarily hide the SVG so elementFromPoint hits the actual content
  const svgEl = document.querySelector("[data-aura-thread]") as HTMLElement | null;
  if (svgEl) svgEl.style.display = "none";
  const el = document.elementFromPoint(x, y);
  if (svgEl) svgEl.style.display = "";
  const bg = getEffectiveBg(el);
  return isDarkBg(bg) ? CREAM : AUBERGINE;
}

export default function AuraThread(): React.ReactElement {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Draw animation — line draws to ~65% ahead of viewport
    if (!prefersReduced) {
      const length = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.2,
        },
      });
    }

    // Pan viewBox + update stroke color on scroll
    const totalViewHeight = 10000;
    const viewSlice = 1200;
    // Offset: line draws ~65% ahead. We shift the viewBox window back
    // so the drawn tip stays in the lower portion of the viewport.
    const lookAhead = viewSlice * 0.35;

    function onScroll(): void {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollFraction = maxScroll > 0 ? window.scrollY / maxScroll : 0;

      // Pan viewBox
      const viewY = Math.max(
        0,
        scrollFraction * (totalViewHeight - viewSlice) - lookAhead
      );
      svg!.setAttribute("viewBox", `0 ${viewY} 1440 ${viewSlice}`);

      // Update stroke color based on actual background at viewport center
      const color = getStrokeColorFromDOM();
      path!.setAttribute("stroke", color);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <svg
      ref={svgRef}
      data-aura-thread
      className="pointer-events-none fixed inset-0 z-[5] h-dvh w-full"
      viewBox="0 0 1440 1200"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        d={[
          // ═══ HERO (cream) — enters top-right, balanced loop ═══
          "M1380,30",
          "C1300,80 1150,100 1050,180",
          "C950,260 880,350 820,450",
          // Balanced loop — imperfect oval (Etha_Loop_Balanced style)
          "C760,540 680,520 640,480",
          "C600,440 560,400 540,450",
          "C520,500 560,560 620,580",
          "C680,600 740,570 780,530",
          // Sweep down toward Five Elements
          "C820,490 800,550 720,650",
          "C640,750 500,820 380,920",
          "C260,1020 200,1080 180,1150",

          // ═══ FIVE ELEMENTS (aubergine) — energised sweep with crossing ═══
          "C160,1220 220,1300 340,1380",
          "C460,1460 650,1500 840,1520",
          // Vata-style angular crossing
          "C960,1540 1080,1500 1120,1440",
          "C1160,1380 1100,1320 1020,1340",
          "C940,1360 920,1420 980,1480",
          "C1040,1540 1140,1560 1200,1600",
          // Wide sweep through elements
          "C1260,1640 1280,1720 1240,1820",
          "C1200,1920 1100,2000 960,2080",
          // Relaxed loop-back
          "C820,2160 740,2200 720,2280",
          "C700,2360 740,2420 800,2440",
          "C860,2460 900,2420 880,2360",
          "C860,2300 800,2280 740,2320",
          // Exit toward Doshas
          "C680,2360 600,2440 520,2560",
          "C440,2680 380,2760 340,2860",

          // ═══ DOSHAS (cream) — the line threads through all 3 dosha forms ═══

          // Approach Vata column (left ~200-400)
          "C300,2940 260,3000 240,3060",

          // ── VATA (Energised) — angular knot with self-crossings ──
          // The line enters from top-left, makes angular direction changes
          // and crosses itself twice, creating a restless knot
          "C220,3120 180,3140 160,3100",  // sharp upward jolt
          "C140,3060 120,3020 160,2980",  // angular reversal
          "C200,2940 280,2960 320,3020",  // cross back rightward
          "C360,3080 340,3140 280,3160",  // second crossing
          "C220,3180 180,3220 200,3280",  // exit downward
          "C220,3340 280,3360 340,3340",  // stabilise

          // ── Traverse to Pitta column (center ~600-800) ──
          "C400,3320 480,3280 560,3260",
          "C620,3240 660,3220 700,3200",

          // ── PITTA (Balanced) — smooth organic oval, nearly closed ──
          // Calm, focused, precise — a single imperfect ellipse
          "C740,3180 800,3160 860,3180",
          "C920,3200 960,3260 960,3320",
          "C960,3380 920,3440 860,3460",
          "C800,3480 740,3480 680,3460",
          "C620,3440 580,3380 580,3320",
          "C580,3260 620,3210 680,3200",
          // Gap — the oval doesn't fully close (brand rule)
          "C700,3195 710,3200 720,3220",

          // ── Traverse to Kapha column (right ~1000-1200) ──
          "C740,3260 800,3300 880,3340",
          "C960,3380 1020,3400 1060,3420",

          // ── KAPHA (Relaxed) — flowing blob with internal loop ──
          // Grounded, steady — wider form with a small loop-back
          "C1100,3440 1160,3480 1200,3540",
          "C1240,3600 1260,3680 1240,3740",
          // Internal loop — the line circles back on itself
          "C1220,3800 1160,3840 1100,3830",
          "C1040,3820 1020,3770 1060,3730",
          "C1100,3690 1160,3700 1180,3740",
          "C1200,3780 1180,3830 1140,3860",
          // Exit the kapha form flowing down
          "C1100,3890 1040,3920 980,3940",
          "C920,3960 860,3980 800,4020",
          // Gentle descent out of Doshas
          "C700,4060 600,4100 520,4160",
          "C440,4220 420,4260 440,4300",

          // ═══ RITUALS cream — organic drift with loop ═══
          "C460,4340 540,4360 640,4360",
          "C780,4360 900,4380 980,4420",
          // Relaxed loop around ritual images
          "C1060,4460 1120,4520 1120,4580",
          "C1120,4640 1060,4680 980,4680",
          "C900,4680 860,4640 880,4580",
          "C900,4520 960,4500 1000,4520",
          // Drift toward aubergine strip
          "C1020,4560 980,4620 900,4700",
          "C800,4780 680,4860 560,4960",

          // ═══ RITUALS aubergine strip — tight energised moment ═══
          "C480,5040 420,5100 400,5160",
          // Angular Vata-style crossing in the dark strip
          "C380,5220 420,5200 460,5140",
          "C500,5080 480,5160 440,5220",
          "C400,5280 400,5340 440,5400",

          // ═══ RITUALS cream lower ═══
          "C480,5460 560,5500 680,5520",
          "C800,5540 920,5580 1000,5660",
          "C1080,5740 1120,5840 1100,5940",
          "C1080,6040 1000,6120 880,6180",

          // ═══ ACADEMY (aubergine) — grand sweeping curves ═══
          "C760,6240 620,6280 500,6360",
          "C380,6440 300,6540 280,6660",
          // Wide relaxed loop (big one design element style)
          "C260,6780 320,6880 440,6920",
          "C560,6960 680,6920 740,6840",
          "C800,6760 760,6680 680,6660",
          "C600,6640 540,6700 560,6780",
          "C580,6860 660,6920 740,6940",
          // Continue sweeping right
          "C820,6960 940,7020 1060,7120",
          "C1180,7220 1260,7340 1280,7480",
          // Small curlicue
          "C1300,7620 1260,7700 1180,7720",
          "C1100,7740 1080,7700 1120,7660",
          "C1160,7620 1200,7660 1180,7720",
          // Flow toward Community
          "C1160,7780 1080,7820 960,7840",

          // ═══ COMMUNITY (cream) — embracing form ═══
          "C840,7860 700,7900 580,7980",
          "C460,8060 360,8160 320,8280",
          // Embracing loop
          "C280,8400 320,8500 420,8540",
          "C520,8580 620,8540 660,8460",
          "C700,8380 660,8320 600,8320",
          "C540,8320 520,8380 560,8440",
          "C600,8500 680,8520 760,8500",
          "C840,8480 900,8520 920,8600",
          "C940,8680 900,8760 840,8820",

          // ═══ CLOSURE (cream) — closing spiral ═══
          "C780,8880 720,8920 680,8980",
          "C640,9040 640,9100 680,9140",
          // Final spiral inward
          "C720,9180 760,9160 770,9120",
          "C780,9080 750,9060 720,9080",
          "C690,9100 700,9130 730,9130",

          // ═══ FOOTER (aubergine) — fading trail ═══
          "C740,9140 720,9200 700,9300",
          "C680,9400 660,9520 650,9640",
          "C640,9760 640,9880 640,10000",
        ].join(" ")}
        stroke="#3D233B"
        strokeOpacity="0.30"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
