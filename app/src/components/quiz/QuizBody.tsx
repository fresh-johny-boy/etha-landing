"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { quizSounds } from "@/lib/quizSounds";

const AIR  = "expo.out";
const FIRE = "power4.in";

/* ── Aura geometry ── */
type Pt = [number, number];

function toPath(pts: Pt[]): string {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i += 3)
    d += ` C${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} ${pts[i + 1][0].toFixed(1)},${pts[i + 1][1].toFixed(1)} ${pts[i + 2][0].toFixed(1)},${pts[i + 2][1].toFixed(1)}`;
  return d;
}

/* Balanced oval — 22 control points */
const AURA_BASE: Pt[] = [
  [188,  7],
  [252,  2], [318,  4], [350, 14],
  [368, 24], [370, 42], [364, 60],
  [356, 76], [318, 86], [260, 91],
  [196, 95], [136, 93], [88,  86],
  [40,  78], [4,   60], [2,   42],
  [0,   24], [18,   8], [62,   3],
  [118,  0], [158,  3], [188,  7],
];
const AURA_D = toPath(AURA_BASE) + " Z";

/* ── Three ETHA aura types mapped to quiz choices
   A → VATA / Air:  open-ended path (no Z) — restless, airy, unclosed
   B → PITTA / Fire: classic balanced ETHA oval — confident, clear
   C → KAPHA / Earth: wide, full, relaxed blob — heavy, rounded
   Different stroke weights + heights make them legibly distinct.
   ──────────────────────────────────────────────────────────────── */
const OPTION_AURAS = {
  a: {
    // Real ETHA brand aura (aura-balanced-01.svg) — authentic organic oval with kink
    vb: "0 0 392 250",
    d: "M307.86,21.36C265.47-.88,211.17-3.86,163.55,9.51c-47.61,13.37-90.21,41.08-126.94,74.17C19.29,99.28,2.05,118.52,1.51,141.81c-.53,23.31,16.07,43.59,34.47,57.96,34.84,27.2,78.6,41.24,122.54,46.24,39.66,4.51,80.11,2.02,118.92-7.32,30.23-7.28,60.27-19.2,82.67-40.75,22.4-21.55,35.89-54.16,28.46-84.32-6.21-25.19-25.58-45.09-46.55-60.41-11.81-8.63,8.24-9.62,-34.15-31.85Z",
    sw: 2.0,
    pad: "py-7",
  },
  b: {
    // Idealized clean oval — Pitta precision
    vb: "0 0 400 76",
    d: "M 196,5 C 264,-1 348,4 386,19 C 408,30 412,47 405,61 C 396,73 354,79 278,81 C 206,83 120,81 52,76 C 6,68 -8,52 4,37 C 16,20 50,7 106,5 C 148,2 172,5 196,5 Z",
    sw: 1.05,
    pad: "py-7",
  },
  c: {
    // Double-hump wave top — Kapha earth/water, peaks extend above button
    vb: "0 0 400 106",
    d: "M 80,14 C 118,-4 158,24 200,4 C 242,-10 282,24 318,6 C 354,-4 392,12 402,36 C 410,54 402,74 378,86 C 346,98 286,104 218,104 C 150,104 86,100 44,86 C 6,72 -6,50 4,30 C 16,8 50,-4 80,14 Z",
    sw: 1.4,
    pad: "py-10",
  },
} as const;

/* ── Blob mask shapes for visual questions ────────────────────────────────
   Three DRAMATICALLY different silhouettes — shape IS character:
   A → Vata / Air   : tall narrow teardrop — thin, airy (aspect 0.49:1)
   B → Pitta / Fire : compact rounder blob  — focused, squarish (1.07:1)
   C → Kapha / Earth: wide landscape pebble — heavy, flat (1.81:1)
   containerW drives layout width so each card looks truly distinct.
   ──────────────────────────────────────────────────────────────────────── */
const BLOB_MASKS = {
  a: {
    vb: "0 0 112 228", w: 112, h: 228, containerW: 112,
    d: "M 56,4 C 78,2 104,20 108,62 C 112,102 100,152 82,184 C 66,212 46,226 30,220 C 14,214 2,196 2,166 C 2,132 14,88 28,58 C 42,26 40,4 56,4 Z",
  },
  b: {
    vb: "0 0 182 170", w: 182, h: 170, containerW: 160,
    d: "M 90,5 C 128,2 166,22 178,60 C 190,98 180,136 156,158 C 132,180 84,184 48,168 C 14,152 -2,114 4,78 C 10,44 32,16 64,6 C 76,2 86,5 90,5 Z",
  },
  c: {
    vb: "0 0 250 138", w: 250, h: 138, containerW: 215,
    d: "M 124,8 C 176,2 238,22 246,56 C 254,88 238,118 200,130 C 164,142 116,138 76,128 C 36,118 2,96 4,66 C 6,36 36,10 80,6 C 100,2 116,10 124,8 Z",
  },
} as const;

/* ── Element images — Vata/Pitta/Kapha semantic mapping ── */
const VISUAL_IMG: Record<string, string> = {
  a: "air.webp",
  b: "fire.webp",
  c: "earth.webp",
};

/* ── Types ── */
type LayerScreen = { kind: "layer"; layer: 1 | 2 | 3; label: string; title: string; sub: string };
type OptDef      = { id: string; text: string };

type ChoiceQ = { kind: "question"; qtype?: "choice"; layer: 1|2|3; q: string; options: OptDef[] };
type VisualQ = { kind: "question"; qtype: "visual";  layer: 1|2|3; q: string; options: OptDef[] };
type Scale2Q = { kind: "question"; qtype: "scale2";  layer: 1|2|3; q: string; poleA: string; poleB: string };
type Scale3Q = { kind: "question"; qtype: "scale3";  layer: 1|2|3; q: string; poleA: string; middle: string; poleB: string };
type OpenQ   = { kind: "question"; qtype: "open";    layer: 1|2|3; q: string; placeholder: string; bonus?: { q: string; placeholder: string } };
type Question = ChoiceQ | VisualQ | Scale2Q | Scale3Q | OpenQ;
type Step     = LayerScreen | Question;

/* ── Layer BG paths — distinct aura silhouette per section ── */
const LAYER_BG: Record<1|2|3, string> = {
  1: "M 318,38 C 395,8 470,58 482,132 C 494,206 462,290 400,350 C 338,410 248,445 166,434 C 84,423 24,362 14,280 C 4,198 42,110 110,68 C 152,46 234,65 278,46 C 296,38 308,38 318,38",
  2: "M 240,30 C 320,2 410,40 440,112 C 470,180 452,272 394,330 C 336,386 244,400 162,386 C 90,372 24,316 8,244 C -8,172 22,102 74,60 C 118,28 184,46 224,32 C 236,26 238,28 240,30",
  3: "M 300,26 C 380,2 464,46 476,120 C 488,198 454,294 392,352 C 330,410 236,434 154,420 C 74,406 8,350 2,272 C -4,194 38,110 100,68 C 148,42 230,62 274,42 C 292,34 298,26 300,26",
};

/* ── Layer definitions ── */
const LAYER_DEF: Record<1|2|3, LayerScreen> = {
  1: { kind: "layer", layer: 1, label: "I",   title: "Body",   sub: "What your physical form reveals."  },
  2: { kind: "layer", layer: 2, label: "II",  title: "Mind",   sub: "What your inner world reveals."    },
  3: { kind: "layer", layer: 3, label: "III", title: "Spirit", sub: "What this moment reveals."         },
};

/* ── 45 Questions (all 5 interaction types) ── */
const QS: Question[] = [
  /* ─ Layer 1 / Body ─────────────────────────────────────────── */
  { kind: "question", layer: 1, q: "My body frame is naturally…", options: [
    { id: "a", text: "Lean and light — hard to gain weight no matter what I eat." },
    { id: "b", text: "Medium and muscular — I gain and lose weight with relative ease." },
    { id: "c", text: "Solid and sturdy — I gain weight easily and hold it." },
  ]},
  { kind: "question", layer: 1, q: "My skin tends to be…", options: [
    { id: "a", text: "Dry, thin, and rough — cool to the touch." },
    { id: "b", text: "Warm, flushed, sensitive — prone to redness or inflammation." },
    { id: "c", text: "Thick, smooth, oily — cool and moist." },
  ]},
  { kind: "question", layer: 1, q: "My hair is naturally…", options: [
    { id: "a", text: "Dry, fine, frizzy, or curly." },
    { id: "b", text: "Fine and oily — tends to thin or grey early." },
    { id: "c", text: "Thick, wavy, lush — naturally oily." },
  ]},
  { kind: "question", layer: 1, q: "My hands and feet are usually…", options: [
    { id: "a", text: "Cold with variable temperature — always reaching for warmth." },
    { id: "b", text: "Warm, even hot — I consistently run warm." },
    { id: "c", text: "Cool and steady — neither cold nor hot." },
  ]},
  { kind: "question", layer: 1, q: "My digestion is…", options: [
    { id: "a", text: "Irregular — sometimes strong, sometimes completely off." },
    { id: "b", text: "Sharp and intense — I become irritable when hunger strikes." },
    { id: "c", text: "Slow but steady — I rarely feel hunger urgently." },
  ]},
  { kind: "question", layer: 1, q: "My appetite day to day is…", options: [
    { id: "a", text: "Variable — I forget to eat, then am suddenly ravenous." },
    { id: "b", text: "Strong and consistent — I must eat on schedule." },
    { id: "c", text: "Moderate — I could eat or skip a meal and feel fine." },
  ]},
  { kind: "question", layer: 1, q: "My sleep is…", options: [
    { id: "a", text: "Light and interrupted — I'm a restless sleeper." },
    { id: "b", text: "Moderate — I wake early with my mind already running." },
    { id: "c", text: "Deep and long — I could sleep ten hours without effort." },
  ]},
  { kind: "question", layer: 1, q: "My energy moves in…", options: [
    { id: "a", text: "Unpredictable bursts — intense, then suddenly exhausted." },
    { id: "b", text: "Sustained peaks — most productive in the middle of the day." },
    { id: "c", text: "Slow crescendos — I build and hold energy through the day." },
  ]},
  /* scale2 */
  { kind: "question", qtype: "scale2", layer: 1, q: "Your body has known this for years. The temperature you keep.",
    poleA: "Cold. Always borrowing warmth from the world.",
    poleB: "Hot. Always trying to release some of it.",
  },
  /* visual */
  { kind: "question", qtype: "visual", layer: 1, q: "If your body had a texture right now, what would it be?", options: [
    { id: "a", text: "Dry, cool, always a little thin." },
    { id: "b", text: "Warm, flushed, quick to react." },
    { id: "c", text: "Soft, full, holds moisture easily." },
  ]},
  { kind: "question", layer: 1, q: "When illness comes, it tends toward…", options: [
    { id: "a", text: "Anxiety, nervous exhaustion, dry and cold conditions." },
    { id: "b", text: "Fever, inflammation, or infection." },
    { id: "c", text: "Congestion, excess mucus, and heaviness." },
  ]},
  /* open */
  { kind: "question", qtype: "open", layer: 1, q: "One sentence, or skip. What does your body most need right now that it is not getting?",
    placeholder: "rest, warmth, stillness, to be seen",
  },
  { kind: "question", layer: 1, q: "My elimination is…", options: [
    { id: "a", text: "Irregular — prone to constipation or inconsistency." },
    { id: "b", text: "Regular and sometimes loose — occasionally urgent." },
    { id: "c", text: "Heavy and regular — well-formed and predictable." },
  ]},
  { kind: "question", layer: 1, q: "My voice naturally is…", options: [
    { id: "a", text: "Quick, high-pitched, variable — I speak fast." },
    { id: "b", text: "Clear, direct, sharp — I say exactly what I mean." },
    { id: "c", text: "Deep, resonant, melodious — I choose words slowly." },
  ]},
  { kind: "question", layer: 1, q: "My lips tend to be…", options: [
    { id: "a", text: "Thin, dry, frequently chapped." },
    { id: "b", text: "Medium, sometimes sensitive or prone to sores." },
    { id: "c", text: "Full, soft, and well-defined." },
  ]},

  /* ─ Layer 2 / Mind ──────────────────────────────────────────── */
  { kind: "question", layer: 2, q: "My thinking style is…", options: [
    { id: "a", text: "Quick and creative — many ideas at once, hard to settle." },
    { id: "b", text: "Sharp and analytical — I think in systems and conclusions." },
    { id: "c", text: "Steady and methodical — I think slowly but think it through." },
  ]},
  /* scale3 */
  { kind: "question", qtype: "scale3", layer: 2, q: "When you have something important to do. Your energy shows up like:",
    poleA: "Strong at the start, hard to keep going.",
    middle: "I lock in and push through, even when I should rest.",
    poleB: "Takes time to start. Once it does, I do not stop.",
  },
  { kind: "question", layer: 2, q: "My memory tends to be…", options: [
    { id: "a", text: "Quick to grasp but quick to lose — it moves with me." },
    { id: "b", text: "Sharp and clear for what matters most." },
    { id: "c", text: "Slow to form, but once held — virtually permanent." },
  ]},
  { kind: "question", layer: 2, q: "Under pressure, I tend to…", options: [
    { id: "a", text: "Scatter — anxiety rises, I lose my centre." },
    { id: "b", text: "Sharpen — I become focused but also controlling." },
    { id: "c", text: "Withdraw — I become quiet, stubborn, or close down." },
  ]},
  /* visual */
  { kind: "question", qtype: "visual", layer: 2, q: "Two doors. What do you actually do? Which one?", options: [
    { id: "a", text: "Open both. Look for a third." },
    { id: "b", text: "Wait until one feels right." },
    { id: "c", text: "Pick one. Walk through. Do not look back." },
  ]},
  { kind: "question", layer: 2, q: "In conversation, I…", options: [
    { id: "a", text: "Jump between topics quickly — I love ideas more than conclusions." },
    { id: "b", text: "Speak precisely — I make my point and defend it." },
    { id: "c", text: "Listen more than I speak — words are chosen carefully." },
  ]},
  { kind: "question", layer: 2, q: "My relationship with time is…", options: [
    { id: "a", text: "Loose — I'm often late, time escapes me effortlessly." },
    { id: "b", text: "Precise — I'm punctual and dislike being kept waiting." },
    { id: "c", text: "Steady — I move at my own unhurried pace." },
  ]},
  /* scale3 */
  { kind: "question", qtype: "scale3", layer: 2, q: "When you need to focus on something important. What actually happens?",
    poleA: "My mind wanders. Ten minutes in, I am somewhere else.",
    middle: "I lock in. Nothing else exists. Sometimes for too long.",
    poleB: "Takes forever to start. Once I do, I can go for hours.",
  },
  { kind: "question", layer: 2, q: "I am most motivated by…", options: [
    { id: "a", text: "Freedom, creativity, and the call of the new." },
    { id: "b", text: "Achievement, mastery, and being recognised for it." },
    { id: "c", text: "Belonging, security, and deep harmony." },
  ]},
  { kind: "question", layer: 2, q: "My emotional expression is…", options: [
    { id: "a", text: "Expansive and changing — I wear feelings openly." },
    { id: "b", text: "Controlled but intense — I feel deeply beneath stillness." },
    { id: "c", text: "Slow and contained — emotions simmer quietly inside." },
  ]},
  /* open */
  { kind: "question", qtype: "open", layer: 2, q: "One detail is enough. Or skip. If you could design a space for your mind to rest in, what would be there?",
    placeholder: "silence, water, soft light, nothing",
  },
  /* visual */
  { kind: "question", qtype: "visual", layer: 2, q: "Your mental energy this month. Which image?", options: [
    { id: "a", text: "Fire burning too bright." },
    { id: "b", text: "Candle flickering in wind." },
    { id: "c", text: "Embers under ash." },
  ]},
  { kind: "question", layer: 2, q: "I trust…", options: [
    { id: "a", text: "My intuition and spontaneous inner knowing." },
    { id: "b", text: "Logic, evidence, and my own proven competence." },
    { id: "c", text: "Tradition, time, and those who have truly earned it." },
  ]},
  { kind: "question", layer: 2, q: "My mind at rest…", options: [
    { id: "a", text: "Rarely stops — thoughts race even in moments of stillness." },
    { id: "b", text: "Analyses and plans — true rest doesn't come easily." },
    { id: "c", text: "Settles quickly — I am naturally inclined to peace." },
  ]},
  { kind: "question", layer: 2, q: "The thing I crave most is…", options: [
    { id: "a", text: "Movement, stimulation, variety." },
    { id: "b", text: "Challenge, impact, and excellence." },
    { id: "c", text: "Comfort, connection, and deep stillness." },
  ]},

  /* ─ Layer 3 / Spirit ────────────────────────────────────────── */
  { kind: "question", layer: 3, q: "Lately, my energy has been…", options: [
    { id: "a", text: "Scattered — I start things and don't finish." },
    { id: "b", text: "Driven but burning — I'm doing too much." },
    { id: "c", text: "Low and heavy — hard to begin anything at all." },
  ]},
  { kind: "question", layer: 3, q: "My mind lately feels…", options: [
    { id: "a", text: "Restless and racing — hard to settle or focus." },
    { id: "b", text: "Sharp but stretched — edging toward exhaustion." },
    { id: "c", text: "Foggy and slow — unmotivated without clear reason." },
  ]},
  { kind: "question", layer: 3, q: "My sleep lately is…", options: [
    { id: "a", text: "Disrupted — I wake in the night and struggle to return." },
    { id: "b", text: "Shortened — I can't turn my mind off." },
    { id: "c", text: "Excessive — I sleep long but still wake feeling tired." },
  ]},
  { kind: "question", layer: 3, q: "My digestion lately is…", options: [
    { id: "a", text: "Bloated, gassy, and inconsistent." },
    { id: "b", text: "Acidic — heartburn, loose, reactive." },
    { id: "c", text: "Sluggish and heavy — slow to clear." },
  ]},
  { kind: "question", layer: 3, q: "The emotion I'm most sitting with…", options: [
    { id: "a", text: "Fear, anxiety, or a sense of being unmoored." },
    { id: "b", text: "Anger, frustration, or a feeling of being blocked." },
    { id: "c", text: "Sadness, heaviness, or a quiet withdrawal." },
  ]},
  { kind: "question", layer: 3, q: "I feel most out of balance when…", options: [
    { id: "a", text: "I haven't had space, freedom, or spontaneity." },
    { id: "b", text: "I'm not in control or not making visible progress." },
    { id: "c", text: "I'm isolated, without purpose, or without routine." },
  ]},
  { kind: "question", layer: 3, q: "My body lately has been…", options: [
    { id: "a", text: "Dry, stiff, cold — hard to warm." },
    { id: "b", text: "Hot, inflamed, and reactive." },
    { id: "c", text: "Heavy, congested, and slow to recover." },
  ]},
  /* scale2 */
  { kind: "question", qtype: "scale2", layer: 3, q: "When something ends. A chapter, a relationship, a phase. How do you leave?",
    poleA: "Quick. Already gone before the goodbye.",
    poleB: "Slowly. I need time to say what it meant.",
  },
  { kind: "question", layer: 3, q: "The habit I most want to break…", options: [
    { id: "a", text: "Inconsistency — I cannot sustain what I begin." },
    { id: "b", text: "Perfectionism — I push until I burn." },
    { id: "c", text: "Inertia — I'm avoiding what I know I need to do." },
  ]},
  { kind: "question", layer: 3, q: "My body is most asking for…", options: [
    { id: "a", text: "Warmth, grounding, and deep stillness." },
    { id: "b", text: "Cooling, release, and softness." },
    { id: "c", text: "Movement, lightness, and stimulation." },
  ]},
  /* visual */
  { kind: "question", qtype: "visual", layer: 3, q: "If your spirit had a texture right now. What would it be?", options: [
    { id: "a", text: "Silk scarf in wind." },
    { id: "b", text: "Blade edge, sharp." },
    { id: "c", text: "Wet clay, dense." },
  ]},
  { kind: "question", layer: 3, q: "The inner season I'm living right now is…", options: [
    { id: "a", text: "Autumn — unpredictable, transitional, searching for ground." },
    { id: "b", text: "Summer — intense, bright, sometimes overwhelming." },
    { id: "c", text: "Late winter — slow, heavy, ready to shift." },
  ]},
  /* open with bonus */
  { kind: "question", qtype: "open", layer: 3, q: "One sentence. Or skip. If you could tell your younger self one thing about who you are becoming, what would it be?",
    placeholder: "You are exactly where you need to be.",
    bonus: { q: "One word for what your spirit needs most right now.", placeholder: "rest, fire, ground, space, permission" },
  },
];

/* ── Layer section icons — mirrors Nav SECTION_ICONS ── */
const LAYER_ICONS: Record<1|2|3, { viewBox: string; paths: { d: string; sw: number }[] }> = {
  1: {
    viewBox: "22 8 66 76",
    paths: [
      { d: "M 55 12 C 45 10 38 18 38 28 C 38 38 46 44 55 44 C 64 44 72 38 72 28 C 72 18 65 10 55 12 Z", sw: 2.4 },
      { d: "M 28 62 C 36 52 46 48 55 48 C 64 48 74 52 82 62", sw: 2.4 },
      { d: "M 55 44 C 55 50 54 56 55 64", sw: 2.4 },
    ],
  },
  2: {
    viewBox: "18 6 74 60",
    paths: [
      { d: "M 24 36 C 32 12 78 12 86 36", sw: 2.4 },
      { d: "M 24 36 C 32 60 78 60 86 36", sw: 2.4 },
      { d: "M 51 36 C 51 30 59 30 59 36 C 59 42 51 42 51 36 Z", sw: 2.4 },
    ],
  },
  3: {
    viewBox: "18 10 74 78",
    paths: [
      { d: "M 55 80 C 47 66 43 48 55 32 C 67 48 63 66 55 80 Z", sw: 2.4 },
      { d: "M 55 80 C 40 70 30 54 38 38 C 46 50 52 66 55 80 Z", sw: 2.4 },
      { d: "M 55 80 C 70 70 80 54 72 38 C 64 50 58 66 55 80 Z", sw: 2.4 },
      { d: "M 26 84 C 36 80 46 82 55 80 C 64 82 74 80 84 84", sw: 2.4 },
    ],
  },
};

/* ── Build step sequence ── */
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

const STEPS = buildSteps();
const TOTAL  = STEPS.length;

/* ────────────────────────────────────────────────────────
   Background aura — slow breathing, layer-aware path
   ──────────────────────────────────────────────────────── */
function BgAura({ layer }: { layer: 1 | 2 | 3 }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(svgRef.current, {
        scale: 1.05, duration: 7, ease: "sine.inOut",
        yoyo: true, repeat: -1, transformOrigin: "center center",
      });
      gsap.to(svgRef.current, {
        rotation: 8, duration: 22, ease: "sine.inOut",
        yoyo: true, repeat: -1, transformOrigin: "center center",
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute"
      style={{ bottom: "-8%", right: "-18%", width: "68vw", maxWidth: 600, opacity: 0.055 }}
      viewBox="0 0 500 470"
      fill="none"
      aria-hidden="true"
    >
      <path d={LAYER_BG[layer]} stroke="#FFEFDE" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────
   Layer transition — cinematic GSAP reveal
   ──────────────────────────────────────────────────────── */
function LayerView({ step, onSkip, entryDelay = 0 }: { step: LayerScreen; onSkip: () => void; entryDelay?: number }) {
  const iconRef  = useRef<SVGSVGElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const icon     = LAYER_ICONS[step.layer];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: entryDelay });
      tl
        .fromTo(iconRef.current,
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.9, ease: AIR },
          0,
        )
        .fromTo(titleRef.current,
          { opacity: 0, scale: 1.07, y: 12 },
          { opacity: 1, scale: 1, y: 0, duration: 1.15, ease: AIR },
          0.25,
        );
    });
    return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center text-center px-8 cursor-pointer select-none"
      onClick={onSkip}
    >
      <svg
        ref={iconRef}
        width="96"
        height="96"
        viewBox={icon.viewBox}
        fill="none"
        aria-hidden="true"
        className="mb-8"
        style={{ opacity: 0 }}
      >
        {icon.paths.map((p, pi) => (
          <path
            key={pi}
            d={p.d}
            stroke="#FFEFDE"
            strokeWidth={p.sw}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.65"
          />
        ))}
      </svg>

      <h2
        ref={titleRef}
        className="font-serif text-cream"
        style={{ fontSize: "clamp(5rem, 16vw, 10.5rem)", lineHeight: 0.92, opacity: 0 }}
      >
        {step.title}
      </h2>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Shared aura SVG overlay — invisible at rest, draws on selection
   ──────────────────────────────────────────────────────── */
function AuraSvg({
  pathRef,
  viewBoxH = 96,
}: {
  pathRef: React.RefObject<SVGPathElement | null>;
  viewBoxH?: number;
}) {
  return (
    <svg
      className="pointer-events-none absolute overflow-visible"
      viewBox={`0 0 372 ${viewBoxH}`}
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      style={{ left: "-14px", top: "-10px", width: "calc(100% + 28px)", height: "calc(100% + 20px)" }}
    >
      <path
        ref={pathRef}
        d={AURA_D}
        stroke="#FFEFDE"
        strokeWidth="0.85"
        strokeOpacity="0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────
   Shared selection + entry animation
   ──────────────────────────────────────────────────────── */
function useOptionAnim(
  wrapRef: React.RefObject<HTMLElement | null>,
  pathRef: React.RefObject<SVGPathElement | null>,
  chosen: string | null,
  id: string,
  entryDelay: number,
  defaultOpacity: number,
) {
  /* Entry — stagger slide-up into opacity target */
  useEffect(() => {
    if (!wrapRef.current) return;
    gsap.fromTo(
      wrapRef.current,
      { opacity: 0, y: 14 },
      { opacity: defaultOpacity, y: 0, duration: 0.55, ease: AIR, delay: entryDelay },
    );
  // entryDelay and defaultOpacity are stable for component lifetime
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Selection state */
  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || chosen === null) return;

    const isSelected = chosen === id;

    gsap.to(wrap, {
      opacity: isSelected ? 1 : 0.14,
      duration: 0.32,
      ease: "power2.out",
      overwrite: true,
    });

    if (isSelected && path) {
      gsap.killTweensOf(path);
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, strokeOpacity: 0 });
      gsap.to(path, { strokeDashoffset: 0, strokeOpacity: 0.75, duration: 0.72, ease: "power2.inOut" });
    } else if (path) {
      gsap.to(path, { strokeOpacity: 0, duration: 0.15, overwrite: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosen]);
}

/* ────────────────────────────────────────────────────────
   Option row — A / B / C aura-ring pill cards
   Each option has a distinct organic oval aura character.
   Rest: ghosted ring at 9% opacity.
   Selected: ring draws itself + brightens. Others dim.
   ──────────────────────────────────────────────────────── */
function OptionRow({ opt, chosen, onPick, entryDelay = 0 }: {
  opt: OptDef; chosen: string | null;
  onPick: (id: string) => void;
  entryDelay?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const aura = OPTION_AURAS[opt.id as keyof typeof OPTION_AURAS] ?? OPTION_AURAS.b;

  /* Entry stagger */
  useEffect(() => {
    if (!wrapRef.current) return;
    gsap.fromTo(wrapRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.6, ease: AIR, delay: entryDelay },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Selection state */
  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || chosen === null) return;
    const isSelected = chosen === opt.id;

    gsap.to(wrap, { opacity: isSelected ? 1 : 0.12, duration: 0.38, ease: "power2.out", overwrite: true });

    if (isSelected && path) {
      gsap.killTweensOf(path);
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, strokeOpacity: 0.22 });
      gsap.to(path, { strokeDashoffset: 0, strokeOpacity: 0.88, duration: 0.9, ease: "power2.inOut" });
    } else if (path) {
      gsap.to(path, { strokeOpacity: 0.05, duration: 0.22, overwrite: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosen]);

  return (
    <div ref={wrapRef as React.RefObject<HTMLDivElement>} className="relative" style={{ opacity: 0 }}>
      <button
        onClick={() => chosen === null && onPick(opt.id)}
        tabIndex={chosen !== null ? -1 : 0}
        className={`relative w-full text-center px-10 ${aura.pad} min-h-[52px] cursor-pointer`}
      >
        {/* Per-option organic aura ring — unique shape per A/B/C */}
        <svg
          className="pointer-events-none absolute overflow-visible"
          viewBox={aura.vb}
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
          style={{ left: "-14px", top: "-8px", width: "calc(100% + 28px)", height: "calc(100% + 16px)" }}
        >
          <path
            ref={pathRef}
            d={aura.d}
            stroke="#FFEFDE"
            strokeWidth={aura.sw}
            strokeOpacity="0.22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span
          className="font-serif text-cream leading-snug block relative z-10"
          style={{ fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)" }}
        >
          {opt.text}
        </span>
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Visual card — blob-masked image tile + text label
   Each option uses a distinct organic blob shape.
   Entry: scale+fade stagger. Selection: outline draws, others dim.
   ──────────────────────────────────────────────────────── */
function VisualCard({ opt, chosen, onPick, entryDelay = 0 }: {
  opt: OptDef; chosen: string | null;
  onPick: (id: string) => void;
  entryDelay?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const blob    = BLOB_MASKS[opt.id as keyof typeof BLOB_MASKS] ?? BLOB_MASKS.b;
  const clipId  = `blob-clip-${opt.id}`;

  useEffect(() => {
    if (!wrapRef.current) return;
    gsap.fromTo(wrapRef.current,
      { opacity: 0, scale: 0.9, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.65, ease: AIR, delay: entryDelay },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || chosen === null) return;
    const isSelected = chosen === opt.id;
    gsap.to(wrap, { opacity: isSelected ? 1 : 0.18, duration: 0.35, ease: "power2.out", overwrite: true });
    if (isSelected && path) {
      gsap.killTweensOf(path);
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, strokeOpacity: 0 });
      gsap.to(path, { strokeDashoffset: 0, strokeOpacity: 0.9, duration: 0.85, ease: "power2.inOut" });
    } else if (path) {
      gsap.to(path, { strokeOpacity: 0.14, duration: 0.2, overwrite: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosen]);

  return (
    <div
      ref={wrapRef}
      className="flex flex-col items-center gap-3"
      style={{ opacity: 0 }}
    >
      <button
        onClick={() => chosen === null && onPick(opt.id)}
        tabIndex={chosen !== null ? -1 : 0}
        className="cursor-pointer w-full block"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <svg
          width="100%"
          viewBox={blob.vb}
          fill="none"
          aria-hidden="true"
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <clipPath id={clipId}>
              <path d={blob.d} />
            </clipPath>
          </defs>
          {/* Image placeholder — clipped to blob shape */}
          <rect
            x="0" y="0"
            width={blob.w} height={blob.h}
            fill="#FFEFDE"
            fillOpacity="0.07"
            clipPath={`url(#${clipId})`}
          />
          {/* Inner fill for depth */}
          <path d={blob.d} fill="#FFEFDE" fillOpacity="0.03" />
          {/* Organic outline — draws on selection */}
          <path
            ref={pathRef}
            d={blob.d}
            stroke="#FFEFDE"
            strokeWidth="1.2"
            strokeOpacity="0.18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <p
        className="font-serif text-cream text-center leading-snug px-1"
        style={{ fontSize: "clamp(0.82rem, 2.1vw, 0.95rem)", opacity: 0.75 }}
      >
        {opt.text}
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Scale node — spectrum with circle indicator
   ──────────────────────────────────────────────────────── */
function ScaleNode({ id, text, pos, total, chosen, onPick, entryDelay = 0 }: {
  id: string; text: string; pos: number; total: number;
  chosen: string | null; onPick: (id: string) => void;
  entryDelay?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const isChosen = chosen === id;
  const isFirst  = pos === 0;
  const isLast   = pos === total - 1;
  useOptionAnim(wrapRef, pathRef, chosen, id, entryDelay, 0.85);

  return (
    <div
      ref={wrapRef as React.RefObject<HTMLDivElement>}
      className="flex items-stretch gap-6"
      style={{ opacity: 0 }}
    >
      {/* Track column */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 26 }}>
        <div
          className="w-px bg-cream/20 flex-1"
          style={{ minHeight: isFirst ? 0 : 28, opacity: isFirst ? 0 : 1 }}
        />
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="flex-shrink-0 my-1.5">
          <circle
            cx="13" cy="13" r="9.5"
            stroke="#FFEFDE"
            strokeOpacity={isChosen ? 0.9 : 0.28}
            strokeWidth="0.85"
          />
          {isChosen && (
            <circle cx="13" cy="13" r="4.5" fill="#FFEFDE" fillOpacity="0.9" />
          )}
        </svg>
        <div
          className="w-px bg-cream/20 flex-1"
          style={{ minHeight: isLast ? 0 : 28, opacity: isLast ? 0 : 1 }}
        />
      </div>

      {/* Text + aura */}
      <button
        onClick={() => chosen === null && onPick(id)}
        tabIndex={chosen !== null ? -1 : 0}
        className="relative flex-1 text-left py-5 min-h-[60px] cursor-pointer"
      >
        <AuraSvg pathRef={pathRef} />
        <span
          className="font-serif text-cream leading-snug block relative z-10"
          style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)" }}
        >
          {text}
        </span>
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Open text question
   ──────────────────────────────────────────────────────── */
function OpenQuestion({ step, onAdvance }: { step: OpenQ; onAdvance: () => void }) {
  const [val, setVal]     = useState("");
  const [bonus, setBonus] = useState("");
  const qRef              = useRef<HTMLHeadingElement>(null);
  const areaRef           = useRef<HTMLDivElement>(null);
  const showBonus = step.bonus && val.trim().length > 0;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(qRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.75, ease: AIR, delay: 0.1 },
      );
      gsap.fromTo(areaRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.65, ease: AIR, delay: 0.45 },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full max-w-2xl px-8 sm:px-10">
      <h2
        ref={qRef}
        className="font-serif text-cream mb-10 leading-snug"
        style={{ fontSize: "clamp(2rem, 5.5vw, 3.5rem)", opacity: 0 }}
      >
        {step.q}
      </h2>

      <div ref={areaRef} style={{ opacity: 0 }}>
        <textarea
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder={step.placeholder}
          rows={3}
          className={[
            "w-full bg-transparent resize-none outline-none",
            "font-serif text-cream leading-relaxed",
            "placeholder:text-cream/28 placeholder:italic",
            "border-b border-cream/[0.1] pb-3",
          ].join(" ")}
          style={{ fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)" }}
        />

        {showBonus && step.bonus && (
          <div className="mt-10 mb-2">
            <p className="font-label text-[9px] text-cream/32 mb-4">{step.bonus.q}</p>
            <textarea
              value={bonus}
              onChange={e => setBonus(e.target.value)}
              placeholder={step.bonus.placeholder}
              rows={2}
              className={[
                "w-full bg-transparent resize-none outline-none",
                "font-serif text-cream leading-relaxed",
                "placeholder:text-cream/28 placeholder:italic",
                "border-b border-cream/[0.1] pb-3",
              ].join(" ")}
              style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.1rem)" }}
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-10">
          <button
            onClick={onAdvance}
            className="font-label text-[9px] text-cream/32 hover:text-cream/60 transition-colors cursor-pointer min-h-[48px] pr-8"
          >
            SKIP
          </button>
          {val.trim().length > 0 && (
            <button
              onClick={onAdvance}
              className="relative font-label text-[9px] text-cream cursor-pointer min-h-[48px] px-8 py-4"
            >
              <svg
                className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
                viewBox="0 0 200 48"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M 98,4 C 136,1 170,3 186,10 C 198,16 200,28 196,38 C 190,46 158,50 100,51 C 42,51 8,46 4,38 C 0,28 4,16 16,10 C 32,3 62,1 98,4"
                  stroke="#FFEFDE"
                  strokeWidth="0.75"
                  strokeOpacity="0.4"
                  strokeLinecap="round"
                />
              </svg>
              <span className="relative z-10">CONTINUE</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Question router — all 5 types
   ──────────────────────────────────────────────────────── */
function QuestionView({ step, chosen, onPick, onAdvance }: {
  step: Question; chosen: string | null;
  onPick: (id: string) => void;
  onAdvance: () => void;
}) {
  const qRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!qRef.current) return;
    gsap.fromTo(
      qRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.75, ease: AIR, delay: 0.08 },
    );
  }, []);

  if (step.qtype === "open") return <OpenQuestion step={step} onAdvance={onAdvance} />;

  if (step.qtype === "visual") {
    const opts = step.options;
    return (
      <div className="w-full px-5 sm:px-8">
        <h2
          ref={qRef}
          className="font-serif text-cream mb-10 leading-snug text-center max-w-lg mx-auto"
          style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", opacity: 0 }}
        >
          {step.q}
        </h2>
        {/* Triangle: A (top-left) + B (top-right), C (bottom-center) */}
        <div className="max-w-sm mx-auto">
          <div className="grid grid-cols-2 gap-5 mb-5">
            <VisualCard opt={opts[0]} chosen={chosen} onPick={onPick} entryDelay={0.30} />
            <VisualCard opt={opts[1]} chosen={chosen} onPick={onPick} entryDelay={0.44} />
          </div>
          <div className="flex justify-center">
            <div className="w-[55%]">
              <VisualCard opt={opts[2]} chosen={chosen} onPick={onPick} entryDelay={0.58} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step.qtype === "scale2") return (
    <div className="w-full max-w-2xl px-8 sm:px-10">
      <h2 ref={qRef} className="font-serif text-cream mb-12 leading-snug"
          style={{ fontSize: "clamp(2rem, 5.5vw, 3.5rem)", opacity: 0 }}>
        {step.q}
      </h2>
      <div className="flex items-center gap-3 mb-10">
        <div className="flex-1 h-px bg-cream/10" />
        <span className="font-label text-[9px] text-cream/28" style={{ letterSpacing: "0.3em" }}>SPECTRUM</span>
        <div className="flex-1 h-px bg-cream/10" />
      </div>
      <div>
        <ScaleNode id="a" text={step.poleA} pos={0} total={2} chosen={chosen} onPick={onPick} entryDelay={0.42} />
        <ScaleNode id="b" text={step.poleB} pos={1} total={2} chosen={chosen} onPick={onPick} entryDelay={0.54} />
      </div>
    </div>
  );

  if (step.qtype === "scale3") return (
    <div className="w-full max-w-2xl px-8 sm:px-10">
      <h2 ref={qRef} className="font-serif text-cream mb-12 leading-snug"
          style={{ fontSize: "clamp(2rem, 5.5vw, 3.5rem)", opacity: 0 }}>
        {step.q}
      </h2>
      <div className="flex items-center gap-3 mb-10">
        <div className="flex-1 h-px bg-cream/10" />
        <span className="font-label text-[9px] text-cream/28" style={{ letterSpacing: "0.3em" }}>SPECTRUM</span>
        <div className="flex-1 h-px bg-cream/10" />
      </div>
      <div>
        <ScaleNode id="a" text={step.poleA}  pos={0} total={3} chosen={chosen} onPick={onPick} entryDelay={0.42} />
        <ScaleNode id="b" text={step.middle} pos={1} total={3} chosen={chosen} onPick={onPick} entryDelay={0.54} />
        <ScaleNode id="c" text={step.poleB}  pos={2} total={3} chosen={chosen} onPick={onPick} entryDelay={0.66} />
      </div>
    </div>
  );

  /* Default: A/B/C choice — question padded, cards full-width */
  return (
    <div className="w-full">
      <h2 ref={qRef} className="font-serif text-cream mb-10 leading-snug text-center px-8 sm:px-12 max-w-2xl mx-auto"
          style={{ fontSize: "clamp(2rem, 5.5vw, 3.5rem)", opacity: 0 }}>
        {step.q}
      </h2>
      <div className="flex flex-col gap-12 px-10">
        {(step as ChoiceQ).options.map((opt, i) => (
          <OptionRow key={opt.id} opt={opt} chosen={chosen} onPick={onPick} entryDelay={0.35 + i * 0.14} />
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Dev jump panel — first example of each type + layer jumps
   ──────────────────────────────────────────────────────── */
const DEV_JUMPS = (() => {
  const seenTypes = new Set<string>();
  const jumps: { label: string; idx: number; color: string }[] = [];

  STEPS.forEach((step, idx) => {
    if (step.kind === "layer") {
      jumps.push({
        label: `L${step.layer}`,
        idx,
        color: ["#94a3b8", "#c084fc", "#e879f9"][step.layer - 1],
      });
      return;
    }
    const t = (step as Question).qtype || "choice";
    if (!seenTypes.has(t)) {
      seenTypes.add(t);
      const colors: Record<string, string> = {
        choice: "#f87171", scale2: "#fb923c", scale3: "#a78bfa", visual: "#60a5fa", open: "#34d399",
      };
      jumps.push({ label: t.toUpperCase(), idx, color: colors[t] ?? "#f87171" });
    }
  });
  return jumps;
})();

/* ────────────────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────────────────── */
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
    gsap.to(content, { opacity: 0, y: -24, duration: 0.3, ease: FIRE, onComplete: next });
  }, [router]);

  /* Per-step enter animation + layer auto-advance */
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    // On the very first step, hold until nav animation completes (~2.55s)
    const isFirstLayer = stepIdx === 0;
    const ctx = gsap.context(() => {
      if (isFirstLayer) {
        gsap.set(content, { opacity: 0, y: 0 });
        gsap.to(content, { opacity: 1, duration: 0.01, delay: 2.55 });
      } else {
        gsap.fromTo(content,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 1.0, ease: AIR, delay: 0.04 },
        );
      }
    });
    let t: ReturnType<typeof setTimeout> | undefined;
    if (STEPS[stepIdx].kind === "layer") t = setTimeout(advance, isFirstLayer ? 5600 : 2800);
    return () => { ctx.revert(); clearTimeout(t); };
  }, [stepIdx, advance]);

  /* Answer selection → auto-advance after aura starts drawing */
  const handlePick = useCallback((id: string) => {
    if (chosen || advancingRef.current) return;
    quizSounds.play(id === "a" ? "chimeA" : id === "b" ? "chimeB" : "chimeC");
    setChosen(id);
    setTimeout(advance, 460);
  }, [chosen, advance]);

  /* Dev: jump to any step instantly */
  const handleDevJump = useCallback((idx: number) => {
    advancingRef.current = false;
    setChosen(null);
    setStepIdx(idx);
  }, []);

  /* Derived */
  const step         = STEPS[stepIdx];
  const currentLayer = (step.kind === "layer" ? step.layer : (step as Question).layer) as 1 | 2 | 3;
  const progress     = stepIdx / (TOTAL - 1);

  return (
    <main className="relative flex min-h-dvh flex-col bg-aubergine select-none">
      <BgAura layer={currentLayer} />

      <Nav
        variant="light"
        hideLinks
        animated
        progress={progress}
        quizMilestones={{ currentLayer }}
      />

      <div
        ref={contentRef}
        className="relative z-10 flex flex-1 items-center justify-center py-8"
        style={{ opacity: 0 }}
      >
        <div key={stepIdx} className="w-full flex justify-center">
          {step.kind === "layer" ? (
            <LayerView step={step} onSkip={advance} entryDelay={stepIdx === 0 ? 2.55 : 0} />
          ) : (
            <QuestionView
              step={step}
              chosen={chosen}
              onPick={handlePick}
              onAdvance={advance}
            />
          )}
        </div>
      </div>

      {/* ── Dev nav ── */}
      {process.env.NODE_ENV === "development" && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[999] flex gap-1.5 flex-wrap items-center p-2"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
        >
          {DEV_JUMPS.map((j) => (
            <button
              key={j.idx}
              onClick={() => handleDevJump(j.idx)}
              style={{ color: j.color, borderColor: `${j.color}55`, fontSize: 10 }}
              className="px-2 py-1 border hover:opacity-70 transition-opacity font-mono cursor-pointer"
            >
              {j.label}
            </button>
          ))}
          <span style={{ color: "#666", fontSize: 10 }} className="self-center ml-auto font-mono">
            {stepIdx}/{TOTAL - 1} · L{currentLayer}
          </span>
        </div>
      )}
    </main>
  );
}
