"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

const AIR  = "expo.out";
const FIRE = "power4.in";

/* ── Three distinct balanced aura blobs — smooth 6-bezier paths ── */
type Pt = [number, number];

function toPath(pts: Pt[]): string {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i += 3)
    d += ` C${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} ${pts[i+1][0].toFixed(1)},${pts[i+1][1].toFixed(1)} ${pts[i+2][0].toFixed(1)},${pts[i+2][1].toFixed(1)}`;
  return d;
}

function distort(base: Pt[], cx: number, cy: number, nx: number, ny: number): string {
  const angle = Math.atan2(ny, nx);
  const mag   = Math.min(1, Math.sqrt(nx * nx + ny * ny));
  return toPath(base.map(([px, py]) => {
    const dx = px - cx, dy = py - cy;
    const r  = Math.sqrt(dx * dx + dy * dy) || 1;
    const soft = Math.pow((Math.cos(Math.atan2(dy, dx) - angle) + 1) / 2, 2);
    return [px + (dx / r) * soft * mag * 10, py + (dy / r) * soft * mag * 10] as Pt;
  }));
}

/* Shared viewBox — proportions close to actual card (≈3.5:1) for minimal distortion */
const VB = "0 0 352 108";

/* A — gap top-left, right side slightly fuller */
const A_BASE: Pt[] = [
  [162, 7],
  [224, 2],  [296, 4],  [330, 13],
  [346, 24], [350, 44], [344, 64],
  [334, 82], [298, 96], [246, 102],
  [188, 107],[124, 106],[74,  98],
  [30,  86], [4,   66], [2,   44],
  [2,   22], [22,  8],  [68,  3],
  [122, 0],  [148, 3],  [162, 7],
];

/* B — rounder arch, taller feel, gap top-right */
const B_BASE: Pt[] = [
  [190, 5],
  [250, 0],  [314, 2],  [340, 12],
  [356, 24], [358, 46], [352, 68],
  [342, 86], [306, 100],[250, 107],
  [188, 112],[124, 110],[72,  102],
  [26,  90], [2,   68], [0,   46],
  [0,   24], [18,  8],  [58,  2],
  [108, 0],  [160, 2],  [190, 5],
];

/* C — slightly different curvature, gap bottom-left area */
const C_BASE: Pt[] = [
  [170, 8],
  [228, 3],  [298, 6],  [330, 16],
  [346, 28], [348, 50], [340, 70],
  [330, 88], [294, 100],[240, 106],
  [182, 110],[118, 108],[68,  100],
  [22,  88], [0,   66], [0,   44],
  [2,   22], [20,  8],  [60,  4],
  [114, 1],  [146, 4],  [170, 8],
];

const CARD_VARIANTS = {
  a: { base: A_BASE, cx: 176, cy: 53, vb: VB, d: toPath(A_BASE) },
  b: { base: B_BASE, cx: 179, cy: 56, vb: VB, d: toPath(B_BASE) },
  c: { base: C_BASE, cx: 174, cy: 55, vb: VB, d: toPath(C_BASE) },
};

/* ── Types ── */
type LayerScreen = { kind: "layer"; layer: 1 | 2 | 3; label: string; title: string; sub: string };
type Option      = { id: "a" | "b" | "c"; text: string };
type Question    = { kind: "question"; layer: 1 | 2 | 3; q: string; options: [Option, Option, Option] };
type Step        = LayerScreen | Question;

/* ── Layer definitions ── */
const LAYER_DEF: Record<1 | 2 | 3, LayerScreen> = {
  1: { kind: "layer", layer: 1, label: "LAYER ONE",   title: "Body", sub: "What your physical form reveals."  },
  2: { kind: "layer", layer: 2, label: "LAYER TWO",   title: "Mind", sub: "What your inner world reveals."    },
  3: { kind: "layer", layer: 3, label: "LAYER THREE", title: "Now",  sub: "What this moment reveals."         },
};
const LAYER_NAMES: Record<1 | 2 | 3, string> = { 1: "BODY", 2: "MIND", 3: "NOW" };

/* ── 43 Questions ── */
const QS: Question[] = [
  /* ─ Layer 1 / Body ──────────────────────────────────────── */
  { kind: "question", layer: 1, q: "My body frame is naturally...", options: [
    { id: "a", text: "Lean and light — hard to gain weight no matter what I eat." },
    { id: "b", text: "Medium and muscular — I gain and lose weight with relative ease." },
    { id: "c", text: "Solid and sturdy — I gain weight easily and hold it." },
  ]},
  { kind: "question", layer: 1, q: "My skin tends to be...", options: [
    { id: "a", text: "Dry, thin, and rough — cool to the touch." },
    { id: "b", text: "Warm, flushed, sensitive — prone to redness or inflammation." },
    { id: "c", text: "Thick, smooth, oily — cool and moist." },
  ]},
  { kind: "question", layer: 1, q: "My hair is naturally...", options: [
    { id: "a", text: "Dry, fine, frizzy, or curly." },
    { id: "b", text: "Fine and oily — tends to thin or grey early." },
    { id: "c", text: "Thick, wavy, lush — naturally oily." },
  ]},
  { kind: "question", layer: 1, q: "My hands and feet are usually...", options: [
    { id: "a", text: "Cold with variable temperature — always reaching for warmth." },
    { id: "b", text: "Warm, even hot — I consistently run warm." },
    { id: "c", text: "Cool and steady — neither cold nor hot." },
  ]},
  { kind: "question", layer: 1, q: "My digestion is...", options: [
    { id: "a", text: "Irregular — sometimes strong, sometimes completely off." },
    { id: "b", text: "Sharp and intense — I become irritable when hunger strikes." },
    { id: "c", text: "Slow but steady — I rarely feel hunger urgently." },
  ]},
  { kind: "question", layer: 1, q: "My appetite day to day is...", options: [
    { id: "a", text: "Variable — I forget to eat, then am suddenly ravenous." },
    { id: "b", text: "Strong and consistent — I must eat on schedule." },
    { id: "c", text: "Moderate — I could eat or skip a meal and feel fine." },
  ]},
  { kind: "question", layer: 1, q: "My sleep is...", options: [
    { id: "a", text: "Light and interrupted — I'm a restless sleeper." },
    { id: "b", text: "Moderate — I wake early with my mind already running." },
    { id: "c", text: "Deep and long — I could sleep ten hours without effort." },
  ]},
  { kind: "question", layer: 1, q: "My energy moves in...", options: [
    { id: "a", text: "Unpredictable bursts — intense, then suddenly exhausted." },
    { id: "b", text: "Sustained peaks — most productive in the middle of the day." },
    { id: "c", text: "Slow crescendos — I build and hold energy through the day." },
  ]},
  { kind: "question", layer: 1, q: "My joints...", options: [
    { id: "a", text: "Crack and pop — dry and variable." },
    { id: "b", text: "Can become hot and inflamed under strain." },
    { id: "c", text: "Are well-lubricated, sometimes holding excess fluid." },
  ]},
  { kind: "question", layer: 1, q: "My eyes are...", options: [
    { id: "a", text: "Small, dark, active — darting and curious." },
    { id: "b", text: "Medium, piercing, intense — often with a reddish tint." },
    { id: "c", text: "Large, soft, calm — deep and steady." },
  ]},
  { kind: "question", layer: 1, q: "When I sweat...", options: [
    { id: "a", text: "Rarely — I find sweating difficult." },
    { id: "b", text: "Easily and profusely — heat affects me immediately." },
    { id: "c", text: "Moderately — average in most conditions." },
  ]},
  { kind: "question", layer: 1, q: "When illness comes, it tends toward...", options: [
    { id: "a", text: "Anxiety, nervous exhaustion, dry and cold conditions." },
    { id: "b", text: "Fever, inflammation, or infection." },
    { id: "c", text: "Congestion, excess mucus, and heaviness." },
  ]},
  { kind: "question", layer: 1, q: "My elimination is...", options: [
    { id: "a", text: "Irregular — prone to constipation or inconsistency." },
    { id: "b", text: "Regular and sometimes loose — occasionally urgent." },
    { id: "c", text: "Heavy and regular — well-formed and predictable." },
  ]},
  { kind: "question", layer: 1, q: "My voice naturally is...", options: [
    { id: "a", text: "Quick, high-pitched, variable — I speak fast." },
    { id: "b", text: "Clear, direct, sharp — I say exactly what I mean." },
    { id: "c", text: "Deep, resonant, melodious — I choose words slowly." },
  ]},
  { kind: "question", layer: 1, q: "My lips tend to be...", options: [
    { id: "a", text: "Thin, dry, frequently chapped." },
    { id: "b", text: "Medium, sometimes sensitive or prone to sores." },
    { id: "c", text: "Full, soft, and well-defined." },
  ]},

  /* ─ Layer 2 / Mind ──────────────────────────────────────── */
  { kind: "question", layer: 2, q: "My thinking style is...", options: [
    { id: "a", text: "Quick and creative — many ideas at once, hard to settle." },
    { id: "b", text: "Sharp and analytical — I think in systems and conclusions." },
    { id: "c", text: "Steady and methodical — I think slowly but think it through." },
  ]},
  { kind: "question", layer: 2, q: "I learn best when...", options: [
    { id: "a", text: "I can explore freely and make my own unexpected connections." },
    { id: "b", text: "The information is precise, logical, and well-organised." },
    { id: "c", text: "I have time to absorb, repeat, and let it settle." },
  ]},
  { kind: "question", layer: 2, q: "My memory tends to be...", options: [
    { id: "a", text: "Quick to grasp but quick to lose — it moves with me." },
    { id: "b", text: "Sharp and clear for what matters most." },
    { id: "c", text: "Slow to form, but once held — virtually permanent." },
  ]},
  { kind: "question", layer: 2, q: "Under pressure, I tend to...", options: [
    { id: "a", text: "Scatter — anxiety rises, I lose my centre." },
    { id: "b", text: "Sharpen — I become focused but also controlling." },
    { id: "c", text: "Withdraw — I become quiet, stubborn, or close down." },
  ]},
  { kind: "question", layer: 2, q: "My decision-making is...", options: [
    { id: "a", text: "Impulsive — I decide fast and sometimes change my mind." },
    { id: "b", text: "Deliberate — I weigh outcomes carefully, then commit fully." },
    { id: "c", text: "Cautious — I prefer consensus, slow change, certainty." },
  ]},
  { kind: "question", layer: 2, q: "In conversation, I...", options: [
    { id: "a", text: "Jump between topics quickly — I love ideas more than conclusions." },
    { id: "b", text: "Speak precisely — I make my point and defend it." },
    { id: "c", text: "Listen more than I speak — words are chosen carefully." },
  ]},
  { kind: "question", layer: 2, q: "My relationship with time is...", options: [
    { id: "a", text: "Loose — I'm often late, time escapes me effortlessly." },
    { id: "b", text: "Precise — I'm punctual and dislike being kept waiting." },
    { id: "c", text: "Steady — I move at my own unhurried pace." },
  ]},
  { kind: "question", layer: 2, q: "When I love, I...", options: [
    { id: "a", text: "Fall quickly and intensely — the feeling shifts as I do." },
    { id: "b", text: "Love with loyalty and a quiet possessiveness." },
    { id: "c", text: "Love steadily and deeply — for a very, very long time." },
  ]},
  { kind: "question", layer: 2, q: "I am most motivated by...", options: [
    { id: "a", text: "Freedom, creativity, and the call of the new." },
    { id: "b", text: "Achievement, mastery, and being recognised for it." },
    { id: "c", text: "Belonging, security, and deep harmony." },
  ]},
  { kind: "question", layer: 2, q: "My emotional expression is...", options: [
    { id: "a", text: "Expansive and changing — I wear feelings openly." },
    { id: "b", text: "Controlled but intense — I feel deeply beneath stillness." },
    { id: "c", text: "Slow and contained — emotions simmer quietly inside." },
  ]},
  { kind: "question", layer: 2, q: "I handle change...", options: [
    { id: "a", text: "By embracing it — I thrive in novelty and flux." },
    { id: "b", text: "By managing it — I need to lead the change." },
    { id: "c", text: "With difficulty — I prefer things to stay as they are." },
  ]},
  { kind: "question", layer: 2, q: "My creativity is...", options: [
    { id: "a", text: "Abundant and unpredictable — inspiration arrives suddenly." },
    { id: "b", text: "Focused and purposeful — I create with clear intention." },
    { id: "c", text: "Deep and slow — I build things designed to last." },
  ]},
  { kind: "question", layer: 2, q: "I trust...", options: [
    { id: "a", text: "My intuition and spontaneous inner knowing." },
    { id: "b", text: "Logic, evidence, and my own proven competence." },
    { id: "c", text: "Tradition, time, and those who have truly earned it." },
  ]},
  { kind: "question", layer: 2, q: "My mind at rest...", options: [
    { id: "a", text: "Rarely stops — thoughts race even in moments of stillness." },
    { id: "b", text: "Analyses and plans — true rest doesn't come easily." },
    { id: "c", text: "Settles quickly — I am naturally inclined to peace." },
  ]},
  { kind: "question", layer: 2, q: "The thing I crave most is...", options: [
    { id: "a", text: "Movement, stimulation, variety." },
    { id: "b", text: "Challenge, impact, and excellence." },
    { id: "c", text: "Comfort, connection, and deep stillness." },
  ]},

  /* ─ Layer 3 / Now ───────────────────────────────────────── */
  { kind: "question", layer: 3, q: "Lately, my energy has been...", options: [
    { id: "a", text: "Scattered — I start things and don't finish." },
    { id: "b", text: "Driven but burning — I'm doing too much." },
    { id: "c", text: "Low and heavy — hard to begin anything at all." },
  ]},
  { kind: "question", layer: 3, q: "My mind lately feels...", options: [
    { id: "a", text: "Restless and racing — hard to settle or focus." },
    { id: "b", text: "Sharp but stretched — edging toward exhaustion." },
    { id: "c", text: "Foggy and slow — unmotivated without clear reason." },
  ]},
  { kind: "question", layer: 3, q: "My sleep lately is...", options: [
    { id: "a", text: "Disrupted — I wake in the night and struggle to return." },
    { id: "b", text: "Shortened — I can't turn my mind off." },
    { id: "c", text: "Excessive — I sleep long but still wake feeling tired." },
  ]},
  { kind: "question", layer: 3, q: "My digestion lately is...", options: [
    { id: "a", text: "Bloated, gassy, and inconsistent." },
    { id: "b", text: "Acidic — heartburn, loose, reactive." },
    { id: "c", text: "Sluggish and heavy — slow to clear." },
  ]},
  { kind: "question", layer: 3, q: "The emotion I'm most sitting with...", options: [
    { id: "a", text: "Fear, anxiety, or a sense of being unmoored." },
    { id: "b", text: "Anger, frustration, or a feeling of being blocked." },
    { id: "c", text: "Sadness, heaviness, or a quiet withdrawal." },
  ]},
  { kind: "question", layer: 3, q: "I feel most out of balance when...", options: [
    { id: "a", text: "I haven't had space, freedom, or spontaneity." },
    { id: "b", text: "I'm not in control or not making visible progress." },
    { id: "c", text: "I'm isolated, without purpose, or without routine." },
  ]},
  { kind: "question", layer: 3, q: "My body lately has been...", options: [
    { id: "a", text: "Dry, stiff, cold — hard to warm." },
    { id: "b", text: "Hot, inflamed, and reactive." },
    { id: "c", text: "Heavy, congested, and slow to recover." },
  ]},
  { kind: "question", layer: 3, q: "The weather affecting me most is...", options: [
    { id: "a", text: "Cold, dry, and windy." },
    { id: "b", text: "Hot, intense, or humid." },
    { id: "c", text: "Cold, wet, or overcast." },
  ]},
  { kind: "question", layer: 3, q: "The habit I most want to break...", options: [
    { id: "a", text: "Inconsistency — I cannot sustain what I begin." },
    { id: "b", text: "Perfectionism — I push until I burn." },
    { id: "c", text: "Inertia — I'm avoiding what I know I need to do." },
  ]},
  { kind: "question", layer: 3, q: "My body is most asking for...", options: [
    { id: "a", text: "Warmth, grounding, and deep stillness." },
    { id: "b", text: "Cooling, release, and softness." },
    { id: "c", text: "Movement, lightness, and stimulation." },
  ]},
  { kind: "question", layer: 3, q: "My mind is most asking for...", options: [
    { id: "a", text: "Presence — to stop the racing and arrive here." },
    { id: "b", text: "Silence — to stop analysing and simply be." },
    { id: "c", text: "Clarity — to cut through the fog and feel purpose." },
  ]},
  { kind: "question", layer: 3, q: "The inner season I'm living right now is...", options: [
    { id: "a", text: "Autumn — unpredictable, transitional, searching for ground." },
    { id: "b", text: "Summer — intense, bright, sometimes overwhelming." },
    { id: "c", text: "Late winter — slow, heavy, ready to shift." },
  ]},
  { kind: "question", layer: 3, q: "In one sentence, my body right now is...", options: [
    { id: "a", text: "Uncontained — like trying to hold wind in your hands." },
    { id: "b", text: "Overcharged — too much heat with nowhere to go." },
    { id: "c", text: "Unmoved — like still water, waiting to flow." },
  ]},
];

/* ── Build interleaved step sequence ── */
function buildSteps(): Step[] {
  const steps: Step[] = [];
  let lastLayer = 0;
  for (const q of QS) {
    if (q.layer !== lastLayer) {
      steps.push(LAYER_DEF[q.layer as 1 | 2 | 3]);
      lastLayer = q.layer;
    }
    steps.push(q);
  }
  return steps;
}

const STEPS = buildSteps(); // 46 steps: 3 layer screens + 43 questions
const TOTAL  = STEPS.length;

/* ── Background aura — breathing balanced oval ── */
function BgAura() {
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!svgRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(svgRef.current, {
        scale: 1.05, duration: 7, ease: "sine.inOut",
        yoyo: true, repeat: -1, transformOrigin: "center center",
      });
      gsap.to(svgRef.current, {
        rotation: 8, duration: 21, ease: "sine.inOut",
        yoyo: true, repeat: -1, transformOrigin: "center center",
      });
    });
    return () => ctx.revert();
  }, []);
  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute"
      style={{ bottom: "-8%", right: "-18%", width: "68vw", maxWidth: 580, opacity: 0.062 }}
      viewBox="0 0 500 470"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M 318,38 C 395,8 470,58 482,132 C 494,206 462,290 400,350 C 338,410 248,445 166,434 C 84,423 24,362 14,280 C 4,198 42,110 110,68 C 152,46 234,65 278,46 C 296,38 308,38 318,38"
        stroke="#FFEFDE"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Option card — balanced aura, AuraButton pattern ── */
function OptionCard({ opt, chosen, onPick }: {
  opt: Option; chosen: string | null; onPick: (id: string) => void;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const rafRef  = useRef(0);
  const isChosen = chosen === opt.id;
  const isDimmed = chosen !== null && !isChosen;

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const v = CARD_VARIANTS[opt.id];

  const onMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (chosen !== null || !btnRef.current || !pathRef.current) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!btnRef.current || !pathRef.current) return;
      const r  = btnRef.current.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      const ny = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      gsap.to(pathRef.current, { attr: { d: distort(v.base, v.cx, v.cy, nx, ny) }, duration: 0.45, ease: "power3.out", overwrite: true });
    });
  }, [chosen, v]);

  const onLeave = useCallback(() => {
    if (chosen !== null) return;
    cancelAnimationFrame(rafRef.current);
    if (pathRef.current)
      gsap.to(pathRef.current, { attr: { d: v.d }, duration: 1.1, ease: "elastic.out(1,0.38)", overwrite: true });
  }, [chosen, v]);

  /* Draw animation on selection */
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    if (isChosen) {
      gsap.killTweensOf(path);
      gsap.set(path, { attr: { d: v.d } });
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" });
    } else {
      gsap.set(path, { strokeDasharray: "none", strokeDashoffset: 0 });
    }
  }, [isChosen, v.d]);

  /* Stroke opacity: resting → dim → selected */
  const strokeOpacity = isDimmed ? 0.06 : isChosen ? 0.72 : 0.3;

  return (
    <button
      ref={btnRef}
      onClick={() => chosen === null && onPick(opt.id)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      tabIndex={chosen !== null ? -1 : 0}
      className={[
        "relative w-full flex items-center gap-5 px-6 py-7 text-left cursor-pointer",
        "transition-opacity duration-400",
        isDimmed ? "opacity-30" : "opacity-100",
      ].join(" ")}
    >
      {/* Balanced aura SVG border — unique blob per option */}
      <svg
        className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        viewBox={v.vb}
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        {/* Subtle fill on selected */}
        <path d={v.d} fill="#FFEFDE" fillOpacity={isChosen ? 0.04 : 0} style={{ transition: "fill-opacity 400ms ease" }} />
        {/* Aura stroke — morphs on hover */}
        <path
          ref={pathRef}
          d={v.d}
          stroke="#FFEFDE"
          strokeWidth="0.9"
          strokeOpacity={strokeOpacity}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "stroke-opacity 400ms ease" }}
        />
      </svg>

      {/* Option letter */}
      <span
        className="font-label text-[9px] text-cream flex-shrink-0 relative z-10"
        style={{ opacity: isChosen ? 1 : 0.5, transition: "opacity 300ms ease" }}
      >
        {opt.id.toUpperCase()}
      </span>

      {/* Option text */}
      <span
        className="font-serif text-cream leading-relaxed flex-1 relative z-10"
        style={{ fontSize: "clamp(0.9rem, 2.2vw, 1.08rem)", opacity: isChosen ? 1 : 0.82, transition: "opacity 300ms ease" }}
      >
        {opt.text}
      </span>

      {/* Selection indicator */}
      {isChosen && (
        <span className="flex-shrink-0 relative z-10">
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
            <circle cx="4.5" cy="4.5" r="3.75" stroke="#FFEFDE" strokeWidth="0.65" strokeOpacity="0.75" />
            <circle cx="4.5" cy="4.5" r="1.75" fill="#FFEFDE" fillOpacity="0.9" />
          </svg>
        </span>
      )}
    </button>
  );
}

/* ── Layer transition screen ── */
function LayerView({ step, onSkip }: { step: LayerScreen; onSkip: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-8 cursor-pointer"
      onClick={onSkip}
    >
      <p className="font-label text-[9px] text-cream/30 mb-7">{step.label}</p>
      <div className="w-8 h-px bg-cream/15 mb-8" />
      <h2
        className="font-serif text-cream"
        style={{ fontSize: "clamp(4.5rem, 14vw, 9rem)", lineHeight: 1.0 }}
      >
        {step.title}
      </h2>
      <p
        className="font-serif text-cream/50 mt-7 italic"
        style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}
      >
        {step.sub}
      </p>
    </div>
  );
}

/* ── Question screen ── */
function QuestionView({ step, qNum, totalQ, chosen, onPick }: {
  step: Question; qNum: number; totalQ: number;
  chosen: string | null; onPick: (id: string) => void;
}) {
  return (
    <div className="w-full max-w-xl px-7 sm:px-4">
      {/* Meta bar */}
      <div className="flex items-center justify-between mb-9">
        <span className="font-label text-[9px] text-cream/30">
          LAYER {String(step.layer).padStart(2, "0")} — {LAYER_NAMES[step.layer]}
        </span>
        <span className="font-label text-[9px] text-cream/30">
          {String(qNum).padStart(2, "0")} / {String(totalQ).padStart(2, "0")}
        </span>
      </div>

      {/* Question text */}
      <h2
        className="font-serif text-cream mb-9 leading-snug"
        style={{ fontSize: "clamp(1.55rem, 4.5vw, 2.5rem)" }}
      >
        {step.q}
      </h2>

      {/* Answer option cards */}
      <div className="flex flex-col gap-2.5">
        {step.options.map((opt) => (
          <OptionCard key={opt.id} opt={opt} chosen={chosen} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function QuizBody() {
  const [stepIdx, setStepIdx] = useState(0);
  const [chosen,  setChosen]  = useState<string | null>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const advancingRef = useRef(false);
  const stepIdxRef   = useRef(0);
  const router = useRouter();

  useEffect(() => { stepIdxRef.current = stepIdx; });

  /* Stable advance — reads stepIdx via ref to avoid stale closure */
  const advance = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    const content = contentRef.current;
    const isLast  = stepIdxRef.current >= TOTAL - 1;

    const next = () => {
      if (isLast) { router.push("/quiz/result"); return; }
      advancingRef.current = false;
      setChosen(null);
      setStepIdx((s) => s + 1);
    };

    if (!content) { next(); return; }
    gsap.to(content, { opacity: 0, y: -22, duration: 0.28, ease: FIRE, onComplete: next });
  }, [router]);

  /* Per-step enter animation + layer auto-advance */
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(content,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.95, ease: AIR, delay: 0.04 }
      );
    });
    let t: ReturnType<typeof setTimeout> | undefined;
    if (STEPS[stepIdx].kind === "layer") t = setTimeout(advance, 2800);
    return () => { ctx.revert(); clearTimeout(t); };
  }, [stepIdx, advance]);

  /* Answer selection → auto-advance */
  const handlePick = useCallback((id: string) => {
    if (chosen || advancingRef.current) return;
    setChosen(id);
    setTimeout(advance, 440);
  }, [chosen, advance]);

  /* Derived values */
  const step     = STEPS[stepIdx];
  const qsBefore = STEPS.slice(0, stepIdx).filter((s) => s.kind === "question").length;
  const qNum     = step.kind === "question" ? qsBefore + 1 : 0;
  const progress = stepIdx / (TOTAL - 1);

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-aubergine select-none">
      <BgAura />
      <Nav variant="light" hideLinks progress={progress} className="pt-10 pb-16 md:pt-14 md:pb-20" />

      <div
        ref={contentRef}
        className="relative z-10 flex flex-1 items-center justify-center py-6"
        style={{ opacity: 0 }}
      >
        <div key={stepIdx} className="w-full flex justify-center">
          {step.kind === "layer" ? (
            <LayerView step={step} onSkip={advance} />
          ) : (
            <QuestionView
              step={step}
              qNum={qNum}
              totalQ={QS.length}
              chosen={chosen}
              onPick={handlePick}
            />
          )}
        </div>
      </div>
    </main>
  );
}
