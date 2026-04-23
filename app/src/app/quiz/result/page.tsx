"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Nav from "@/components/Nav";
import { QuizCTAButton } from "@/components/quiz/QuizCTAButton";
import QuizEmailGate from "@/components/quiz/QuizEmailGate";
import { useQuizData } from "@/components/quiz/QuizDataProvider";
import type { Archetype } from "@/lib/quizDataContract";
import {
  DOSHA_THEMES,
  AURA_PATHS,
  AURA_VIEWBOXES,
  RESULT_AURA_POS,
} from "@/lib/doshaThemes";

/* ── Card copy ─────────────────────────────────────────────────── */
const CARD = {
  vata: {
    archetype: "The Kinetic Mind",
    reframe: "You were built to move. Right now you are being asked to also burn.",
    comp: [{ pct: 60, label: "Vata" }, { pct: 30, label: "Pitta" }, { pct: 10, label: "Kapha" }],
    secondaryNote: "With Pitta secondary, your creativity carries an edge of precision — and your burnout arrives faster than most Vatas.",
    signals: [
      "Your mind races when your body needs to land",
      "You push through tired instead of stopping",
      "Your thoughts arrive faster than you can place them",
    ],
    ritualLabel: "One thing for tonight",
    ritual: "Lie on your back. Both hands on your belly. Breathe out completely before breathing in. Three times. Let the weight of your hands tell your nervous system the day is finished.",
    teaser: "Includes the one plant Vata has relied on for grounding for centuries",
  },
  pitta: {
    archetype: "The Fiery Drive",
    reframe: "You are not burning out. You are Pitta — and what you need is not less fire. It is a cooler vessel.",
    comp: [{ pct: 58, label: "Pitta" }, { pct: 32, label: "Vata" }, { pct: 10, label: "Kapha" }],
    secondaryNote: "With Vata secondary, your fire moves fast and can scatter — brilliant and creative, but prone to burnout from doing too many things at full intensity.",
    signals: [
      "Your precision turns inward when there is no outlet",
      "You finish the day in your head long after your body has stopped",
      "Your frustration rises before you can name its source",
    ],
    ritualLabel: "One thing for tonight",
    ritual: "Roll your tongue or part your lips. Inhale slowly through the mouth — feel the cool air travel inward. Hold briefly. Exhale through the nose. Three rounds. This is Sheetali — the oldest Pitta cooling practice in Ayurveda.",
    teaser: "Includes the one plant that cools Pitta's fire without dimming its light",
  },
  kapha: {
    archetype: "The Grounded Core",
    reframe: "You are not stuck. You are Kapha — and the bloom is already there. It simply needs the right conditions.",
    comp: [{ pct: 60, label: "Kapha" }, { pct: 28, label: "Pitta" }, { pct: 12, label: "Vata" }],
    secondaryNote: "With Pitta secondary, your depth has an edge — a will beneath the steadiness that, when activated, is formidable.",
    signals: [
      "Your mornings need more than one reason to begin",
      "You carry what others put down",
      "Your energy arrives slowly — and lasts the longest",
    ],
    ritualLabel: "One thing for tomorrow morning",
    ritual: "Before anything else — five minutes of movement. Brisk, warm, arms and legs. Then fresh ginger tea, drunk standing. Kapha wakes from the inside out — and you already know this.",
    teaser: "Includes the sacred plant that tells Kapha the morning has genuinely arrived",
  },
} as const;

const DOSHAS: Archetype[] = ["vata", "pitta", "kapha"];

/* ── Component ─────────────────────────────────────────────────── */
export default function QuizResultPage() {
  const data   = useQuizData();
  const result = data.getResult();

  const [devDosha, setDevDosha]   = useState<Archetype>(result?.primary ?? "vata");
  const [showGate, setShowGate]   = useState(false);
  const auraRef     = useRef<SVGSVGElement>(null);
  const labelRef    = useRef<HTMLParagraphElement>(null);
  const nameRef     = useRef<HTMLHeadingElement>(null);
  const metaRef     = useRef<HTMLDivElement>(null);
  const contentRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!result) return;
    setDevDosha(result.primary);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      gsap.set(nameRef.current,    { y: 18 });
      gsap.set(contentRef.current, { y: 8 });

      if (reduced) {
        // Respect reduced-motion but keep a short stagger so arrival still reads as sequence
        const tl = gsap.timeline({ delay: 0.05 });
        tl.to(auraRef.current,    { opacity: 1, duration: 0.3 }, 0);
        tl.to(labelRef.current,   { opacity: 1, duration: 0.3 }, 0.1);
        tl.to(nameRef.current,    { opacity: 1, y: 0, duration: 0.3 }, 0.2);
        tl.to(metaRef.current,    { opacity: 1, duration: 0.3 }, 0.3);
        tl.to(contentRef.current, { opacity: 1, y: 0, duration: 0.3 }, 0.4);
        return;
      }

      /* Entry — unhurried but earned */
      const tl = gsap.timeline({ delay: 0.1 });
      tl.to(auraRef.current,     { opacity: 1, duration: 2.0, ease: "power2.out" }, 0);
      tl.to(labelRef.current,    { opacity: 1, duration: 0.7, ease: "power2.out" }, 0.3);
      tl.to(nameRef.current,     { opacity: 1, y: 0, duration: 1.0, ease: "expo.out" }, 0.6);
      tl.to(metaRef.current,     { opacity: 1, duration: 0.8, ease: "power2.out" }, 1.2);
      tl.to(contentRef.current,  { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, 1.8);

      /* Aura: slow breathe only — no rotation, no spin */
      gsap.to(auraRef.current, {
        scale: 1.02, duration: 12, ease: "sine.inOut",
        yoyo: true, repeat: -1, transformOrigin: "center", delay: 2.0,
      });
      gsap.to(auraRef.current, {
        y: -10, duration: 16, ease: "sine.inOut",
        yoyo: true, repeat: -1, delay: 2.0,
      });
    });

    return () => ctx.revert();
  }, [devDosha]);

  const theme     = DOSHA_THEMES[devDosha];
  const auraVb    = AURA_VIEWBOXES[devDosha];
  const auraPath  = AURA_PATHS[devDosha];
  const auraPos   = RESULT_AURA_POS[devDosha];
  const card      = CARD[devDosha];
  const doshaName = devDosha.charAt(0).toUpperCase() + devDosha.slice(1);

  if (!result && process.env.NODE_ENV !== "development") {
    return (
      <main style={{ background: "#3D233B", minHeight: "100dvh" }} className="relative">
        <Nav variant="light" hideLinks />
        <div className="flex items-center justify-center px-8 text-center" style={{ minHeight: "80dvh" }}>
          <div style={{ maxWidth: 360 }}>
            <p
              className="font-label"
              style={{ fontSize: 10, letterSpacing: "0.28em", color: "rgba(255,239,222,0.55)" }}
            >
              NOTHING TO SHOW YET
            </p>
            <h1
              className="font-serif"
              style={{
                fontSize: "clamp(1.75rem,5vw,2.4rem)",
                color: "#FFEFDE",
                marginTop: 18,
                lineHeight: 1.18,
                fontWeight: 400,
              }}
            >
              Finish the quiz <em className="italic">first.</em>
            </h1>
            <p
              className="font-serif italic"
              style={{
                fontSize: "0.95rem",
                color: "rgba(255,239,222,0.62)",
                lineHeight: 1.6,
                marginTop: 14,
              }}
            >
              Your card is built from your answers. It cannot arrive before you do.
            </p>
            <a
              href="/quiz"
              className="font-label"
              style={{
                display: "inline-block",
                marginTop: 32,
                fontSize: 11,
                letterSpacing: "0.28em",
                color: "rgba(255,239,222,0.92)",
                textDecoration: "none",
              }}
            >
              BEGIN →
            </a>
            <AuraOrnament color="rgba(255,239,222,0.55)" style={{ marginTop: 14 }} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{ background: theme.bg, minHeight: "100dvh" }}
      className="relative overflow-x-hidden"
    >
      <Nav variant="light" hideLinks progress={1} />

      {/* ── DEV PANEL ─────────────────────────────────────────────── */}
      {process.env.NODE_ENV === "development" && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[999] flex gap-1.5 flex-wrap items-center p-2"
          style={{ background: "rgba(61,35,59,0.88)", backdropFilter: "blur(6px)" }}
        >
          {DOSHAS.map((d) => {
            const color = d === "vata" ? "#F5A800" : d === "pitta" ? "#A2E8F2" : "#FFB3A5";
            return (
              <button
                key={d}
                onClick={() => setDevDosha(d)}
                style={{
                  color: devDosha === d ? "#FFEFDE" : color,
                  borderColor: `${color}55`,
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  fontWeight: devDosha === d ? 700 : 400,
                }}
                className="font-label px-2 py-1 border hover:opacity-70 transition-opacity cursor-pointer"
              >
                {d.toUpperCase()}
              </button>
            );
          })}
          <span
            style={{ color: "rgba(255,239,222,0.5)", fontSize: 9, letterSpacing: "0.18em" }}
            className="font-label self-center ml-auto"
          >
            RESULT · {devDosha.toUpperCase()}
          </span>
        </div>
      )}

      {/* ── CARD ──────────────────────────────────────────────────── */}
      <section className="relative" aria-labelledby="dosha-name" style={{ minHeight: "100dvh", paddingTop: 100, paddingBottom: 112 }}>

        {/* Atmospheric aura — one per dosha, connected closed loop, breathes only */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <svg
            ref={auraRef}
            viewBox={auraVb}
            fill="none"
            preserveAspectRatio="xMidYMid meet"
            style={{ position: "absolute", overflow: "visible", opacity: 0, willChange: "transform", ...auraPos }}
          >
            <path
              d={auraPath}
              stroke="#FFEFDE"
              strokeOpacity="0.09"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Content column */}
        <div className="relative z-10 mx-auto px-8 sm:px-12 max-w-[440px] md:max-w-[580px]">

          {/* Identity reveal */}
          <div style={{ marginTop: 64 }}>
            <p
              ref={labelRef}
              className="font-label"
              style={{
                fontSize: 11,
                letterSpacing: "0.28em",
                color: "rgba(255,239,222,0.65)",
                textAlign: "center",
                opacity: 0,
              }}
            >
              YOUR NATURE IS
            </p>
            <h1
              id="dosha-name"
              ref={nameRef}
              className="font-serif"
              style={{
                fontSize: "clamp(4.4rem, 19vw, 7.8rem)",
                lineHeight: 0.93,
                letterSpacing: "-0.01em",
                color: theme.nameColor,
                textAlign: "center",
                marginTop: 8,
                opacity: 0,
              }}
            >
              {doshaName}
            </h1>
          </div>

          {/* Archetype + composition */}
          <div
            ref={metaRef}
            style={{ marginTop: 22, opacity: 0 }}
          >
            <p
              className="font-label"
              style={{ fontSize: 11, letterSpacing: "0.22em", color: "rgba(255,239,222,0.70)", textAlign: "center" }}
            >
              {card.archetype.toUpperCase()}
            </p>

            {/* Composition bubble chart */}
            <div style={{ marginTop: 28 }}>
              <AuraBubbleChart comp={card.comp} bgColor={theme.bg} />
            </div>
          </div>

          {/* Main content */}
          <div ref={contentRef} style={{ marginTop: 40, opacity: 0 }}>

            {/* Reframe quote — emotional core */}
            <blockquote
              className="font-serif italic"
              style={{
                fontSize: "clamp(1.28rem, 3.2vw, 1.55rem)",
                lineHeight: 1.55,
                color: "#FFEFDE",
                textAlign: "center",
                margin: 0,
                fontWeight: 400,
              }}
            >
              {card.reframe}
            </blockquote>

            {/* Mirror signals — no bullets, indented italic */}
            <div style={{ marginTop: 52 }}>
              <p
                className="font-label"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  color: "rgba(255,239,222,0.75)",
                  marginBottom: 22,
                  textAlign: "center",
                }}
              >
                WHAT YOUR ANSWERS REVEALED
              </p>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 18 }}>
                {card.signals.map((s, idx) => (
                  <li
                    key={`signal-${idx}`}
                    className="font-serif italic"
                    style={{
                      fontSize: "1.05rem",
                      color: "rgba(255,239,222,0.92)",
                      lineHeight: 1.55,
                      textAlign: "center",
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Ritual */}
            <div style={{ marginTop: 56, position: "relative" }}>
              <p
                className="font-label"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  color: "rgba(255,239,222,0.75)",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {card.ritualLabel.toUpperCase()}
              </p>
              <p
                className="font-serif italic"
                style={{
                  fontSize: "1.15rem",
                  color: "rgba(255,239,222,0.95)",
                  lineHeight: 1.55,
                  textAlign: "center",
                }}
              >
                {card.ritual}
              </p>
            </div>

            {/* CTA */}
            <div style={{ marginTop: 60, textAlign: "center" }}>
              <QuizCTAButton label="BEGIN THE REMEMBERING" onClick={() => setShowGate(true)} />
            </div>
          </div>
        </div>
      </section>
      {/* ── EMAIL GATE OVERLAY ───────────────────────────────────── */}
      {showGate && (
        <QuizEmailGate
          dosha={devDosha}
          onSuccess={() => setShowGate(false)}
        />
      )}

    </main>
  );
}

/* ── Organic aura ornaments ─────────────────────────────────────
 * Replace straight-line dividers with short balanced-state aura strokes.
 * Brand rule: no straight lines — organic shapes from aura SVGs only.
 */
function AuraOrnament({
  color,
  style,
}: {
  color: string;
  style?: React.CSSProperties;
}): React.ReactElement {
  return (
    <div
      aria-hidden="true"
      style={{ display: "flex", justifyContent: "center", ...style }}
    >
      <svg
        viewBox="0 0 120 14"
        width="96"
        height="12"
        fill="none"
        style={{ overflow: "visible" }}
      >
        <path
          d="M 4,8 C 18,2 32,12 48,7 C 62,2 78,12 92,8 C 104,5 114,9 116,7"
          stroke={color}
          strokeWidth="0.8"
          strokeOpacity="0.55"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

function MiniAura({
  pct,
  color,
  strokeOpacity,
}: {
  pct: number;
  color: string;
  strokeOpacity: number;
}): React.ReactElement {
  const w = Math.max(28, Math.round(28 + (pct / 100) * 200));
  const h = Math.max(18, Math.round(18 + (pct / 100) * 22));
  return (
    <svg
      viewBox="0 0 100 40"
      width={w}
      height={h}
      fill="none"
      preserveAspectRatio="none"
      style={{ overflow: "visible", flexShrink: 0 }}
    >
      <path
        d="M 8,20 C 18,6 38,4 52,10 C 68,16 86,10 94,18 C 98,26 84,34 62,32 C 42,30 20,34 8,28 C 2,24 2,26 8,20 Z"
        stroke={color}
        strokeWidth="1.2"
        strokeOpacity={strokeOpacity}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

const DOSHA_COLORS: Record<string, string> = {
  Vata:  '#F5A800',
  Pitta: '#A2E8F2',
  Kapha: '#FFB3A5',
};

function AuraBubbleChart({
  comp,
  bgColor,
}: {
  comp: readonly { pct: number; label: string }[];
  bgColor: string;
}): React.ReactElement {
  const K = 0.552;

  const slots = [
    { cx: 108, cy: 102, rx: 78, ry: 73, warp: [6,  5, -3,  5] },
    { cx: 244, cy:  80, rx: 53, ry: 49, warp: [4, -3,  4, -3] },
    { cx: 252, cy: 167, rx: 32, ry: 30, warp: [2, -2,  2, -1] },
  ];

  function ovalPath(cx: number, cy: number, rx: number, ry: number, w: number[]): string {
    const kx = K * rx, ky = K * ry;
    return [
      `M ${cx},${cy - ry}`,
      `C ${cx + kx + w[0]},${cy - ry} ${cx + rx},${cy - ky + w[1]} ${cx + rx},${cy}`,
      `C ${cx + rx},${cy + ky + w[2]} ${cx + kx},${cy + ry + w[3]} ${cx},${cy + ry}`,
      `C ${cx - kx},${cy + ry} ${cx - rx},${cy + ky} ${cx - rx},${cy}`,
      `C ${cx - rx},${cy - ky} ${cx - kx + w[0]},${cy - ry} ${cx},${cy - ry}`,
      `Z`,
    ].join(' ');
  }

  const sWidth  = [1.2, 0.9, 0.7];
  const pctSize = [23,  15,  9];
  const lblSize = [8,   7,   6];

  return (
    <svg
      viewBox="0 0 360 220"
      fill="none"
      style={{ width: '100%', marginTop: 20, overflow: 'visible' }}
      aria-label="Dosha composition"
      role="img"
    >
      {slots.map((s, i) => {
        const dc    = DOSHA_COLORS[comp[i].label] ?? '#FFEFDE';
        const pSize = pctSize[i];
        const lSize = lblSize[i];
        return (
          <g key={comp[i].label}>
            <path
              d={ovalPath(s.cx, s.cy, s.rx, s.ry, s.warp)}
              fill={dc}
              fillOpacity={1}
              stroke={dc}
              strokeOpacity={1}
              strokeWidth={sWidth[i]}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x={s.cx}
              y={s.cy - 4}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={bgColor}
              fillOpacity={1}
              style={{ fontFamily: 'var(--font-plantin, Georgia, serif)', fontSize: pSize }}
            >
              {comp[i].pct}%
            </text>
            <text
              x={s.cx}
              y={s.cy + pSize * 0.72}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={bgColor}
              fillOpacity={1}
              style={{
                fontFamily: 'var(--font-brandon, "Arial Narrow", Arial, sans-serif)',
                fontSize: lSize,
                letterSpacing: '0.18em',
              }}
            >
              {comp[i].label.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
