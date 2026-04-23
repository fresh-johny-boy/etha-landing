# Quiz UX Hardening Implementation Plan

Created: 2026-04-23
Status: PENDING
Approved: No
Iterations: 0
Worktree: No
Type: Feature

## Summary

**Goal:** Fix every P0/P1/P2 UX gap surfaced by `UX_findings/joana/critique-report.md` and apply the v4 quiz spec from `ETHA_Dosha_Quiz_v4-final-23.04.docx` so the flow survives Joana's mobile, interrupted, skimming context without changing the visual brand system.

**Architecture:** In-place modifications to `app/src/components/quiz/*` and `app/src/app/quiz/**`. New single client-side state store (`lib/quizState.ts`) persists to `localStorage`. New minimal route `/quiz/sent` for post-submission. No backend changes. No new runtime dependencies.

**Tech Stack:** Next.js 16 (App Router, client components), React 19, TypeScript, Tailwind v4 `@theme inline`, GSAP + ScrollTrigger (already in), Lenis (already in), `localStorage` for persistence.

## Scope

### In Scope

**P0 (launch blockers):**
- Persist quiz state (answers, index, layer, first-name, email) to `localStorage` on every change; hydrate on mount; show resume prompt when state exists.
- Route guards: deep-linking to `/quiz/body` / `/quiz/gate` / `/quiz/result` without prior state redirects to `/quiz`.
- Back button on every quiz screen (intro, body/mind/spirit, completion, dosha reveal, email gate). Undo semantics: step back preserves selection; user can change answer.

**P1 (high-impact abandonment):**
- Rewrite intro 6 screens → 4 screens per v4 spec (`ETHA_Dosha_Quiz_v4-final-23.04.docx`). New copy for S1–S4.
- Remove every `Q[n] of [total]` counter. Replace with Body / Mind / Spirit milestone dots (active dot tinted).
- Auto-advance single-select questions: 180ms delay, no Continue button. 2-node and 3-node scales keep current pattern (select commits). Open-text keeps Skip + Submit.
- Rewrite email gate to "delivery, not wall": add first-name field, new headline "Where should we send your report?", legal consent line below CTA, privacy note below that.

**P2 (IA + hardening):**
- New completion screen between last Spirit question and dosha reveal card ("Your rhythm has been heard." — 3s auto-advance or tap).
- New dosha reveal card screen between completion and email gate: primary Dosha + archetype + blurred/locked full report + CTA "Read my full report".
- New `/quiz/sent` post-submission confirmation screen: "Your map is on its way."
- Result-page tab-switch clarity: when user taps a non-primary Dosha, show "PREVIEW" label so it reads as exploration not re-score.
- Zero-em-dash sweep across all quiz surfaces (v4 forbids em dashes).
- Email input hardening: `maxLength=254`, `trim()` before validation, RFC-lite regex, `type="email"`, `autocomplete="email"`, `inputMode="email"`.

### Out of Scope

- Rewriting the 52 → 45 question content. v4 removes the visible counter, so the mismatch is invisible to the user. Flagged for a follow-up plan.
- Claude API / n8n integration for open-text Mirror paragraphs. Out of scope — API work.
- Klaviyo tag emission on quiz submit. Out of scope — needs marketing integration.
- Scoring algorithm changes (dual-Dosha / tri-Dosha thresholds). Current scoring is acceptable for launch.
- Full dosha result copy rewrite to match v4 exactly. Current result copy is already strong per critique. Small polish only.
- Photography production for Q1/Q2/Q3 (v4 requires full-bleed image tiles). Existing `opener-q1-a/b/c` already exist — verify they're wired, no new assets produced.
- Server-side sessions / cross-device resume. Explicitly deferred per user note: "dev guy will probably change it later."

## Approach

**Chosen:** In-place incremental modification with a single new `lib/quizState.ts` client module.

**Why:** lowest-risk path to ship. The existing components (`QuizBody.tsx` 1834 lines, `QuizIntro.tsx` 393, `QuizEmailGate.tsx` 341) already carry the brand system correctly. Rewriting them in a parallel tree would duplicate thousands of lines of GSAP/Aura/layout code for no benefit. All changes land as targeted diffs inside existing files plus one new state module and three new small screens. Cost: temporary state mixing between v3 data and v4 UX until the follow-up scoring plan; acceptable because the visual surface is unchanged.

**Alternatives considered:**
- **Full v4 rebuild as a parallel `QuizV4/` tree, feature-flag swap:** cleaner migration seam but doubles maintenance while flag is on; rejected — user explicitly said a future dev pass will rewrite persistence, so we don't need long-term cleanliness here.
- **Hybrid config-module + feature flag:** adds ceremony (flag plumbing, two active code paths) for marginal benefit; rejected for same reason.

## Context for Implementer

- **Patterns to follow:**
  - `app/src/components/quiz/QuizBody.tsx:1609` — existing `DEV_JUMPS` gating pattern (`process.env.NODE_ENV === "development"`). Keep for all dev-only affordances.
  - `app/src/components/quiz/QuizIntro.tsx:23` — existing `SCREENS: ScreenDef[]` array. Replace contents in place; keep the type shape.
  - `app/src/components/quiz/QuizBody.tsx:125` (`LAYER_DEF`) + `:133` (`Question[]`) + `:466` (SVG layer shapes) + `:556` (`LAYER_START`) + `:561` (`LAYER_POS`) — central data maps. Touch as little as possible.
  - `app/src/components/quiz/QuizEmailGate.tsx:35–138` — existing `useState` + GSAP focus-aura pattern. Extend for first-name field; do not refactor the aura animation.
- **Conventions:**
  - All quiz components are `"use client"`. Add new ones the same way.
  - Brand tokens in `app/src/app/globals.css`. Never hard-code colors. Do not introduce border-radius > 0. No gradient text. No em dashes anywhere.
  - Brandon Grotesque UPPERCASE + `.font-label` only for labels. Plantin for all headlines and body.
  - `process.env.NEXT_PUBLIC_BASE_PATH` prefix on every image `src` (GitHub Pages deploy).
- **Key files:**
  - `app/src/components/quiz/QuizIntro.tsx` — pre-story screens (intro).
  - `app/src/components/quiz/QuizBody.tsx` — the 3-layer question engine.
  - `app/src/components/quiz/QuizEmailGate.tsx` — current email-only modal. Becomes the v4 delivery gate.
  - `app/src/components/quiz/QuizInterstitial.tsx` — existing between-acts interstitials. Reuse pattern for completion screen.
  - `app/src/app/quiz/layout.tsx` — nav + shared quiz chrome.
  - `app/src/app/quiz/result/page.tsx` — result rendering. Minimal edit.
  - `ETHA_Dosha_Quiz_v4-final-23.04.docx` — source of truth for all new copy.
- **Gotchas:**
  - `useEffect` on mount order matters: hydrate from `localStorage` **before** first render settles, otherwise Next 16 RSC → client hydration can flash Q1 then jump to saved index. Use a `useSyncExternalStore`-style read or a `useState` initializer reading `localStorage` inline.
  - Next 16 breaking changes: `params` / `searchParams` are Promises; `cookies()` / `headers()` are async. We stay client-only to avoid this.
  - `QuizBody.tsx` already holds a layer position map (`LAYER_POS`) for aura-curve animation — when removing the numeric counter, do not remove the aura's own progress binding.
  - The current flow uses `router.push("/quiz/gate")` from `QuizBody` when last question answered. Preserve this; we insert completion + reveal screens before gate, so route order becomes `body → completion → reveal → gate → sent`.
- **Domain context:**
  - v4 framing: email gate is "delivery not wall." User already sees their Dosha name before being asked to hand over email.
  - "Zeigarnik effect" is called out in v4 — the "Almost ready" completion copy is deliberate; do not soften it.
  - Progress dots replace the counter because v4 says visible numeric progress makes the quiz feel long; dots communicate "3 chapters" without enumerating 45 questions.

## Runtime Environment

- **Start command:** `cd app && npm run dev`
- **Port:** 3000
- **Deploy path:** GitHub Pages at `/etha-landing/` via `.github/workflows/deploy.yml`
- **Health check:** `http://localhost:3000/quiz` renders the intro first screen; no console errors.
- **Restart procedure:** kill the dev server (`Ctrl-C`), `npm run dev` again. Turbopack HMR handles component edits without restart.

## Feature Inventory

n/a — this plan modifies existing code in place; no whole-file removals. All current components remain, their internals change.

## Assumptions

- `localStorage` is available in Joana's target browsers (iOS Safari 15+, Android Chrome, desktop evergreen) — supported by caniuse. Tasks 1, 6 depend on this.
- Existing `/images/opener-q1-a.webp` (and b/c, q2-*, q3-*) are the "full-bleed image tiles" v4 requires for Q1–Q3 — supported by `git status` showing `M app/public/images/opener-q1-a.webp` etc. already committed. Tasks 4 depend on this.
- The v4 copy in `ETHA_Dosha_Quiz_v4-final-23.04.docx` is final and user-approved — supported by the user's direct answer to the AskUserQuestion batch. Tasks 3, 6, 7 depend on this.
- Current 52-question data structure stays in place for this sprint; question copy fidelity to v4 is a follow-up plan — supported by user note "our dev guy will probably change it" and the v4 spec's removal of visible counters. Task 4 depends on this (counter removal).
- `process.env.NODE_ENV === "development"` correctly gates dev-jump buttons in production build — supported by `QuizBody.tsx:1805` and `QuizIntro.tsx:331` existing gating. No task required.

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hydration flicker from `localStorage` read after first paint | High | Medium | Use `useState(() => readFromLS())` initializer pattern + guard with `typeof window !== "undefined"` check; wrap the quiz route in a `"use client"` boundary that delays mounting the question until hydration completes. |
| Back-button on first screen with nothing to go back to | Medium | Low | Back button renders only when `history.length > 1` AND there is a previous in-quiz step. First intro screen hides it. |
| User explicitly wants to restart the quiz but gets auto-resumed | Medium | Medium | Resume prompt has two CTAs: "Continue where I left off" and "Start over." Second clears `localStorage`. |
| Auto-advance skips user misclick with no recovery | Medium | High | Back button + history covers this. Also: 180ms delay gives visual feedback before navigation. |
| Removing `"1/52"` counter also breaks the aura's progress binding in `QuizBody.tsx:561` | Medium | Medium | Keep `LAYER_POS` + internal index untouched; only the visible counter text element is removed. Confirm via computed style that aura still animates. |
| Legal consent line links to pages that don't exist | High | Low | Link to `/legal/terms` and `/legal/privacy` placeholders that render a "Coming soon" message. Out-of-scope to write full legal copy in this plan. |
| v4's "no em dashes" rule is already violated somewhere existing | Medium | Low | Add a grep-based sweep to `spec-verify`. Replace every `—` with either a period, comma, or "and" per context. |

## Goal Verification

### Truths

1. On a 390×844 mobile emulation, Joana can refresh the browser mid-quiz (after answering at least 3 questions) and returns to the same question with prior answers preserved. TS-001.
2. On any quiz screen past intro 1/4, a "Back" affordance is present, visible, tappable at ≥44pt, and returns to the previous screen preserving any selection. TS-002.
3. The intro is exactly 4 screens, matching the copy in `ETHA_Dosha_Quiz_v4-final-23.04.docx` verbatim. No screen contains `Q[n] of [total]`. TS-003.
4. No body/mind/spirit question screen displays a numeric counter such as "1/52" or "18/52." Progress is communicated by three dots (Body/Mind/Spirit) in the nav with the active chapter tinted. TS-004.
5. A single-select answer tap auto-advances within 180–300ms without a Continue button press. TS-005.
6. After the last Spirit question, the user sees (a) a completion screen "Your rhythm has been heard," (b) a Dosha reveal card with archetype + blurred report, (c) an email gate with **first name and email** fields and a legal-consent line below the CTA, (d) a post-submission screen "Your map is on its way." TS-006.
7. A clean-tab deep-link to `/quiz/body` with empty `localStorage` redirects to `/quiz` intro 1/4. TS-007.
8. No em-dash character (`—`, U+2014) exists in any quiz component source file or rendered quiz page. TS-008.

### Artifacts

- `app/src/lib/quizState.ts` (new) — persistence + resume state
- `app/src/components/quiz/QuizBackButton.tsx` (new) — shared back affordance
- `app/src/components/quiz/QuizIntro.tsx` (modified) — 4-screen v4 copy
- `app/src/components/quiz/QuizBody.tsx` (modified) — counter removed, dots added, auto-advance
- `app/src/components/quiz/QuizCompletion.tsx` (new) — "Your rhythm has been heard"
- `app/src/components/quiz/QuizDoshaReveal.tsx` (new) — locked/blurred reveal card
- `app/src/components/quiz/QuizEmailGate.tsx` (modified) — first-name + v4 copy + consent
- `app/src/app/quiz/sent/page.tsx` (new) — post-submission confirmation
- `app/src/app/quiz/result/page.tsx` (modified) — preview-tab label, em-dash sweep

## E2E Test Scenarios

### TS-001: State persists across refresh
**Priority:** Critical
**Preconditions:** clean `localStorage`, viewport 390×844
**Mapped Tasks:** Task 1

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/quiz`, tap through intro screens 1–4 | Lands on Body Q1 |
| 2 | Answer Body Q1, Q2, Q3 | Advances to Q4 |
| 3 | Hard-refresh (Cmd-R) | Resume prompt appears: "Continue where I left off" / "Start over" |
| 4 | Tap "Continue" | Lands back on Body Q4; Q1–Q3 selections are preserved (verifiable by tapping Back) |
| 5 | Tap "Start over" from a fresh refresh | Returns to `/quiz` intro 1/4; `localStorage` cleared |

### TS-002: Back button works on every screen
**Priority:** Critical
**Preconditions:** fresh quiz start
**Mapped Tasks:** Task 2

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | From intro 2/4, tap Back | Returns to intro 1/4; no Back button visible on 1/4 |
| 2 | From Body Q5, tap Back | Returns to Body Q4; previous selection still highlighted |
| 3 | From Mind Q1, tap Back | Returns to the last Body question |
| 4 | From email gate, tap Back | Returns to Dosha reveal card |

### TS-003: Intro is 4 screens, v4 copy
**Priority:** Critical
**Preconditions:** clean session
**Mapped Tasks:** Task 3

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load `/quiz` | Screen 1: "Am I who I am supposed to be?" |
| 2 | Tap advance | Screen 2: ancient framing + reframe combined paragraph |
| 3 | Tap advance | Screen 3: value promise as prose (not list) |
| 4 | Tap advance | Screen 4: "Are you ready to return to yourself?" + Yes/Not right now CTAs + privacy + soft-exit copy |
| 5 | Tap Yes | Lands on Body Q1 |
| 6 | Tap Not right now | Soft exit copy appears; no quiz start |

### TS-004: No numeric counter; dots only
**Priority:** High
**Preconditions:** mid-flow
**Mapped Tasks:** Task 4

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Visit any Body / Mind / Spirit question screen | No text matching `\d+\s*/\s*\d+` appears on screen |
| 2 | Inspect nav | Three dots labeled / styled as Body, Mind, Spirit. Active chapter dot is filled aubergine; future dots are outlined |
| 3 | Progress from Body to Mind | Body dot becomes filled-complete; Mind dot becomes active |

### TS-005: Auto-advance on single-select
**Priority:** High
**Preconditions:** on a single-select question (A/B/C)
**Mapped Tasks:** Task 4

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap answer A | Within 300ms, screen transitions to next question without a Continue tap |
| 2 | On a 2-node scale question, drag/tap pole | Commits and auto-advances |
| 3 | On an open-text question, type + tap Submit | Advances; Skip button also advances without text |

### TS-006: Completion → reveal → gate → sent flow
**Priority:** Critical
**Preconditions:** completed Q45 (or last Spirit question)
**Mapped Tasks:** Task 5, Task 6

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Answer last Spirit question | Transitions to completion screen "Your rhythm has been heard." |
| 2 | Wait 3 seconds or tap | Transitions to Dosha reveal card: archetype + reframe quote + blurred full report + CTA "Read my full report" |
| 3 | Tap CTA | Email gate: "Where should we send your report?" with First name field + Email field + CTA "Send my full report" + legal consent link-copy + privacy note |
| 4 | Type first name + email, tap CTA | Transitions to `/quiz/sent` "Your map is on its way." Minimal layout, no CTA |
| 5 | Tap legal / privacy links | Open respective legal pages (placeholder "Coming soon" acceptable for this plan) |

### TS-007: Deep-link guard
**Priority:** High
**Preconditions:** clean `localStorage`
**Mapped Tasks:** Task 1

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open clean tab, navigate to `http://localhost:3000/quiz/body` | Redirects to `/quiz` intro 1/4 |
| 2 | Navigate to `http://localhost:3000/quiz/gate` on clean state | Redirects to `/quiz` intro 1/4 |
| 3 | Navigate to `http://localhost:3000/quiz/sent` on clean state | Redirects to `/quiz` intro 1/4 |

### TS-008: Zero em-dashes
**Priority:** Medium
**Preconditions:** none
**Mapped Tasks:** Task 7

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | `grep -R "—" app/src/components/quiz app/src/app/quiz` | Zero matches |
| 2 | Walk every quiz screen in browser, view-source | Zero U+2014 characters in rendered HTML |

## Progress Tracking

- [ ] Task 1: State persistence + route guards + resume prompt
- [ ] Task 2: Shared Back-button + history stack on every quiz screen
- [ ] Task 3: Rewrite intro to v4 (4 screens, new copy)
- [ ] Task 4: Remove numeric counter, add Body/Mind/Spirit dots, auto-advance single-select
- [ ] Task 5: Completion screen + Dosha reveal card
- [ ] Task 6: Email gate v4 (first-name, delivery framing, consent) + /quiz/sent post-submission screen
- [ ] Task 7: Result-page preview-tab label + em-dash sweep + email-input hardening
      **Total Tasks:** 7 | **Completed:** 0 | **Remaining:** 7

## Implementation Tasks

### Task 1: State persistence + route guards + resume prompt

**Objective:** Persist quiz state to `localStorage` on every change; hydrate on mount; show resume prompt if state exists; redirect deep-links into mid-quiz routes to `/quiz` when no state.
**Dependencies:** None
**Mapped Scenarios:** TS-001, TS-007

**Files:**
- Create: `app/src/lib/quizState.ts`
- Modify: `app/src/app/quiz/layout.tsx`
- Modify: `app/src/components/quiz/QuizIntro.tsx`
- Modify: `app/src/components/quiz/QuizBody.tsx`
- Modify: `app/src/components/quiz/QuizEmailGate.tsx`
- Create: `app/src/app/quiz/sent/page.tsx` (guard only; UI lives in Task 6)
- Test: manual via TS-001 / TS-007

**Key Decisions / Notes:**
- Shape: `{ v: 1, introScreen: number, layer: 1|2|3, stepIndex: number, answers: Record<string, unknown>, firstName?: string, email?: string, completedAt?: number }`
- Key: `etha.quiz.state.v1` — versioned so a future dev pass can invalidate without breaking clients.
- Initializer pattern: `useState(() => typeof window !== "undefined" ? JSON.parse(localStorage.getItem(KEY) ?? "null") : null)` to avoid hydration flicker.
- Resume prompt is a brand-consistent modal (same 0px radius, cream-on-aubergine, Plantin headline, Brandon UPPERCASE CTAs). Rendered in `quiz/layout.tsx` client-side wrapper on mount if state exists.
- Route guards: in each route page (`/quiz/body`, `/quiz/gate`, `/quiz/sent`), first `useEffect` checks `localStorage`; if empty, `router.replace("/quiz")`.
- Write path: every `setAnswer`, `setScreen`, `setLayer` call pushes through a helper `updateQuizState(patch)` that calls `localStorage.setItem`.
- Debounce writes at 50ms if profiler shows jank. Default: write synchronously.
- Hot path: `updateQuizState` runs on every answer tap. Keep it a single `JSON.stringify` + `setItem`. No deep clone.

**Definition of Done:**
- [ ] `etha.quiz.state.v1` key appears in `localStorage` within 500ms of answering Q1
- [ ] Refresh at any mid-quiz point returns to the exact same question with prior answers preserved (TS-001)
- [ ] Deep-link to `/quiz/body` / `/quiz/gate` / `/quiz/sent` on clean state redirects to `/quiz` (TS-007)
- [ ] Resume prompt appears on fresh tab load when state exists; "Start over" clears the key
- [ ] No console errors during hydration
- [ ] `npm run build` passes

**Verify:**
- TS-001, TS-007 browser walk via chrome-devtools-mcp
- `npm run lint && npm run build` in `app/`

### Task 2: Shared Back-button + in-quiz history stack

**Objective:** Render a back affordance on every quiz screen except intro 1/4. Stepping back preserves any prior selection so the user can change their answer.
**Dependencies:** Task 1
**Mapped Scenarios:** TS-002

**Files:**
- Create: `app/src/components/quiz/QuizBackButton.tsx`
- Modify: `app/src/components/quiz/QuizIntro.tsx` (wire back in header)
- Modify: `app/src/components/quiz/QuizBody.tsx` (wire back in header)
- Modify: `app/src/components/quiz/QuizEmailGate.tsx` (wire back in modal)
- Modify: `app/src/lib/quizState.ts` (add `history: string[]` stack)

**Key Decisions / Notes:**
- `QuizBackButton` is a small 44×44pt tap target, top-left of the nav, Brandon Grotesque label "BACK" + aubergine arrow.
- History stack lives inside `quizState` so refresh-then-back works. Push on forward; pop on back.
- Back from a question that was auto-advanced re-highlights the prior answer (read from `answers[qid]`).
- Disable (don't hide) Back on intro 1/4 so layout doesn't shift.
- First screen has Back disabled with low-opacity styling.
- Back from email gate returns to Dosha reveal card. Back from Dosha reveal returns to completion screen. Back from completion returns to last Spirit question.

**Definition of Done:**
- [ ] Back button present on every screen from intro 2/4 through email gate
- [ ] Tapping Back returns one step and preserves selection (TS-002)
- [ ] Back is visually disabled on intro 1/4
- [ ] Tap target meets 44×44pt
- [ ] Keyboard: Esc key also triggers Back (progressive enhancement)

**Verify:**
- TS-002 browser walk
- Manual keyboard test: Tab to Back, Enter triggers

### Task 3: Rewrite intro to v4 (4 screens, new copy)

**Objective:** Replace the existing 6-screen intro (`QuizIntro.tsx`) with the 4-screen v4 pre-story from `ETHA_Dosha_Quiz_v4-final-23.04.docx`.
**Dependencies:** Task 1, Task 2
**Mapped Scenarios:** TS-003

**Files:**
- Modify: `app/src/components/quiz/QuizIntro.tsx`

**Key Decisions / Notes:**
- Replace `SCREENS: ScreenDef[]` at line 23 with exactly 4 entries:
  1. Opening question: `"Am I who I am supposed to be?"` — kind: STATEMENT
  2. Ancient framing + reframe: `"There is a system older than modern medicine that mapped the human body not by disease, but by nature. Not who you should become. Who you already are."` — kind: REFLECT
  3. Value promise: `"In the next 15 minutes, you will receive your personal rhythm map, a morning-to-night ritual designed for your constitution, and botanical recommendations matched to where you are right now. 43 questions. One map that belongs only to you."` — kind: VALUE (prose, NOT bulleted list)
  4. Choice gate: `"Are you ready to return to yourself?"` with TWO CTAs: "Yes, begin." and "Not right now." Privacy copy: `"Your answers are private. Be honest. That is the only way this works."` Soft-exit copy on Not-right-now tap: `"This will be here. Come back when the moment is right."`
- Remove the prior 6-screen arrangement entirely. No migration shim.
- Update `DEV_JUMPS` at line 215 — it derives from `SCREENS` so no change needed if the shape stays.
- Remove counter text "intro X/6" at line 361 — it violates the v4 "no sequential counter" rule. Replaced by the dots system from Task 4.
- Keep all GSAP transitions + the Nav `progress={screen / (SCREENS.length - 1)}` prop binding.
- Verify no em dashes in the new copy strings (v4 rule).

**Definition of Done:**
- [ ] Intro renders exactly 4 screens (TS-003)
- [ ] Copy matches docx verbatim
- [ ] Screen 4 has two CTAs: Yes, begin / Not right now
- [ ] "Not right now" shows soft-exit copy and does not advance
- [ ] No `"intro X/6"` text visible anywhere
- [ ] No em dashes in file

**Verify:**
- TS-003 browser walk
- `grep -n "—" app/src/components/quiz/QuizIntro.tsx` → zero hits
- `grep -n "intro.*\/" app/src/components/quiz/QuizIntro.tsx` → zero hits

### Task 4: Remove numeric counter, add milestone dots, auto-advance single-select

**Objective:** Remove every `N/52`-style counter from `QuizBody.tsx`. Add a top-nav row of three milestone dots (Body / Mind / Spirit). Single-select answers auto-advance 180ms after tap without a Continue button.
**Dependencies:** Task 1, Task 3
**Mapped Scenarios:** TS-004, TS-005

**Files:**
- Modify: `app/src/components/quiz/QuizBody.tsx`
- Modify: `app/src/app/quiz/layout.tsx` (if nav dots live there)

**Key Decisions / Notes:**
- Hot path: every answer tap flows through a single handler; add `setTimeout(advance, 180)` only when `question.kind === "single-select"`. Existing 2-node / 3-node / open-text paths keep current commit pattern.
- Dots structure: three `<span>` elements, each 12×12pt tap area (visual) / 44pt touch area. States: upcoming (outlined aubergine), active (filled aubergine), complete (filled darker or tinted accent). Labels Brandon Grotesque UPPERCASE "BODY / MIND / SPIRIT" under each dot.
- Remove line `1/52 · L1` text element entirely (lives around `QuizBody.tsx:1830` area based on snapshot).
- Do NOT remove the internal index / `LAYER_POS` — aura animation binds to it.
- Add a `prefers-reduced-motion` check on the 180ms auto-advance timer — if reduced motion, advance immediately (10ms) to avoid feeling unresponsive.
- Don't animate the dot fill with GSAP ease-out-elastic — use `ease-out-quart` (v4-consistent, no bounce).

**Definition of Done:**
- [ ] `grep -n "\d\+\s*\/\s*\d\+" app/src/components/quiz/QuizBody.tsx` shows zero visible-counter strings in JSX
- [ ] Three dots render in nav on every question screen (TS-004)
- [ ] Active dot tint changes on layer transition
- [ ] Single-select tap auto-advances within 200–300ms (TS-005)
- [ ] 2-node scale, 3-node scale, and open-text paths unchanged
- [ ] Reduced-motion respected

**Verify:**
- TS-004 and TS-005 browser walk
- `npm run lint`
- Visual: ensure aura path-drawing still binds to internal index (no regression)

### Task 5: Completion screen + Dosha reveal card

**Objective:** Insert two new screens between the last Spirit question and the email gate: a completion interstitial ("Your rhythm has been heard.") and a Dosha reveal card (archetype + blurred full report + single CTA).
**Dependencies:** Task 1, Task 2, Task 4
**Mapped Scenarios:** TS-006

**Files:**
- Create: `app/src/components/quiz/QuizCompletion.tsx`
- Create: `app/src/components/quiz/QuizDoshaReveal.tsx`
- Modify: `app/src/components/quiz/QuizBody.tsx` (replace direct `router.push("/quiz/gate")` at end-of-Spirit with route through completion → reveal)
- Modify: `app/src/app/quiz/layout.tsx` (if routes are page-level, add new intermediary route files)

**Key Decisions / Notes:**
- Route arrangement options:
  - **Option A:** add two new route segments `/quiz/completion` and `/quiz/reveal`. Cleaner URL semantics; easier back-button handling.
  - **Option B:** keep both as internal states inside `QuizBody.tsx`. Fewer files; avoids router gymnastics.
  - **Chosen:** Option A. Easier for Task 2's back-button and for Task 1's route guards. Cost: 2 more page.tsx files of ~10 lines each.
- `QuizCompletion`: 3-second auto-advance via `setTimeout`; any tap also advances. Copy from docx verbatim:
  > Your rhythm has been heard.
  > Forty-three answers. Three layers.
  > Something rare has been assembled here,
  > a map that belongs only to you.
  > It is almost ready.
- `QuizDoshaReveal`: reads primary Dosha from `quizState`, renders:
  - Archetype label ("The Kinetic Mind" / "The Fiery Drive" / "The Grounded Core")
  - Reframe quote (verbatim from docx per Dosha)
  - Composition percentages (already computed from answers — reuse existing result-page scoring helper)
  - Blurred region showing the locked full report (CSS `filter: blur(8px)` + `pointer-events: none`)
  - Full-width CTA "Read my full report" → `router.push("/quiz/gate")`
  - Dosha-specific Aura SVG in the background (use existing Vata/Pitta/Kapha aura shapes)
- Re-use the existing `QuizInterstitial` component or pattern for the visual scaffolding.
- Zero em dashes (v4).

**Definition of Done:**
- [ ] Answering the last Spirit question transitions to `/quiz/completion` (TS-006)
- [ ] Completion screen auto-advances after 3s or on tap
- [ ] `/quiz/reveal` shows correct Dosha archetype + blurred report + CTA
- [ ] CTA advances to `/quiz/gate`
- [ ] Back from reveal returns to completion; back from completion returns to last Spirit question
- [ ] Aura matches the Dosha (Energised for Vata, Balanced for Pitta, Relaxed for Kapha)

**Verify:**
- TS-006 browser walk
- Spot-check all three Dosha outcomes by manipulating stored answers in devtools

### Task 6: Email gate v4 + post-submission screen

**Objective:** Rewrite the email gate copy to v4 "delivery not wall" framing, add a first-name field, a legal consent line beneath the CTA, and a privacy note beneath that. Create the `/quiz/sent` confirmation screen.
**Dependencies:** Task 1, Task 2, Task 5
**Mapped Scenarios:** TS-006

**Files:**
- Modify: `app/src/components/quiz/QuizEmailGate.tsx`
- Create: `app/src/app/quiz/sent/page.tsx` (already stubbed in Task 1 for guard; fill in UI now)
- Create: `app/src/app/quiz/sent/QuizSent.tsx` (client component)

**Key Decisions / Notes:**
- Replace the current `YOUR MAP IS READY` headline with the v4 sequence:
  - Context line (small, Brandon UPPERCASE, aubergine-faint): "Your Dosha has been identified. Your full report is one step away."
  - Headline (Plantin serif): "Where should we send your report?"
  - Body: "Your complete rhythm map, your daily ritual, and your botanical recommendations, written for you alone. Enter your name and email to read it in full."
  - Field 1 label: "First name" — `type="text"`, `autocomplete="given-name"`, `maxLength={80}`, `required`, `.trim()` before submit
  - Field 2 label: "Your email address" — `type="email"`, `autocomplete="email"`, `inputMode="email"`, `maxLength={254}`, `.trim()` before submit, RFC-lite regex
  - CTA: "Send my full report"
  - Below CTA (smallest Brandon UPPERCASE, visually separated): "By continuing you agree to our Terms and Conditions and Privacy Policy." Terms + Privacy are links to `/legal/terms` + `/legal/privacy` (placeholder pages acceptable — create `page.tsx` with single heading "Coming soon.")
  - Bottom: "Private. Never shared. Unsubscribe at any moment."
- Persist `firstName` + `email` into `quizState` on submit.
- On submit: call existing submission logic (currently navigates to `/quiz/result`); change navigation target to `/quiz/sent`, not `/quiz/result`.
- `QuizSent`: minimal layout per v4. No CTA, no upsell. Copy:
  > Your map is on its way.
  > Check your inbox. Something made for you alone is arriving.
  > Take a breath. You just did something most people never do.
  > You listened.
- After 8s or tap on the page, advance to `/quiz/result` so the user does eventually see their full report (keeps current result page wired).
- Zero em dashes.

**Definition of Done:**
- [ ] Email gate has First name field before email field (TS-006)
- [ ] Headline + body + context line + CTA match docx verbatim
- [ ] Legal consent line with two linked phrases renders below CTA
- [ ] Submitting valid data navigates to `/quiz/sent` (not directly to result)
- [ ] `/quiz/sent` renders the v4 confirmation copy
- [ ] Trimmed values stored in `quizState.firstName` and `quizState.email`
- [ ] Max-length, autocomplete, inputMode, type attributes set correctly on inputs

**Verify:**
- TS-006 browser walk
- Paste `"  joana@test.com  "` → submission accepts (post-trim)
- Paste an emoji-only field → disabled CTA / regex rejects
- Check DevTools > Application > Local Storage for persisted first name + email

### Task 7: Result-page preview-tab label + em-dash sweep + consent-page stubs

**Objective:** Close out the P2 polish: clarify the result-page dosha tab as a preview (not a re-score), remove every em dash from quiz surfaces, and stub the `/legal/terms` + `/legal/privacy` pages.
**Dependencies:** Task 1–6
**Mapped Scenarios:** TS-008

**Files:**
- Modify: `app/src/app/quiz/result/page.tsx`
- Create: `app/src/app/legal/terms/page.tsx` (placeholder)
- Create: `app/src/app/legal/privacy/page.tsx` (placeholder)
- Global: grep-sweep `app/src/components/quiz/` + `app/src/app/quiz/` for `—`

**Key Decisions / Notes:**
- In result page, when user taps a non-primary Dosha tab, add a small Brandon UPPERCASE label "PREVIEW" next to the archetype heading so it is unambiguous it is a preview of an alternate Dosha, not a re-score.
- Em-dash replacement rules: inside a sentence → replace with a comma + space if it's a parenthetical, or with a period + space if it separates two independent clauses. Never replace with a single dash or hyphen.
- Legal placeholder page: Plantin serif heading "Coming soon.", aubergine on cream, brand nav, nothing else. ~15 lines each.
- Final verification: `grep -R "—" app/src/components/quiz app/src/app/quiz` returns zero.

**Definition of Done:**
- [ ] Zero em dashes in any quiz component source or rendered quiz page (TS-008)
- [ ] Non-primary Dosha tab on result page shows "PREVIEW" label
- [ ] `/legal/terms` and `/legal/privacy` render "Coming soon." without 404
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

**Verify:**
- TS-008 grep + browser walk
- `npm run build && npm run lint` in `app/`

## Open Questions

- Dosha composition percentages: current result page already computes them. Reuse the same helper for `QuizDoshaReveal`. Implementer to locate the scoring function in `app/src/app/quiz/result/page.tsx` and either import or extract to `app/src/lib/doshaScoring.ts` if it isn't already shared. If extraction is needed, fold into Task 5.
- The v4 spec mentions Klaviyo tags on many questions. This plan deliberately does not emit them (out of scope). If the marketing pipeline goes live before this plan ships, the dev-guy pass mentioned by the user can layer tag emission on top of the `updateQuizState` helper without changing its shape.

### Deferred Ideas

- "Quick map" / 10-question fast path for repeat users (P2 from critique). Valuable, but adds scoring work and a second data model. Defer to a follow-up plan once the v4 UX ships.
- Server-side cross-device session resume. Explicitly deferred per user note.
- Question data migration to the v4 45-question set with Klaviyo tags and dual/tri-Dosha scoring thresholds. Deferred to the dev-guy pass.

## Autonomous Decisions

(Made without questions because the user's earlier answers covered the scope and direction.)

- **Question rewrites deferred.** The v4 spec describes 45 questions with specific copy. Current code has 52. The visible counter is removed in Task 4, so the mismatch is invisible to the user. Rewriting 45 question strings is a separate concern from UX hardening and belongs in the dev-guy migration plan.
- **Two new routes (`/quiz/completion` and `/quiz/reveal`) instead of internal state.** Chosen over in-component state because Task 2 (Back button) and Task 1 (route guards) are both simpler at the route level than inside a large switch-case component.
- **Placeholder legal pages (not full legal copy).** The plan writes "Coming soon." stubs so the gate's consent line has working links. Drafting actual T&C / Privacy Policy copy is a legal task, not a UX task.
- **State schema versioned as `v1`.** So the follow-up dev-guy pass can invalidate without breaking client sessions.
