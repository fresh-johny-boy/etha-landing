# Quiz Post-Audit Hardening Implementation Plan

Created: 2026-04-23
Status: COMPLETE
Approved: Yes
Iterations: 1
Worktree: No
Type: Feature

## Summary

**Goal:** Close the 5 remaining defects from the 2026-04-23 post-ship audit (30/40 → 33-34/40) before launch.
**Architecture:** Surgical edits on 4 files. No new components, no new routes, no schema changes. All fixes localised.
**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, GSAP.

## Scope

### In Scope
- Answer re-select window during the 180ms auto-advance (single-select questions)
- QuizCompletion auto-advance timing 3000 → 5500ms + tap-to-advance hint
- `"Forty-three answers"` → `"Forty-five answers"` copy fix
- Route guard on `/quiz/result` for production (currently shows soft fallback — convert to hard redirect)
- Arial fallback removal from result page CSS var chain
- Minor polish: `min-h-screen` → `min-h-dvh` in QuizSent, `text-cream/32` typo → `text-cream/30`

### Out of Scope
- Mobile visual triangle layout (user confirmed: intentional)
- Auto-advance 180ms interval (intentional per prior admin decision)
- H10 (Dosha explanation in intro) — deferred, would require copywriting
- H9 (categorised network error messaging) — deferred
- Klaviyo tag emission — deferred to post-launch
- Legal page copy — out of scope for this pass

## Approach

**Chosen:** Surgical edits on 4 files. No abstractions, no new helpers.

**Why:** The 5 defects are independent point-fixes. Introducing any shared utility or new component would add risk without reducing line count. Each fix has a narrow blast radius verifiable in isolation. Cost: four separate files touched instead of one — but cohesion is higher because each fix lives where the symptom was observed.

**Alternatives considered:**
- Centralised "answer commit" state machine across all three question types — rejected, over-engineered for a 180ms window problem affecting single-select only.
- Extracted `QUIZ_COPY` constants module for the "Forty-five" fix — rejected, one string change doesn't justify indirection.
- Route-guard HOC wrapping `/quiz/*` pages — rejected, `/quiz/body/page.tsx` already has the pattern inline and it reads fine.

## Context for Implementer

### Patterns to follow
- Route guard at `app/src/app/quiz/body/page.tsx:10-14` — same pattern applied to result page
- Reduced-motion branch pattern at `QuizCompletion.tsx:11-15`
- Button onClick pattern in QuizBody — locks via React state (`chosen`), not via `advancingRef` alone

### Conventions
- Fonts: `font-serif` (Plantin) for content, `.font-label` (Brandon Grotesque, UPPERCASE with letter-spacing) for labels
- Border-radius: 0px everywhere — no `rounded` Tailwind classes
- Text colours: `#3D233B` aubergine on cream surfaces, `#FFEFDE` cream on aubergine surfaces — never `#000` or `#fff`
- Viewport height: `min-h-dvh` (not `min-h-screen`) for dynamic viewport on mobile Safari
- Auto-advance intervals: always wrapped in `prefers-reduced-motion` guard with 10ms fallback

### Key files (all under `app/src/`)
| File | Role in this plan |
|------|-------------------|
| `components/quiz/QuizBody.tsx` | Answer re-select window — 3 onClick handlers + handlePick guard |
| `components/quiz/QuizCompletion.tsx` | Timing + copy + tap-to-advance hint |
| `app/quiz/result/page.tsx` | Route guard (production) + Arial fallback |
| `components/quiz/QuizSent.tsx` | min-h-dvh polish |

### Gotchas
- `QuizBody.tsx` has **three** single-select button onClick handlers (lines 773, 861, 949) — must update all three consistently. Grep for `chosen === null && onPick` to find them.
- `handlePick` (line 1705) has a `if (chosen || advancingRef.current) return;` guard that must be relaxed — else the re-select at the button level won't propagate.
- `setTimeout` returned by handlePick needs to be cancellable on re-pick — currently it isn't captured. Implementer needs a `pickTimeoutRef`.
- `quizSounds.play(...)` fires on every pick — if user re-picks, the chime plays twice. Acceptable; the second chime naturally overrides via `overwrite: true` on Web Audio.
- Result page line 145: `const primaryDosha = result?.primary ?? devDosha;` — dev toolbar remains functional after route guard change, since guard returns early before this line only in production.
- Completion screen uses Tailwind responsive classes (`text-3xl md:text-4xl lg:text-5xl`) — leave this alone in this pass. Converting to `clamp()` is a separate polish.

### Domain context
- A "pick" on a single-select question fires an answer record + chime + 180ms timer → advance. The 180ms is intentional (fast-flow). The defect: once chosen, the UI locks, so a mis-tap cannot be corrected inside that 180ms window.
- Completion screen is a peak emotional moment (reveal layer). Users need time to read 4 staggered lines. Current 3s = less than 2s readable time after staggered reveal lands.
- Route guards matter because Riley-type stress testers bookmark mid-quiz routes and return later expecting either resume or redirect — not an empty result screen.

## Runtime Environment

- **Start:** `cd app && npm run dev` (Next.js 16 Turbopack)
- **Port:** 3000
- **Health check:** `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/quiz` → 200
- **Re-verify after each task:** browser at `http://localhost:3000/quiz`, clear `localStorage.removeItem('etha.quiz.state.v1')` between runs

## Assumptions

- The 180ms auto-advance is FINAL design intent — supported by prior admin decision, plan Task 1 of `2026-04-23-quiz-v4-ship-ready.md`. Tasks 1 depends on this (do not extend the interval).
- `hasQuizState()` is the canonical entitlement check — supported by `quiz/body/page.tsx:11` + `quiz/gate/page.tsx:13`. Task 3 depends on this.
- Tailwind v4 `@theme inline` does not define `/32` opacity — supported by `globals.css` grep. Task 4 assumes `/30` is the nearest defined token.
- `result/page.tsx:155` dev-mode branch is intentional for local preview — supported by the existing `process.env.NODE_ENV !== "development"` guard. Task 3 preserves this branch.

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Re-pick during 180ms causes double-record in `data.recordAnswer` | Medium | Medium | `recordAnswer` overwrites by stepIdx — verify by reading QuizDataProvider; if not overwrite-safe, add explicit reset before re-record |
| Cancelling the pick timeout creates memory leaks if component unmounts | Low | Low | Store in `useRef`, clear in unmount + on every new pick |
| Completion tap-to-advance hint reveals too early and breaks emotional beat | Low | Medium | Fade hint in at 3.5s (well after all copy lines land), not at mount |
| `router.replace("/quiz")` in result page causes flash of empty state on real result | Low | High | Guard runs inside `useEffect` — first paint shows the loading/aura, redirect only fires if `!result`. Verify no SSR rendering path exists |
| Arial fallback removal causes Plantin to render where Brandon was expected | Low | Low | Parent element already has `font-serif` (Plantin) — fallback inherits correctly; visual regression low |

## Goal Verification

### Truths

1. On single-select questions, a user who mis-taps answer A and immediately taps answer B before the 180ms advance fires sees B as the committed answer — verifiable by setting state and reading `data.getAnswers()` in dev toolbar.
2. QuizCompletion screen displays for at least 5 seconds before auto-advancing (except under `prefers-reduced-motion`) — verifiable with stopwatch on live page.
3. QuizCompletion copy says `"Forty-five answers. One pattern."` not `"Forty-three."` — verifiable by grep.
4. Navigating directly to `http://localhost:3000/quiz/result` in production build with no quiz state in localStorage redirects to `/quiz` — verifiable with fresh browser tab + `npm run build && npm start`.
5. `grep -rn "Arial" app/src/` returns zero hits in TSX/CSS source files — verifiable by grep.
6. `QuizSent.tsx` uses `min-h-dvh` — verifiable by grep.
7. `critique-report.md` re-run scores ≥ 33/40 — TS-006 passes.

### Artifacts

- `app/src/components/quiz/QuizBody.tsx` — 3 onClick changes + handlePick refactor + `pickTimeoutRef`
- `app/src/components/quiz/QuizCompletion.tsx` — `delay` constant 5500 + `bodyLines[0]` copy + tap-to-advance hint element
- `app/src/app/quiz/result/page.tsx` — production redirect branch + Arial fallback removal
- `app/src/components/quiz/QuizSent.tsx` — min-h-dvh swap

## E2E Test Scenarios

### TS-001: Mis-tap correction on single-select
**Priority:** Critical
**Preconditions:** Clean state (`localStorage.removeItem('etha.quiz.state.v1')`). Start quiz, reach Q1 (single-select).
**Mapped Tasks:** Task 1

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/quiz` and begin quiz | Q1 renders with A/B/C options |
| 2 | Rapidly tap answer A, then tap answer B within 150ms | B is the committed answer; step advances to Q2 |
| 3 | Open DevTools console, inspect `localStorage['etha.quiz.state.v1']` | `answers[0].value === 'b'` |

### TS-002: Completion screen readable duration
**Priority:** High
**Preconditions:** Reach `/quiz/completion` (dev toolbar jump acceptable).
**Mapped Tasks:** Task 2

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Arrive at completion screen | 4 staggered copy lines render by ~1.2s |
| 2 | Wait without tapping | Screen persists ≥ 5 seconds before auto-advance |
| 3 | Inspect copy | Line 1 reads `"Forty-five answers. Three layers."` |
| 4 | Tap the screen during the wait | Screen advances immediately |

### TS-003: Route guard on `/quiz/result` (production)
**Priority:** Critical
**Preconditions:** Clean state. Production build: `npm run build && npm start`.
**Mapped Tasks:** Task 3

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | In a fresh tab, clear localStorage | `etha.quiz.state.v1` is absent |
| 2 | Navigate directly to `http://localhost:3000/quiz/result` | URL changes to `/quiz` within 100ms; intro screen renders |
| 3 | Repeat in development mode | Result page renders with mock Vata data (dev-mode branch preserved) |

### TS-004: Arial fallback eliminated
**Priority:** Medium
**Preconditions:** None.
**Mapped Tasks:** Task 4

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | `grep -rn "Arial" app/src/` | Zero matches |
| 2 | Open `/quiz/result` with Brandon font blocked (DevTools > Network > block `*brandon*`) | Labels render in Plantin (inherited), not Arial Narrow |

### TS-005: QuizSent viewport on mobile Safari
**Priority:** Medium
**Preconditions:** Mobile Safari emulation 390×844.
**Mapped Tasks:** Task 4

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/quiz/sent` | No visible gap between content and address bar; layout fills dynamic viewport |

### TS-006: Critique re-audit
**Priority:** Critical
**Preconditions:** All Tasks 1–4 complete. Dev server running.
**Mapped Tasks:** Task 5

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Run `/critique http://localhost:3000/quiz http://localhost:3000/quiz/body http://localhost:3000/quiz/completion http://localhost:3000/quiz/gate http://localhost:3000/quiz/sent http://localhost:3000/quiz/result` | Report saved to `UX_findings/post-hardening-audit/critique-report.md` |
| 2 | Inspect Nielsen total | ≥ 33/40 |
| 3 | Verify "Verified Fixes" table | All 5 items from this plan show ✅ FIXED |

## Progress Tracking

- [x] Task 1: Answer re-select window during 180ms auto-advance
- [x] Task 2: Completion screen timing + copy + tap-to-advance hint
- [x] Task 3: Route guard on `/quiz/result` in production
- [x] Task 4: Polish — Arial fallback, min-h-dvh, cream/32 typo
- [x] Task 5: Re-audit via `/critique` and confirm ≥ 33/40

**Total Tasks:** 5 | **Completed:** 5 | **Remaining:** 0

## Implementation Tasks

### Task 1: Answer re-select window during 180ms auto-advance

**Objective:** Allow a user to tap a different answer during the 180ms auto-advance window. The second tap wins.
**Dependencies:** None
**Mapped Scenarios:** TS-001

**Files:**
- Modify: `app/src/components/quiz/QuizBody.tsx`

**Key Decisions / Notes:**
- Three button handlers need relaxed guards:
  - `OptionRow` — line 773: `onClick={() => chosen === null && onPick(opt.id)}` → `onClick={() => onPick(opt.id)}` and `tabIndex={chosen !== null ? -1 : 0}` → `tabIndex={0}`
  - `VisualCard` — line 861: same pattern
  - `ScaleNode` — line 949: same pattern (applies to scale questions where scales use single-pick among 3 nodes)
- `handlePick` at line 1705 currently blocks re-pick: `if (chosen || advancingRef.current) return;` — change to `if (advancingRef.current) return;`
- Add a `pickTimeoutRef = useRef<number | null>(null)` to QuizBody's main component.
- In `handlePick`: clear any existing `pickTimeoutRef.current` before starting a new one, then assign the new timeout id.
- In `advance` (existing fn) and in component unmount: clear `pickTimeoutRef.current` to prevent stale fires.
- Do NOT change the 180ms interval. Do NOT change `recordAnswer` semantics — verify by reading `QuizDataProvider.tsx` that `recordAnswer(stepIdx, id)` is overwrite-safe (it should be a keyed update).
- Performance note: re-pick replays the chime. This is acceptable (short overlap, quizSounds is Web Audio and overwrites) — do not add debouncing.

**Definition of Done:**
- [ ] All three button onClick handlers allow re-pick before advance
- [ ] `handlePick` does not short-circuit on `chosen` truthy
- [ ] `pickTimeoutRef` captures setTimeout id, cleared before each new pick and on unmount
- [ ] TS-001 passes end-to-end in browser
- [ ] No diagnostics errors (`npm run lint` clean on this file)

**Verify:**
- Browser: `http://localhost:3000/quiz` → begin → Q1, rapid A→B tap → confirm B advanced
- `localStorage` inspection after re-pick: `answers[0].value === 'b'`

---

### Task 2: Completion screen timing + copy + tap-to-advance hint

**Objective:** Give users sufficient read time at the emotional peak and correct the question count copy.
**Dependencies:** None
**Mapped Scenarios:** TS-002

**Files:**
- Modify: `app/src/components/quiz/QuizCompletion.tsx`

**Key Decisions / Notes:**
- Line 15: `const delay = prefersReduced ? 10 : 3000;` → `const delay = prefersReduced ? 10 : 5500;`
- Line 48: `"Forty-three answers. Three layers."` → `"Forty-five answers. Three layers."`
- Add a tap-to-advance hint element below the last copy line — uppercase Brandon, low opacity, fades in at `delay: 3.5` (after last copy line lands at 1.2s):
  ```tsx
  <p
    ref={hintRef}
    className="font-label text-cream mt-8"
    style={{ opacity: 0, fontSize: 10, letterSpacing: "0.28em", color: "rgba(255,239,222,0.5)" }}
  >
    TAP TO CONTINUE
  </p>
  ```
  Animate with `gsap.to(hintRef.current, { opacity: 1, duration: 0.8, delay: 3.5 })`.
- Under reduced motion: skip the hint entirely (existing pattern) — user gets the 10ms fast-exit anyway.

**Definition of Done:**
- [ ] `delay` constant = 5500 (non-reduced) / 10 (reduced)
- [ ] First body line reads "Forty-five answers"
- [ ] "TAP TO CONTINUE" hint fades in at 3.5s
- [ ] Tap on container still advances immediately (existing `onClick={onAdvance}`)
- [ ] TS-002 passes

**Verify:**
- Browser: stopwatch from completion mount to auto-advance → ≥5s
- `grep "Forty-three" app/src/` → zero matches

---

### Task 3: Route guard on `/quiz/result` in production

**Objective:** Direct navigation to `/quiz/result` without completed state redirects to `/quiz` in production. Preserve dev-mode mock fallback.
**Dependencies:** None
**Mapped Scenarios:** TS-003

**Files:**
- Modify: `app/src/app/quiz/result/page.tsx`

**Key Decisions / Notes:**
- Current behaviour (line 155): if no `result` and NOT in dev, renders "NOTHING TO SHOW YET / Finish the quiz first." screen with a manual BEGIN link.
- Change: in production, redirect to `/quiz` instead of rendering the fallback screen.
- Implementation: add `useEffect` near top of component (after `router` is declared):
  ```tsx
  useEffect(() => {
    if (!result && process.env.NODE_ENV !== "development") {
      router.replace("/quiz");
    }
  }, [result, router]);
  ```
- Keep the existing fallback JSX at line 155 as a dev-only safety net (should never actually render in production because of the redirect effect, but harmless to keep).
- Do NOT touch `primaryDosha` / `devDosha` derivation — existing dev toolbar flow continues to work because the redirect only fires when `!result` AND not dev.

**Definition of Done:**
- [ ] `useEffect` with `router.replace("/quiz")` added in result page
- [ ] Production build test: `npm run build && npm start`, clear localStorage, visit `/quiz/result` → redirects to `/quiz`
- [ ] Development: same URL still renders mock Vata result (dev toolbar preserved)
- [ ] TS-003 passes

**Verify:**
- `npm run build && npm start` (terminal 2)
- Browser: DevTools Application → Local Storage → delete `etha.quiz.state.v1`
- Navigate to `http://localhost:3000/quiz/result` → URL changes to `/quiz`

---

### Task 4: Polish — Arial fallback, min-h-dvh, cream/32 typo

**Objective:** Three small correctness fixes that don't merit individual tasks.
**Dependencies:** None
**Mapped Scenarios:** TS-004, TS-005

**Files:**
- Modify: `app/src/app/quiz/result/page.tsx` (line 617)
- Modify: `app/src/components/quiz/QuizSent.tsx` (line 74)
- Modify: `app/src/components/quiz/QuizBody.tsx` (line 1417)

**Key Decisions / Notes:**
- `result/page.tsx:617`:
  - Before: `fontFamily: 'var(--font-brandon, "Arial Narrow", Arial, sans-serif)'`
  - After: `fontFamily: 'var(--font-brandon)'`
  - If Brandon fails, parent `font-serif` (Plantin) inherits — still on-brand.
- `QuizSent.tsx:74`:
  - Before: `className="relative min-h-screen flex items-center justify-center overflow-hidden"`
  - After: `className="relative min-h-dvh flex items-center justify-center overflow-hidden"`
- `QuizBody.tsx:1417`:
  - Before: `<p className="font-label text-[9px] text-cream/32 mb-5">`
  - After: `<p className="font-label text-[9px] text-cream/30 mb-5">`
  - (`/32` is not a defined opacity modifier in Tailwind v4 core; `/30` is. Visual diff: ~2% opacity change, imperceptible.)

**Definition of Done:**
- [ ] `grep -rn "Arial" app/src/` → zero matches in TSX files
- [ ] `grep -rn "min-h-screen" app/src/` → zero matches (or only in non-quiz files — `min-h-dvh` everywhere in quiz)
- [ ] `grep -rn "text-cream/32" app/src/` → zero matches
- [ ] TS-004 passes, TS-005 passes
- [ ] No diagnostics errors

**Verify:**
- `grep -rn "Arial\|min-h-screen\|text-cream/32" app/src/` → expected zero matches in quiz files

---

### Task 5: Re-audit via `/critique` and confirm ≥ 33/40

**Objective:** Verify the 4 implementation tasks hit the audit target. This task is the exit criterion for the plan.
**Dependencies:** Tasks 1–4
**Mapped Scenarios:** TS-006

**Files:**
- Create: `UX_findings/post-hardening-audit/critique-report.md` (generated by `/critique`)

**Key Decisions / Notes:**

**⛔ This task is a VERIFICATION step — the implementer does not write the report manually. It is the output of invoking `/critique` as a Claude Code skill.**

**How the implementing agent MUST invoke `/critique`:**

1. **Before invoking:** ensure dev server is running.
   ```bash
   cd app && npm run dev  # terminal 2, leave running
   ```

2. **Before invoking:** clear prior quiz state.
   ```javascript
   // In browser DevTools console on http://localhost:3000
   localStorage.removeItem('etha.quiz.state.v1')
   ```

3. **Invoke the critique skill** via the Skill tool — do NOT invoke `/critique` as a bash command, and do NOT spawn an Agent to "do a critique." Use the native Skill invocation:
   ```
   Skill(
     skill="critique",
     args="http://localhost:3000/quiz http://localhost:3000/quiz/body http://localhost:3000/quiz/completion http://localhost:3000/quiz/gate http://localhost:3000/quiz/sent http://localhost:3000/quiz/result"
   )
   ```

4. **The critique skill will:**
   - Run Assessment A (LLM design review) and Assessment B (automated detection) in parallel sub-agents
   - Synthesise both into a combined critique report
   - Ask targeted follow-up questions
   - Save the report to the path specified in the args

5. **Override the save path** in the critique invocation by specifying the target file at the end of the args string:
   ```
   args="http://localhost:3000/quiz ... http://localhost:3000/quiz/result Save output to: UX_findings/post-hardening-audit/critique-report.md"
   ```
   (The critique skill accepts freeform save-path instructions as part of args.)

6. **Do NOT invoke `/polish` as the exit command** — `/polish` is a design skill for final UI refinement (opacity tuning, spacing corrections, micro-typography). It is NOT a verification tool. The exit command for this plan is `/critique`. After `/critique` returns a ≥ 33/40 score, the plan is complete.

7. **If `/critique` scores below 33/40:**
   - Read the priority issues in the new report
   - Map each to a command from: `/harden` (interaction + route issues), `/polish` (copy + micro-UI), `/clarify` (ambiguous copy), `/layout` (spacing + grid), `/typeset` (type scale)
   - Do NOT re-run `/critique` until at least one `/harden` or `/polish` pass has been completed on the flagged issues
   - After the fix pass, re-run `/critique` exactly as in step 3 to check the delta

**Definition of Done:**
- [ ] `/critique` skill invoked with all 6 live routes (skip `/quiz/reveal` — it's an interstitial inside result)
- [ ] Report file exists at `UX_findings/post-hardening-audit/critique-report.md`
- [ ] Nielsen total ≥ 33/40
- [ ] "Verified Fixes" table in the new report shows all 4 items from Tasks 1–4 as ✅ FIXED
- [ ] TS-006 passes

**Verify:**
- `ls -la UX_findings/post-hardening-audit/critique-report.md` → file exists, recent timestamp
- `grep "Total.*\*\*\(3[3-9]\|40\)/40\*\*" UX_findings/post-hardening-audit/critique-report.md` → match

---

## Autonomous Decisions

- **No worktree / no new branch.** User has existing uncommitted quiz work from the ship-ready sprint; branching would fragment changes. This is a 5-fix patch pack layered on top. If user wants to isolate, they can `git stash` before `/spec-implement`.
- **Skipped Batch 1 and Batch 2 questions.** The critique already resolved all priority, scope, and design decisions. Asking again would be noise.
- **Kept the 180ms auto-advance unchanged.** Task 1 modifies *what happens during* the 180ms window, not the window itself. Interval is intentional per prior admin decision.
- **Route guard only on `/quiz/result`.** Audit flagged `/quiz/body` too, but reading the file confirms a guard already exists at `body/page.tsx:11`. No-op for that route.
- **Exit command is `/critique`, not `/polish`.** `/polish` is a fix command; it would be the *input* to an audit pass, not the output. Using `/critique` as the gate ensures the plan is measured against the same yardstick that produced the 24/40 and 30/40 baselines.

## Agent Invocation Guide (Summary)

For the agent running `/spec-implement` on this plan:

| Task | Primary tool | Exit command |
|------|--------------|--------------|
| 1 — Re-select window | Edit | visual QA in browser |
| 2 — Completion timing | Edit | visual QA in browser |
| 3 — Route guard | Edit | `npm run build && npm start` smoke test |
| 4 — Polish | Edit | `grep` verification |
| 5 — Re-audit | `Skill(skill="critique", args="...")` | score ≥ 33/40 |

**Do NOT** spawn a fresh agent or `Task(subagent_type="general-purpose")` to "run the audit." The `/critique` skill already orchestrates two parallel sub-agents internally.

**Do NOT** invoke `/polish` as part of this plan — `/polish` is reserved for UI micro-refinements discovered DURING a future audit, not as a verification step.

## Open Questions

None. All design decisions resolved in the 2026-04-23 post-ship critique.
