# ETHA Quiz — Implementation Spec
_Compiled: 2026-04-22 · Source: `docs/QUIZ-AUDIT.md` + admin resolutions · Target: actionable plan, not exhaustive detail._

**How to read this doc:**
Each spec item has an **ID** (stable, referenced from PRs), a **scope** (files + rough LOC), a concrete **approach**, and **acceptance criteria**. Items are grouped by epic. Epics ordered roughly by execution priority, not severity — some P1s are gated on Epic 1/2 decisions so they come later.

**Legend:** 🔴 P0 · 🟠 P1 · 🟡 P2 · ⚪ P3 · ❓ admin decision needed.

---

## 🧱 Scope boundary — FRONTEND ONLY

This spec covers **visual surfaces, interactions, and copy presentation only.** Backend concerns are **out of scope** and will be wired by the dev team later:

| Out of scope for this spec | Handed off to backend |
|---|---|
| Answer scoring / archetype resolver | ✓ |
| Session persistence (how answers survive refresh) | ✓ |
| Email capture storage + validation | ✓ |
| Archetype content authoring pipeline | ✓ (we ship stub data; backend swaps it) |
| Analytics event emission | ✓ |
| Tie-break rules, scoring weights | ✓ |

**Frontend ownership boundary:** we expose a **mock data provider** (a `QuizDataProvider` React context) with a typed interface. Backend replaces the mock with a real implementation later without changing any component code.

Every component that would *consume* scoring, archetype, or email state reads from the provider. Ship the provider pre-populated with a hardcoded "Vata" archetype for dev. Backend swaps the provider body; the contract stays.

**Interface the backend will implement (written once, in `src/lib/quizDataContract.ts`):**
```ts
type Archetype = "vata" | "pitta" | "kapha";

type QuizData = {
  // consumed by QuizBody — no-op in mock
  recordAnswer(stepIdx: number, answer: string | number): void;

  // consumed by QuizEmailGate — no-op in mock, returns true
  submitEmail(email: string): Promise<boolean>;

  // consumed by result page — returns hardcoded mock in dev
  getResult(): {
    primary: Archetype;
    secondary: Archetype;
    mirrorEchoes: string[];   // 2–3 templated sentences picked from user's answers
  } | null;
};
```

That's the whole contract. Everything below is built against it.

---

## Admin resolutions applied from the audit

All five "dropped" v1 items stay dropped. In addition, these disputed items now resolve to **DROP**:

| Previously disputed | Admin call | Status |
|---|---|---|
| `<textarea>` `border-radius` FAIL | "drop it" | ❌ Removed from spec |
| VISUAL 2+1 C prominence | "drop it" | ❌ Removed from spec |
| CHOICE bottom dead zone (%maybe%) | "happy with the result, DROP IT" | ❌ Removed from spec |
| VISUAL top-row label collision | "dont worry" | ❌ Removed from spec |
| VISUAL entry stagger tightening | "dont agree" | ❌ Removed from spec |

**Audit item 7.2 (CHOICE micro-confirmation) — admin: "NOT SURE ABOUT WHAT THIS MEANS"** → clarified + folded into CHOICE-1 below. Admin reviews the concrete approach there.

---

## Epic 1 — Result & Email Gate Surfaces  🔴

The single largest gap. Build the **surfaces**; backend fills the data later via the provider defined in the scope boundary.

### RESULT-1 🔴 ✅ — Data contract + mock provider

**Why:** Everything below consumes quiz state. Define the interface once, stub it with hardcoded mock data, and hand a typed surface to backend.

**Scope:**
- New: `src/lib/quizDataContract.ts` — types only. The `QuizData` interface from the scope boundary above. (~40 LOC.)
- New: `src/lib/quizDataMock.ts` — a hardcoded implementation returning a canned "Vata" result. (~60 LOC.)
- New: `src/components/quiz/QuizDataProvider.tsx` — React context wrapping any implementation. (~40 LOC.)
- Edit: `app/quiz/layout.tsx` — wrap children in the provider with the mock by default.

**Approach:**
- The mock's `recordAnswer` is a no-op that `console.log`s in dev for debugging.
- The mock's `submitEmail` is a no-op that returns `Promise.resolve(true)` after a 600ms fake delay (for the email-gate reveal animation to feel real in dev).
- The mock's `getResult` returns a fixed canned result for dev (toggleable via a URL query param like `?mock=pitta` for dev to preview all three archetypes).
- `useQuizData()` hook consumed by `QuizBody`, `QuizEmailGate`, and every result sub-component.

**Acceptance:**
- Every quiz component reads state via `useQuizData()`. Zero direct scoring logic anywhere in `src/`.
- Dev can preview all three archetypes by hitting `/quiz/result?mock=vata|pitta|kapha`.
- TypeScript compile passes with strict mode — provider + contract fully typed.
- Backend can drop-in replace `quizDataMock.ts` with no component changes.

### RESULT-2 🔴 ✅ — Email gate screen (surface only)

**Why:** Audit §11.3 — no email capture screen exists. Strategy Phase 5.

**Scope:**
- New: `src/components/quiz/QuizEmailGate.tsx` (~180 LOC).
- Edit: `QuizBody.tsx` — instead of hard-cut to `/quiz/result` after the last question, route to an in-body email gate state.

**Approach:**
- Own step in the `STEPS` sequence (not a modal). Reveals after last SPIRIT question.
- Layout: archetype "teaser" above the fold (headline archetype name + single sentence, **blurred type** effect), cream input field, `Begin your remembering` CTA to submit, privacy line below.
- Teaser blur: CSS `filter: blur(8px)` on the archetype paragraph until email is submitted. On submit, fade blur to 0 over 1.2s, simultaneously navigate to `/quiz/result`.
- Teaser content comes from `useQuizData().getResult()` — returns mock in dev.
- Submit calls `useQuizData().submitEmail(value)` — returns success in mock.
- Copy anchors on admin call (see OPEN-Q-3).
- No skip. Email is required to see the result. (Admin confirms in OPEN-Q-3.)

**Acceptance:**
- Gate screen uses same chrome (Nav, BgAura, QuizCTAButton) as the body.
- Blur animates smoothly — no jank on mobile.
- Email validates (basic regex — format, not deliverability) before enabling submit.
- Submit reveal → navigation works end-to-end against the mock provider.
- Zero direct `fetch` / API calls from the component — all through the provider.

### RESULT-3 🔴 ✅ — Result page architecture

**Why:** Audit §11.4 — current result is a 10-line placeholder.

**Scope:**
- Rewrite: `src/app/quiz/result/page.tsx` (~400 LOC, or broken into sub-components).
- New: `src/components/quiz/result/*` — 5 sub-components matching the 5 sections below.

**Approach — single vertical scroll, editorial rhythm:**

1. **Section A — Identity reveal ("Mirror")**
   Large Plantin headline: archetype name + subtitle. Below: 2–3 specific echoes of the user's answers (e.g., "Because you said your sleep is light and interrupted, and your hands are always borrowing warmth…"). Subtitles come from templated sentences keyed by answer patterns.

2. **Section B — Accessible science ("Why this, in modern terms")**
   2–3 paragraphs translating the Ayurvedic mechanism into a modern analogy. No "Ayurveda" as a word; use the brand's earned phrases (`rhythm`, `constitution`, `5,000-year-old system`).

3. **Section C — Ritual timeline**
   Vertical chronological ritual: `Sunrise (7am) / Midday (2pm) / Evening (9pm)` sections. Each section: moment copy + `one` botanical recommendation (see RESULT-4). Not a product grid.

4. **Section D — Botanical recommendation detail**
   Expanded card per ritual moment. "Why this, for your rhythm" — one-paragraph rationale that echoes the user's answers.

5. **Section E — Academy bridge + retake**
   Secondary CTA: `Continue your remembering` → Academy. Tertiary text link: `Take the mapping again` (for seasonal recalibration; see OPEN-Q-7).

**Layout rules:**
- Same aubergine + cream, same font stack.
- No border-radius anywhere (confirmed not-disputed for surfaces other than `<textarea>`).
- Each section separated by an aura divider (thin stroke, same as `AuraThread` style but static).
- Page title (meta): `{Archetype} — Your Rhythm · ĒTHA`.

**Data source:** result sub-components consume `useQuizData().getResult()` — no direct imports of archetype constants.

**Acceptance:**
- Result renders for each of 3 primary archetypes without layout break on 412px (verified via `?mock=vata|pitta|kapha`).
- All copy is templated from the stub archetype library (RESULT-4). No hard-coded archetype text in JSX.
- No product names / herb names violate brand rules (admin QA pass against `etha-hard-rules` skill).
- Scroll depth reaches bottom without any viewport overflow.

### RESULT-4 🔴 ✅ — Stub archetype content library

**Why:** RESULT-3 needs *something* to render against. This is placeholder copy the backend/content team will replace. Not a production content pipeline.

**Scope:**
- New: `src/lib/archetypesMock.ts` (~200 LOC data-only).
- Data shape per archetype: `{ name, poeticName, heroLine, scienceParagraphs, ritual: { sunrise, midday, evening }, botanicals: [...] }`.

**Approach:**
- Seed with placeholder content written in ETHA voice (use `etha-write` skill to draft if needed).
- Archetype naming is **[DISPUTED — see OPEN-Q-1]**. Ship both `name: "Vata"` and `poeticName: "Kinetic Mind"` so RESULT-3 can switch between them in one edit.
- Consumed by `quizDataMock.ts` (RESULT-1). Backend team replaces either file independently.
- **Mirror echoes** (`getResult().mirrorEchoes`) are hardcoded strings for dev. Backend later generates them from real answers.

**Acceptance:**
- All three archetypes have all fields filled (no nulls).
- Running the full content through `etha-hard-rules` returns zero violations.
- File is pure data (no runtime logic) — backend-swappable.

### RESULT-5 🟠 ✅ — Result page loading state

**Why:** Small quality-of-life — between email submit and full result render, feels like a blank aubergine page flash.

**Scope:**
- Edit: `app/quiz/result/page.tsx`.

**Approach:**
- On mount, if `useQuizData().getResult()` returns non-null, show the existing `Your map is forming. / This will take just a moment.` for 800ms as a deliberate reveal, then fade into Section A.
- If `getResult()` returns null (hit `/quiz/result` directly, no mock), redirect to `/quiz` with a gentle message.

---

## Epic 2 — Brand voice alignment  🔴🟠

Cheap, high-impact. Should land before any A/B test of the flow.

### VOICE-1 🔴 ✅ — Replace off-brand CTAs (4 files)

**Why:** Audit §4.1. Joana meets two brands today.

**Scope:**
- Edit: `src/components/Hero.tsx:174` — `BEGIN SELF-DISCOVERY` → `BEGIN YOUR REMEMBERING`.
- Edit: `src/components/Closure.tsx:65` — same.
- Edit: `src/components/Doshas.tsx:329` — `DISCOVER YOUR DOSHA` → `BEGIN YOUR REMEMBERING`.
- Edit: `src/components/quiz/QuizIntro.tsx:41` — gate `ctaA: "Discover yourself"` → `"Begin your remembering"`.

**Approach:** Direct string replacement. Uppercase form on landing CTAs (matches existing Brandon Grotesque labels), sentence-case where the button is not a label.

**Acceptance:**
- Grep for `SELF-DISCOVERY`, `DISCOVER YOUR DOSHA`, `Discover yourself` returns zero hits in `src/`.

### VOICE-2 🔴 ✅ — Metadata + duration leaks

**Why:** Audit §4.2. Three leaks: `43 questions`, `15 minutes`, `Dosha` in title.

**Scope:**
- Edit: `app/quiz/page.tsx:3-6` — `title: "Discover Your Dosha — ĒTHA"` → `title: "Begin your remembering — ĒTHA"`; `description` stays short, avoids numbers.
- Edit: `app/quiz/body/page.tsx:3-6` — strip `43 questions across three layers`. Replace with a single-line on-brand description.
- Edit: `QuizIntro.tsx:31` — `"In the next 15 minutes, you will receive:"` → `"You are about to receive:"` (or admin-approved alternative — see OPEN-Q-2).

**Acceptance:**
- No numeric string matching `/\b(43|15|minutes|questions)\b/i` in any `app/quiz/**/page.tsx` metadata or intro.

### VOICE-3 🟠 — Em-dash decision  ❓

**Why:** Audit §4.4. Every CHOICE answer uses `—`. Brand rules ban em dashes in body copy; answers are a grey area.

**Scope (if decision = remove):**
- Edit: `QuizBody.tsx` QS[] (~45 answer strings).

**Approach:** Admin picks one path. See OPEN-Q-5.

### VOICE-4 🟡 ✅ — Soften clinical-leaning answers

**Why:** Audit §4.5. ~10 of 45 answers lean medical.

**Scope:** Edit `QuizBody.tsx` QS[] — targeted strings: `elimination`, `inflammation`, `congestion`, `prone to sores`, `reactive`.

**Approach:** Rewrite tonally without changing diagnostic signal. Run through `etha-mr-different` check. Keep medical precision only where it's load-bearing.

**Acceptance:** Softened strings still map unambiguously to Vata/Pitta/Kapha per Ayurvedic canon (admin QA).

### VOICE-5 🟠 — Opening statement decision  ❓

**Why:** Audit §5.1. See OPEN-Q-4 for options.

**Scope:** Edit `QuizIntro.tsx:24`.

---

## Epic 3 — Intro revision  🟠

### INTRO-1 🟠 ✅ — Reduce animation timing (admin direction)

**Why:** Audit §5.2. Admin comment: *"not sure about it maybe reduce animation or idk."* Interpretation: keep the 7 screens, make them feel shorter by faster reveals.

**Scope:** Edit `QuizIntro.tsx` — timing constants and per-screen delays.

**Approach:**
- Reduce `StatementScreen` line-reveal delay from 0.9s to 0.5s between lines.
- Reduce `TwoLineStatement` line-2 delay from 1.8s to 1.0s.
- Reduce hint button reveal delay (currently `isFirst ? 3.6 : isGate ? 2.8 : 2.2`) to `isFirst ? 3.0 : isGate ? 2.0 : 1.4`.
- Reduce `ReflectionScreen` duration from 1.1s to 0.8s.
- Total intro time budget: ~35s down from ~55s (still readable, not rushed).

**Acceptance:**
- Click-through timing feels natural at default reading speed.
- Full intro walk-through in < 45s at an average pace.
- `prefers-reduced-motion` drops all entrance delays to 0.

### INTRO-2 🟠 ✅ — Value screen copy (gated by VOICE-2)

Covered under VOICE-2.

---

## Epic 4 — Q1–Q3 visually-heavy opener  🟠

### OPENER-1 🟠 — Reshuffle first three questions to visual-heavy  ❓

**Why:** Audit §12. Admin comment: *"MAKE THE QUESTIONS VISUALLY HEAVY either think of a new template for questions just first 3 or use visual question template we already have."*

Two implementation paths. Admin picks one (OPEN-Q-6), but both specs are plotted so we can start on whichever lands:

#### Path A — Reuse the existing VISUAL template

**Scope:**
- Edit: `QuizBody.tsx` QS[] reordering.
- New assets: 3 × `webp` images per question (sunrise / midday / evening variants, or morning-state aspirational imagery). 9 images total at 1200px wide, `app/public/images/`.

**Approach:**
- Q1: `How do you want to feel when you wake up?` (3 visual options — calm / energized / grounded; maps a/b/c → Vata/Pitta/Kapha).
- Q2: aspirational mid-day (open / focused / steady).
- Q3: aspirational evening (playful / still / soft).
- All three use the existing `VisualCard` + `BLOB_MASKS` system unchanged.
- Current Q1–Q3 (body-frame / skin / hair) move to Q4+ as standard CHOICE.

#### Path B — New template for first 3 only

**Scope:**
- New: `src/components/quiz/VisualHero.tsx` — a full-bleed single-image choice where the whole screen is the option (swipe between or tap to select).
- Edit: `QuizBody.tsx` — new `qtype: "visual-hero"` branch.

**Approach:**
- Image fills 100vh with 30% aubergine overlay gradient.
- Option label large Plantin, cream, centered at bottom third.
- User taps or swipes horizontally between the 3 options. Selecting = advance.
- Motion cue: subtle parallax on aubergine aura overlay during swipe.
- Only used for Q1–Q3. Disposable pattern.

**Acceptance (either path):**
- First 3 questions feel effortless, aspirational, visual-first.
- Original body-frame / skin / hair questions preserved at Q4+ so diagnostic signal is unchanged.
- Analytics: time-to-first-answer < 15s at median.

---

## Epic 5 — Mid-quiz reassurance + end-of-quiz tempo shift  🟠

### INTERSTITIAL-1 🟠 ✅ — Between-layer reassurance screens

**Why:** Audit §6.2 + §11.1. Strategy Step 5.

**Scope:**
- New: `src/components/quiz/QuizInterstitial.tsx` (~60 LOC).
- Edit: `QuizBody.tsx` — insert an interstitial **before** each `LayerView` (except the first).

**Approach:**
- Screen: cream-on-aubergine serif paragraph in middle third, aura breath at 1.02 scale loop, `CONTINUE` button bottom.
- Copy templated per layer transition:
  - After BODY → before MIND: *"Your body has shown us its rhythm. Now — your mind."*
  - After MIND → before SPIRIT: *"We see you. One more pass, softer this time."*
- Hold 4.0–4.5s or until user taps CONTINUE (whichever first).

**Acceptance:**
- Two interstitials shown per full run (before Mind, before Spirit).
- Skipping `prefers-reduced-motion` auto-advances after 4.5s.

### TEMPO-1 🟠 ✅ — Sensory transition over the last 5 questions

**Why:** Audit §6.3 + §11.2. Strategy Step 6.

**Scope:**
- Edit: `QuizBody.tsx` — detect `stepIdx >= TOTAL - 5` and apply softer easing + one lead-in line.

**Approach:**
- Entrance easing swaps from `AIR` (expo.out) to `WATER` (sine.inOut) for the last 5.
- Before the first of the last 5, a one-screen interstitial: *"We have almost finished mapping your rhythm."* (re-uses `QuizInterstitial`).
- Question entrance duration bumps from 1.0s → 1.4s.

**Acceptance:**
- Observable tempo shift near the end (subjective — admin QA).
- Interstitial appears exactly once per full run, before Q41.

---

## Epic 6 — Question-type polish  🔴🟠🟡

### SCALE-1 🔴 ✅ — CONTINUE affordance before drag

**Why:** Audit §8.1. Admin: *"agree."*

**Scope:** Edit `QuizBody.tsx` `ScaleSlider`.

**Approach:**
- Replace `opacity: 0` / `pointer-events: none` pre-drag state with a visible *disabled* CTA: 30% opacity `CONTINUE` text with an aura border at 14% opacity, `cursor: not-allowed`.
- Add subtle pulse on the slider handle aura (opacity 0.55 ↔ 0.85, 2s loop) to indicate "this is the interactive element."
- `DRAG TO PLACE` label stays but as a secondary cue, positioned below the handle not below the CTA.
- On first drag (pointerdown), the disabled CTA fades out; after drop, the active CTA fades in with aura-path draw (see SCALE-3).

**Acceptance:**
- User can always see CONTINUE exists.
- Disabled state is not clickable (confirmed with cursor + aria-disabled).
- Transition from disabled → active reads as one motion, not two.

### SCALE-2 🟠 ✅ — SCALE3 middle pole label collision

**Why:** Audit §8.2. **BLOCKER.**

**Scope:** Edit `QuizBody.tsx` `ScaleSlider` JSX + styles.

**Approach:**
- Middle pole label moves **below** the track, not between left and right poles.
- Left/right poles stay flanking the track at 44% max-width each (parity with scale2 so layouts converge).
- Middle pole: full-width, center-aligned, italic, `font-size: clamp(0.82rem, 2.1vw, 0.98rem)`, `max-width: 80%` mx-auto.
- Opacity logic unchanged (brightens near 0.5).

**Acceptance:**
- No collision at any copy length up to 120 chars.
- Layout identical between scale2 and scale3 except for the added middle-below block.

### SCALE-3 🟡 ✅ — CONTINUE aura-draw reveal after drop

**Why:** Audit §8.4.

**Scope:** Edit `QuizCTAButton.tsx` + usage in `ScaleSlider`.

**Approach:**
- Add an optional `revealMode: "draw" | "fade"` prop to `QuizCTAButton` (default `"fade"`).
- `"draw"` mode sets `strokeDasharray = getTotalLength()`, offset = full, tweens offset to 0 over 0.6s + `strokeOpacity` 0 → 0.4.
- `ScaleSlider` uses `revealMode="draw"` in the post-drop reveal.

**Acceptance:**
- Pre-drag (disabled) → drag → drop transition reads as: aura wakes, handle moves, CTA aura draws itself.

### SCALE-4 🟡 ✅ — Pole bleed tightening

**Why:** Audit §8.3.

**Scope:** Edit `QuizBody.tsx` pole JSX.

**Approach:** `max-width: 40%` both sides on scale2; `max-width: 26%` for left/right, full width for middle on scale3 (per SCALE-2).

### SCALE-5 🟡 ✅ — SCALE3 bucket visual zones

**Why:** Audit §8.5 — user at 0.32 vs 0.34 falls into different buckets with no visual warning. (Continuous-vs-bucket *scoring* is a backend decision; this item is purely the visual affordance.)

**Scope:** Edit `QuizBody.tsx` `ScaleSlider`.

**Approach:**
- Render three faint aura arcs along the track as bucket zones (~0.10 stroke-opacity). Zone boundaries visible to the user.
- On drop, handle snaps softly to the nearest bucket center over 200ms (eases perceived precision).
- The `recordAnswer` call via the provider still sends the bucket letter `a|b|c` — backend decides whether to also receive the raw 0–1 position for finer scoring.

**Acceptance:**
- User can see the three bucket zones before dropping.
- Snap feels intentional, not twitchy.

### SCALE-6 ⚪ ✅ — Re-drag aura breathing seam

**Why:** Audit §8.6.

**Scope:** Edit `ScaleSlider` `onDown` handler.

**Approach:** On `pointerdown` when `placedIdRef.current !== null`, explicitly kill prior aura draw tween before calling `startBreathing()`. Already mostly done; confirm no orphan tweens with `gsap.killTweensOf`.

### OPEN-1 🔴 ✅ — Question + textarea overflow safeguard

**Why:** Audit §10.2. Note: the audit's other OPEN "BLOCKER" (textarea border-radius) is dropped per admin.

**Scope:** Edit `QuizBody.tsx` `OpenQuestion`.

**Approach:**
- Add `max-height: calc(100dvh - 420px)` on the textarea container.
- `textarea` itself becomes `overflow-y: auto` when content exceeds rows.
- Question `h2` uses `clamp(1.6rem, 5vw, 3.5rem)` (down from `2rem` floor) so very long questions scale down slightly rather than wrap more lines.
- On viewports < 700px tall, collapse the textarea `rows` from 7 → 5.

**Acceptance:**
- On a 360×640 viewport, question + textarea + SKIP all visible without scroll for questions up to 120 chars.
- Scroll appears inside textarea only when user types > 7 visible rows of content.

### OPEN-2 🟠 ✅ — SKIP contrast

**Why:** Audit §10.3.

**Scope:** Edit `QuizBody.tsx` OPEN SKIP button.

**Approach:**
- Change `text-cream/38` → `text-cream/62`.
- Hover / focus `text-cream/62` → `text-cream/85`.
- Confirm min 44×44 visual target (current 48 is fine — keep).
- Aura stroke opacity bumps from 0.22 → 0.38 to match.

**Acceptance:**
- Contrast ratio ≥ 4.5:1 (AA).
- SKIP remains visually secondary to CONTINUE.

### OPEN-3 🟠 ✅ — Bonus textarea reveal + persistence

**Why:** Audit §10.4 + §10.5.

**Scope:** Edit `QuizBody.tsx` `OpenQuestion`.

**Approach:**
- Replace conditional render `{showBonus && …}` with a persistent mount: once `val.trim().length > 0` has ever been true, `bonusRevealed` stays true for the rest of the component's lifetime.
- Wrap bonus block in a `gsap`-driven height + opacity reveal (0 → auto height, 0 → 1 opacity, 600ms, `AIR` ease).
- Collapse back is not a thing — once revealed, stays revealed.

**Acceptance:**
- Typing "n" then backspacing does not un-reveal the bonus textarea.
- Reveal animates height smoothly, no layout snap.

### OPEN-4 🟠 ✅ — CONTINUE soft reveal

**Why:** Audit §10.6.

**Scope:** Edit `QuizBody.tsx` `OpenQuestion` CONTINUE render.

**Approach:** Same treatment as bonus — mount via `gsap` fade + small y-shift (y: 8 → 0, opacity 0 → 1, 300ms). Don't unmount on backspace-to-empty; dim instead.

### CHOICE-1 🟡 ✅ — Selection hold before advance (admin direction)

**Why:** Audit §7.1. Admin: *"agree teh draw speed is good maybe let the screen 200 to 300ms more before changing it."*

**Scope:** Edit `QuizBody.tsx` `handlePick`.

**Approach:**
- Current: `setTimeout(advance, 460)`.
- New: `setTimeout(advance, 760)` — adds ~300ms so the aura draw (0.9s) gets visually closer to completion.
- Also fold in the "one-beat confirmation" concept from audit §7.2 that admin was unsure about: at 300ms post-pick, trigger a brief aura "breath" on the selected option (scale 1.02 for 200ms, back to 1.0). This is the "confirmation" — subtle, sensory, not a tick or checkmark.

**Acceptance:**
- Selected option reads as acknowledged before the screen leaves.
- No perceivable sluggishness — total hand-to-next-screen latency still under 1s.

---

## Epic 7 — Motion & chrome polish  🟡⚪

### CHROME-1 🟡 ✅ — LayerView hold duration

**Why:** Audit §6.1.

**Scope:** Edit `QuizBody.tsx` line 1394 — `setTimeout(advance, isFirstLayer ? 5600 : 2800)` → `setTimeout(advance, isFirstLayer ? 5600 : 4200)`.

**Acceptance:** Body/Mind/Spirit title hold reads as a ritual moment, not a transition.

### CHROME-2 🟡 ✅ — Nav wave shape (admin direction)

**Why:** Audit §6.6. Admin: *"agree make it more intresting."* Promoted from P3 → P2.

**Scope:** Edit `Nav.tsx` `WAVE_D`.

**Approach:**
- Current: 5 waves of horizontal bezier.
- New: subtle ascent — path starts at `y=7`, passes through `y=5` at 30%, `y=3` at 55%, `y=5` at 75%, `y=4` at end. Still organic, but reads as *journey shape* not flat line.
- Progress fill still uses `pathLength="1"` so dash tween math is unchanged.

**Acceptance:**
- Progress reveal feels like an ascent, not a timeline.
- No regression in checkpoint alignment (BODY/MIND/SPIRIT icons still sit correctly on the wave).

### CHROME-3 ⚪ ✅ — BODY/MIND/SPIRIT done-state opacity

**Why:** Audit §13 #29.

**Scope:** Edit `Nav.tsx` `iconOp` / `textOp` logic.

**Approach:** `isDone` opacities bump from `0.45 / 0.38` → `0.60 / 0.52`.

### CHROME-4 ⚪ ✅ — BgAura loop sync

**Why:** Audit §6.4.

**Scope:** Edit `QuizBody.tsx` `BgAura`.

**Approach:**
- Replace two independent `gsap.to` loops with a single `gsap.timeline({ repeat: -1 })` that drives both scale and rotation on a shared clock with intentional phase offset.
- Timeline length: 22s (rotation period). Scale yoyo is built in as `.to(svg, { scale: 1.05 }, 0).to(svg, { scale: 1 }, 3.5)` etc.

### CHROME-5 ⚪ ✅ — Easing vocabulary

**Why:** Audit §6.5.

**Scope:** Edit `QuizBody.tsx` L9–11 + usage.

**Approach:** Map actively:
- `AIR` (expo.out) — entrance animations (current default).
- `FIRE` (power4.in) — exits.
- `WATER` (sine.inOut) — SPIRIT layer entrances + TEMPO-1 tempo shift.
- `EARTH` (power1.out) — LayerView + grounding reveals.
If admin rejects the scheme, delete unused constants.

---

## Out of scope for v1 (frontend)

Items not on this spec — some are for backend, some for later frontend work:

**Backend / dev-team concerns (hand off via the provider contract):**
- Answer scoring, tallying, archetype resolution.
- Session persistence (sessionStorage, cookies, server-side run IDs — backend picks).
- Email capture → CRM / mailing list wiring.
- Real archetype content (we ship stubs; content team + backend swap).
- Tie-break rules, weighting, SCALE3 continuous-vs-bucket scoring model. **All deferred to backend.**
- Answer retrieval for the mirror-echoes feature. Frontend receives pre-built echo strings from `getResult().mirrorEchoes`.
- Analytics event emission (`Quiz Start`, `Layer Advance`, `Gate Submit`, `Result View`, `Academy Click`).

**Future frontend specs (not in this one):**
- Retake flow (text-link trigger exists; actual flow is a later spec).
- Tablet + desktop layouts (see OPEN-Q-9).
- Internationalization of question copy.
- Admin UI for editing archetype content.

---

## Open questions — admin to decide before / during implementation  ❓

Scoring-related decisions (old ARCH-1..4) are **deferred to backend**. Frontend-only opens below:

| ID | Decision | Blocks | Options |
|---|---|---|---|
| **OPEN-Q-1** | Archetype naming in copy | RESULT-3, RESULT-4 | (a) full swap to poetic (Kinetic / Fiery / Grounded); (b) dual-name (`Kinetic Mind — the Vata rhythm`); (c) keep Sanskrit. Default if no decision: (b). |
| **OPEN-Q-2** | Value-screen opener replacement | VOICE-2 | (a) `You are about to receive:`; (b) `Here is what will find you:`; (c) `What arrives:`. Default: (a). |
| **OPEN-Q-3** | Email gate: required or skippable? | RESULT-2 | Strategy default: required. Admin confirm. |
| **OPEN-Q-4** | Opening statement | VOICE-5 | (a) keep `Am I who I am supposed to be?`; (b) flip to `You are not who you should be. You are who you already are.`; (c) new. Default: (a). |
| **OPEN-Q-5** | Em dashes in answers | VOICE-3 | (a) keep; (b) swap for period + line break; (c) only in long multi-clause answers. Default: (a) — defer. |
| **OPEN-Q-6** | Q1–Q3 template | OPENER-1 | Path A (reuse VISUAL) vs Path B (new visual-hero template). Default: Path A unless admin explicitly picks B. |
| **OPEN-Q-7** | Retake UX | RESULT-3 | Text link only, or full retake screen. Default: text link. |
| **OPEN-Q-8** | Viewport scope v1 | (all) | Mobile-only, or mobile + desktop. Default: mobile-only. |
| **OPEN-Q-9** | Result page composition | RESULT-3 | Editorial magazine vs vertical ritual scroll. Default: vertical ritual scroll (better cadence for ETHA). |

---

## Sequencing / sprint view

**Sprint 1 (ships the commerce bridge) — ✅ DONE on branch `quiz-spec-sprint-1`:**
- RESULT-1, RESULT-2, RESULT-3, RESULT-4 (all 🔴) ✅
- VOICE-1, VOICE-2 (🔴) ✅
- SCALE-1, OPEN-1 (🔴) ✅

Shipped the biggest gap + all P0 items. The quiz now has a conversion engine.

**Sprint 2 (content + flow polish) — ✅ substantially shipped on branch `quiz-spec-sprint-1`:**
- OPENER-1 (🟠) — ⛔ blocked on 9 new webp assets (sunrise/midday/evening). Admin must supply images or pick Path B.
- INTERSTITIAL-1, TEMPO-1 (🟠) ✅
- SCALE-2, OPEN-2, OPEN-3, OPEN-4 (🟠) ✅
- INTRO-1 (🟠) ✅
- VOICE-3 (🟠) ❓ — deferred per OPEN-Q-5 default (keep em dashes).
- VOICE-4 (🟡) ✅
- VOICE-5 (🟠) ❓ — deferred per OPEN-Q-4 default (keep opening statement).
- CHOICE-1 (🟡) ✅

Strategy-complete (pending OPENER-1 assets + admin ❓ decisions).

**Sprint 3 (craft pass) — ✅ DONE on branch `quiz-spec-sprint-1`:**
- SCALE-3, SCALE-4, SCALE-5, SCALE-6 (🟡⚪) ✅
- CHROME-1, CHROME-2, CHROME-3, CHROME-4, CHROME-5 (🟡⚪) ✅
- RESULT-5 (🟠) ✅

Ship-ready.

---

_End of spec plan. Each item is PR-sized; implementation order is the sprint view above unless admin re-prioritizes._
