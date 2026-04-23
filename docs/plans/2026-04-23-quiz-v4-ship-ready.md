# ETHA Dosha Quiz — v4 Ship-Ready Implementation Plan

Created: 2026-04-23
Status: PENDING
Approved: No
Iterations: 0
Worktree: No
Type: Feature (supersedes `2026-04-23-quiz-ux-hardening.md`)

## Summary

**Goal:** Ship the ETHA Dosha Quiz to production-ready state, aligned verbatim with `ETHA_Dosha_Quiz_v4-final-23.04.docx` and clearing every P0/P1 from `UX_findings/2026-04-23-quiz-full/critique-report.md`.

**Architecture:** In-place modification of `app/src/components/quiz/*` and `app/src/app/quiz/**`. One new client-side state store (`lib/quizState.ts`). One new scoring module (`lib/doshaScoring.ts`). Four new screens as route segments. No backend, no new runtime dependencies. `localStorage` is the only persistence surface.

**Tech stack:** Next.js 16 App Router (client components), React 19, TypeScript, Tailwind v4 `@theme inline`, GSAP + Lenis (already present), `localStorage`.

**Supersedes:** `docs/plans/2026-04-23-quiz-ux-hardening.md`. That plan's 7 tasks are retained, expanded, and 4 new tasks are added. On approval of this plan, archive the prior file.

---

## Scope

### In Scope

**P0 launch blockers:**
- Persist answers + layer + stepIndex + firstName + email to `localStorage`; hydrate on mount; redirect deep-links to `/quiz` when state is empty; show resume prompt when state exists.
- Fix `QuizEmailGate.tsx:56` — Escape key must call `onCancel`, not `onSuccess("")`. Closes silent-send funnel leak.
- Route guards on `/quiz/body`, `/quiz/completion`, `/quiz/reveal`, `/quiz/gate`, `/quiz/sent`, `/quiz/result`.

**P1 high-impact abandonment:**
- Rewrite intro 6 screens → 4 screens per v4 docx. Verbatim copy for S1–S4.
- Migrate question set 52 → 45 per v4 docx (Body 15 + Mind 13 + Spirit 17). Verbatim copy, correct question kinds per docx note.
- Remove every `Q[n] of [total]` counter. Three milestone dots (Body / Mind / Spirit) replace it.
- Auto-advance single-select 180ms, no Continue button. Auto-advance is intentional per admin — do not add a confirm step.
- Rewrite email gate to delivery framing: headline "Where should we send your report?", first-name field, email field, legal consent line below CTA, privacy note below that.
- Back button on every screen from intro 2/4 through email gate, pulling from an in-state history stack so refresh-then-back works.

**P1 content + scoring:**
- Completion screen between last Spirit question and Dosha reveal (3s auto-advance). Verbatim docx copy.
- Dosha reveal card per Dosha — archetype, reframe quote, composition preview, three revealed patterns, ritual, teaser strip. Verbatim docx copy for Vata, Pitta, Kapha.
- Post-submission screen `/quiz/sent` — verbatim docx copy, minimal layout, 8s auto-advance to `/quiz/result`.
- Scoring update: weights 30% Body / 25% Mind / 45% Spirit. Dual-Dosha threshold <15%. Tri-Dosha threshold <20%. Expose composition percentages to reveal + result screens.
- Visual triangle rebalance: A/B/C in one horizontal row (not A+B top / C bottom). Removes Kapha bias risk.

**P2 IA + polish:**
- Scale-3 live-highlight: nearest letter brightens during drag, not only on release.
- Zero-em-dash sweep across all quiz surfaces (`—` → period, comma, or "and" per context).
- Email input hardening: `maxLength=254`, `trim()`, RFC-lite regex, `type="email"`, `autocomplete="email"`, `inputMode="email"`. First-name `maxLength=80`, `autocomplete="given-name"`.
- Result-page: when user taps a non-primary Dosha tab, show "PREVIEW" label so it reads as exploration.
- Legal placeholder stubs at `/legal/terms` and `/legal/privacy` ("Coming soon.") so the consent line links work.

### Out of Scope

- Klaviyo tag emission and property sync. v4 docx names ~20 tags. Defer to a separate integration plan — this ship uses `localStorage` only and stubs a `klaviyoTags: string[]` field on state that a later pass can wire to the Klaviyo JS SDK.
- Claude API / n8n integration for open-text Mirror paragraph in Email 1. Open-text fields (Q11, Q26, Q45 + bonus) are captured into state; emailing is a separate pipeline.
- Actual legal copy (T&C, Privacy Policy). Placeholder pages only.
- Server-side cross-device session resume. Client-local persistence only, per prior admin direction.
- Routing actions for Q42 (A=Academy, B=Product bundle, C=Explorer stream). Tag is stored on state; downstream email/routing logic is separate.
- Dev toolbar hardening beyond the existing `NODE_ENV === "development"` gate. Current gate is sufficient for launch.

---

## Approach

**Chosen:** In-place incremental modification with a single new state module and a single new scoring module.

**Why:** Lowest-risk path to production. The current components already hold the brand system correctly (aura, type, color, 0-radius, sound). Rebuilding in parallel would duplicate thousands of lines of GSAP + layout code for no net gain. All changes land as targeted edits inside existing files plus three small new components and two small library modules. Cost: the 52→45 migration is a content swap — manageable because every v3 question has a v4 analog by shape (single-select, scale, open-text).

**Alternatives considered:**
- **Parallel `QuizV4/` tree behind feature flag:** cleaner seam, but doubles maintenance while the flag is on. Rejected — no staged rollout is required.
- **Full rewrite of QuizBody into a config-driven renderer:** tempting long-term, but outside the ship window. Rejected — the existing switch-on-`kind` renderer is good enough.
- **Use React Context for quiz state:** cleaner than passing props, but adds ceremony. Rejected — `localStorage` + a module-level getter/setter is simpler and survives refresh.

---

## Context for Implementer

- **Patterns to follow:**
  - `app/src/components/quiz/QuizBody.tsx:1609` — `DEV_JUMPS` gating pattern (`process.env.NODE_ENV === "development"`). Keep for all dev-only affordances.
  - `app/src/components/quiz/QuizIntro.tsx:23` — `SCREENS: ScreenDef[]` array pattern. Replace contents in place, preserve shape.
  - `app/src/components/quiz/QuizBody.tsx:125` `LAYER_DEF`, `:133` `Question[]`, `:466` SVG layer shapes, `:556` `LAYER_START`, `:561` `LAYER_POS`, `:564` `TOTAL` — central data maps.
  - `app/src/components/quiz/QuizEmailGate.tsx:35–138` — existing `useState` + GSAP focus-aura pattern. Extend for first-name, do not refactor the aura animation.
  - Sound pairing at `QuizBody.tsx:1714` (`quizSounds.play(id === "a" ? "chimeA" ...)`) — preserve.
- **Conventions:**
  - All quiz components are `"use client"`. New ones the same way.
  - Brand tokens in `app/src/app/globals.css`. Never hard-code colors. border-radius stays 0. No gradient text. No em dashes anywhere.
  - Brandon Grotesque UPPERCASE + `.font-label` for labels only. Plantin for headlines and body.
  - `process.env.NEXT_PUBLIC_BASE_PATH` prefix on every image `src`.
- **Key files:**
  - `app/src/components/quiz/QuizIntro.tsx` — pre-story (45 lines → 4 screens).
  - `app/src/components/quiz/QuizBody.tsx` — 3-layer question engine, becomes 45 questions.
  - `app/src/components/quiz/QuizEmailGate.tsx` — email gate v4.
  - `app/src/components/quiz/QuizInterstitial.tsx` — reuse for completion screen.
  - `app/src/app/quiz/layout.tsx` — shared chrome + nav dots.
  - `app/src/app/quiz/result/page.tsx` — result + preview tabs.
  - `ETHA_Dosha_Quiz_v4-final-23.04.docx` — source of truth for all copy.
- **Gotchas:**
  - Hydration: read `localStorage` inside `useState` initializer, not in `useEffect`, or Joana sees Q1 flash before jumping to saved index.
  - Next 16: `params`/`searchParams` are Promises; `cookies()`/`headers()` async. All quiz pages stay client-only.
  - `LAYER_POS` feeds aura-curve animation. Removing the visible counter must not touch `LAYER_POS`.
  - v4 completion screen reads "Forty-three answers" while code ships 45 questions. The intro also says "43 questions." This is a deliberate copy choice from the docx (the number 43 is the promise even though the engine runs 45). Keep copy verbatim; do not reconcile by changing the docx.
  - Escape key on email gate currently fires `onSuccess("")`. This is Phase-1 P0. Fix as part of Task 7 (gate rewrite).
- **Domain context:**
  - v4 framing: email gate is "delivery, not wall." User sees their Dosha + archetype before handing over email.
  - "Zeigarnik effect" — the completion copy "Almost ready" is deliberate; do not soften.
  - Milestone dots replace the counter because v4 says visible numeric progress makes the quiz feel long.
  - Auto-advance 180ms is intentional per admin — fast-flow is part of the feel; the price of occasional misclick is accepted.

---

## Runtime Environment

- **Start command:** `cd app && npm run dev`
- **Port:** 3000
- **Deploy path:** GitHub Pages at `/etha-landing/` via `.github/workflows/deploy.yml`
- **Health check:** `http://localhost:3000/quiz` renders intro screen 1/4 with no console errors.
- **Restart:** Ctrl-C, `npm run dev`. Turbopack HMR handles most edits without restart.

---

## Feature Inventory

This plan migrates the question set 52 → 45. Every v3 question must map to either a v4 question, an explicit "out of scope" (deleted intentionally), or a replacement.

| v3 QuizBody.tsx location | v3 kind | v4 mapping | Task |
|---|---|---|---|
| Q1–Q3 Body single-select | single-select + visual | v4 Q1, Q2, Q3 (verbatim copy, full-bleed image tiles) | Task 8 |
| Body scale2 question | 2-node | v4 Q8 (temperature) and Q13 (waking) | Task 8 |
| Body open-text | open | v4 Q11 (one-word body ask) | Task 8 |
| Body single-select questions | single-select | v4 Q4–Q7, Q9, Q10, Q12, Q14, Q15 | Task 8 |
| Mind scale3 | 3-node | v4 Q17 and Q23 (3-node with middle node label) | Task 8 |
| Mind single-select | single-select | v4 Q16, Q18–Q22, Q24, Q25, Q27, Q28 | Task 8 |
| Mind open-text | open | v4 Q26 | Task 8 |
| Spirit single-select | single-select + visual | v4 Q29–Q37, Q39, Q40–Q42, Q44 | Task 8 |
| Spirit scale2 | 2-node | v4 Q38 | Task 8 |
| Spirit open-text | open | v4 Q45 + bonus field | Task 8 |
| Spirit tempo (if present) | tempo | v4 Q43 (4 options — not tempo. Convert to 4-option single-select) | Task 8 |
| Any v3 question not in v4 | — | OUT OF SCOPE — delete | Task 8 |

All `Klaviyo: ...` tag names in the docx are captured as `string[]` on each answer record. Emission out of scope.

---

## Assumptions

- `localStorage` is available in Joana's target browsers (iOS Safari 15+, Android Chrome evergreen, desktop evergreen). Tasks 1, 7 depend on this.
- Existing `app/public/images/opener-q1-a.webp`, `q1-b.webp`, `q1-c.webp`, q2-*, q3-* are the full-bleed image tiles v4 requires for the first three questions. Supported by `git status` showing these images modified. Task 8 depends on this.
- v4 copy in `ETHA_Dosha_Quiz_v4-final-23.04.docx` is final and user-approved. Tasks 3, 5, 7, 8 depend on this.
- Current scoring function lives inline in `app/src/app/quiz/result/page.tsx`. Task 9 extracts it to `lib/doshaScoring.ts`.
- `process.env.NODE_ENV` correctly gates dev-only affordances in production build. Supported by `QuizBody.tsx:1805` and `QuizIntro.tsx:331`.
- Photography for Q34 and Q41 (Visual, photography required per docx) is already produced or the existing generated imagery is acceptable for launch. If not, this becomes a blocker.
- Auto-advance 180ms is intentional per admin. No confirm step required. Task 4 preserves the interaction.

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Hydration flicker from `localStorage` read after first paint | High | Medium | Use `useState(() => readFromLS())` initializer. Guard with `typeof window !== "undefined"`. Defer first render until hydration completes. |
| Back-button on first screen with nothing to go back to | Medium | Low | Render as disabled (low-opacity) on intro 1/4 rather than conditionally mount, so layout does not shift. |
| Auto-advance skips user misclick with no recovery | Medium | High | Back button + in-state history covers this. Auto-advance 180ms is locked as intentional per admin. Document it. |
| Removing visible counter breaks aura progress binding | Medium | Medium | Keep `LAYER_POS` + internal index untouched. Only the visible counter JSX is removed. Browser walk verifies aura animation still fires. |
| Escape key on email gate continues to silent-submit | Medium | High | Task 7 splits Escape → `onCancel` path from submit path. Unit-level check: Escape with no text typed does NOT call `onSuccess`. |
| 52→45 question migration introduces data-shape drift | High | High | Re-use existing `Question[]` type. Task 8 swaps entries in place. Add a Zod-style schema check in Task 9 scoring module that rejects unknown question kinds. |
| Scoring percentages don't sum to 100% across weights 30/25/45 | Medium | High | Unit test the scoring function with synthetic answer sets. DoD includes: for any valid answer set, `vata + pitta + kapha === 100`. |
| Legal consent line links to pages that 404 | High | Low | Task 11 stubs `/legal/terms` and `/legal/privacy` with "Coming soon." |
| v4 forbids em dashes but existing content has some | Medium | Low | Task 11 grep-sweep + replace. Add to `spec-verify`. |
| Dosha reveal card blur is a `filter: blur` stacking context bug on Safari | Low | Medium | Use `backdrop-filter` where possible; fall back to a cream-tinted opaque overlay on Safari via `@supports not (backdrop-filter: blur(1px))`. |
| "Forty-three answers" copy contradicts 45 questions | Low | Medium | Keep docx copy verbatim. Copy is a promise number, engine is a delivery number. Accept intentional drift. |
| Visual triangle rebalance breaks current mobile layout | Medium | Medium | Use Tailwind `grid-cols-3 gap-4` with `aspect-square` on tiles; verify at 390px viewport before merging. |
| Existing scale-3 drag logic tightly coupled to post-release commit | Medium | Medium | Task 10 adds a `onDrag` handler that only reads position — no state commit, just a `nearestLetter` CSS variable update. |

---

## Goal Verification

### Truths

1. On a 390×844 mobile emulation, a user can refresh the browser mid-quiz (after answering ≥3 questions) and returns to the same question with prior answers preserved. TS-001.
2. On any quiz screen past intro 1/4, a Back affordance is present, visible, tappable at ≥44pt, and returns to the prior screen preserving any selection. TS-002.
3. The intro is exactly 4 screens, matching the copy in `ETHA_Dosha_Quiz_v4-final-23.04.docx` verbatim. No screen contains `Q[n] of [total]`. TS-003.
4. No quiz question screen displays a numeric counter. Progress is three dots (Body / Mind / Spirit). TS-004.
5. A single-select answer tap auto-advances within 180–300ms without a Continue press. TS-005.
6. After the last Spirit question, the user sees: completion screen → Dosha reveal card → email gate (first name + email + consent + privacy) → post-submission screen → result. TS-006.
7. Clean-tab deep-links to any `/quiz/*` subroute with empty `localStorage` redirect to `/quiz` intro 1/4. TS-007.
8. No em-dash character (`—`, U+2014) exists in any quiz component source or rendered quiz page. TS-008.
9. For every valid answer set, `doshaScoring(answers)` returns three percentages summing to exactly 100. TS-009.
10. The 45 questions in v4 docx are all present in `QuizBody.tsx` with copy matching verbatim. No v3-only question text remains. TS-010.
11. Pressing Escape on the email gate closes the gate without submitting; no `{ email: "" }` is written to state. TS-011.
12. Visual triangle questions (Q1–Q3, Q18, Q21, Q27, Q34, Q41) render A, B, C in one horizontal row at equal visual weight on all viewports. TS-012.

### Artifacts

- `app/src/lib/quizState.ts` (new) — `localStorage` persistence + resume + history stack + schema versioning
- `app/src/lib/doshaScoring.ts` (new) — weighted scoring + dual/tri-Dosha thresholds
- `app/src/components/quiz/QuizBackButton.tsx` (new) — shared back affordance
- `app/src/components/quiz/QuizIntro.tsx` (modified) — 4-screen v4 copy
- `app/src/components/quiz/QuizBody.tsx` (modified) — 45 questions verbatim, counter removed, dots added, auto-advance, visual triangle rebalance, scale-3 live-highlight
- `app/src/components/quiz/QuizCompletion.tsx` (new) — "Your rhythm has been heard"
- `app/src/components/quiz/QuizDoshaReveal.tsx` (new) — per-Dosha locked reveal card
- `app/src/components/quiz/QuizEmailGate.tsx` (modified) — first-name + v4 copy + consent + Escape fix
- `app/src/app/quiz/completion/page.tsx` (new)
- `app/src/app/quiz/reveal/page.tsx` (new)
- `app/src/app/quiz/sent/page.tsx` (new) — "Your map is on its way"
- `app/src/app/quiz/result/page.tsx` (modified) — PREVIEW label on non-primary tabs, em-dash sweep
- `app/src/app/legal/terms/page.tsx` (new placeholder)
- `app/src/app/legal/privacy/page.tsx` (new placeholder)

---

## E2E Test Scenarios

### TS-001: State persists across refresh
**Priority:** Critical. **Mapped Tasks:** 1.

| Step | Action | Expected |
|---|---|---|
| 1 | `/quiz`, tap through intro 1→4 | Lands Body Q1 |
| 2 | Answer Q1, Q2, Q3 | Advances Q4 |
| 3 | Cmd-R | Resume prompt "Continue" / "Start over" |
| 4 | Continue | Lands Q4, Q1–Q3 selections preserved (verify by Back) |
| 5 | Start over | Returns intro 1/4, `localStorage` cleared |

### TS-002: Back button every screen
**Priority:** Critical. **Mapped Tasks:** 2.

| Step | Action | Expected |
|---|---|---|
| 1 | Intro 2/4 → tap Back | Intro 1/4; Back disabled |
| 2 | Body Q5 → Back | Q4 with prior selection highlighted |
| 3 | Mind Q1 → Back | Last Body question |
| 4 | Email gate → Back | Dosha reveal card |

### TS-003: Intro 4 screens v4 copy
**Priority:** Critical. **Mapped Tasks:** 3.

| Step | Action | Expected |
|---|---|---|
| 1 | Load `/quiz` | S1 "Am I who I am supposed to be?" |
| 2 | Advance | S2 ancient framing + reframe paragraph |
| 3 | Advance | S3 value promise as prose |
| 4 | Advance | S4 "Are you ready to return to yourself?" + two CTAs + privacy + soft-exit |
| 5 | Yes, begin | Body Q1 |
| 6 | Not right now | Soft-exit copy visible, no quiz start |

### TS-004: No numeric counter; dots only
**Priority:** High. **Mapped Tasks:** 4.

| Step | Action | Expected |
|---|---|---|
| 1 | Any question screen | No text matching `\d+\s*/\s*\d+` |
| 2 | Nav | Three dots: Body / Mind / Spirit |
| 3 | Progress Body → Mind | Body dot complete, Mind dot active |

### TS-005: Auto-advance single-select
**Priority:** High. **Mapped Tasks:** 4.

| Step | Action | Expected |
|---|---|---|
| 1 | Tap answer A on single-select | Within 300ms advance without Continue |
| 2 | 2-node scale → drag/tap pole | Commits + auto-advances |
| 3 | Open-text → type + Submit | Advances. Skip also advances |

### TS-006: Completion → reveal → gate → sent flow
**Priority:** Critical. **Mapped Tasks:** 5, 7.

| Step | Action | Expected |
|---|---|---|
| 1 | Answer Q45 | Completion screen "Your rhythm has been heard." |
| 2 | Wait 3s or tap | Dosha reveal card — archetype + reframe + blurred report + CTA |
| 3 | CTA "Read my full report" | Email gate — context line + headline + first-name + email + CTA + legal + privacy |
| 4 | Type first name + email, tap Send | `/quiz/sent` "Your map is on its way." |
| 5 | Wait 8s or tap | `/quiz/result` full report |
| 6 | Tap Terms / Privacy links | `/legal/terms` / `/legal/privacy` render "Coming soon." |

### TS-007: Deep-link guard
**Priority:** High. **Mapped Tasks:** 1.

| Step | Action | Expected |
|---|---|---|
| 1 | Clean tab → `/quiz/body` | Redirect `/quiz` intro 1/4 |
| 2 | Clean tab → `/quiz/gate` | Redirect `/quiz` intro 1/4 |
| 3 | Clean tab → `/quiz/completion` | Redirect `/quiz` intro 1/4 |
| 4 | Clean tab → `/quiz/sent` | Redirect `/quiz` intro 1/4 |

### TS-008: Zero em dashes
**Priority:** Medium. **Mapped Tasks:** 11.

| Step | Action | Expected |
|---|---|---|
| 1 | `grep -R "—" app/src/components/quiz app/src/app/quiz` | Zero hits |
| 2 | Walk every quiz screen, view-source | Zero U+2014 in rendered HTML |

### TS-009: Scoring sums to 100%
**Priority:** High. **Mapped Tasks:** 9.

| Step | Action | Expected |
|---|---|---|
| 1 | Run `doshaScoring(all-A answers)` | Three percentages, sum === 100 |
| 2 | Run on mixed answer set | Sum === 100 |
| 3 | Dual-Dosha case (Vata 55 / Pitta 45 / Kapha 0) | Flag `isDual: true` |
| 4 | Tri-Dosha case (Vata 40 / Pitta 35 / Kapha 25) | Flag `isTri: true` |

### TS-010: Question set matches docx
**Priority:** Critical. **Mapped Tasks:** 8.

| Step | Action | Expected |
|---|---|---|
| 1 | Count Q defs in `QuizBody.tsx` | 45 |
| 2 | Diff first-line text of each Q vs docx | Zero mismatches |
| 3 | `grep "^Q([0-9]+)" docx` vs `Question[].id` | All 45 IDs present |

### TS-011: Email gate Escape does not silent-submit
**Priority:** Critical. **Mapped Tasks:** 7.

| Step | Action | Expected |
|---|---|---|
| 1 | Open gate, press Esc | Gate closes, returns to reveal card |
| 2 | Check `quizState.email` | Unchanged from prior state (not `""`) |
| 3 | Check analytics/console | No submit event fired |

### TS-012: Visual triangle rebalance
**Priority:** High. **Mapped Tasks:** 10.

| Step | Action | Expected |
|---|---|---|
| 1 | Load Body Q1 at 390×844 | A, B, C in one row, equal width, equal height |
| 2 | Same at 1440×900 | Same layout proportions preserved |
| 3 | Any visual question (Q18, Q21, Q27, Q34, Q41) | Same 3-up row |

---

## Progress Tracking

- [ ] Task 1: State persistence + route guards + resume prompt
- [ ] Task 2: Shared Back-button + history stack on every quiz screen
- [ ] Task 3: Rewrite intro to v4 (4 screens, verbatim copy)
- [ ] Task 4: Remove counter, add Body/Mind/Spirit dots, auto-advance single-select
- [ ] Task 5: Completion screen + Dosha reveal card with per-Dosha v4 copy
- [ ] Task 6: Visual triangle rebalance (3-up row) + scale-3 live-highlight during drag
- [ ] Task 7: Email gate v4 rewrite + Escape→onCancel fix + post-submission screen
- [ ] Task 8: Migrate question set 52 → 45 per v4 docx verbatim
- [ ] Task 9: Scoring module — weights 30/25/45 + dual/tri-Dosha thresholds
- [ ] Task 10: Scale-3 live-highlight during drag (folded into Task 6 if trivial, separate if not)
- [ ] Task 11: Em-dash sweep + result-page PREVIEW label + legal page stubs + email input hardening

**Total Tasks:** 11 | **Completed:** 0 | **Remaining:** 11

---

## Implementation Tasks

### Task 1: State persistence + route guards + resume prompt

**Objective:** Persist quiz state to `localStorage`. Hydrate on mount. Redirect deep-links to `/quiz` when state is empty. Show resume prompt when state exists.
**Dependencies:** None.
**Mapped Scenarios:** TS-001, TS-007.

**Files:**
- Create: `app/src/lib/quizState.ts`
- Modify: `app/src/app/quiz/layout.tsx`
- Modify: `app/src/components/quiz/QuizIntro.tsx`
- Modify: `app/src/components/quiz/QuizBody.tsx`
- Modify: `app/src/components/quiz/QuizEmailGate.tsx`
- Create: `app/src/app/quiz/sent/page.tsx` (guard only; UI in Task 7)
- Create: `app/src/app/quiz/completion/page.tsx` (guard only; UI in Task 5)
- Create: `app/src/app/quiz/reveal/page.tsx` (guard only; UI in Task 5)

**Key Decisions / Notes:**
- Schema:
  ```ts
  type QuizState = {
    v: 1;
    introScreen: number;
    layer: 1 | 2 | 3;
    stepIndex: number;
    answers: Record<string, AnswerValue>;
    history: string[];
    firstName?: string;
    email?: string;
    klaviyoTags?: string[];  // stub for later pipeline
    completedAt?: number;
  };
  ```
- Key: `etha.quiz.state.v1`. Versioned so a later dev pass can invalidate.
- Initializer: `useState(() => typeof window !== "undefined" ? JSON.parse(localStorage.getItem(KEY) ?? "null") : null)`.
- Resume prompt: modal rendered in `quiz/layout.tsx` client wrapper if state exists. 0-radius, cream-on-aubergine, Plantin headline, Brandon UPPERCASE CTAs.
- Route guards: each guarded route checks `readQuizState()` in a `useEffect`. If missing required field → `router.replace("/quiz")`. Guards:
  - `/quiz/body` — need `introScreen >= 3`.
  - `/quiz/completion` — need all 45 answers.
  - `/quiz/reveal` — need `completedAt`.
  - `/quiz/gate` — need `completedAt`.
  - `/quiz/sent` — need `email`.
  - `/quiz/result` — need `email`.
- Write path: single helper `updateQuizState(patch)` calls `localStorage.setItem`. Every answer tap, screen change, layer change routes through it. Synchronous writes; no debounce unless profiler shows jank.

**Definition of Done:**
- [ ] `etha.quiz.state.v1` appears in `localStorage` within 500ms of answering Q1
- [ ] Refresh at any mid-quiz point returns to same question with prior answers (TS-001)
- [ ] Deep-link to any guarded route on clean state redirects to `/quiz` (TS-007)
- [ ] Resume prompt appears on fresh tab load when state exists; "Start over" clears the key
- [ ] No console errors during hydration
- [ ] `npm run build` passes

**Verify:** TS-001, TS-007 via chrome-devtools-mcp. `npm run lint && npm run build`.

---

### Task 2: Shared Back-button + in-state history stack

**Objective:** Back affordance on every quiz screen except intro 1/4. Step-back preserves selection so user can change answers.
**Dependencies:** Task 1.
**Mapped Scenarios:** TS-002.

**Files:**
- Create: `app/src/components/quiz/QuizBackButton.tsx`
- Modify: `app/src/components/quiz/QuizIntro.tsx` (wire back in header)
- Modify: `app/src/components/quiz/QuizBody.tsx` (wire back in header)
- Modify: `app/src/components/quiz/QuizEmailGate.tsx` (wire back in modal)
- Modify: `app/src/components/quiz/QuizCompletion.tsx` (Task 5)
- Modify: `app/src/components/quiz/QuizDoshaReveal.tsx` (Task 5)
- Modify: `app/src/lib/quizState.ts` — `history: string[]` + `pushHistory(route)` + `popHistory()`

**Key Decisions / Notes:**
- Tap target 44×44pt. Top-left of nav. Brandon UPPERCASE "BACK" + aubergine arrow.
- History lives on state, not `window.history`, so refresh-then-back works.
- Push on every forward nav. Pop on back.
- Back from auto-advanced question re-highlights the prior answer (read from `answers[qid]`).
- Disabled (not hidden) on intro 1/4 — layout stable.
- Back from email gate → Dosha reveal. Back from reveal → completion. Back from completion → last Spirit question.
- Keyboard: Esc triggers Back (progressive enhancement) — but only on non-email-gate screens. Gate Esc handled by Task 7 as a cancel, which is distinct.

**Definition of Done:**
- [ ] Back visible and active on intro 2/4 through email gate (TS-002)
- [ ] Back returns one step and preserves selection
- [ ] Disabled-state styling on intro 1/4
- [ ] Tap target ≥44×44pt
- [ ] Esc key triggers Back on non-gate screens

**Verify:** TS-002 browser walk. Keyboard-only pass.

---

### Task 3: Rewrite intro to v4 (4 screens verbatim)

**Objective:** Replace 6-screen intro with 4-screen v4 pre-story.
**Dependencies:** Task 1, Task 2.
**Mapped Scenarios:** TS-003.

**Files:**
- Modify: `app/src/components/quiz/QuizIntro.tsx`

**Key Decisions / Notes:**
Replace `SCREENS` at line 23 with exactly 4 entries:
1. **S1 Opening question** — kind `STATEMENT` — copy: *"Am I who I am supposed to be?"*
2. **S2 Ancient framing + reframe** — kind `REFLECT` — copy: *"There is a system older than modern medicine that mapped the human body not by disease, but by nature. Not who you should become. Who you already are."*
3. **S3 Value promise** — kind `VALUE` (prose, NOT bulleted) — copy: *"In the next 15 minutes, you will receive your personal rhythm map, a morning-to-night ritual designed for your constitution, and botanical recommendations matched to where you are right now. 43 questions. One map that belongs only to you."*
4. **S4 Choice gate** — kind `GATE` — headline: *"Are you ready to return to yourself?"*. Two CTAs: `"Yes, begin."` and `"Not right now."`. Privacy copy: *"Your answers are private. Be honest. That is the only way this works."*. Soft-exit on "Not right now": *"This will be here. Come back when the moment is right."*

Remove prior 6-screen arrangement entirely. No migration shim.
Remove "intro X/6" counter at line 361.
Zero em dashes in new strings.
Keep GSAP transitions + Nav progress prop binding.

**Definition of Done:**
- [ ] Intro = exactly 4 screens (TS-003)
- [ ] Copy verbatim vs docx
- [ ] S4 has two CTAs
- [ ] "Not right now" renders soft-exit, no quiz start
- [ ] No "intro X/Y" text anywhere
- [ ] No em dashes
- [ ] `grep -n "—" app/src/components/quiz/QuizIntro.tsx` → 0

**Verify:** TS-003 browser walk. Grep checks.

---

### Task 4: Remove counter, add milestone dots, auto-advance

**Objective:** Remove every visible `N/45` counter. Add top-nav row of three dots (Body / Mind / Spirit). Single-select answers auto-advance 180ms after tap without Continue.
**Dependencies:** Task 1, Task 3.
**Mapped Scenarios:** TS-004, TS-005.

**Files:**
- Modify: `app/src/components/quiz/QuizBody.tsx`
- Modify: `app/src/app/quiz/layout.tsx` (dots live in shared nav)

**Key Decisions / Notes:**
- Auto-advance hot path: single handler. `setTimeout(advance, 180)` only when `question.kind === "single-select"` or `"visual"`. Existing 2-node / 3-node / open-text paths keep their commit pattern.
- Auto-advance is intentional per admin. Do NOT add a confirm step.
- Dots: three `<span>` 12×12pt visual / 44pt touch. States: upcoming (outlined aubergine), active (filled aubergine), complete (filled darker / tinted accent). Brandon UPPERCASE labels "BODY / MIND / SPIRIT" beneath each.
- Remove the `1/52 · L1` text element entirely.
- Do NOT remove internal index / `LAYER_POS` — aura binds to it.
- Add `prefers-reduced-motion` check: if reduced, advance in 10ms instead of 180ms.
- Dot fill animation: `ease-out-quart`. No bounce.

**Definition of Done:**
- [ ] `grep -n "\d\+\s*\/\s*\d\+" app/src/components/quiz/QuizBody.tsx` → 0 visible-counter strings in JSX
- [ ] Three dots render on every question (TS-004)
- [ ] Active dot changes on layer transition
- [ ] Single-select tap auto-advances 200–300ms (TS-005)
- [ ] 2-node, 3-node, open-text unchanged
- [ ] Reduced-motion respected
- [ ] Aura animation unregressed

**Verify:** TS-004, TS-005 browser walk. `npm run lint`. Visual aura regression check.

---

### Task 5: Completion screen + Dosha reveal card

**Objective:** Insert two new screens between last Spirit question and email gate: completion interstitial + Dosha reveal card with per-Dosha v4 copy.
**Dependencies:** Task 1, Task 2, Task 4, Task 9 (for composition %).
**Mapped Scenarios:** TS-006.

**Files:**
- Create: `app/src/components/quiz/QuizCompletion.tsx`
- Create: `app/src/components/quiz/QuizDoshaReveal.tsx`
- Modify: `app/src/app/quiz/completion/page.tsx` (fill in UI)
- Modify: `app/src/app/quiz/reveal/page.tsx` (fill in UI)
- Modify: `app/src/components/quiz/QuizBody.tsx` (end-of-Spirit navigates to `/quiz/completion`)

**Key Decisions / Notes:**

**Completion screen copy (verbatim, v4):**
> Your rhythm has been heard.
> Forty-three answers. Three layers.
> Something rare has been assembled here,
> a map that belongs only to you.
> It is almost ready.

- 3s auto-advance via `setTimeout`. Tap also advances.
- Reuse `QuizInterstitial` pattern for scaffolding.

**Dosha reveal card structure:**
- Reads primary Dosha from `doshaScoring(answers)` (Task 9).
- Shows:
  - Dosha name (e.g. "Vata")
  - Archetype label (Vata: "The Kinetic Mind" / Pitta: "The Fiery Drive" / Kapha: "The Grounded Core")
  - Reframe quote (per docx, verbatim per Dosha)
  - Composition: `Vata N% / Pitta N% / Kapha N%`
  - Secondary nature note (per docx, contingent on secondary dosha)
  - "What your answers revealed" — three bullet lines (per Dosha, per docx)
  - Ritual label + ritual (per Dosha, verbatim from docx)
  - Teaser strip (per Dosha)
  - Full-width CTA: **"Read my full report"** → `router.push("/quiz/gate")`
- Ritual + full report content is visible BUT behind `filter: blur(8px)` + `pointer-events: none`.
- Dosha-specific Aura in background: Vata → Energised (citrine). Pitta → Balanced (aquamarine). Kapha → Relaxed (carnelian).
- No username on this card. Name collected on gate.

**Verbatim Dosha copy (from docx):**

- **Vata card:**
  - Archetype: *The Kinetic Mind*
  - Reframe: *"You were built to move. Right now you are being asked to also burn."*
  - Secondary nature (if Pitta secondary): *"With Pitta secondary, your creativity carries an edge of precision. And your burnout arrives faster than most Vatas."*
  - Revealed:
    - *Your mind races when your body needs to land*
    - *You push through tired instead of stopping*
    - *Your thoughts arrive faster than you can place them*
  - Ritual label: *One thing for tonight*
  - Ritual: *"Lie on your back. Both hands on your belly. Breathe out completely before breathing in. Three times. Let the weight of your hands tell your nervous system the day is finished."*
  - Teaser: *Includes the one plant Vata has relied on for grounding for centuries*
  - CTA footer: *Your complete Vata profile is waiting.*

- **Pitta card:**
  - Archetype: *The Fiery Drive*
  - Reframe: *"You are not burning out. You are Pitta. And what you need is not less fire. It is a cooler vessel."*
  - Secondary nature (if Vata secondary): *"With Vata secondary, your fire moves fast and can scatter. Brilliant and creative, but prone to burnout from doing too many things at full intensity."*
  - Revealed:
    - *Your precision turns inward when there is no outlet*
    - *You finish the day in your head long after your body has stopped*
    - *Your frustration rises before you can name its source*
  - Ritual label: *One thing for tonight*
  - Ritual: *"Roll your tongue or part your lips. Inhale slowly through the mouth. Feel the cool air travel inward. Hold briefly. Exhale through the nose. Three rounds. This is Sheetali. The oldest Pitta cooling practice in Ayurveda."*
  - Teaser: *Includes the one plant that cools Pitta's fire without dimming its light*
  - CTA footer: *Your complete Pitta profile is waiting.*

- **Kapha card:**
  - Archetype: *The Grounded Core*
  - Reframe: *"You are not stuck. You are Kapha. And the bloom is already there. It simply needs the right conditions."*
  - Secondary nature (if Pitta secondary): *"With Pitta secondary, your depth has an edge. A will beneath the steadiness that, when activated, is formidable."*
  - Revealed:
    - *Your mornings need more than one reason to begin*
    - *You carry what others put down*
    - *Your energy arrives slowly. And lasts the longest*
  - Ritual label: *One thing for tomorrow morning*
  - Ritual: *"Before anything else, five minutes of movement. Brisk, warm, arms and legs. Then fresh ginger tea, drunk standing. Kapha wakes from the inside out. And you already know this."*
  - Teaser: *Includes the sacred plant that tells Kapha the morning has genuinely arrived*
  - CTA footer: *Your complete Kapha profile is waiting.*

Zero em dashes.

**Definition of Done:**
- [ ] Q45 → `/quiz/completion` (TS-006)
- [ ] Completion screen auto-advances after 3s or tap
- [ ] `/quiz/reveal` shows correct archetype + reframe + composition + blurred body + CTA
- [ ] Composition percentages match `doshaScoring` output
- [ ] CTA advances to `/quiz/gate`
- [ ] Back from reveal → completion; back from completion → last Spirit question
- [ ] Aura state matches Dosha
- [ ] Spot-check all 3 Dosha outcomes by manipulating `answers` in devtools

**Verify:** TS-006 browser walk × 3 Doshas.

---

### Task 6: Visual triangle rebalance + scale-3 live-highlight

**Objective:** A/B/C visual questions render in a single horizontal row at equal weight. Scale-3 questions show the nearest letter brightening live during drag, not only on release.
**Dependencies:** Task 4.
**Mapped Scenarios:** TS-012.

**Files:**
- Modify: `app/src/components/quiz/QuizBody.tsx`

**Key Decisions / Notes:**

**Visual triangle rebalance:**
- At `QuizBody.tsx:1549-1565`, change from A+B top / C bottom to `grid grid-cols-3 gap-4`.
- Tiles: `aspect-square` at 390px viewport. On ≥768px: stay 3-up but add `gap-6`.
- All three tiles get equal tap target ≥96×96pt on mobile.
- Preserve existing aura-per-option animation (`QuizBody.tsx:57-79`).
- Q1, Q2, Q3 (full-bleed image tiles) and Q18, Q21, Q27, Q34, Q41 (visual cards) all use this layout.

**Scale-3 live-highlight:**
- At `QuizBody.tsx:1123` (boundaries 0.33 / 0.67), add a `nearestLetter` state derived from drag position.
- During drag: CSS variable `--scale-3-active-letter` updates on `onPointerMove`. Letters A/B/C each read the variable and apply full opacity when matched, half opacity otherwise.
- On release: existing commit flow unchanged.
- Add haptic tick via `navigator.vibrate([10])` on bucket crossover (iOS no-op; Android feels right).

**Definition of Done:**
- [ ] Visual questions render 3-up row at all viewports (TS-012)
- [ ] Tap target ≥96×96pt mobile
- [ ] Scale-3 letter brightness tracks drag position live
- [ ] No regression of existing aura-per-option animation
- [ ] Haptic tick fires once per bucket crossing
- [ ] `npm run build` passes

**Verify:** TS-012 browser walk at 390 and 1440. Manual drag test on scale-3 (Q17, Q23).

---

### Task 7: Email gate v4 rewrite + Escape→onCancel fix + post-submission screen

**Objective:** Rewrite email gate to v4 delivery framing. Add first-name field. Add legal consent line. Fix the P0 Escape silent-submit. Create `/quiz/sent` post-submission screen.
**Dependencies:** Task 1, Task 2, Task 5.
**Mapped Scenarios:** TS-006, TS-011.

**Files:**
- Modify: `app/src/components/quiz/QuizEmailGate.tsx`
- Modify: `app/src/app/quiz/sent/page.tsx` (fill in UI)
- Create: `app/src/app/quiz/sent/QuizSent.tsx` (client component)

**Key Decisions / Notes:**

**Email gate copy (verbatim v4):**
- Context line (small Brandon UPPERCASE, aubergine-faint): *"Your Dosha has been identified. Your full report is one step away."*
- Headline (Plantin serif): *"Where should we send your report?"*
- Body (Plantin): *"Your complete rhythm map, your daily ritual, and your botanical recommendations, written for you alone. Enter your name and email to read it in full."*
- Field 1 label: *"First name"*. `type="text"`, `autocomplete="given-name"`, `maxLength={80}`, `required`, `.trim()` on submit.
- Field 2 label: *"Your email address"*. `type="email"`, `autocomplete="email"`, `inputMode="email"`, `maxLength={254}`, `.trim()` on submit, RFC-lite regex.
- CTA: *"Send my full report"*
- Legal consent line (smallest Brandon UPPERCASE, directly below CTA, visually separated): *"By continuing you agree to our Terms and Conditions and Privacy Policy."* Terms + Privacy as links to `/legal/terms` + `/legal/privacy`.
- Privacy note (bottom, smallest type, visually separated): *"Private. Never shared. Unsubscribe at any moment."*

**Escape→onCancel fix (P0):**
- Current: `QuizEmailGate.tsx:56` Esc handler calls `onSuccess("")`.
- Fix: split into `onCancel` and `onSubmit`. Esc fires `onCancel`. `onCancel` sets `showGate=false` and navigates back to `/quiz/reveal` — it does NOT write to state.
- `onSuccess` only fires on valid form submit with both fields passing validation.

**Post-submission screen `/quiz/sent`:**
- Copy (verbatim v4):
  > Your map is on its way.
  > Check your inbox. Something made for you alone is arriving.
  > Take a breath. You just did something most people never do.
  > You listened.
- Minimal layout. No CTA. No upsell.
- 8s auto-advance OR tap → `/quiz/result`.
- Uses Balanced Aura in ambient drift.

Zero em dashes.

**Definition of Done:**
- [ ] First-name field precedes email field (TS-006)
- [ ] Headline + body + context + CTA + legal + privacy match docx verbatim
- [ ] Submit writes `firstName` + `email` to `quizState` (trimmed)
- [ ] Submit navigates to `/quiz/sent`
- [ ] Esc closes gate WITHOUT calling `onSuccess` (TS-011)
- [ ] `/quiz/sent` renders verbatim copy, 8s auto-advance to `/quiz/result`
- [ ] max-length, autocomplete, inputMode, type attributes correct
- [ ] Legal links open `/legal/terms` and `/legal/privacy`

**Verify:** TS-006 + TS-011 browser walk. Emoji-only input rejected. Trailing whitespace in paste works.

---

### Task 8: Migrate question set 52 → 45 per v4 docx

**Objective:** Replace every `Question` entry in `QuizBody.tsx` with the verbatim 45-question set from v4 docx. Preserve question-kind engine; add new kinds only if required.
**Dependencies:** Task 4 (auto-advance for single-select), Task 9 (scoring contract).
**Mapped Scenarios:** TS-010.

**Files:**
- Modify: `app/src/components/quiz/QuizBody.tsx`

**Key Decisions / Notes:**

**Question structure per docx:**
- **Body (Q1–Q15, weight 30%):** Q1–Q3 single-select + full-bleed image tiles (photography required). Q4, Q5, Q7, Q9, Q10, Q12, Q14, Q15 single-select. Q6 single-select + visual. Q8 2-node scale. Q11 open-text (1 word, skip allowed). Q13 2-node scale.
- **Mind (Q16–Q28, weight 25%):** Q16, Q18–Q22, Q24, Q25, Q27, Q28 single-select. Q17 3-node scale (middle node labelled). Q23 3-node scale (middle labelled). Q26 open-text (1 detail, skip allowed).
- **Spirit (Q29–Q45, weight 45%):** Q29–Q37, Q39, Q40–Q42, Q44 single-select. Q34, Q41 require photography. Q38 2-node scale. Q43 4-option single-select (not a scale). Q45 open-text (1 sentence, skip) + bonus one-word field.

**Q43 note:** 4 options (A 2min / B 5min / C 15min / D 30min+). Current engine supports 3-option single-select with A/B/C aura shapes. Extend to 4-option variant OR render Q43 as a stacked list with 4 cards (no auras). Chosen: **stacked 4-card list** — Q43 is text-only per docx ("No visual cards needed").

**Open-text bonus on Q45:** "One word for what your spirit needs most right now." Mount on Q45 screen as a second input beneath the main text area. Skip available.

**Question kind mapping for existing engine:**

| v4 Q | Kind in engine |
|---|---|
| Q1, Q2, Q3 | `visual` (full-bleed image tile version) |
| Q4, Q5, Q7, Q9, Q10, Q12, Q14, Q15, Q16, Q19, Q20, Q22, Q24, Q25, Q28, Q29, Q30, Q31, Q32, Q33, Q35, Q36, Q37, Q39, Q40, Q44 | `single-select` |
| Q6, Q18, Q21, Q27, Q34, Q41 | `visual` (card version) |
| Q8, Q13, Q38 | `scale-2` (2-node) |
| Q17, Q23 | `scale-3` (3-node with middle node label) |
| Q11, Q26, Q45 | `open-text` |
| Q43 | new `single-select-4` variant — 4 options, stacked list |

Tag metadata per answer:
```ts
type Question = {
  id: `Q${number}`;
  layer: 1 | 2 | 3;
  kind: "single-select" | "visual" | "scale-2" | "scale-3" | "open-text" | "single-select-4";
  prompt: string;                // body of the question
  lead?: string;                 // italicised lead line above the prompt (docx has these)
  options: Array<{ id: "a" | "b" | "c" | "d"; label: string; dosha: "V" | "P" | "K" }>;
  klaviyoTags?: string[];        // captured into state on answer
  scrambled?: boolean;           // if true, shuffle A/B/C display order per session (store stable seed in state)
};
```

Dosha mapping for each option comes from standard Ayurveda rubric cross-referenced against the docx's balance/imbalance tags. Implementer to set per docx — typical rule:
- A option = primary Vata or scattered/mental
- B option = primary Pitta or fire/drive
- C option = primary Kapha or slow/grounded
Exceptions called out in docx notes (e.g. Q20 "Twelve different directions" = Vata, "One problem turning over" = Pitta, "Nowhere. Just heavy." = Kapha) — follow the copy's semantics.

Scrambled questions: Q5, Q19, Q22, Q30, Q32, Q35, Q37, Q44, Q15 marked "Scrambled order." Implementer stores a Fisher-Yates shuffle seed per session on first mount.

Zero em dashes. Replace with commas / periods per context.

**Definition of Done:**
- [ ] `QuizBody.tsx` has exactly 45 `Question` entries (TS-010)
- [ ] Each Q's lead + prompt + option labels match docx verbatim
- [ ] Dosha mapping set for every option
- [ ] Klaviyo tags captured per docx into `answer.klaviyoTags`
- [ ] Scrambled questions shuffle stably per session (not per render)
- [ ] Q43 renders as 4-option list (no auras)
- [ ] Q45 has primary text + bonus one-word field + skip
- [ ] No em dashes
- [ ] `npm run build` passes

**Verify:** TS-010. Diff first line of each Q against docx. Count Q defs.

---

### Task 9: Dosha scoring module

**Objective:** Extract scoring to `lib/doshaScoring.ts`. Apply weights 30% Body / 25% Mind / 45% Spirit. Compute dual-Dosha (<15% gap) and tri-Dosha (<20% spread) flags. Expose composition percentages that sum to 100.
**Dependencies:** Task 8 (question set + Dosha mapping).
**Mapped Scenarios:** TS-009.

**Files:**
- Create: `app/src/lib/doshaScoring.ts`
- Modify: `app/src/app/quiz/result/page.tsx` (replace inline scoring)
- Modify: `app/src/components/quiz/QuizDoshaReveal.tsx` (consume composition)

**Key Decisions / Notes:**
- Signature:
  ```ts
  export type DoshaBreakdown = {
    primary: "vata" | "pitta" | "kapha";
    secondary: "vata" | "pitta" | "kapha";
    composition: { vata: number; pitta: number; kapha: number };  // sum === 100
    isDual: boolean;
    isTri: boolean;
  };
  export function doshaScoring(answers: Answers, questions: Question[]): DoshaBreakdown;
  ```
- Algorithm:
  1. Initialise raw counts: `{ vata: 0, pitta: 0, kapha: 0 }`.
  2. For each answered question, increment the dosha mapped to the chosen option.
  3. Partition totals by layer. Compute layer percentages. Weight by (Body 0.30 / Mind 0.25 / Spirit 0.45).
  4. Normalise to sum === 100 (rounding: Largest Remainder Method so rounding error never yields 99 or 101).
  5. Primary = argmax. Secondary = second-largest.
  6. `isDual = (composition[primary] - composition[secondary]) < 15`.
  7. `isTri = (max - min) < 20`.
- Open-text answers (Q11, Q26, Q45) do not score. They are captured into `state.answers` for later email pipeline.
- Skipped open-text answers also don't score.
- Q42 routing tag (A/B/C) stored on state as `routingTag`, not in scoring.
- Q43 ritual-time stored as `ritualTime`, not in scoring.
- Q44 lifestyle stored as `lifestyleContext`, not in scoring.

**Definition of Done:**
- [ ] All-A answers → Vata-heavy composition, sums to 100 (TS-009)
- [ ] All-B → Pitta-heavy, sum 100
- [ ] All-C → Kapha-heavy, sum 100
- [ ] Mixed set → correct weighting per layer
- [ ] `isDual` flag correct on (Vata 55 / Pitta 45 / Kapha 0)
- [ ] `isTri` flag correct on (40 / 35 / 25)
- [ ] No NaN / negative values on partial answer sets
- [ ] Unit-test file in `app/src/lib/doshaScoring.test.ts` (Vitest-style) — optional, but reviewers prefer it

**Verify:** Synthetic answer sets. `result/page.tsx` still renders.

---

### Task 10: Scale-3 live-highlight — see Task 6

**Folded into Task 6.** Left in progress tracker for visibility. If implementer finds Task 6 scope too large, split Task 10 back out.

---

### Task 11: Em-dash sweep + result preview label + legal stubs + hardening

**Objective:** Close out P2 polish. Remove every em dash in quiz surfaces. Show "PREVIEW" label when user taps a non-primary Dosha tab on result page. Stub legal pages. Harden email inputs beyond what Task 7 already did.
**Dependencies:** Task 7.
**Mapped Scenarios:** TS-008.

**Files:**
- Modify: `app/src/app/quiz/result/page.tsx`
- Create: `app/src/app/legal/terms/page.tsx`
- Create: `app/src/app/legal/privacy/page.tsx`
- Grep sweep: `app/src/components/quiz/`, `app/src/app/quiz/`, `app/src/app/legal/`

**Key Decisions / Notes:**
- Em-dash rules: inside a sentence → replace with comma + space if parenthetical; period + space if separating independent clauses. Never replace with a single dash or hyphen.
- PREVIEW label: when `selectedTab !== primary` on result page, render Brandon UPPERCASE "PREVIEW" chip next to archetype heading. Aubergine-faint background, aubergine text, 0-radius.
- Legal pages: Plantin serif heading "Coming soon.", aubergine on cream, shared nav. ~15 lines each.
- Email input hardening confirmed (maxLength / trim / regex in Task 7). Plus: on paste, strip trailing whitespace before validation — current Task 7 `.trim()` on submit handles this but also do it `onChange` so the disabled-state of Send CTA tracks live.

**Definition of Done:**
- [ ] `grep -R "—" app/src/components/quiz app/src/app/quiz app/src/app/legal` → 0 (TS-008)
- [ ] Rendered HTML on every quiz page has 0 U+2014
- [ ] Non-primary Dosha tab on result shows "PREVIEW" chip
- [ ] `/legal/terms` and `/legal/privacy` render without 404
- [ ] Send CTA enables/disables live as user types
- [ ] `npm run lint && npm run build` pass

**Verify:** TS-008 grep + browser walk. Lint + build.

---

## Open Questions

- **Photography for Q34 and Q41** (Hummingbird/Hawk/Bear, Silk-scarf/Blade-edge/Wet-clay): docx says "photography required". Existing project asset library likely lacks these. Implementer to confirm; if absent, raise for asset production before merging Task 8. Interim: reuse existing aura-only visual card style and flag for next sprint.
- **"Forty-three answers" in completion copy vs 45 questions shipped:** keep docx verbatim per admin decision. Document in code comment so future contributors don't "fix" it.
- **Klaviyo tag emission**: out of scope this sprint. `klaviyoTags: string[]` stub field on state lets a later pass wire to Klaviyo SDK without schema change. Flag for separate plan.
- **Soft-exit on intro S4 "Not right now":** what happens after the soft-exit copy shows? Docx doesn't specify. Propose: tap anywhere on soft-exit copy returns to S4 gate; does not save state; no tracking fire.

### Deferred Ideas

- "Quick map" / 10-question fast path for returning users. Valuable, but requires a second data model. Defer.
- Server-side cross-device session resume. Deferred per admin.
- Dual-Dosha and Tri-Dosha reveal cards (the docx only names single primaries). The `isDual` and `isTri` flags are computed in Task 9 and visible in state; UI differentiation deferred.
- Claude API mirror paragraph for open-text fields in Email 1. Deferred — belongs to email pipeline work, not quiz UX.

---

## Autonomous Decisions

- **Keep docx copy verbatim even when it drifts from engine reality** ("43 questions" promise in intro + completion, 45 in engine). Docx is source of truth for copy; engine is source of truth for structure. Both ship.
- **Auto-advance 180ms locked as intentional** per admin. No confirm step. Misclick risk accepted; back button covers it.
- **State schema versioned `v1`** so future migration doesn't break clients.
- **Two new routes `/quiz/completion` and `/quiz/reveal`** instead of internal state. Cleaner for route guards and back button.
- **Q43 rendered as 4-option stacked list**, not scale or visual. Docx says "No visual cards needed."
- **Scrambled question order stored as a per-session seed on state**, not re-shuffled on each render. Preserves back-button fidelity.
- **Largest Remainder Method for composition rounding** to guarantee sum === 100.
- **Placeholder legal pages** — "Coming soon." is acceptable for launch. Legal copy is a legal task, not UX.
- **Klaviyo tag emission deferred** despite docx specifying tags. State stubs them for a later integration pass.
- **Visual triangle rebalance applies to ALL visual/full-bleed questions**, not just Q1–Q3. Consistency across layers.

---

## Approval

This plan is ready for implementation. On approval:
1. Archive `docs/plans/2026-04-23-quiz-ux-hardening.md` (mark as `Status: SUPERSEDED` at the top).
2. Run `Skill(skill='spec-implement', args='docs/plans/2026-04-23-quiz-v4-ship-ready.md')` to begin Task 1.
3. Expected sprint length: 5–7 working days for a solo implementer.
