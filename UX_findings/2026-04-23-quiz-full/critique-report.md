# Quiz Critique Report — Full Flow Audit

**Date:** 2026-04-23
**Scope:** `/quiz`, `/quiz/body`, `/quiz/gate`, `/quiz/result`
**Method:** LLM design review (source read) + automated pattern scan
**Prior baseline:** 20/40 (Joana persona flow, 2026-04-22)

---

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Progress rendered as visual arc only; no "23 of 43" readout. No save-state toast. |
| 2 | Match System / Real World | 4 | Copy is outstanding — "The bed.", "The pillow won." — domain-accurate, Joana-tuned. |
| 3 | User Control and Freedom | 2 | Auto-advance at 180ms + no un-pick. Escape on email gate fires `onSuccess("")` silently. |
| 4 | Consistency and Standards | 3 | Five question kinds each have different commit models. CTA label drifts ("Yes, begin." / "CONTINUE" / "READ MY FULL REPORT"). |
| 5 | Error Prevention | 2 | No typo check on email. Scale-3 buckets (0.33/0.67) invisible until release. No "I don't know" pole. |
| 6 | Recognition Rather Than Recall | 3 | Layer icons + letters help. Interstitials reference answers from 10+ screens ago with no recall aid. |
| 7 | Flexibility and Efficiency | 1 | Zero keyboard shortcuts in body. No A/B/C typing. No resume on revisit. |
| 8 | Aesthetic and Minimalist | 4 | Genuinely excellent. Single focal question, one aura, one action. Restraint is the craft. |
| 9 | Error Recovery | 2 | Poetic-but-vague errors ("Something held this back"). No field-level inline errors. |
| 10 | Help and Documentation | 1 | No contextual help on scales. "43 questions" promised, 45 shipped + 8 interstitials = ~53 screens. |
| **Total** | | **24/40** | **Moderate — craft pockets, structural gaps** |

**Delta vs baseline:** +4 points. Re-scoring with source-level access surfaced craft wins (aura-per-option, sound pairing) that the Joana-persona walk rated more harshly. Structural debt unchanged.

---

## Anti-Patterns Verdict

### LLM assessment — **NOT AI slop.**

No gradient text. No glassmorphism (one justified `backdrop-filter: blur(28px)` on the email modal — `QuizEmailGate.tsx:192`). No hero-metric cards. No side-stripe borders. No identical card grids. Shapes are hand-authored cubic beziers. Palette locked to brand. Type pairing is Plantin + Brandon, as specified. The bespoke aura-per-option silhouettes (`QuizBody.tsx:57-79`) and drag-on-wavy-track slider are the opposite of slop — expensive, considered, and unique.

### Deterministic scan — **clean.**

| Pattern | Count |
|---------|-------|
| border-left/right >1px | 0 |
| Gradient text (bg-clip-text) | 0 |
| Dark-glow box-shadow | 0 |
| Pure black text / `#000` | 0 |
| Gradient buttons | 0 |
| Rounded corners (any) | 0 |
| Generic font stacks in primary role | 0 |
| "Coming soon" / TBD / Lorem | 0 |
| console.log/warn/error in .tsx | 0 |

One P3: `result/page.tsx:646` declares `"Arial Narrow", Arial, sans-serif` as a CSS variable fallback chain. Only fires if Brandon fails to load. Cosmetic.

**Note:** impeccable CLI is not installed globally (`npx impeccable` returned "Unknown command"). Scan ran as 12-pattern Grep sweep. If you want the full 25-pattern browser overlay, install the CLI per `.claude/skills/critique/SKILL.md` Step 2.

---

## Overall Impression

The quiz is the best-crafted surface in the project. Writing, aura system, and sound all pull in the same direction. What holds it at 24/40 is not decoration — it's **commitment mechanics.** A 180ms auto-advance on identity-defining questions, an Escape key that silently discards the email capture, and a resume system that writes state but never reads it back — these are the three loops that cost trust at the exact moment the brand is asking for it.

**The one thing to fix this week:** make commit reversible. Everything else can wait a sprint.

---

## What's Working

- **Writing is the single strongest asset.** Playful Authority is audible in the concrete: *"The bed."* (`QuizBody.tsx:141`), *"The pillow won."* (`QuizBody.tsx:188`). No other Ayurveda quiz sounds like this.
- **Aura-per-option** (`QuizBody.tsx:57-79`) — A, B, C each get a distinct organic silhouette, not just a letter badge. Brand doing real interaction work.
- **Sound-answer pairing** via `quizSounds.play(id === "a" ? "chimeA" ...)` (`QuizBody.tsx:1714`) turns commitment into a felt moment. Peak-end territory.

---

## Priority Issues

### [P0] Silent email-discard via Escape key
- **File:** `app/src/components/quiz/QuizEmailGate.tsx:56`
- **Why:** Pressing Escape on the email gate calls `onSuccess("")` — an empty string fed to the success handler. At `result/page.tsx:473` this writes `{ email: "" }` to state and routes to `/quiz/sent` as if the email was captured. User loses their result, brand loses the lead, funnel silently leaks.
- **Fix:** Escape should call a separate `onCancel` that hides the overlay (`setShowGate(false)`) — never the success path.
- **Command:** `/harden`

### [P0] Auto-advance + 180ms lock prevents correction
- **File:** `app/src/components/quiz/QuizBody.tsx:1711-1717`
- **Why:** `handlePick` sets `chosen`, plays sound, and 180ms later commits + unmounts the question. No "Are you sure?" moment, no un-pick on non-scale questions. Misclick = wrong dosha. For a 52-screen product selling identity, this is brittle.
- **Fix:** Hold the selected-aura preview 800-1200ms with subtle "Tap again to continue" cue, or let any other option override until CONTINUE is tapped.
- **Command:** `/harden`

### [P1] State persistence written but never read on resume
- **File:** `app/src/lib/quizState.ts` + `app/src/components/quiz/QuizBody.tsx:1649`
- **Why:** `QuizBody` initialises `useState(0)` for `stepIdx` — never calls `readQuizState()`. Writes only fire at intro→body handoff and email submit. `answers` and `stepIndex` in the schema are dead fields. `pushHistory` defined but never invoked. Tab-close at Q30 returns to Q1 with answers gone but old email still cached. Contradicts plan Task 1.
- **Fix:** Read on mount, write on every `recordAnswer`, surface "Continue where you left off" on `/quiz` landing.
- **Command:** `/harden`

### [P1] Question count contradiction
- **Files:** `QuizIntro.tsx:43` vs `QuizBody.tsx:133-463` (45 questions) + `buildSteps()` at 509 (adds layers + 5 interstitials)
- **Why:** Intro promises "43 questions." Code ships 45. Total STEPS ≈ 53. Breaks the 15-minute promise at `QuizIntro.tsx:37`. Playful Authority cannot survive a numeric fib.
- **Fix:** One constant — `TOTAL_QUESTIONS` in `quizConfig.ts` — fed to intro copy, nav, and buildSteps.
- **Command:** `/clarify`

### [P1] Visual triangle biases C as "lesser"
- **File:** `app/src/components/quiz/QuizBody.tsx:1549-1565`
- **Why:** A + B share the top row at `gap-10`; C sits alone below. Western reading order makes the bottom-centred option feel like the remainder/default, biasing Kapha responses. Particularly corrupting on Q1-Q3 which set the tone for the entire quiz.
- **Fix:** Horizontal row of three at equal weight, or rotate the "odd one out" position per question.
- **Command:** `/layout`

### [P2] Scale-3 bucket boundaries invisible while dragging
- **File:** `app/src/components/quiz/QuizBody.tsx:1123` (boundaries 0.33 / 0.67)
- **Why:** User drags to 0.34 intending "close to A", lands on "B". Letter brightens post-hoc on release at `QuizBody.tsx:1135`. No anchoring during the drag means the system tells the user their intent was wrong only after they committed.
- **Fix:** Live-highlight the nearest letter while dragging, not only on release. Optional: haptic tick on bucket cross.
- **Command:** `/clarify`

---

## Persona Red Flags

### Joana (early-30s, mobile, 5-sec attention, wellness-skeptic)
- **Q1 misclick scenario:** taps "The bed" as a joke, 180ms auto-commit, no undo. Five screens later realises it skewed her answers. Closes tab. She does not come back.
- **Intro 6 screens** before first data question. She bounces at screen 3, brand learned nothing about her (confirmed prior finding, still shipped).
- **"15 minutes, 43 questions" promise** at `QuizIntro.tsx:37,43` — when she hits Q38 and the counter keeps climbing past 43, the trust cost is larger than the time cost.

### Casey (distracted mobile, interrupted, thumb-zone)
- **Tab-close → lose-all.** Persistence schema exists but never reads back. Casey is the modal user — she checks Messages mid-quiz every time.
- **Visual triangle** (`QuizBody.tsx:1549`) — on 390px viewport, C-below-AB means C sits in the thumb-reachable sweet spot. She picks C not because it fits but because it's easiest to tap.
- **Scale-3 drag precision** — thumb-drag at 390px with three invisible bucket boundaries is a bad fight. She drops at the wrong bucket and doesn't notice.

### Riley (deliberate stress tester)
- **Email Escape = silent send.** Riley will find this on attempt 2 and file it P0.
- **Direct URL `/quiz/gate`** — `QuizEmailGate.tsx:37` pulls `archetype = ARCHETYPES[dosha]` with fallback; renders a seemingly-legit teaser for a dosha the user never earned.
- **Dev toolbar** (`QuizIntro.tsx:400`, `QuizBody.tsx:1609`) — one `NODE_ENV` flip from production. Gate it harder.

---

## Minor Observations

- Interstitial auto-advances after 4500ms (`QuizInterstitial.tsx:56`) with no visible countdown. Slow readers yanked.
- Legal copy sits below CTA on email gate (`QuizEmailGate.tsx:384-391`). Compliance prefers above.
- CTA label inconsistency — "Yes, begin." → "CONTINUE" → "READ MY FULL REPORT" → "SEND MY FULL REPORT". One voice, four masters.
- Open-question "bonus field" (`QuizBody.tsx:1411`) mounts on first keystroke — surprise expansion adds cognitive load instead of reducing it.
- Arial fallback in `result/page.tsx:646` — low-cost cleanup.

---

## Questions to Consider

1. If Joana misclicks "The bed" instead of "My mind" on Q1 — a 180ms commit — she receives a wrong Dosha and an archetype card designed to feel like prophecy. Is the brand willing to stake credibility on a click that can't be undone?
2. Intro takes ~45 seconds of read-and-tap before a single data-bearing question. If Joana bounces at screen 3, the brand has learned nothing. Should the first question come before, not after, the "15 minutes" value promise?
3. The product promises "43 questions, one map." Code ships 45 + 8 non-questions = 53 screens. Who owns keeping copy and code in sync — and does "Playful Authority" survive being caught in a numeric fib?

---

## Score Delta & Trend

| Date | Score | Band | Notes |
|------|-------|------|-------|
| 2026-04-22 | 20/40 | Low-moderate | Joana persona walk. Caught state + intro + counter P0/P1. |
| 2026-04-23 | 24/40 | Moderate | Full source read. Same structural debt + deeper craft recognition + new P0 (Escape silent-send, auto-advance lock). |

**Trajectory after plan `docs/plans/2026-04-23-quiz-ux-hardening.md` ships:** projected 30-32/40 if Tasks 1+2+4 land. Add fixes for the two new P0s above → 33-34/40 territory.

---

## User Clarifications (2026-04-23)

Recorded during audit review — no implementation requested. These are design-intent notes for the next implementer.

- **Auto-advance 180ms lock is INTENTIONAL.** User confirmed it's a fast-flow design choice, not a bug. The P0 severity is downgraded to **informational risk**: brand accepts misclick cost for interaction speed. If trust issues surface in analytics (high "back to retry" or high dosha-change rate between tabs), revisit with an "undo last" pill.
- **Question count canonical source** is `ETHA_Dosha_Quiz_v4-final-23.04.docx`. Code must reconcile against the docx, not the other way around. The docx specifies Body 15 + Mind 13 + Spirit 17 = 45 questions (not 43 as intro currently states). Intro copy needs updating to the docx number, or the docx + code deleted down to 43 together.
- **Action plan deferred.** User opted audit-only. No `/harden` pass executed. Findings remain documented here for the implementer who picks up `docs/plans/2026-04-23-quiz-ux-hardening.md`.
- **Escape silent-send P0 stands.** User picked "both in one /harden pass" for fix order, but scope is "audit only" for now. When implementation resumes, bundle the Escape fix with whatever /harden work addresses the existing plan's Task 1 (state persistence).
