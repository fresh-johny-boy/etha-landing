"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import Nav from "@/components/Nav";
import { quizSounds } from "@/lib/quizSounds";
import { QuizCTAButton } from "./QuizCTAButton";
import QuizEmailGate from "./QuizEmailGate";
import QuizInterstitial from "./QuizInterstitial";
import { useQuizData } from "./QuizDataProvider";

/* Easing vocabulary:
   AIR   — entrances (default)
   FIRE  — exits
   WATER — SPIRIT-layer entrances + late-quiz tempo shifts
   EARTH — layer-reveal + grounding moments */
const AIR   = "expo.out";
const FIRE  = "power4.in";
const WATER = "sine.inOut";
const EARTH = "power1.out";

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

/* ── Scale slider geometry ── */
/* Track: gentle 5-wave horizontal organic line, viewBox 0 0 448 56, y-center 28 */
const SLIDER_TRACK = "M 16,28 C 48,16 80,40 112,28 C 144,16 176,40 208,28 C 240,16 272,40 304,28 C 336,16 368,40 400,28 C 416,22 428,26 432,28";
/* Handle aura: small ETHA-style irregular organic oval centered at origin */
const SLIDER_AURA  = "M 0,-13 C 6,-16 14,-12 16,-5 C 18,2 14,12 7,15 C 0,18 -10,14 -14,6 C -18,-2 -14,-12 -8,-14 C -4,-15 -2,-13 0,-13 Z";

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
    d: "M163.55,9.51C211.17,-3.86,265.47,-0.88,307.86,21.36C350.26,43.59,330.21,44.58,342.02,53.21C362.99,68.53,382.36,88.43,388.57,113.62C395.99,143.78,382.51,176.39,360.11,197.94C337.71,219.49,307.67,231.41,277.44,238.69C238.63,248.03,198.18,250.52,158.52,246.01C114.58,241.01,70.82,226.97,35.98,199.77C17.58,185.40,0.98,165.12,1.51,141.81C2.05,118.52,19.29,99.28,36.61,83.68C73.34,50.59,115.94,22.88,163.55,9.51Z",
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
    // Portrait leaf/drop — tall, clearly portrait (0.67:1)
    vb: "0 0 156 232", w: 156, h: 232, containerW: 168,
    d: "M 78,5 C 110,0 148,20 154,62 C 160,104 146,154 124,188 C 102,220 70,234 44,222 C 18,210 4,180 6,148 C 8,114 22,72 44,44 C 62,20 56,8 78,5 Z",
  },
  b: {
    vb: "0 0 182 170", w: 182, h: 170, containerW: 185,
    d: "M 90,5 C 128,2 166,22 178,60 C 190,98 180,136 156,158 C 132,180 84,184 48,168 C 14,152 -2,114 4,78 C 10,44 32,16 64,6 C 76,2 86,5 90,5 Z",
  },
  c: {
    vb: "0 0 250 138", w: 250, h: 138, containerW: 248,
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
type VisualQ = { kind: "question"; qtype: "visual";  layer: 1|2|3; q: string; options: OptDef[]; images?: { a: string; b: string; c: string } };
type Scale2Q = { kind: "question"; qtype: "scale2";  layer: 1|2|3; q: string; poleA: string; poleB: string };
type Scale3Q = { kind: "question"; qtype: "scale3";  layer: 1|2|3; q: string; poleA: string; middle: string; poleB: string };
type OpenQ   = { kind: "question"; qtype: "open";    layer: 1|2|3; q: string; placeholder: string; bonus?: { q: string; placeholder: string } };
type Question = ChoiceQ | VisualQ | Scale2Q | Scale3Q | OpenQ;
type InterstitialStep = { kind: "interstitial"; id: string; text: string; layer: 1|2|3; variant: "reassure" | "tempo" };
type Step     = LayerScreen | Question | InterstitialStep;

/* ── Layer definitions ── */
const LAYER_DEF: Record<1|2|3, LayerScreen> = {
  1: { kind: "layer", layer: 1, label: "I",   title: "Body",   sub: "What your physical form reveals."  },
  2: { kind: "layer", layer: 2, label: "II",  title: "Mind",   sub: "What your inner world reveals."    },
  3: { kind: "layer", layer: 3, label: "III", title: "Spirit", sub: "What this moment reveals."         },
};

/* ── 45 Questions (all 5 interaction types) ── */
const QS: Question[] = [
  /* ─ Layer 1 / Body ─────────────────────────────────────────── */
  /* Q1–Q3: visually-heavy openers (placeholder images, swap-in-place later).
     Each opener sits in a different sensory register — sound, touch, trace —
     so they read as three art pieces, not three versions of the same question.
     a→Vata, b→Pitta, c→Kapha. */
  { kind: "question", qtype: "visual", layer: 1, q: "Which one sounds like your morning?",
    images: { a: "opener-q1-a.webp", b: "opener-q1-b.webp", c: "opener-q1-c.webp" },
    options: [
      { id: "a", text: "Wind through a thin curtain." },
      { id: "b", text: "Water coming to boil." },
      { id: "c", text: "Rain on a heavy roof." },
    ],
  },
  { kind: "question", qtype: "visual", layer: 1, q: "Choose the one you'd hold.",
    images: { a: "opener-q2-a.webp", b: "opener-q2-b.webp", c: "opener-q2-c.webp" },
    options: [
      { id: "a", text: "A silver needle, cold." },
      { id: "b", text: "A cast-iron handle, still warm." },
      { id: "c", text: "A stone the sea has polished." },
    ],
  },
  { kind: "question", qtype: "visual", layer: 1, q: "What do you leave behind in a room?",
    images: { a: "opener-q3-a.webp", b: "opener-q3-b.webp", c: "opener-q3-c.webp" },
    options: [
      { id: "a", text: "The door not quite closed." },
      { id: "b", text: "A candle burning after you left." },
      { id: "c", text: "A warm indent in the cushion." },
    ],
  },
  { kind: "question", layer: 1, q: "My body frame is naturally…", options: [
    { id: "a", text: "Lean and light. Hard to gain weight no matter what I eat." },
    { id: "b", text: "Medium and muscular. I gain and lose weight with relative ease." },
    { id: "c", text: "Solid and sturdy. I gain weight easily and hold it." },
  ]},
  { kind: "question", layer: 1, q: "My skin tends to be…", options: [
    { id: "a", text: "Dry, thin, and rough. Cool to the touch." },
    { id: "b", text: "Warm, flushed, sensitive. Quick to redden when things heat up." },
    { id: "c", text: "Thick, smooth, oily. Cool and moist." },
  ]},
  { kind: "question", layer: 1, q: "My hair is naturally…", options: [
    { id: "a", text: "Dry, fine, frizzy, or curly." },
    { id: "b", text: "Fine and oily. Tends to thin or grey early." },
    { id: "c", text: "Thick, wavy, lush. Naturally oily." },
  ]},
  { kind: "question", layer: 1, q: "My hands and feet are usually…", options: [
    { id: "a", text: "Cold with variable temperature. Always reaching for warmth." },
    { id: "b", text: "Warm, even hot. I consistently run warm." },
    { id: "c", text: "Cool and steady. Neither cold nor hot." },
  ]},
  { kind: "question", layer: 1, q: "My digestion is…", options: [
    { id: "a", text: "Irregular. Sometimes strong, sometimes completely off." },
    { id: "b", text: "Sharp and intense. I become irritable when hunger strikes." },
    { id: "c", text: "Slow but steady. I rarely feel hunger urgently." },
  ]},
  { kind: "question", layer: 1, q: "My appetite day to day is…", options: [
    { id: "a", text: "Variable. I forget to eat, then am suddenly ravenous." },
    { id: "b", text: "Strong and consistent. I must eat on schedule." },
    { id: "c", text: "Moderate. I could eat or skip a meal and feel fine." },
  ]},
  { kind: "question", layer: 1, q: "My sleep is…", options: [
    { id: "a", text: "Light and interrupted. I'm a restless sleeper." },
    { id: "b", text: "Moderate. I wake early with my mind already running." },
    { id: "c", text: "Deep and long. I could sleep ten hours without effort." },
  ]},
  { kind: "question", layer: 1, q: "My energy moves in…", options: [
    { id: "a", text: "Unpredictable bursts. Intense, then suddenly exhausted." },
    { id: "b", text: "Sustained peaks. Most productive in the middle of the day." },
    { id: "c", text: "Slow crescendos. I build and hold energy through the day." },
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
    { id: "a", text: "Restlessness, nervous exhaustion, dryness and cold." },
    { id: "b", text: "Fever, heat, and things that flare up fast." },
    { id: "c", text: "Heaviness, thickness in the chest, and anything that lingers." },
  ]},
  /* open */
  { kind: "question", qtype: "open", layer: 1, q: "One sentence, or skip. What does your body most need right now that it is not getting?",
    placeholder: "rest, warmth, stillness, to be seen",
  },
  { kind: "question", layer: 1, q: "My body's daily rhythm of release is…", options: [
    { id: "a", text: "Uneven. Some days light and easy, other days held back." },
    { id: "b", text: "Frequent and quick. Sometimes urgent when things move fast." },
    { id: "c", text: "Heavy and steady. Predictable like clockwork." },
  ]},
  { kind: "question", layer: 1, q: "My voice naturally is…", options: [
    { id: "a", text: "Quick, high-pitched, variable. I speak fast." },
    { id: "b", text: "Clear, direct, sharp. I say exactly what I mean." },
    { id: "c", text: "Deep, resonant, melodious. I choose words slowly." },
  ]},
  { kind: "question", layer: 1, q: "My lips tend to be…", options: [
    { id: "a", text: "Thin, dry, frequently chapped." },
    { id: "b", text: "Medium, quick to chap or crack when I run hot." },
    { id: "c", text: "Full, soft, and well-defined." },
  ]},

  /* ─ Layer 2 / Mind ──────────────────────────────────────────── */
  { kind: "question", layer: 2, q: "My thinking style is…", options: [
    { id: "a", text: "Quick and creative. Many ideas at once, hard to settle." },
    { id: "b", text: "Sharp and analytical. I think in systems and conclusions." },
    { id: "c", text: "Steady and methodical. I think slowly but think it through." },
  ]},
  /* scale3 */
  { kind: "question", qtype: "scale3", layer: 2, q: "When you have something important to do. Your energy shows up like:",
    poleA: "Strong at the start, hard to keep going.",
    middle: "I lock in and push through, even when I should rest.",
    poleB: "Takes time to start. Once it does, I do not stop.",
  },
  { kind: "question", layer: 2, q: "My memory tends to be…", options: [
    { id: "a", text: "Quick to grasp but quick to lose. It moves with me." },
    { id: "b", text: "Sharp and clear for what matters most." },
    { id: "c", text: "Slow to form. Once held, virtually permanent." },
  ]},
  { kind: "question", layer: 2, q: "Under pressure, I tend to…", options: [
    { id: "a", text: "Scatter. Anxiety rises, I lose my centre." },
    { id: "b", text: "Sharpen. I become focused but also controlling." },
    { id: "c", text: "Withdraw. I become quiet, stubborn, or close down." },
  ]},
  /* visual */
  { kind: "question", qtype: "visual", layer: 2, q: "Two doors. What do you actually do? Which one?", options: [
    { id: "a", text: "Open both. Look for a third." },
    { id: "b", text: "Wait until one feels right." },
    { id: "c", text: "Pick one. Walk through. Do not look back." },
  ]},
  { kind: "question", layer: 2, q: "In conversation, I…", options: [
    { id: "a", text: "Jump between topics quickly. I love ideas more than conclusions." },
    { id: "b", text: "Speak precisely. I make my point and defend it." },
    { id: "c", text: "Listen more than I speak. Words are chosen carefully." },
  ]},
  { kind: "question", layer: 2, q: "My relationship with time is…", options: [
    { id: "a", text: "Loose. I'm often late, time escapes me effortlessly." },
    { id: "b", text: "Precise. I'm punctual and dislike being kept waiting." },
    { id: "c", text: "Steady. I move at my own unhurried pace." },
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
    { id: "a", text: "Expansive and changing. I wear feelings openly." },
    { id: "b", text: "Controlled but intense. I feel deeply beneath stillness." },
    { id: "c", text: "Slow and contained. Emotions simmer quietly inside." },
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
    { id: "a", text: "Rarely stops. Thoughts race even in moments of stillness." },
    { id: "b", text: "Analyses and plans. True rest doesn't come easily." },
    { id: "c", text: "Settles quickly. I am naturally inclined to peace." },
  ]},
  { kind: "question", layer: 2, q: "The thing I crave most is…", options: [
    { id: "a", text: "Movement, stimulation, variety." },
    { id: "b", text: "Challenge, impact, and excellence." },
    { id: "c", text: "Comfort, connection, and deep stillness." },
  ]},

  /* ─ Layer 3 / Spirit ────────────────────────────────────────── */
  { kind: "question", layer: 3, q: "Lately, my energy has been…", options: [
    { id: "a", text: "Scattered. I start things and don't finish." },
    { id: "b", text: "Driven but burning. I'm doing too much." },
    { id: "c", text: "Low and heavy. Hard to begin anything at all." },
  ]},
  { kind: "question", layer: 3, q: "My mind lately feels…", options: [
    { id: "a", text: "Restless and racing. Hard to settle or focus." },
    { id: "b", text: "Sharp but stretched. Edging toward exhaustion." },
    { id: "c", text: "Foggy and slow. Unmotivated without clear reason." },
  ]},
  { kind: "question", layer: 3, q: "My sleep lately is…", options: [
    { id: "a", text: "Disrupted. I wake in the night and struggle to return." },
    { id: "b", text: "Shortened. I can't turn my mind off." },
    { id: "c", text: "Excessive. I sleep long but still wake feeling tired." },
  ]},
  { kind: "question", layer: 3, q: "My digestion lately is…", options: [
    { id: "a", text: "Bloated, unsettled, never quite the same two days in a row." },
    { id: "b", text: "Sharp and burning. Quick to turn on me." },
    { id: "c", text: "Sluggish and heavy. Slow to move through." },
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
    { id: "a", text: "Dry, stiff, cold. Hard to warm." },
    { id: "b", text: "Hot, flushed, and quick to react." },
    { id: "c", text: "Heavy, thick, and slow to recover." },
  ]},
  /* scale2 */
  { kind: "question", qtype: "scale2", layer: 3, q: "When something ends. A chapter, a relationship, a phase. How do you leave?",
    poleA: "Quick. Already gone before the goodbye.",
    poleB: "Slowly. I need time to say what it meant.",
  },
  { kind: "question", layer: 3, q: "The habit I most want to break…", options: [
    { id: "a", text: "Inconsistency. I cannot sustain what I begin." },
    { id: "b", text: "Perfectionism. I push until I burn." },
    { id: "c", text: "Inertia. I'm avoiding what I know I need to do." },
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
    { id: "a", text: "Autumn. Unpredictable, transitional, searching for ground." },
    { id: "b", text: "Summer. Intense, bright, sometimes overwhelming." },
    { id: "c", text: "Late winter. Slow, heavy, ready to shift." },
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

/* ── Build step sequence ──
   Interstitials are injected before each new layer (except the first) — a
   reassurance beat between BODY→MIND and MIND→SPIRIT. One more interstitial
   (tempo) lands before the final 5 questions to shift the rhythm. */
const REASSURE_COPY: Record<1|2|3, string | null> = {
  1: null,
  2: "Your body has shown us its rhythm. Now — your mind.",
  3: "We see you. One more pass, softer this time.",
};
const TEMPO_COPY = "We have almost finished mapping your rhythm.";

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const tempoAt = QS.length - 5; // first of the last 5 questions (in QS)
  let lastLayer = 0;
  QS.forEach((q, qi) => {
    if (q.layer !== lastLayer) {
      const nextLayer = q.layer as 1 | 2 | 3;
      const copy = REASSURE_COPY[nextLayer];
      if (copy) {
        steps.push({
          kind: "interstitial",
          id: `reassure-${nextLayer}`,
          text: copy,
          layer: nextLayer,
          variant: "reassure",
        });
      }
      steps.push(LAYER_DEF[nextLayer]);
      lastLayer = q.layer;
    }
    if (qi === tempoAt) {
      steps.push({
        kind: "interstitial",
        id: "tempo-final",
        text: TEMPO_COPY,
        layer: q.layer as 1 | 2 | 3,
        variant: "tempo",
      });
    }
    steps.push(q);
  });
  return steps;
}

const STEPS = buildSteps();
const TOTAL  = STEPS.length;

/* TEMPO-1 — last 5 questions get a slower, softer entry cadence. */
const LATE_TEMPO_SET: Set<number> = (() => {
  const s = new Set<number>();
  let count = 0;
  for (let i = STEPS.length - 1; i >= 0 && count < 5; i--) {
    if (STEPS[i].kind === "question") { s.add(i); count++; }
  }
  return s;
})();

/* Where each layer begins in STEPS (derived, not hardcoded) */
const LAYER_START: Record<1|2|3, number> = { 1: 0, 2: 0, 3: 0 };
STEPS.forEach((s, i) => { if (s.kind === "layer") LAYER_START[s.layer as 1|2|3] = i; });

/* Icon positions in the 3-col grid wave: 1/6, 1/2, 5/6
   Within each layer, bar advances from its icon toward the next icon. */
const LAYER_POS: Record<1|2|3, number> = { 1: 1/6, 2: 1/2, 3: 5/6 };
function calcProgress(stepIdx: number, layer: 1|2|3): number {
  const start  = LAYER_START[layer];
  const end    = layer < 3 ? LAYER_START[(layer + 1) as 2|3] : TOTAL;
  /* Clamp — reassurance interstitials sit one step before a layer's start. */
  const within = Math.max(0, Math.min(1, (stepIdx - start) / (end - start)));
  const from   = LAYER_POS[layer];
  const to     = layer < 3 ? LAYER_POS[(layer + 1) as 2|3] : 1;
  return from + within * (to - from);
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
          { opacity: 1, scale: 1, duration: 0.9, ease: EARTH },
          0,
        )
        .fromTo(titleRef.current,
          { opacity: 0, scale: 1.07, y: 12 },
          { opacity: 1, scale: 1, y: 0, duration: 1.15, ease: EARTH },
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

    gsap.to(wrap, { opacity: isSelected ? 1 : 0.12, duration: 0.38, ease: "power2.out", overwrite: "auto" });

    if (isSelected && path) {
      gsap.killTweensOf(path);
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, strokeOpacity: 0.22 });
      gsap.to(path, { strokeDashoffset: 0, strokeOpacity: 0.88, duration: 0.9, ease: "power2.inOut" });
      /* One-beat confirmation — sensory, not a tick */
      gsap.fromTo(wrap,
        { scale: 1 },
        { scale: 1.02, duration: 0.2, ease: "sine.out", yoyo: true, repeat: 1, delay: 0.3, transformOrigin: "center center" },
      );
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
function VisualCard({ opt, chosen, onPick, entryDelay = 0, imageOverride }: {
  opt: OptDef; chosen: string | null;
  onPick: (id: string) => void;
  entryDelay?: number;
  imageOverride?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const blob     = BLOB_MASKS[opt.id as keyof typeof BLOB_MASKS] ?? BLOB_MASKS.b;
  const clipId   = `blob-clip-${opt.id}`;
  const imgFile  = imageOverride ?? VISUAL_IMG[opt.id] ?? "earth.webp";

  useEffect(() => {
    if (!wrapRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(wrapRef.current,
        { opacity: 0, y: 36, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "power3.out", delay: entryDelay },
      );
    });
    return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || chosen === null) return;
    const isSelected = chosen === opt.id;
    gsap.to(wrap, { opacity: isSelected ? 1 : 0.18, duration: 0.35, ease: "power2.out", overwrite: "auto" });
    if (isSelected && path) {
      gsap.killTweensOf(path);
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, strokeOpacity: 0 });
      gsap.to(path, { strokeDashoffset: 0, strokeOpacity: 0.9, duration: 0.85, ease: "power2.inOut" });
      /* One-beat confirmation */
      gsap.fromTo(wrap,
        { scale: 1 },
        { scale: 1.02, duration: 0.2, ease: "sine.out", yoyo: true, repeat: 1, delay: 0.3, transformOrigin: "center center" },
      );
    } else if (path) {
      gsap.to(path, { strokeOpacity: 0.14, duration: 0.2, overwrite: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosen]);

  return (
    <div ref={wrapRef} className="flex flex-col items-center gap-3" style={{ opacity: 0 }}>
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
          {/* Real element image clipped to blob silhouette */}
          <image
            href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/${imgFile}`}
            x="0" y="0"
            width={blob.w} height={blob.h}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
            style={{ opacity: 1 }}
          />
          {/* Organic outline — ghost at rest, draws on selection */}
          <path
            ref={pathRef}
            d={blob.d}
            stroke="#FFEFDE"
            strokeWidth="1.3"
            strokeOpacity="0.22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <p
        className="font-serif text-cream text-center leading-snug px-1"
        style={{ fontSize: "clamp(1rem, 2.8vw, 1.2rem)", opacity: 1 }}
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
   Horizontal organic-aura drag slider — scale2 (A↔B) and
   scale3 (A↔middle↔B). The track is a living ETHA aura
   line; the handle breathes. Active segment brightens left
   of the handle. Pole labels fade with position in real time.
   All visuals updated imperatively (no React re-renders during
   drag) for 60 fps smoothness on mobile.
   ──────────────────────────────────────────────────────── */
function ScaleSlider({ step, onPlaced, entryDelay = 0, disabled = false }: {
  step: Scale2Q | Scale3Q;
  onPlaced: (id: string | null) => void;
  entryDelay?: number;
  disabled?: boolean;
}) {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const svgRef     = useRef<SVGSVGElement>(null);
  const dimRef     = useRef<SVGPathElement>(null);
  const litRef     = useRef<SVGPathElement>(null);
  const handleGRef = useRef<SVGGElement>(null);
  const auraRef    = useRef<SVGPathElement>(null);
  const poleARef   = useRef<HTMLParagraphElement>(null);
  const poleBRef   = useRef<HTMLParagraphElement>(null);
  const poleMRef   = useRef<HTMLParagraphElement>(null);
  /* Bucket-zone tick marks (scale3 only) — placed after dim track mounts */
  const tick1Ref   = useRef<SVGLineElement>(null);
  const tick2Ref   = useRef<SVGLineElement>(null);
  /* A/B (or A/B/C) letter markers shown above the track at bucket centres.
     Rendered as HTML so we have full control over font + vertical spacing. */
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const posRef      = useRef(0.5);
  const dragging    = useRef(false);
  const lenRef      = useRef(0);
  /* placedIdRef drives the DRAG TO PLACE cue fade; CONTINUE lives in the
     page footer (QuizBody) and is rendered based on onPlaced(id) reports. */
  const placedIdRef = useRef<string | null>(null);
  const [placed, setPlaced] = useState(false);

  const isS3 = step.qtype === "scale3";
  /* Bucket centres — where the A/B(/C) letters sit. The handle no longer
     snaps here on drop; letters are just positional guides and score
     according to onUp's boundaries (scale3: <0.33 / 0.33–0.67 / >0.67). */
  const bucketCenters = isS3 ? [1/6, 0.5, 5/6] : [0.25, 0.75];
  const bucketLetters = isS3 ? ["A", "B", "C"] : ["A", "B"];

  const applyPos = (pos: number) => {
    const dim = dimRef.current;
    const lit = litRef.current;
    const hg  = handleGRef.current;
    if (!dim || !lit || !hg || !lenRef.current) return;
    const len = lenRef.current;
    const al  = pos * len;
    const pt  = dim.getPointAtLength(al);
    hg.setAttribute("transform", `translate(${pt.x.toFixed(1)},${pt.y.toFixed(1)})`);
    lit.setAttribute("stroke-dasharray", `${al.toFixed(1)} ${(len + 4).toFixed(1)}`);
    if (poleARef.current) poleARef.current.style.opacity = String(Math.max(0.38, 1.0 - pos * 0.62));
    if (poleBRef.current) poleBRef.current.style.opacity = String(Math.max(0.38, 0.38 + pos * 0.62));
    if (poleMRef.current && isS3) {
      poleMRef.current.style.opacity = String(Math.max(0.38, 0.82 - Math.abs(pos - 0.5) * 1.8));
    }
  };

  /* Pulse range — wider than before so the handle reads as the
     interactive element while the user hasn't dragged yet. */
  const startBreathing = () => {
    if (!auraRef.current) return;
    gsap.killTweensOf(auraRef.current);
    gsap.set(auraRef.current, { attr: { strokeDasharray: "none", strokeDashoffset: 0, strokeOpacity: 0.55 } });
    gsap.to(auraRef.current, { attr: { strokeOpacity: 0.85 }, duration: 2.0, ease: WATER, yoyo: true, repeat: -1 });
  };

  useEffect(() => {
    const dim = dimRef.current;
    if (!dim) return;
    lenRef.current = dim.getTotalLength();
    applyPos(0.5);
    /* Place scale3 bucket-zone ticks at the 0.33 / 0.67 boundaries */
    if (isS3 && tick1Ref.current && tick2Ref.current) {
      const len = lenRef.current;
      const p1 = dim.getPointAtLength(len * 0.333);
      const p2 = dim.getPointAtLength(len * 0.667);
      const place = (el: SVGLineElement, p: { x: number; y: number }) => {
        el.setAttribute("x1", p.x.toFixed(1));
        el.setAttribute("x2", p.x.toFixed(1));
        el.setAttribute("y1", (p.y - 7).toFixed(1));
        el.setAttribute("y2", (p.y + 7).toFixed(1));
      };
      place(tick1Ref.current, p1);
      place(tick2Ref.current, p2);
    }
    /* Place A/B(/C) HTML letter labels at each bucket-centre x, expressed
       as a percentage of the 448-wide SVG so they stay aligned when the
       SVG scales with the viewport. */
    const len = lenRef.current;
    bucketCenters.forEach((c, i) => {
      const el = letterRefs.current[i];
      if (!el) return;
      const p = dim.getPointAtLength(len * c);
      el.style.left = `${(p.x / 448) * 100}%`;
    });
    const ctx = gsap.context(() => {
      gsap.fromTo(wrapRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.7, ease: AIR, delay: entryDelay },
      );
      gsap.set(handleGRef.current, { opacity: 0 });
      gsap.to(handleGRef.current, { opacity: 1, duration: 0.55, ease: AIR, delay: entryDelay + 0.45 });
      gsap.set(auraRef.current, { attr: { strokeOpacity: 0.55 } });
      gsap.to(auraRef.current, {
        attr: { strokeOpacity: 0.85 },
        duration: 2.0, ease: WATER,
        yoyo: true, repeat: -1,
        delay: entryDelay + 1.0,
      });
    });
    return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (disabled) return;
    /* Re-drag after placing — kill any in-flight tweens (aura draw)
       before restarting breathing so we don't get animation seams. */
    if (placedIdRef.current !== null) {
      placedIdRef.current = null;
      setPlaced(false);
      onPlaced(null);
      if (auraRef.current) gsap.killTweensOf(auraRef.current);
      startBreathing();
      /* Reset letter markers to neutral opacity */
      letterRefs.current.forEach((el) => {
        if (el) el.style.opacity = "0.55";
      });
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    if (svgRef.current) svgRef.current.style.cursor = "grabbing";
    gsap.killTweensOf(auraRef.current);
    gsap.to(auraRef.current, { attr: { strokeOpacity: 0.88 }, duration: 0.12, overwrite: true });
    const rect = svgRef.current!.getBoundingClientRect();
    const pos  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    posRef.current = pos;
    applyPos(pos);
  };

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current || disabled) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const pos  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    posRef.current = pos;
    applyPos(pos);
  };

  const onUp = () => {
    if (!dragging.current || disabled) return;
    dragging.current = false;
    if (svgRef.current) svgRef.current.style.cursor = "grab";
    const pos = posRef.current;
    const id  = isS3 ? (pos < 0.33 ? "a" : pos > 0.67 ? "c" : "b") : (pos < 0.5 ? "a" : "b");
    const placedIdx = isS3 ? (id === "a" ? 0 : id === "c" ? 2 : 1) : (id === "a" ? 0 : 1);
    /* Aura ring draws to confirm placement — CONTINUE button then appears */
    if (auraRef.current) {
      gsap.killTweensOf(auraRef.current);
      const al = auraRef.current.getTotalLength();
      gsap.set(auraRef.current, { attr: { strokeDasharray: al, strokeDashoffset: al, strokeOpacity: 0.3 } });
      gsap.to(auraRef.current, { attr: { strokeDashoffset: 0, strokeOpacity: 0.88 }, duration: 0.55, ease: "power2.inOut" });
    }
    /* Brighten the chosen letter so the user sees which bucket registered */
    letterRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = i === placedIdx ? "0.95" : "0.32";
    });
    placedIdRef.current = id;
    setPlaced(true);
    onPlaced(id);
  };

  return (
    <div ref={wrapRef} style={{ opacity: 0 }}>
      {/* A / B (/ C) row — sits on a single line well above the track.
         `left` is placed imperatively in useEffect once the dim path is
         measured. Margin-bottom gives clear separation from the handle. */}
      <div className="relative w-full h-4 mb-7" aria-hidden="true">
        {bucketLetters.map((ltr, i) => (
          <span
            key={ltr}
            ref={(el) => { letterRefs.current[i] = el; }}
            className="absolute font-label text-cream text-[11px]"
            style={{
              top: 0,
              opacity: 0.55,
              letterSpacing: "0.3em",
              transform: "translateX(-50%)",
              pointerEvents: "none",
              transition: "opacity 0.3s ease",
            }}
          >
            {ltr}
          </span>
        ))}
      </div>
      <svg
        ref={svgRef}
        viewBox="0 0 448 56"
        width="100%"
        fill="none"
        overflow="visible"
        style={{ display: "block", cursor: "grab", touchAction: "none", userSelect: "none" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        aria-label="Drag to place on the spectrum"
      >
        <path ref={dimRef} d={SLIDER_TRACK}
          stroke="#FFEFDE" strokeWidth="1.15" strokeOpacity="0.14"
          strokeLinecap="round" strokeLinejoin="round"
        />
        {/* Bucket-zone ticks — scale3 only. Mark the boundaries so the user can
            see the three zones before dropping. Positions set in useEffect. */}
        {isS3 && (
          <>
            <line ref={tick1Ref} stroke="#FFEFDE" strokeWidth="0.85"
              strokeOpacity="0.28" strokeLinecap="round" />
            <line ref={tick2Ref} stroke="#FFEFDE" strokeWidth="0.85"
              strokeOpacity="0.28" strokeLinecap="round" />
          </>
        )}
        <path ref={litRef} d={SLIDER_TRACK}
          stroke="#FFEFDE" strokeWidth="1.15" strokeOpacity="0.7"
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="0 1000"
        />
        <g ref={handleGRef} style={{ opacity: 0, pointerEvents: "none" }}>
          <path ref={auraRef} d={SLIDER_AURA}
            stroke="#FFEFDE" strokeWidth="1.1" strokeOpacity="0.55"
            fill="none" strokeLinecap="round" strokeLinejoin="round"
          />
          <circle cx="0" cy="0" r="5.5" fill="#FFEFDE" fillOpacity="0.92" />
        </g>
      </svg>

      {/* Secondary cue — sits directly under the handle/track */}
      <p
        className="font-label text-[8px] text-center mt-2"
        style={{
          letterSpacing: "0.3em",
          color: "rgba(255,239,222,1)",
          opacity: placed ? 0 : 0.6,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        }}
      >
        DRAG TO PLACE
      </p>

      <div className="flex gap-5 mt-5 justify-between">
        <p ref={poleARef} className="font-serif text-cream leading-snug"
           style={{ fontSize: "clamp(0.82rem, 2.1vw, 0.98rem)", maxWidth: isS3 ? "26%" : "40%", opacity: 0.78 }}>
          {step.poleA}
        </p>
        <p ref={poleBRef} className="font-serif text-cream leading-snug text-right"
           style={{ fontSize: "clamp(0.82rem, 2.1vw, 0.98rem)", maxWidth: isS3 ? "26%" : "40%", opacity: 0.46 }}>
          {step.poleB}
        </p>
      </div>
      {isS3 && (
        <p ref={poleMRef} className="font-serif text-cream leading-snug text-center mx-auto mt-4 italic"
           style={{ fontSize: "clamp(0.82rem, 2.1vw, 0.98rem)", maxWidth: "80%", opacity: 0.5 }}>
          {(step as Scale3Q).middle}
        </p>
      )}
      {/* CONTINUE lives in the page footer (QuizBody) so it sits at the
         bottom of the viewport like the intro screen. */}
    </div>
  );
}

/* ── Aura paths for open question inputs ── */
/* Tall rectangle-ish organic loop — traces the textarea perimeter with organic wobble */
const OPEN_MAIN_AURA  = "M 178,5 C 234,2 300,4 338,11 C 354,16 360,28 359,52 C 358,96 360,138 358,174 C 356,186 346,193 318,196 C 278,199 234,200 178,200 C 122,200 74,199 38,196 C 12,192 4,184 4,172 C 2,138 4,96 4,52 C 4,28 10,16 28,11 C 66,4 124,2 178,5 Z";
/* Shorter version for bonus textarea */
const OPEN_BONUS_AURA = "M 178,4 C 234,1 300,3 338,9 C 354,13 360,22 359,36 C 358,62 360,86 358,108 C 356,118 346,124 318,126 C 278,128 234,129 178,129 C 122,129 74,128 38,126 C 12,123 4,116 4,106 C 2,86 4,62 4,36 C 4,22 10,13 28,9 C 66,3 124,1 178,4 Z";
/* Small pill for SKIP button */
const OPEN_SKIP_AURA  = "M 58,3 C 80,1 102,2 112,8 C 118,12 118,22 114,30 C 108,37 88,40 58,40 C 28,40 8,37 2,30 C -2,22 -2,12 4,8 C 14,2 36,1 58,3 Z";

/* ────────────────────────────────────────────────────────
   Open text question
   ──────────────────────────────────────────────────────── */
function OpenQuestion({ step, onAdvance }: { step: OpenQ; onAdvance: () => void }) {
  const [val, setVal]             = useState("");
  const [bonus, setBonus]         = useState("");
  const [mainFocus, setMainFocus] = useState(false);
  const [bonusFocus, setBonusFocus] = useState(false);
  const [compact, setCompact]     = useState(false);
  /* Once user has ever typed, bonus stays mounted for the lifetime of this question. */
  const [bonusRevealed, setBonusRevealed] = useState(false);
  const qRef         = useRef<HTMLHeadingElement>(null);
  const areaRef      = useRef<HTMLDivElement>(null);
  const mainAuraRef  = useRef<SVGPathElement>(null);
  const bonusAuraRef = useRef<SVGPathElement>(null);
  const bonusBlockRef = useRef<HTMLDivElement>(null);
  const continueRef   = useRef<HTMLButtonElement>(null);
  const hasContent = val.trim().length > 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-height: 700px)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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

  /* Aura brightens on focus */
  useEffect(() => {
    if (!mainAuraRef.current) return;
    gsap.to(mainAuraRef.current, { strokeOpacity: mainFocus ? 0.58 : 0.2, duration: 0.45, ease: "power2.out" });
  }, [mainFocus]);

  useEffect(() => {
    if (!bonusAuraRef.current) return;
    gsap.to(bonusAuraRef.current, { strokeOpacity: bonusFocus ? 0.58 : 0.2, duration: 0.45, ease: "power2.out" });
  }, [bonusFocus]);

  /* OPEN-3: Smooth height + opacity reveal when the bonus block first mounts. */
  useEffect(() => {
    const el = bonusBlockRef.current;
    if (!bonusRevealed || !el) return;
    const h = el.scrollHeight;
    gsap.fromTo(el,
      { height: 0, opacity: 0 },
      {
        height: h,
        opacity: 1,
        duration: 0.6,
        ease: AIR,
        onComplete: () => { el.style.height = "auto"; el.style.overflow = "visible"; },
      },
    );
  }, [bonusRevealed]);

  /* OPEN-4: CONTINUE soft reveal + dim on empty (never unmount). */
  useEffect(() => {
    const btn = continueRef.current;
    if (!btn) return;
    gsap.to(btn, {
      opacity: hasContent ? 1 : 0,
      y: hasContent ? 0 : 8,
      duration: 0.3,
      ease: AIR,
      overwrite: true,
    });
    btn.style.pointerEvents = hasContent ? "auto" : "none";
  }, [hasContent]);

  return (
    <div className="w-full max-w-2xl px-8 sm:px-10">
      <h2
        ref={qRef}
        className="font-serif text-cream mb-10 leading-snug"
        style={{ fontSize: "clamp(1.6rem, 5vw, 3.5rem)", opacity: 0 }}
      >
        {step.q}
      </h2>

      <div ref={areaRef} style={{ opacity: 0 }}>
        {/* Tall aura-bordered textarea — organic frame instead of CSS border */}
        <div className="relative" style={{ maxHeight: "calc(100dvh - 420px)" }}>
          <svg
            className="pointer-events-none absolute overflow-visible"
            viewBox="0 0 360 205"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
            style={{ left: "-10px", top: "-8px", width: "calc(100% + 20px)", height: "calc(100% + 16px)" }}
          >
            <path
              ref={mainAuraRef}
              d={OPEN_MAIN_AURA}
              stroke="#FFEFDE"
              strokeWidth="0.95"
              strokeOpacity="0.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <textarea
            value={val}
            onChange={e => {
              const v = e.target.value;
              setVal(v);
              /* OPEN-3: once the user has ever typed, bonus stays mounted. */
              if (!bonusRevealed && v.trim().length > 0 && step.bonus) setBonusRevealed(true);
            }}
            onFocus={() => setMainFocus(true)}
            onBlur={() => setMainFocus(false)}
            placeholder={step.placeholder}
            rows={compact ? 5 : 7}
            className={[
              "w-full bg-transparent resize-none outline-none",
              "font-serif text-cream leading-relaxed",
              "placeholder:text-cream/25 placeholder:italic",
              "px-4 py-5 overflow-y-auto",
            ].join(" ")}
            style={{ fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)" }}
          />
        </div>

        {bonusRevealed && step.bonus && (
          <div
            ref={bonusBlockRef}
            className="mt-10"
            style={{ overflow: "hidden" }}
          >
            <p className="font-label text-[9px] text-cream/32 mb-5">{step.bonus.q}</p>
            <div className="relative">
              <svg
                className="pointer-events-none absolute overflow-visible"
                viewBox="0 0 360 134"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
                style={{ left: "-10px", top: "-8px", width: "calc(100% + 20px)", height: "calc(100% + 16px)" }}
              >
                <path
                  ref={bonusAuraRef}
                  d={OPEN_BONUS_AURA}
                  stroke="#FFEFDE"
                  strokeWidth="0.95"
                  strokeOpacity="0.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <textarea
                value={bonus}
                onChange={e => setBonus(e.target.value)}
                onFocus={() => setBonusFocus(true)}
                onBlur={() => setBonusFocus(false)}
                placeholder={step.bonus.placeholder}
                rows={3}
                className={[
                  "w-full bg-transparent resize-none outline-none",
                  "font-serif text-cream leading-relaxed",
                  "placeholder:text-cream/25 placeholder:italic",
                  "px-4 py-4",
                ].join(" ")}
                style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.1rem)" }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          {/* SKIP — small aura pill, consistent with button system */}
          <button
            onClick={onAdvance}
            className="relative font-label text-[9px] text-cream/62 hover:text-cream/85 focus-visible:text-cream/85 transition-colors cursor-pointer min-h-[48px] px-7 py-4"
          >
            <svg
              className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
              viewBox="0 0 116 40"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <path
                d={OPEN_SKIP_AURA}
                stroke="#FFEFDE"
                strokeWidth="0.7"
                strokeOpacity="0.38"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="relative z-10">SKIP</span>
          </button>

          {/* OPEN-4: always mounted; fade + y-shift driven by hasContent. */}
          <button
            ref={continueRef}
            onClick={() => { if (!hasContent) return; quizSounds.play("openSubmit"); onAdvance(); }}
            className="relative font-label text-[9px] text-cream cursor-pointer min-h-[48px] px-8 py-4"
            style={{ opacity: 0, transform: "translateY(8px)", pointerEvents: "none" }}
            aria-hidden={!hasContent}
            tabIndex={hasContent ? 0 : -1}
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
                strokeOpacity="0.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="relative z-10">CONTINUE</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Question router — all 5 types
   ──────────────────────────────────────────────────────── */
function QuestionView({ step, chosen, onPick, onScalePlaced, onAdvance }: {
  step: Question; chosen: string | null;
  onPick: (id: string) => void;
  onScalePlaced: (id: string | null) => void;
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
    const bA = BLOB_MASKS.a;
    const bB = BLOB_MASKS.b;
    const bC = BLOB_MASKS.c;
    return (
      <div className="w-full px-4 sm:px-6">
        <h2
          ref={qRef}
          className="font-serif text-cream mb-12 leading-snug text-center max-w-lg mx-auto"
          style={{ fontSize: "clamp(1.75rem, 4.8vw, 2.8rem)", opacity: 0 }}
        >
          {step.q}
        </h2>
        {/* Triangle: A (tall narrow) + B (compact square) top, C (wide flat) bottom-center */}
        <div className="flex flex-col items-center gap-14">
          <div className="flex items-end justify-center gap-10">
            {/* A — tall narrow teardrop */}
            <div style={{ width: bA.containerW }}>
              <VisualCard opt={opts[0]} chosen={chosen} onPick={onPick} entryDelay={0.18} imageOverride={step.images?.a} />
            </div>
            {/* B — compact rounder blob */}
            <div style={{ width: bB.containerW }}>
              <VisualCard opt={opts[1]} chosen={chosen} onPick={onPick} entryDelay={0.44} imageOverride={step.images?.b} />
            </div>
          </div>
          {/* C — wide landscape pebble */}
          <div style={{ width: bC.containerW }}>
            <VisualCard opt={opts[2]} chosen={chosen} onPick={onPick} entryDelay={0.70} imageOverride={step.images?.c} />
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
      <ScaleSlider step={step} onPlaced={onScalePlaced} disabled={chosen !== null} entryDelay={0.42} />
    </div>
  );

  if (step.qtype === "scale3") return (
    <div className="w-full max-w-2xl px-8 sm:px-10">
      <h2 ref={qRef} className="font-serif text-cream mb-12 leading-snug"
          style={{ fontSize: "clamp(2rem, 5.5vw, 3.5rem)", opacity: 0 }}>
        {step.q}
      </h2>
      <ScaleSlider step={step} onPlaced={onScalePlaced} disabled={chosen !== null} entryDelay={0.42} />
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
    if (step.kind === "interstitial") {
      if (!seenTypes.has(`i-${step.variant}`)) {
        seenTypes.add(`i-${step.variant}`);
        jumps.push({
          label: step.variant === "tempo" ? "TEMPO" : `→L${step.layer}`,
          idx,
          color: "#fde68a",
        });
      }
      return;
    }
    const t = step.qtype || "choice";
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
  const [gateOpen, setGateOpen] = useState(false);
  /* Scale-question placement lives in parent so the CONTINUE button can
     render at the page bottom (outside the centred content) like the intro. */
  const [scalePlacedId, setScalePlacedId] = useState<string | null>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const advancingRef = useRef(false);
  const stepIdxRef   = useRef(0);
  const data = useQuizData();

  useEffect(() => { stepIdxRef.current = stepIdx; });

  /* Stable advance — reads stepIdx via ref to avoid stale closure */
  const advance = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    const content = contentRef.current;
    const isLast  = stepIdxRef.current >= TOTAL - 1;

    const next = () => {
      if (isLast) { setGateOpen(true); return; }
      advancingRef.current = false;
      setChosen(null);
      setScalePlacedId(null);
      setStepIdx((s) => s + 1);
    };

    if (!content) { next(); return; }
    gsap.to(content, { opacity: 0, y: -24, duration: 0.3, ease: FIRE, onComplete: next });
  }, []);

  /* Per-step enter animation + layer auto-advance */
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    // On the very first step, hold until nav animation completes (~2.55s)
    const isFirstLayer = stepIdx === 0;
    const isLateTempo = LATE_TEMPO_SET.has(stepIdx);
    const ctx = gsap.context(() => {
      if (isFirstLayer) {
        gsap.set(content, { opacity: 0, y: 0 });
        gsap.to(content, { opacity: 1, duration: 0.01, delay: 2.55 });
      } else {
        /* TEMPO-1: last 5 questions use WATER easing + 1.4s duration. */
        gsap.fromTo(content,
          { opacity: 0, y: 32 },
          {
            opacity: 1, y: 0,
            duration: isLateTempo ? 1.4 : 1.0,
            ease: isLateTempo ? WATER : AIR,
            delay: 0.04,
          },
        );
      }
    });
    let t: ReturnType<typeof setTimeout> | undefined;
    if (STEPS[stepIdx].kind === "layer") t = setTimeout(advance, isFirstLayer ? 5600 : 4200);
    return () => { ctx.revert(); clearTimeout(t); };
  }, [stepIdx, advance]);

  /* Answer selection → auto-advance after aura starts drawing */
  const handlePick = useCallback((id: string) => {
    if (chosen || advancingRef.current) return;
    data.recordAnswer(stepIdxRef.current, id);
    quizSounds.play(id === "a" ? "chimeA" : id === "b" ? "chimeB" : "chimeC");
    setChosen(id);
    setTimeout(advance, 760);
  }, [chosen, advance, data]);

  /* Dev: jump to any step instantly */
  const handleDevJump = useCallback((idx: number) => {
    advancingRef.current = false;
    setChosen(null);
    setStepIdx(idx);
  }, []);

  /* Derived */
  const step         = STEPS[stepIdx];
  const currentLayer = (
    step.kind === "layer"        ? step.layer :
    step.kind === "interstitial" ? step.layer :
                                    (step as Question).layer
  ) as 1 | 2 | 3;
  const progress = calcProgress(stepIdx, currentLayer);

  if (gateOpen) return <QuizEmailGate />;

  return (
    <main className="relative flex min-h-dvh flex-col bg-aubergine select-none">
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
          ) : step.kind === "interstitial" ? (
            <QuizInterstitial text={step.text} onAdvance={advance} />
          ) : (
            <QuestionView
              step={step}
              chosen={chosen}
              onPick={handlePick}
              onScalePlaced={setScalePlacedId}
              onAdvance={advance}
            />
          )}
        </div>
      </div>

      {/* Bottom action area — CONTINUE for scale questions sits here so it
         anchors to the viewport bottom, matching the intro screen layout.
         Other question types manage their own CTAs (auto-advance / inline). */}
      {step.kind === "question" && (step.qtype === "scale2" || step.qtype === "scale3") && (
        <div className="relative z-10 flex flex-col items-center px-8 pt-6 pb-10 sm:pb-14">
          <div className="w-full max-w-2xl">
            {scalePlacedId ? (
              <QuizCTAButton
                key={`cta-placed-${stepIdx}`}
                label="CONTINUE"
                onClick={() => handlePick(scalePlacedId)}
                revealMode="draw"
              />
            ) : (
              <QuizCTAButton
                key={`cta-disabled-${stepIdx}`}
                label="CONTINUE"
                onClick={() => {}}
                disabled
              />
            )}
          </div>
        </div>
      )}

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
          <button
            onClick={() => setGateOpen(true)}
            style={{ color: "#f472b6", borderColor: "#f472b655", fontSize: 10 }}
            className="px-2 py-1 border hover:opacity-70 transition-opacity font-mono cursor-pointer"
          >
            → GATE
          </button>
          <span style={{ color: "#666", fontSize: 10 }} className="self-center ml-auto font-mono">
            {stepIdx}/{TOTAL - 1} · L{currentLayer}
          </span>
        </div>
      )}
    </main>
  );
}
