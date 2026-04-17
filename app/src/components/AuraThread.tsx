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

/** Find the nearest ancestor <section> — inner blobs/overlays should not
 *  influence stroke color, only the section's own background. */
function getOwningSection(el: Element | null): HTMLElement | null {
  let node: Element | null = el;
  while (node && node !== document.documentElement) {
    if (node instanceof HTMLElement && node.tagName === "SECTION") return node;
    node = node.parentElement;
  }
  return null;
}

/** Find the first non-transparent bg walking up from an element. */
function getEffectiveBg(el: Element | null): string {
  while (el && el !== document.documentElement) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
      return bg;
    }
    el = el.parentElement;
  }
  return "rgb(255, 239, 222)"; // default cream
}

/** Sample section-level bg at viewport center and return contrasting stroke. */
function getStrokeColorFromDOM(): string {
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;
  // Temporarily hide the SVG so elementFromPoint hits the actual content
  const svgEl = document.querySelector("[data-aura-thread]") as HTMLElement | null;
  if (svgEl) svgEl.style.display = "none";
  const el = document.elementFromPoint(x, y);
  if (svgEl) svgEl.style.display = "";

  // Explicit override wins (e.g. Hero image sections)
  let node: Element | null = el;
  while (node && node !== document.documentElement) {
    if (node instanceof HTMLElement && node.dataset.auraStroke) {
      return node.dataset.auraStroke;
    }
    node = node.parentElement;
  }

  // Use nearest <section> bg — prevents inner dark blobs/overlays from
  // flipping the stroke color (the old "white line on cream" bug).
  const section = getOwningSection(el);
  const bg = section ? getEffectiveBg(section) : getEffectiveBg(el);
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

    const totalViewHeight = 10000;
    const viewSlice = 1200;
    // Offset: line draws ~65% ahead. We shift the viewBox window back
    // so the drawn tip stays in the lower portion of the viewport.
    const lookAhead = viewSlice * 0.35;

    function applyProgress(progress: number): void {
      // Pan viewBox
      const viewY = Math.max(
        0,
        progress * (totalViewHeight - viewSlice) - lookAhead
      );
      svg!.setAttribute("viewBox", `0 ${viewY} 1440 ${viewSlice}`);

      // Hide in footer region
      if (progress > 0.88) {
        svg!.style.opacity = "0";
        return;
      }
      svg!.style.opacity = "1";

      // Dynamic color per section
      path!.setAttribute("stroke", getStrokeColorFromDOM());
    }

    // Draw animation + viewBox pan share one ScrollTrigger so they stay
    // on the same clock as Lenis-smoothed scroll.
    const length = path.getTotalLength();
    if (!prefersReduced) {
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });
    }

    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.2,
      onUpdate: (self) => {
        if (!prefersReduced) {
          path!.style.strokeDashoffset = String(length * (1 - self.progress));
        }
        applyProgress(self.progress);
      },
    });

    applyProgress(0);
    return () => {
      trigger.kill();
    };
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
          // ═══ HERO (0-1200) — Calm, balanced, enters top-right ═══
          "M1380,30",
          "C1300,80 1150,100 1050,180",
          // Balanced loop: imperfect oval
          "C900,300 800,450 720,400",
          "C640,350 700,250 820,300",
          "C940,350 880,500 780,600",
          "C680,700 500,800 380,920",
          "C260,1020 200,1080 180,1150",

          // ═══ FIVE ELEMENTS (1200-2400) — Energised, active, crossings ═══
          "C160,1220 220,1300 340,1380",
          "C460,1460 650,1500 840,1520",
          // Angular Vata-style knot
          "C960,1540 1080,1500 1120,1440",
          "C1160,1380 1100,1320 1020,1340",
          "C940,1360 920,1420 980,1480",
          "C1040,1540 1140,1560 1200,1650",
          "C1260,1740 1280,1820 1240,1920",
          "C1200,2020 1100,2080 960,2150",
          "C820,2220 740,2250 720,2300",
          "C700,2350 740,2380 800,2390",
          "C860,2400 900,2380 880,2340",
          "C860,2300 800,2280 740,2320",
          // Sweeping down to Doshas
          "C680,2360 600,2450 520,2560",
          "C440,2670 380,2770 340,2880",

          // ═══ DOSHAS (~2900-4100) — 3 Columns ═══
          // Vata (Energised, Left)
          "C300,2960 260,3020 240,3080",
          "C220,3140 180,3160 160,3120", 
          "C140,3080 120,3040 160,3000",
          "C200,2960 280,2980 320,3040",
          "C360,3100 340,3160 280,3180",
          "C220,3200 180,3240 200,3300",
          "C220,3360 280,3380 340,3360",
          // Moving to Pitta (Balanced, Center)
          "C400,3340 480,3300 560,3280",
          "C620,3260 660,3240 700,3220",
          "C740,3200 800,3180 860,3200",
          "C920,3220 960,3280 960,3340",
          "C960,3400 920,3460 860,3480",
          "C800,3500 740,3500 680,3480",
          "C620,3460 580,3400 580,3340",
          "C580,3280 620,3230 680,3220",
          "C700,3215 710,3220 720,3240",
          // Moving to Kapha (Relaxed, Right)
          "C740,3280 800,3320 880,3360",
          "C960,3400 1020,3420 1060,3440",
          "C1100,3460 1160,3500 1200,3560",
          "C1240,3620 1260,3700 1240,3760",
          "C1220,3820 1160,3860 1100,3850",
          "C1040,3840 1020,3790 1060,3750",
          "C1100,3710 1160,3720 1180,3760",
          "C1200,3800 1180,3850 1140,3880",
          "C1100,3910 1040,3940 980,3960",
          "C920,3980 860,4000 800,4040",

          // ═══ RITUALS (~4200-5800) — Relaxed, floating waves ═══
          "C700,4080 600,4120 520,4180",
          "C440,4240 420,4280 440,4320",
          "C460,4360 540,4380 640,4380",
          "C780,4380 900,4400 980,4440",
          "C1060,4480 1120,4540 1120,4600",
          "C1120,4660 1060,4700 980,4700",
          "C900,4700 860,4660 880,4600",
          "C900,4540 960,4520 1000,4540",
          "C1020,4580 980,4640 900,4720",
          "C800,4800 680,4880 560,4980",
          "C480,5060 420,5120 400,5180",
          // Angular element in dark band
          "C380,5240 420,5220 460,5160",
          "C500,5100 480,5180 440,5240",
          "C400,5300 400,5360 440,5420",
          "C480,5480 560,5520 680,5540",
          "C800,5560 920,5600 1000,5680",
          "C1080,5760 1120,5860 1100,5960",

          // ═══ ACADEMY & COMMUNITY (~6000-8800) — Grand sweeping curves ═══
          "C1080,6060 1000,6140 880,6200",
          "C760,6260 620,6300 500,6380",
          "C380,6460 300,6560 280,6680",
          // Wide relaxed loop
          "C260,6800 320,6900 440,6940",
          "C560,6980 680,6940 740,6860",
          "C800,6780 760,6700 680,6680",
          "C600,6660 540,6720 560,6800",
          "C580,6880 660,6940 740,6960",
          "C820,6980 940,7040 1060,7140",
          "C1180,7240 1260,7360 1280,7500",
          "C1300,7640 1260,7720 1180,7740",
          "C1100,7760 1080,7720 1120,7680",
          "C1160,7640 1200,7680 1180,7740",
          "C1160,7800 1080,7840 960,7860",
          // Community embrace
          "C840,7880 700,7920 580,8000",
          "C460,8080 360,8180 320,8300",
          "C280,8420 320,8520 420,8560",
          "C520,8600 620,8560 660,8480",
          "C700,8400 660,8340 600,8340",
          "C540,8340 520,8400 560,8460",
          "C600,8520 680,8540 760,8520",
          "C840,8500 900,8540 920,8620",
          "C940,8700 900,8740 860,8760",

          // ═══ CLOSURE (8800-10000) — Balanced closing flow ═══
          "C820,8780 740,8800 640,8840",
          "C540,8880 440,8940 380,9040",
          "C320,9140 300,9260 360,9360",
          "C420,9460 520,9520 620,9500",
          "C720,9480 800,9400 840,9300",
          // Final soft loop back 
          "C880,9200 860,9100 780,9080",
          "C700,9060 660,9140 680,9220",
          "C700,9300 760,9360 840,9420",
          "C920,9480 1020,9540 1080,9640",
          "C1140,9740 1180,9840 1140,9940",
          // Taper out at the very end
          "C1100,10040 1000,10080 900,10100"
        ].join(" ")}
        stroke="#3D233B"
        strokeOpacity="1"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
