"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { QuizCTAButton } from "@/components/quiz/QuizCTAButton";
import { useQuizData } from "@/components/quiz/QuizDataProvider";
import QuizEmailGate from "@/components/quiz/QuizEmailGate";
import { writeQuizState, readQuizState } from "@/lib/quizState";
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
  const router = useRouter();

  const [devDosha, setDevDosha]   = useState<Archetype>(result?.primary ?? "vata");
  const [showGate, setShowGate]   = useState(false);
  const [emailDone, setEmailDone] = useState(() => !!readQuizState()?.email);
  const auraRef      = useRef<SVGSVGElement>(null);
  const labelRef     = useRef<HTMLParagraphElement>(null);
  const nameRef      = useRef<HTMLHeadingElement>(null);
  const archetypeRef = useRef<HTMLDivElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!result) return;
    setDevDosha(result.primary);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      gsap.set(nameRef.current,    { y: 24, opacity: 0 });
      gsap.set(contentRef.current, { y: 10, opacity: 0 });

      if (reduced) {
        const tl = gsap.timeline({ delay: 0.05 });
        tl.to(auraRef.current,      { opacity: 1, duration: 0.3 }, 0);
        tl.to(labelRef.current,     { opacity: 1, duration: 0.3 }, 0.1);
        tl.to(nameRef.current,      { opacity: 1, y: 0, duration: 0.3 }, 0.2);
        tl.to(archetypeRef.current, { opacity: 1, duration: 0.3 }, 0.3);
        tl.to(contentRef.current,   { opacity: 1, y: 0, duration: 0.3 }, 0.4);
        return;
      }

      /*
       * Sequential reveal — each group waits for the previous to land.
       * Eases: power2/power3 for smooth deceleration, no bounce/elastic.
       *
       * 0.0s  aura breathes in (ambient, long)
       * 0.2s  "YOUR NATURE IS" label
       * 0.7s  dosha name — the hero moment, given the most space
       * 2.0s  archetype label
       * 2.7s  blobs (handled in AuraBubbleChart via startDelay prop)
       * 4.5s  content (reframe + signals + ritual)
       */
      const tl = gsap.timeline({ delay: 0.1 });

      /*
       * Waterfall chain — each starts 0.06s before the previous finishes.
       * Aura runs in parallel (ambient, doesn't block chain).
       *
       * label:      0.00 → 0.50
       * name:       0.44 → 1.34
       * archetype:  1.28 → 1.73
       * blob 0:     1.67  (startDelay passed to AuraBubbleChart)
       * blob 1:     1.95
       * blob 2:     2.23 → 2.93
       * content:    2.87
       */
      tl.to(auraRef.current,      { opacity: 1, duration: 1.4, ease: "power2.out" }, 0);
      tl.to(labelRef.current,     { opacity: 1, duration: 0.5, ease: "circ.out" }, 0);
      tl.to(nameRef.current,      { opacity: 1, y: 0, duration: 0.9, ease: "expo.out" }, "-=0.06");
      tl.to(archetypeRef.current, { opacity: 1, duration: 0.45, ease: "circ.out" }, "-=0.06");
      tl.to(contentRef.current,   { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }, 2.87);

      /* Aura ambient breathe — starts after initial reveal settles */
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

  const primaryDosha = result?.primary ?? devDosha;
  const isPreview    = devDosha !== primaryDosha;

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
      <section className="relative" aria-labelledby="dosha-name" style={{ minHeight: "100dvh", paddingTop: 100, paddingBottom: 64 }}>

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
              strokeOpacity="0.14"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Content column */}
        <div className="relative z-10 mx-auto px-8 sm:px-12 max-w-[520px] md:max-w-[680px]">

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

          {/* Archetype label */}
          <div
            ref={archetypeRef}
            style={{ marginTop: 22, opacity: 0 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <p
                className="font-label"
                style={{ fontSize: 11, letterSpacing: "0.22em", color: "rgba(255,239,222,0.70)" }}
              >
                {card.archetype.toUpperCase()}
              </p>
              {isPreview && (
                <span
                  className="font-label"
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "0.2em",
                    color: theme.dimAccent,
                    border: "1px solid",
                    borderColor: theme.dimAccent,
                    padding: "2px 6px",
                    borderRadius: 0,
                    lineHeight: 1,
                  }}
                >
                  PREVIEW
                </span>
              )}
            </div>
          </div>

          {/* Composition bubble chart — animates independently, blobs stagger from startDelay */}
          <div style={{ marginTop: 28 }}>
            <AuraBubbleChart comp={card.comp} startDelay={1.67} />
          </div>

          {/* Main content */}
          <div ref={contentRef} style={{ marginTop: 64, opacity: 0 }}>

            {/* Reframe quote — emotional core, given full stage */}
            <blockquote
              className="font-serif italic"
              style={{
                fontSize: "clamp(1.7rem, 4.5vw, 2.1rem)",
                lineHeight: 1.5,
                color: "#FFEFDE",
                textAlign: "center",
                margin: 0,
                fontWeight: 400,
                maxWidth: "34ch",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {card.reframe}
            </blockquote>

            {/* Mirror signals — left-aligned, editorial feel */}
            <div style={{ marginTop: 64 }}>
              <p
                className="font-label"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.26em",
                  color: "rgba(255,239,222,0.55)",
                  marginBottom: 32,
                  textAlign: "left",
                }}
              >
                WHAT YOUR ANSWERS REVEALED
              </p>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 28 }}>
                {card.signals.map((s, idx) => (
                  <li
                    key={`signal-${idx}`}
                    className="font-serif italic"
                    style={{
                      fontSize: "1.22rem",
                      color: "rgba(255,239,222,0.88)",
                      lineHeight: 1.6,
                      textAlign: "left",
                      paddingLeft: 0,
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Ritual — the gift. More weight, more separation, left-aligned */}
            <div style={{ marginTop: 72, position: "relative" }}>
              <p
                className="font-label"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.26em",
                  color: "rgba(255,239,222,0.55)",
                  marginBottom: 20,
                  textAlign: "left",
                }}
              >
                {card.ritualLabel.toUpperCase()}
              </p>
              <p
                className="font-serif italic"
                style={{
                  fontSize: "clamp(1.3rem, 3.2vw, 1.55rem)",
                  color: "#FFEFDE",
                  lineHeight: 1.65,
                  textAlign: "left",
                }}
              >
                {card.ritual}
              </p>
            </div>

          </div>
        </div>

        {/* Email CTA */}
        {!emailDone && (
          <div
            className="mx-auto px-8 sm:px-12 max-w-[520px] md:max-w-[680px]"
            style={{ marginTop: 72, textAlign: "center", paddingBottom: 48 }}
          >
            <QuizCTAButton
              label="READ MY FULL REPORT"
              onClick={() => setShowGate(true)}
              strokeColor={theme.nameColor}
              revealMode="draw"
            />
            <p
              className="font-serif italic"
              style={{ marginTop: 14, fontSize: "0.82rem", color: "rgba(255,239,222,0.72)" }}
            >
              Private. Never shared. Unsubscribe at any moment.
            </p>
          </div>
        )}
      </section>

      {/* Email gate overlay */}
      {showGate && (
        <QuizEmailGate
          dosha={devDosha}
          onSuccess={(email) => {
            writeQuizState({ email });
            setEmailDone(true);
            setShowGate(false);
            router.push("/quiz/sent");
          }}
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

const DOSHA_FILLS: Record<string, { fill: string; text: string }> = {
  Vata:  { fill: '#F5A800', text: '#3D233B' },
  Pitta: { fill: '#A2E8F2', text: '#3D233B' },
  Kapha: { fill: '#FFB3A5', text: '#3D233B' },
};

function AuraBubbleChart({
  comp,
  startDelay = 2.7,
}: {
  comp: readonly { pct: number; label: string }[];
  startDelay?: number;
}): React.ReactElement {
  const groupRefs = useRef<(SVGGElement | null)[]>([]);

  /*
   * Hand-crafted C1-continuous paths — every anchor has mathematically balanced
   * control handles so the tangent direction is identical on both sides.
   * No warp arrays, no kinks, no algorithmic ugliness.
   *
   * Blob 0: wide horizontal pebble  (cx≈93, cy≈117)
   * Blob 1: tall narrow standing-stone (cx≈268, cy≈78)
   * Blob 2: small compact disc       (cx≈276, cy≈204)
   *
   * Gap between 0→1: ~18px horizontal. Gap between 1→2: ~26px vertical.
   */
  const BLOBS = [
    {
      path: "M 80,36 C 138,20 196,68 196,112 C 196,156 148,202 90,202 C 32,202 2,162 6,116 C 10,70 22,52 80,36 Z",
      tx: 93, ty: 116,
    },
    {
      path: "M 268,14 C 298,12 322,36 322,76 C 322,116 300,140 268,142 C 236,144 214,120 214,80 C 214,40 238,16 268,14 Z",
      tx: 268, ty: 78,
    },
    {
      path: "M 276,168 C 300,165 318,180 318,204 C 318,228 298,240 276,240 C 254,240 234,226 234,204 C 234,182 252,171 276,168 Z",
      tx: 276, ty: 204,
    },
  ];

  const centers = [[93,117],[268,78],[276,204]];

  useEffect(() => {
    const groups = groupRefs.current.filter((g): g is SVGGElement => g !== null);
    if (!groups.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    groups.forEach((g, i) => {
      gsap.set(g, { svgOrigin: `${centers[i][0]} ${centers[i][1]}`, scale: 0, opacity: 0 });
    });

    if (reduced) {
      gsap.to(groups, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.15, delay: startDelay });
      return;
    }

    groups.forEach((g, i) => {
      gsap.to(g, {
        scale: 1,
        opacity: 1,
        duration: 0.7,
        ease: "back.out(1.3)",
        delay: startDelay + i * 0.28,
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comp, startDelay]);

  const pctSize = [28, 19, 13];
  const lblSize = [10,  8,  7];

  return (
    <svg
      viewBox="0 0 400 250"
      fill="none"
      style={{ width: '100%', marginTop: 20, overflow: 'visible' }}
      aria-label="Dosha composition"
      role="img"
    >
      {BLOBS.map((b, i) => {
        const fills = DOSHA_FILLS[comp[i].label] ?? { fill: '#FFEFDE', text: '#3D233B' };
        const pSize = pctSize[i];
        const lSize = lblSize[i];
        return (
          <g
            key={comp[i].label}
            ref={(el) => { groupRefs.current[i] = el; }}
          >
            <path d={b.path} fill={fills.fill} />
            <text
              x={b.tx}
              y={b.ty - 4}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={fills.text}
              style={{ fontFamily: 'var(--font-plantin, Georgia, serif)', fontSize: pSize }}
            >
              {comp[i].pct}%
            </text>
            <text
              x={b.tx}
              y={b.ty + pSize * 0.75}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={fills.text}
              style={{
                fontFamily: 'var(--font-brandon, "Arial Narrow", Arial, sans-serif)',
                fontSize: lSize,
                letterSpacing: '0.2em',
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
