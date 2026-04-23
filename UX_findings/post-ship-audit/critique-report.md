# Quiz Critique Report — Post-Ship Audit

**Date:** 2026-04-23
**Scope:** `/quiz`, `/quiz/body`, `/quiz/completion`, `/quiz/reveal`, `/quiz/gate`, `/quiz/sent`, `/quiz/result`
**Method:** LLM design review (source read) + automated 25-pattern grep scan
**Prior baseline:** 24/40 (full source audit, 2026-04-23 morning)
**Target:** 33–34/40

---

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Progress arc + layer milestones + interstitials are solid. Still no numeric "Q12 of 45" readout (intentional). |
| 2 | Match System / Real World | 4 | Language is Ayurvedic but always grounded in lived experience. Pole labels concrete, not abstract. |
| 3 | User Control and Freedom | 3 | Back button, Escape→onCancel (P0 FIXED), resume modal — major improvement. Deduction: once answer committed, no re-select before auto-advance. |
| 4 | Consistency and Standards | 3 | Plantin + Brandon UPPERCASE consistently applied. Minor: QuizCompletion uses Tailwind responsive classes (`text-3xl md:text-4xl`) while all other screens use `clamp()`. |
| 5 | Error Prevention | 3 | Email gate: `disabled` on invalid state, double-submit guard, `maxLength=254`, `.trim()`. Deduction: aria-live error region emits empty string on mount. |
| 6 | Recognition Rather than Recall | 3 | Per-question images, layer landmark screens, visible pole labels. Deduction: open-text CONTINUE invisible until first keystroke — users can't discover action without accidentally triggering it. |
| 7 | Flexibility and Efficiency | 3 | Keyboard nav (Escape/ArrowLeft), tap-to-advance on completion + sent, dev toolbar. Deduction: no Enter-to-advance on choice questions for desktop users. |
| 8 | Aesthetic and Minimalist Design | 4 | Genuinely excellent. Single-question focus, per-option organic auras, atmospheric ripple bg at 4–22% opacity. Nothing extraneous on result page. |
| 9 | Error Recovery | 2 | Inline email errors readable and on-brand. Deduction: network failure offers no categorised explanation ("network down" vs "email taken") and no explicit retry affordance — just the button re-enabling itself. |
| 10 | Help and Documentation | 2 | Privacy reassurance present. No explanation of what Doshas are before questions begin — deliberate mystique, but penalises first-timers. |
| **Total** | | **30/40** | **Good — strong craft, structural gaps closing** |

**Delta vs baseline:** +6 points. The P0 Escape fix, back button, resume modal, and email validation improvements account for the gains. H3 jumped 2→3, H7 jumped 1→3. H9 and H10 unchanged.

---

## Anti-Patterns Verdict

### LLM assessment — **NOT AI slop.**

This did not regress. Bespoke GSAP pipelines, nature-easing vocabulary (AIR/FIRE/WATER/EARTH elements), per-option organic aura SVGs with distinct character (open Vata path, clean Pitta oval, Kapha double-hump), 14-ring water-ripple intro, reduced-motion branches throughout. The `applyPos` imperative slider (no React re-renders during drag) is rare competence. Copy remains the single strongest asset — "Not posing. Just passing by. The mirror." is not AI-generated output.

### Deterministic scan — **clean with 1 live violation.**

| Pattern | Count | Notes |
|---------|-------|-------|
| `border-left/right` side-stripe | 0 | Clean |
| Gradient text (`background-clip: text`) | 0 | Clean |
| Dark glow box-shadow | 0 | Clean |
| Pure black text / `#000` | 0 | Clean |
| Pure white / `#fff` | 0 | Clean |
| `border-radius` / `rounded` | 0 | Two comment-only hits — no real violations |
| `console.log/warn/error` | 0 | Clean |
| `TODO / FIXME / HACK` | 0 | Clean |
| Generic fonts (primary role) | **1** | `result/page.tsx:617` — Arial fallback in Brandon CSS var chain — **LIVE VIOLATION** |
| Em dashes `—` in copy | 0 | Comment-only hits — no copy violations |
| `gradient` in classNames | 0 | One `<radialGradient>` SVG element — false positive |
| `text-transparent / bg-clip-text` | 0 | Clean |
| `backdrop-filter: blur` | 1 | `quiz/layout.tsx:17–18` — ResumeModal only — **justified exception** |

**P0 bug `onSuccess("")`:** Confirmed ABSENT. Fix is live.

---

## Overall Impression

The quiz is in the best shape it has been. The Escape fix, back button, and email validation close the three most trust-damaging gaps from the prior audit. At 30/40, the remaining 3-4 points are within reach — they require one copy fix ("Forty-three answers" vs. 45 actual questions), one interaction fix (answer re-selection window), and harder route guards for orphan deep-links. The emotional arc from completion through sent is the strongest new addition: "You listened." lands exactly right.

---

## What's Working

1. **P0 Escape fix — complete accessibility modal pattern.** Focus trap, `aria-modal`, auto-focus at 900ms, `onCancel?.()` optional-chain safety, correct dependency array — this is a textbook accessible modal implementation, not a one-line patch.

2. **Imperative slider + 60 fps live-highlight.** `applyPos` updates SVG attributes and pole opacity directly (no React state), `pointerCapture` handles drag-out-of-bounds. On scale-3, the middle pole fades to max when cursor is centred, dims at extremes. This gives the user real-time bucket feedback without a single re-render.

3. **Completion → Sent emotional arc.** QuizCompletion's staggered reveal culminates in QuizSent's three-line sequence with "You listened." at 2.1s delay, 8-second hold, tap-to-skip. The aura breathing at `strokeOpacity: 0.06` remains atmospheric. Both screens respect `prefers-reduced-motion`. Strong peak-end execution.

---

## Priority Issues

### [P1] Answer committed with no re-select window
- **File:** `QuizBody.tsx:773` — `onClick={() => chosen === null && onPick(opt.id)}` and `tabIndex={chosen !== null ? -1 : 0}`
- **Why:** Once an answer is tapped, buttons lock immediately. The 0.8s auto-advance means a mis-tap on a single-select question cannot be corrected without back-navigating and losing the step. On 390px mobile, adjacent answer cards are close enough that mis-taps are not edge cases.
- **Fix:** Allow re-selection (replace `chosen === null &&` guard with a comparison — `onPick(opt.id)` regardless of prior pick) until the CONTINUE fires. Lock only when advancing.
- **Command:** `/harden`

### [P1] QuizCompletion 3-second auto-advance too fast
- **File:** `QuizCompletion.tsx:15` — `const delay = prefersReduced ? 10 : 3000`
- **Why:** Four staggered copy lines resolve at ~1.2s. The user has ~1.8s to read and absorb the emotional beat — "Your rhythm has been heard." "Forty-three answers. One pattern." — before the screen disappears. Slow readers and interrupted users (Casey) will be yanked mid-read.
- **Fix:** Increase to 5000–6000ms. Add a visible tap-to-advance affordance (pulsing aura or subtle "tap to continue" label) so users who are paying attention can skip early.
- **Command:** `/harden`

### [P1] "Forty-three answers" copy contradicts 45-question engine
- **File:** `QuizCompletion.tsx:48` — copy reads `"Forty-three answers. One pattern."`
- **Why:** The quiz ships 45 questions (Body 15 + Mind 13 + Spirit 17 per v4 docx). This line is factually wrong and will be noticed by any user who counted along (Riley P0, Joana at the end of her patience).
- **Fix:** Change to `"Forty-five answers. One pattern."` — single character change, no layout impact.
- **Command:** `/polish`

### [P2] Route guards missing on `/quiz/body` and `/quiz/result`
- **File:** `quiz/layout.tsx` (no hard redirect), `quiz/result/page.tsx:155` (dev mock guard only)
- **Why:** Direct navigation to `/quiz/body` bypasses intro entirely and renders Q1 without entitlement. `/quiz/result` with no state gets mock Vata data in development — in production it shows a blank result or fallback message rather than a redirect. Riley's Test #2 from the prior persona walk still fails.
- **Fix:** In `/quiz/body/page.tsx`, add `if (!hasQuizState()) { router.replace("/quiz"); return null; }` at top of `useEffect`. In `result/page.tsx`, replace the `NODE_ENV` dev-mock initialisation with a hard `router.replace("/quiz")` when state is absent in production.
- **Command:** `/harden`

### [P3] Arial fallback still live in result page
- **File:** `result/page.tsx:617` — `fontFamily: 'var(--font-brandon, "Arial Narrow", Arial, sans-serif)'`
- **Why:** If Brandon Grotesque fails to load (CDN miss, ad blocker, slow 3G), the label renders in Arial. On a brand surface this important, a fallback that screams "browser default" is visible.
- **Fix:** Change to `fontFamily: 'var(--font-brandon)'` — if the font fails, inherit from the parent (which will use Plantin, still on-brand) rather than falling through to Arial.
- **Command:** `/polish`

---

## Persona Red Flags

### Joana (early-30s mobile, wellness-skeptic, 5-sec attention)

- **Mis-tap → locked.** Joana taps "The mountain" on a visual question when she meant "The stream." The button locks on tap, 0.8s CONTINUE fires, she's past the question with no undo. Damage: wrong dosha weighting with no recovery path except back-navigation.
- **"Forty-three answers"** copy on completion screen will feel off — she did 45 questions and the quiz is celebrating the wrong number.
- **"Where should we send your report?"** copy on email gate is transactional register after 44 emotionally resonant questions. The brand voice earned trust for 15 minutes then dropped to generic email-capture phrasing. She notices the shift.

### Casey (distracted mobile, interrupted mid-quiz)

- **Resume modal works** — `hasQuizState()` check at `/quiz` with "Continue" and "Start over" — Casey gets back in correctly. ✓
- **Completion screen yanks at 3s.** Casey checks Messages at Q43, returns to quiz, taps through completion — the emotional beat at 3 seconds is gone before she finishes reading the second line.
- **Open-text CONTINUE is invisible** until she types. On a distracted thumb-tap flow, she'll tap the visible aura decoration and nothing happens. She may think the quiz froze.

### Riley (deliberate stress tester)

- **Direct `/quiz/body` deep-link** still renders without a redirect. Test #2 from the prior persona walk still fails.
- **"Forty-three answers"** on the completion screen — Riley counted 45 questions (or at least noted the v4 docx says 45). She files this as a data-integrity issue.
- **The result animation depends on `devDosha` not `primaryDosha`** when result is null on first render — in a fresh tab, the Vata aura may animate briefly before the actual dosha loads. Riley will see this flash on throttled CPU (Test #10).

---

## Minor Observations

- `QuizSent` uses `min-h-screen` (line ~74) while every other quiz screen uses `min-h-dvh` — on mobile Safari with address bar visible, Sent has a visible gap at the bottom.
- `QuizCompletion` uses Tailwind responsive breakpoints (`text-3xl md:text-4xl lg:text-5xl`) while all other quiz screens use `clamp()`. Mixing sizing conventions means small changes to one screen's type scale won't propagate correctly to Completion.
- The bonus textarea label uses `text-cream/32` — `/32` opacity is not a defined Tailwind v4 token in globals.css. May silently produce no opacity modifier.
- `QuizIntro` GateScreen splits headline at `Math.ceil(words.length / 2)` — produces a "5 words / 4 words" break that may not land on the natural phrase break. At 6.5rem Plantin this is visible on 390px viewport.
- Legal stubs (`/legal/terms`, `/legal/privacy`) exist — confirm they have real copy before launch. Placeholder legal pages are a compliance risk.

---

## Questions to Consider

1. The email gate copy ("Where should we send your report?") is the only transactional-register moment in an otherwise poetic 45-question experience. Should it sound more like the quiz voice — e.g., "Leave the address where we should send this." — even if less clear?
2. The visual triangle is 2-up on mobile (A+B top / C centred at 62% width). The prior critique flagged this as a Kapha bias because C sits alone in the thumb sweet spot. The new implementation preserves the mobile triangle — is this intentional, or should mobile go 3-up stacked vertically?
3. At 30/40, the remaining 3-4 points are H3 (answer undo) + H9 (error recovery) + H10 (documentation). Which is worth the implementation effort before launch?

---

## Score Delta & Trend

| Date | Score | Band | Notes |
|------|-------|------|-------|
| 2026-04-22 | 20/40 | Low-moderate | Joana persona walk |
| 2026-04-23 morning | 24/40 | Moderate | Full source read + admin decisions |
| 2026-04-23 evening | **30/40** | **Good** | P0 Escape fix, back button, email validation, resume modal, scale-3 live-highlight, completion + sent screens |

**Projected trajectory:**
- After answer re-select window + completion timing fix + copy "forty-five" → 32/40
- After `/quiz/body` route guard + error recovery naming → 33–34/40
- H10 (help/documentation) requires intro copy explaining Doshas — deferred, would add 1–2 points

---

## Verified Fixes from Prior Audit

| Prior Finding | Status |
|---------------|--------|
| **P0** Escape silent-send on email gate | ✅ FIXED — `onCancel` wired, `onSuccess("")` eliminated |
| **P1** State persistence written but never read | ✅ FIXED — `hasQuizState()` read on mount with resume modal |
| **P1** Visual triangle biases C as "lesser" | ✅ FIXED — 3-col proportional grid on sm+; mobile keeps triangle (intentional per assessment) |
| **P2** Scale-3 bucket boundaries invisible during drag | ✅ FIXED — `applyPos` imperatively updates pole opacity during drag |
| **P1** Back button absent | ✅ FIXED — `QuizBackButton.tsx` with 44pt target, disabled at step 0 |
| **INFO** Auto-advance 180ms | ✅ UNCHANGED — intentional, as decided |
| **P3** Arial fallback in result page | ⚠️ STILL PRESENT — `result/page.tsx:617` |
