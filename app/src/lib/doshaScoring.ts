/**
 * doshaScoring.ts
 *
 * Weighted Dosha scoring module.
 * Weights: Body (layer 1) = 30%, Mind (layer 2) = 25%, Spirit (layer 3) = 45%
 * a = Vata, b = Pitta, c = Kapha throughout
 */

export type DoshaBreakdown = {
  primary: "vata" | "pitta" | "kapha";
  secondary: "vata" | "pitta" | "kapha";
  composition: { vata: number; pitta: number; kapha: number }; // integers, sum === 100
  isDual: boolean;
  isTri: boolean;
};

type Dosha = "vata" | "pitta" | "kapha";

/* ── Lightweight question metadata ────────────────────────────────────────
   Mirrors QS array order from QuizBody.tsx. Only layer + qtype are needed.
   open qtype questions do not score. scale2/scale3 score a/b/c normally.
   The 45-question array below must stay in sync with QS in QuizBody.tsx.
   ───────────────────────────────────────────────────────────────────────── */
type QMeta = { layer: 1 | 2 | 3; qtype?: string };

const QS_META: QMeta[] = [
  /* Layer 1 / Body (Q1-Q15) */
  { layer: 1, qtype: "visual"  }, // Q1
  { layer: 1, qtype: "visual"  }, // Q2
  { layer: 1, qtype: "visual"  }, // Q3
  { layer: 1                   }, // Q4  choice
  { layer: 1                   }, // Q5  choice
  { layer: 1, qtype: "visual"  }, // Q6
  { layer: 1                   }, // Q7  choice
  { layer: 1, qtype: "scale2"  }, // Q8
  { layer: 1, qtype: "visual"  }, // Q9
  { layer: 1                   }, // Q10 choice
  { layer: 1, qtype: "open"    }, // Q11 — skip
  { layer: 1                   }, // Q12 choice
  { layer: 1, qtype: "scale2"  }, // Q13
  { layer: 1                   }, // Q14 choice
  { layer: 1                   }, // Q15 choice

  /* Layer 2 / Mind (Q16-Q28) */
  { layer: 2                   }, // Q16 choice
  { layer: 2, qtype: "scale3"  }, // Q17
  { layer: 2, qtype: "visual"  }, // Q18
  { layer: 2                   }, // Q19 choice
  { layer: 2                   }, // Q20 choice
  { layer: 2, qtype: "visual"  }, // Q21
  { layer: 2                   }, // Q22 choice
  { layer: 2, qtype: "scale3"  }, // Q23
  { layer: 2                   }, // Q24 choice
  { layer: 2                   }, // Q25 choice
  { layer: 2, qtype: "open"    }, // Q26 — skip
  { layer: 2, qtype: "visual"  }, // Q27
  { layer: 2                   }, // Q28 choice

  /* Layer 3 / Spirit (Q29-Q45) */
  { layer: 3                   }, // Q29 choice
  { layer: 3                   }, // Q30 choice
  { layer: 3                   }, // Q31 choice
  { layer: 3                   }, // Q32 choice
  { layer: 3                   }, // Q33 choice
  { layer: 3, qtype: "visual"  }, // Q34
  { layer: 3                   }, // Q35 choice
  { layer: 3                   }, // Q36 choice
  { layer: 3                   }, // Q37 choice
  { layer: 3, qtype: "scale2"  }, // Q38
  { layer: 3                   }, // Q39 choice
  { layer: 3                   }, // Q40 choice
  { layer: 3, qtype: "visual"  }, // Q41
  { layer: 3                   }, // Q42 choice
  { layer: 3                   }, // Q43 choice (4 options — d doesn't map to dosha, skip)
  { layer: 3                   }, // Q44 choice
  { layer: 3, qtype: "open"    }, // Q45 — skip
];

/* ── Build a map from STEPS index to QS_META index ───────────────────────
   Mirrors buildSteps() logic from QuizBody.tsx:
   - Insert LayerScreen before each layer group
   - Insert interstitials after QS indices 8, 20, 38
   - Insert transition interstitials before layer 2 and 3
   ───────────────────────────────────────────────────────────────────────── */
type StepInfo = { kind: "question"; qsIndex: number } | { kind: "other" };

function buildStepMap(): StepInfo[] {
  const map: StepInfo[] = [];
  const MID_ACT_AFTER = new Set([8, 20, 38]);
  let lastLayer = 0;

  QS_META.forEach((q, qi) => {
    if (q.layer !== lastLayer) {
      const nextLayer = q.layer;
      if (nextLayer > 1) {
        // transition interstitial
        map.push({ kind: "other" });
      }
      // layer screen
      map.push({ kind: "other" });
      lastLayer = q.layer;
    }
    map.push({ kind: "question", qsIndex: qi });
    if (MID_ACT_AFTER.has(qi)) {
      map.push({ kind: "other" });
    }
  });

  return map;
}

const STEP_MAP: StepInfo[] = buildStepMap();

/* ── Largest Remainder Method ─────────────────────────────────────────────
   Normalises three floats that sum to ~100 into integers that sum exactly to 100.
   ───────────────────────────────────────────────────────────────────────── */
function largestRemainder(vals: [number, number, number]): [number, number, number] {
  const floors = vals.map(Math.floor) as [number, number, number];
  const remainders = vals.map((v, i) => ({ idx: i, rem: v - floors[i] }));
  const deficit = 100 - floors.reduce((s, n) => s + n, 0);
  remainders.sort((a, b) => b.rem - a.rem);
  for (let i = 0; i < deficit; i++) {
    floors[remainders[i].idx]++;
  }
  return floors;
}

/* ── Main scoring function ───────────────────────────────────────────────
   answers: Record<stepIndex (string), "a"|"b"|"c"|any>
   Steps that are not in the STEP_MAP or not of kind "question" are ignored.
   Open-text qtypes are skipped.
   ───────────────────────────────────────────────────────────────────────── */
export function doshaScoring(
  answers: Record<string, string>
): DoshaBreakdown {
  const FALLBACK: DoshaBreakdown = {
    primary: "vata",
    secondary: "pitta",
    composition: { vata: 34, pitta: 33, kapha: 33 },
    isDual: true,
    isTri: true,
  };

  if (!answers || Object.keys(answers).length === 0) return FALLBACK;

  // Raw score buckets per layer per dosha
  const raw: Record<1 | 2 | 3, Record<Dosha, number>> = {
    1: { vata: 0, pitta: 0, kapha: 0 },
    2: { vata: 0, pitta: 0, kapha: 0 },
    3: { vata: 0, pitta: 0, kapha: 0 },
  };
  const totals: Record<1 | 2 | 3, number> = { 1: 0, 2: 0, 3: 0 };

  for (const [stepIdxStr, answer] of Object.entries(answers)) {
    const stepIdx = parseInt(stepIdxStr, 10);
    if (isNaN(stepIdx) || stepIdx < 0 || stepIdx >= STEP_MAP.length) continue;

    const info = STEP_MAP[stepIdx];
    if (info.kind !== "question") continue;

    const meta = QS_META[info.qsIndex];
    if (!meta) continue;

    // Skip open-text questions
    if (meta.qtype === "open") continue;

    const layer = meta.layer;

    if (answer === "a") {
      raw[layer].vata++;
      totals[layer]++;
    } else if (answer === "b") {
      raw[layer].pitta++;
      totals[layer]++;
    } else if (answer === "c") {
      raw[layer].kapha++;
      totals[layer]++;
    }
    // "d" or other values (e.g. Q43 has option d) don't map to a dosha — skip
  }

  const totalAnswers = totals[1] + totals[2] + totals[3];
  if (totalAnswers === 0) return FALLBACK;

  /* Per-layer percentage for each dosha (0-100), guarding against /0 */
  function pct(layer: 1 | 2 | 3, dosha: Dosha): number {
    if (totals[layer] === 0) return 33.33;
    return (raw[layer][dosha] / totals[layer]) * 100;
  }

  /* Weighted score for each dosha */
  const WEIGHTS = { 1: 0.30, 2: 0.25, 3: 0.45 };

  const scores: Record<Dosha, number> = {
    vata:  pct(1, "vata")  * WEIGHTS[1] + pct(2, "vata")  * WEIGHTS[2] + pct(3, "vata")  * WEIGHTS[3],
    pitta: pct(1, "pitta") * WEIGHTS[1] + pct(2, "pitta") * WEIGHTS[2] + pct(3, "pitta") * WEIGHTS[3],
    kapha: pct(1, "kapha") * WEIGHTS[1] + pct(2, "kapha") * WEIGHTS[2] + pct(3, "kapha") * WEIGHTS[3],
  };

  /* Normalise to sum=100 using Largest Remainder */
  const [vataInt, pittaInt, kaphaInt] = largestRemainder([
    scores.vata,
    scores.pitta,
    scores.kapha,
  ]);

  const composition = { vata: vataInt, pitta: pittaInt, kapha: kaphaInt };

  /* Rank doshas */
  const sorted: Dosha[] = (["vata", "pitta", "kapha"] as Dosha[]).sort(
    (a, b) => composition[b] - composition[a]
  );

  const primary   = sorted[0];
  const secondary = sorted[1];

  const diff = composition[primary] - composition[secondary];
  const span = composition[primary] - composition[sorted[2]];

  const isDual = diff < 15;
  const isTri  = span < 20;

  return { primary, secondary, composition, isDual, isTri };
}
