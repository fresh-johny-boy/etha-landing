# Quiz Critique Report — Full Flow Audit

**Date:** 2026-04-23
**Scope:** `/quiz`, `/quiz/body`, `/quiz/gate`, `/quiz/result`
**Method:** LLM design review (source read) + automated pattern scan
**Prior baseline:** 20/40 (Joana persona flow, 2026-04-22)
**Revision:** Admin notes incorporated 2026-04-23

---

## Design Health Score

| # | Heuristic | Score | Key Issue | Admin Decision |
|---|-----------|-------|-----------|----------------|
| 1 | Visibility of System Status | 2 | Progress rendered as visual arc only; no "23 of 43" readout. No save-state toast. | **Intentional.** Visual-only progress is a brand choice — no numeric counter by design. |
| 2 | Match System / Real World | 4 | Copy is outstanding — "The bed.", "The pillow won." — domain-accurate, Joana-tuned. | — |
| 3 | User Control and Freedom | 2 | Auto-advance at 180ms + no un-pick. Escape on email gate fires `onSuccess("")` silently. | **Auto-advance is intentional** (fast-flow is part of the feel). **Escape silent-send is a bug** — must fix. |
| 4 | Consistency and Standards | 3 | Five question kinds each have different commit models. CTA label drifts ("Yes, begin." / "CONTINUE" / "READ MY FULL REPORT" / "SEND MY FULL REPORT"). | **Open — needs review.** Admin unsure whether CTA drift is intentional voice-work or accidental. Flag for next copy pass. |
| 5 | Error Prevention | 2 | Scale-3 buckets (0.33/0.67) invisible until release. No "I don't know" pole. No client-side email typo detection. | **Email typo-check not feasible client-side.** Server-side validation only — accepted as a floor. |
| 6 | Recognition Rather Than Recall | 3 | Layer icons + letters help. Interstitials reference answers from 10+ screens ago with no recall aid. | — |
| 7 | Flexibility and Efficiency | 1 | Zero keyboard shortcuts in body. No A/B/C typing. No resume on revisit. | **Resume deferred** to later iteration — documented, not shipped this sprint. |
| 8 | Aesthetic and Minimalist | 4 | Genuinely excellent. Single focal question, one aura, one action. Restraint is the craft. | — |
| 9 | Error Recovery | 2 | Email error messages are poetic but vague ("Something held this back") — user can't tell if it's network, duplicate email, or validation. No field-level inline errors. | **Clarified for admin:** when email submit fails, the user sees one sentence with no category ("network down" vs "email already in our list" vs "malformed address"). Fix = name the category and put the error under the field, not as a banner. |
| 10 | Help and Documentation | 1 | No contextual help on scales. Question count promise breaks (see P1). | — |
| **Total** | | **24/40** | **Moderate — craft pockets, structural gaps** | |

**Delta vs baseline:** +4 points. Source-level access surfaced craft wins (aura-per-option, sound pairing) that the Joana-persona walk rated more harshly. Structural debt unchanged.

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

The quiz is the best-crafted surface in the project. Writing, aura system, and sound all pull in the same direction. What holds it at 24/40 is not decoration — it's **commitment mechanics and copy-code sync.** The 180ms auto-advance is accepted as intentional, but the Escape key that silently discards the email capture and the resume system that writes state but never reads it back still cost trust at the moment the brand is asking for it.

**The one thing to fix this week:** the Escape silent-send on the email gate. Funnel leak is larger than it looks.

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
- **Admin decision:** Ship. Bundle with the state-persistence work in plan Task 1.

### [INFO] Auto-advance + 180ms lock — intentional
- **File:** `app/src/components/quiz/QuizBody.tsx:1711-1717`
- **Why flagged:** `handlePick` commits + unmounts 180ms after pick. Misclick = wrong dosha with no undo. Originally rated P0 for trust risk.
- **Admin decision:** **Keep as-is.** Fast-flow is part of the intended feel. Accept misclick cost for interaction speed. Revisit only if analytics show high "back to retry" or high cross-tab dosha-change rate.
- **Command:** none — design-intent.

### [P1] State persistence written but never read on resume
- **File:** `app/src/lib/quizState.ts` + `app/src/components/quiz/QuizBody.tsx:1649`
- **Why:** `QuizBody` initialises `useState(0)` for `stepIdx` — never calls `readQuizState()`. Writes only fire at intro→body handoff and email submit. `answers` and `stepIndex` in the schema are dead fields. `pushHistory` defined but never invoked. Tab-close at Q30 returns to Q1 with answers gone but old email still cached. Contradicts plan Task 1.
- **Fix:** Read on mount, write on every `recordAnswer`, surface "Continue where you left off" on `/quiz` landing.
- **Command:** `/harden`
- **Admin decision:** **Resume UX deferred.** Persistence plumbing may still land, but the user-facing "Continue where you left off" prompt is a later iteration.

### [P1] Question count contradiction — reconcile against v4 docx
- **Files:** `QuizIntro.tsx:43` vs `QuizBody.tsx:133-463` (45 questions) + `buildSteps()` at 509 (adds layers + 5 interstitials)
- **Why:** Intro promises "43 questions." Code ships 45. Total STEPS ≈ 53. Breaks the 15-minute promise at `QuizIntro.tsx:37`.
- **Fix:** Single constant `TOTAL_QUESTIONS` in `quizConfig.ts` — fed to intro copy, nav, and buildSteps.
- **Admin decision:** **Canonical source is `ETHA_Dosha_Quiz_v4-final-23.04.docx`.** docx specifies Body 15 + Mind 13 + Spirit 17 = 45 questions. Either update intro copy to "45 questions" or trim two questions to match "43" — reconcile code + docx + intro together. **Needs verification pass against v4 docx.**
- **Command:** `/clarify`

### [P1] Visual triangle biases C as "lesser"
- **File:** `app/src/components/quiz/QuizBody.tsx:1549-1565`
- **Why:** A + B share the top row at `gap-10`; C sits alone below. Western reading order makes the bottom-centred option feel like the remainder/default, biasing Kapha responses. Particularly corrupting on Q1-Q3 which set the tone.
- **Fix:** Horizontal row of three at equal weight, or rotate the "odd one out" position per question.
- **Command:** `/layout`

### [P2] Scale-3 bucket boundaries invisible while dragging
- **File:** `app/src/components/quiz/QuizBody.tsx:1123` (boundaries 0.33 / 0.67)
- **Why:** User drags to 0.34 intending "close to A", lands on "B". Letter brightens post-hoc on release at `QuizBody.tsx:1135`. No anchoring during drag means the system tells the user their intent was wrong only after commit.
- **Fix:** Live-highlight the nearest letter while dragging, not only on release. Optional: haptic tick on bucket cross.
- **Command:** `/clarify`

---

## Persona Red Flags

### Joana (early-30s, mobile, 5-sec attention, wellness-skeptic)
- **Q1 misclick scenario:** taps "The bed" as a joke, 180ms auto-commit, no undo. *Accepted risk per admin decision — intentional speed.*
- **Intro 6 screens** before first data question. She bounces at screen 3, brand learned nothing about her. v4 docx trims intro to 4 screens — aligns.
- **"15 minutes, 43 questions" promise** at `QuizIntro.tsx:37,43` — when she hits Q38 and the counter keeps climbing past 43, trust cost is larger than the time cost. Fix via P1 count reconciliation.

### Casey (distracted mobile, interrupted, thumb-zone)
- **Tab-close → lose-all.** Persistence schema exists but never reads back. Casey is the modal user — she checks Messages mid-quiz every time.
- **Visual triangle** (`QuizBody.tsx:1549`) — on 390px viewport, C-below-AB means C sits in the thumb-reachable sweet spot. She picks C not because it fits but because it's easiest to tap.
- **Scale-3 drag precision** — thumb-drag at 390px with three invisible bucket boundaries is a bad fight. She drops at the wrong bucket and doesn't notice.

### Riley (deliberate stress tester)
- **Email Escape = silent send.** Riley will find this on attempt 2 and file it P0. Admin confirmed: fix.
- **Direct URL `/quiz/gate`** — `QuizEmailGate.tsx:37` pulls `archetype = ARCHETYPES[dosha]` with fallback; renders a seemingly-legit teaser for a dosha the user never earned.
- **Dev toolbar** (`QuizIntro.tsx:400`, `QuizBody.tsx:1609`) — one `NODE_ENV` flip from production. Gate it harder.

---

## Minor Observations

- Interstitial auto-advances after 4500ms (`QuizInterstitial.tsx:56`) with no visible countdown. Slow readers yanked.
- Legal copy sits below CTA on email gate (`QuizEmailGate.tsx:384-391`). Compliance generally prefers above.
- **CTA label drift** — "Yes, begin." → "CONTINUE" → "READ MY FULL REPORT" → "SEND MY FULL REPORT". Admin flagged as *open* — needs a copy-pass decision on whether this is intentional voice or accidental inconsistency.
- Open-question "bonus field" (`QuizBody.tsx:1411`) mounts on first keystroke — surprise expansion adds cognitive load instead of reducing it.
- Arial fallback in `result/page.tsx:646` — low-cost cleanup.

---

## Questions to Consider

1. v4 docx is canonical for question structure. Who owns keeping code + intro copy + nav progress in sync with the docx going forward? One TOTAL_QUESTIONS constant fixes the symptom; a named owner prevents recurrence.
2. Intro takes ~45 seconds of read-and-tap before a single data-bearing question in current code. v4 docx trims this to 4 screens. When does that rewrite land?
3. CTA label drift (four variants for the primary action). Intentional tonal shift per context, or accidental copy debt? Needs a single-pass audit.

---

## Score Delta & Trend

| Date | Score | Band | Notes |
|------|-------|------|-------|
| 2026-04-22 | 20/40 | Low-moderate | Joana persona walk. Caught state + intro + counter P0/P1. |
| 2026-04-23 | 24/40 | Moderate | Full source read. Same structural debt + craft recognition + new P0 (Escape silent-send) + intentional-mark on auto-advance. |

**Projected trajectory:**
- After Escape silent-send fix + state persistence ships → 27-28/40
- After intro rewrite (v4 docx, 4 screens) + count reconciliation → 30-32/40
- After visual triangle rebalance + scale-3 live-highlight → 33-34/40
- Resume UX (deferred) would add another 1-2 points but is not in scope this sprint.

---

## Admin Decisions Consolidated (2026-04-23)

Captured during audit review. No implementation executed — these are design-intent notes for the next implementer.

| Finding | Admin Decision |
|---------|----------------|
| Numeric progress counter ("23 of 43") | **Skip.** Visual-only arc is intentional. |
| Auto-advance 180ms lock | **Keep.** Intentional fast-flow. Downgraded from P0 → design-intent note. |
| Escape silent-send on email gate | **Fix.** Bundle with plan Task 1 (state persistence). |
| CTA label drift | **Open.** Needs a copy-pass audit — may be intentional voice-work. |
| Client-side email typo-check | **Not feasible.** Server-side validation only. |
| Resume UX ("Continue where you left off") | **Deferred.** Persistence plumbing may still land; user-facing prompt is later. |
| Error Recovery — vague email errors | **Clarified:** fix = named category + field-level inline error, not poetic banner. |
| Question count (43 vs 45 vs 53) | **Verify against v4 docx.** `ETHA_Dosha_Quiz_v4-final-23.04.docx` is source of truth. Reconcile code + intro copy + docx together. |
| Action plan execution | **Not now.** Audit-only session. Plan at `docs/plans/2026-04-23-quiz-ux-hardening.md` awaits separate approval. |
