"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

const AIR  = "expo.out";
const FIRE = "power4.in";

/* ── Single balanced aura — draws on click, invisible at rest ── */
type Pt = [number, number];

function toPath(pts: Pt[]): string {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i += 3)
    d += ` C${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} ${pts[i+1][0].toFixed(1)},${pts[i+1][1].toFixed(1)} ${pts[i+2][0].toFixed(1)},${pts[i+2][1].toFixed(1)}`;
  return d;
}

/* Spacious balanced oval — viewBox proportioned ~4.8:1 to match card */
const AURA_BASE: Pt[] = [
  [188, 7],
  [252, 2],  [318, 4],  [350, 14],
  [368, 24], [370, 42], [364, 60],
  [356, 76], [318, 86], [260, 91],
  [196, 95], [136, 93], [88,  86],
  [40,  78], [4,   60], [2,   42],
  [0,   24], [18,  8],  [62,  3],
  [118, 0],  [158, 3],  [188, 7],
];
const AURA_D  = toPath(AURA_BASE) + " Z";

/* ── Types ── */
type LayerScreen = { kind: "layer"; layer: 1 | 2 | 3; label: string; title: string; sub: string };
type OptDef = { id: string; text: string };

/* A/B/C standard select — most questions */
type ChoiceQ = { kind: "question"; qtype?: "choice"; layer: 1|2|3; q: string; options: OptDef[] };

/* Image tiles — centered text, card layout, photography placeholder */
type VisualQ = { kind: "question"; qtype: "visual"; layer: 1|2|3; q: string; options: OptDef[] };

/* Spectrum — only 2 poles, no middle */
type Scale2Q = { kind: "question"; qtype: "scale2"; layer: 1|2|3; q: string; poleA: string; poleB: string };

/* Spectrum — 2 poles + explicit middle node */
type Scale3Q = { kind: "question"; qtype: "scale3"; layer: 1|2|3; q: string; poleA: string; middle: string; poleB: string };

/* Open text with skip */
type OpenQ   = { kind: "question"; qtype: "open"; layer: 1|2|3; q: string; placeholder: string; bonus?: { q: string; placeholder: string } };

type Question = ChoiceQ | VisualQ | Scale2Q | Scale3Q | OpenQ;
type Step     = LayerScreen | Question;

/* ── Layer definitions ── */
const LAYER_DEF: Record<1 | 2 | 3, LayerScreen> = {
  1: { kind: "layer", layer: 1, label: "LAYER ONE",   title: "Body", sub: "What your physical form reveals."  },
  2: { kind: "layer", layer: 2, label: "LAYER TWO",   title: "Mind", sub: "What your inner world reveals."    },
  3: { kind: "layer", layer: 3, label: "LAYER THREE", title: "Now",  sub: "What this moment reveals."         },
};
const LAYER_NAMES: Record<1 | 2 | 3, string> = { 1: "BODY", 2: "MIND", 3: "NOW" };

/* ── 45 Questions (PDF-accurate, all 5 interaction types) ── */
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
  /* Q8 — 2-node scale (PDF Q8) */
  { kind: "question", qtype: "scale2", layer: 1, q: "Your body has known this for years. The temperature your body keeps.",
    poleA: "Cold. Always borrowing warmth from the world.",
    poleB: "Hot. Always trying to release some of it.",
  },
  /* Q9 — visual cards (PDF Q6) */
  { kind: "question", qtype: "visual", layer: 1, q: "If your body had a texture right now, what would it be?", options: [
    { id: "a", text: "Dry, cool, always a little thin." },
    { id: "b", text: "Warm, flushed, quick to react." },
    { id: "c", text: "Soft, full, holds moisture easily." },
  ]},
  { kind: "question", layer: 1, q: "When illness comes, it tends toward...", options: [
    { id: "a", text: "Anxiety, nervous exhaustion, dry and cold conditions." },
    { id: "b", text: "Fever, inflammation, or infection." },
    { id: "c", text: "Congestion, excess mucus, and heaviness." },
  ]},
  /* Q11 — open text */
  { kind: "question", qtype: "open", layer: 1, q: "One sentence, or skip. What does your body most need right now that it is not getting?",
    placeholder: "rest, warmth, stillness, to be seen",
  },
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
  /* Q17 — 3-node scale (PDF Q17) */
  { kind: "question", qtype: "scale3", layer: 2, q: "When you have something important to do. Your energy shows up like:",
    poleA: "Strong at the start, hard to keep going.",
    middle: "I lock in and push through, even when I should rest.",
    poleB: "Takes time to start. Once it does, I do not stop.",
  },
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
  /* Q18 — visual cards (PDF Q18) */
  { kind: "question", qtype: "visual", layer: 2, q: "Two doors. What do you actually do? Which one?", options: [
    { id: "a", text: "Open both. Look for a third." },
    { id: "b", text: "Wait until one feels right." },
    { id: "c", text: "Pick one. Walk through. Do not look back." },
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
  /* Q23 — 3-node scale (PDF Q23) */
  { kind: "question", qtype: "scale3", layer: 2, q: "When you need to focus on something important. What actually happens?",
    poleA: "My mind wanders. Ten minutes in, I am somewhere else.",
    middle: "I lock in. Nothing else exists. Sometimes for too long.",
    poleB: "Takes forever to start. Once I do, I can go for hours.",
  },
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
  /* Q26 — open text (PDF Q26) */
  { kind: "question", qtype: "open", layer: 2, q: "One detail is enough. Or skip. If you could design a space for your mind to rest in, what would be there?",
    placeholder: "silence, water, soft light, nothing",
  },
  /* Q27 — visual cards (PDF Q27) */
  { kind: "question", qtype: "visual", layer: 2, q: "Your mental energy this month. Which image?", options: [
    { id: "a", text: "Fire burning too bright." },
    { id: "b", text: "Candle flickering in wind." },
    { id: "c", text: "Embers under ash." },
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
  /* Q38 — 2-node scale (PDF Q38) */
  { kind: "question", qtype: "scale2", layer: 3, q: "When something ends. A chapter, a relationship, a phase. How do you leave?",
    poleA: "Quick. Already gone before the goodbye.",
    poleB: "Slowly. I need time to say what it meant.",
  },
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
  /* Q41 — visual cards (PDF Q41) */
  { kind: "question", qtype: "visual", layer: 3, q: "If your spirit had a texture right now. What would it be?", options: [
    { id: "a", text: "Silk scarf in wind." },
    { id: "b", text: "Blade edge, sharp." },
    { id: "c", text: "Wet clay, dense." },
  ]},
  { kind: "question", layer: 3, q: "The inner season I'm living right now is...", options: [
    { id: "a", text: "Autumn — unpredictable, transitional, searching for ground." },
    { id: "b", text: "Summer — intense, bright, sometimes overwhelming." },
    { id: "c", text: "Late winter — slow, heavy, ready to shift." },
  ]},
  /* Q45 — open text with bonus (PDF Q45) */
  { kind: "question", qtype: "open", layer: 3, q: "One sentence. Or skip. If you could tell your younger self one thing about who you are becoming, what would it be?",
    placeholder: "You are exactly where you need to be.",
    bonus: { q: "One word for what your spirit needs most right now.", placeholder: "rest, fire, ground, space, permission" },
  },
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

/* ── Option row — aura invisible at rest, draws on click ── */
function OptionRow({ opt, chosen, onPick }: {
  opt: Option; chosen: string | null; onPick: (id: string) => void;
}) {
  const pathRef  = useRef<SVGPathElement>(null);
  const isChosen = chosen === opt.id;
  const isDimmed = chosen !== null && !isChosen;

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    if (isChosen) {
      gsap.killTweensOf(path);
      gsap.set(path, { attr: { d: AURA_D }, strokeOpacity: 0 });
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, { strokeDashoffset: 0, strokeOpacity: 0.75, duration: 0.72, ease: "power2.inOut" });
    } else {
      gsap.set(path, { strokeDasharray: "none", strokeDashoffset: 0, strokeOpacity: 0 });
    }
  }, [isChosen]);

  return (
    <div className="relative">
      <div className="h-px bg-cream/[0.08]" />
      <button
        onClick={() => chosen === null && onPick(opt.id)}
        tabIndex={chosen !== null ? -1 : 0}
        className={[
          "relative w-full text-left py-6 min-h-[48px] cursor-pointer",
          "transition-opacity duration-350",
          isDimmed ? "opacity-[0.14]" : isChosen ? "opacity-100" : "opacity-70 hover:opacity-100",
        ].join(" ")}
      >
        {/* Aura — invisible at rest, draws on selection */}
        <svg
          className="pointer-events-none absolute overflow-visible"
          viewBox="0 0 372 96"
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

        <span
          className="font-serif text-cream leading-relaxed block relative z-10"
          style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)" }}
        >
          {opt.text}
        </span>
      </button>
    </div>
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
function QuestionView({ step, chosen, onPick }: {
  step: Question; chosen: string | null; onPick: (id: string) => void;
}) {
  return (
    <div className="w-full max-w-xl px-7 sm:px-4">
      <h2
        className="font-serif text-cream mb-10 leading-snug"
        style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}
      >
        {step.q}
      </h2>

      <div>
        {step.options.map((opt) => (
          <OptionRow key={opt.id} opt={opt} chosen={chosen} onPick={onPick} />
        ))}
        <div className="h-px bg-cream/[0.08]" />
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
              chosen={chosen}
              onPick={handlePick}
            />
          )}
        </div>
      </div>
    </main>
  );
}
