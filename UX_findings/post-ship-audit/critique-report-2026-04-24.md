# ETHA Quiz — Post-Round-2 Critique Report

**Date:** 2026-04-24
**Scope:** /quiz · /quiz/body · /quiz/completion · /quiz/gate · /quiz/sent · /quiz/result
**Baseline:** Post-hardening critique (2026-04-23) — 33/40
**Method:** LLM design review (source read) + automated pattern scan (15 files, manual analysis — `npx impeccable` CLI not installed)

---

## Assessment Notes

**Assessment A** found an existing audit file (`UX_findings/post-ship-audit/2026-04-23-llm-quiz-ui-audit.md`) from before Round 2 fixes and returned stale findings. P1 (/quiz/sent dead end), P2 (bubble chart timing), and P3 (firstName field) from that file are all **✅ RESOLVED**. Scores below reflect current code state.

**Assessment B** ran manual pattern analysis across all 15 quiz files. 0 absolute ban violations. Key false positives: `#fde68a` and `font-mono` are both inside `NODE_ENV === "development"` render guards — not shipped. `DEV_JUMPS` constant is computed at module scope but only rendered under the NODE_ENV check at line 1803.

---

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Progress dots + step counter solid. Interstitials give no countdown — user has no signal that screen will auto-advance |
| 2 | Match System / Real World | 4 | Copy quality is exceptional throughout the full updated flow. "Your map is travelling." lands at exactly the right emotional register |
| 3 | User Control and Freedom | 4 | ✅ Gate dead end resolved. Back button works. Answer re-select works. Remaining gap: open-text/scale SKIP affordance is faint |
| 4 | Consistency and Standards | 4 | Tight system throughout. `strokeDashoffset` on aura paths is a deferred brand-rule decision (owner choice) |
| 5 | Error Prevention | 3 | ✅ firstName removed. Route guard in place. Interstitials auto-advance at 4.5s — 40–50 word copy blocks need ~10s to read at 250 wpm. Users commit to next screen mid-read |
| 6 | Recognition Rather Than Recall | 3 | All choices are visible and self-explanatory. SKIP label exists but low visual weight on scale questions |
| 7 | Flexibility and Efficiency | 2 | Linear by design (appropriate for Joana). No keyboard shortcuts. Open-text SKIP affordance weak for first-timers |
| 8 | Aesthetic and Minimalist Design | 4 | ✅ Bubble chart timing fixed. No AI slop. Aura system is genuinely distinctive. QuizEmailGate inline sent panel is clean and warm |
| 9 | Error Recovery | 3 | Route guard prevents empty result. Email error message clear. No back-to-previous-question (acceptable for this format) |
| 10 | Help and Documentation | 3 | Interstitials provide rich contextual guidance mid-flow. Sent panel copy is reassuring. SKIP not obviously discoverable |
| **Total** | | **33/40** | **Solid — Round 2 improvements absorbed into calibrated baseline. Two open issues block 35/40** |

> Note: Previous table (post-hardening) had an arithmetic error (individual scores summed to 31, reported as 33). Current table genuinely sums to 33. Net improvement from Round 2 is +2 points on true prior baseline.

---

## Anti-Patterns Verdict

**Not AI slop.** Bespoke aura SVG geometry, oblique copy ("Something rare has been assembled here, a map that belongs only to you"), the organic scale slider — all genuinely distinctive. QuizEmailGate's inline sent confirmation with dosha-accent headlines is a standout moment. Bubble chart on result page is the only element that reads slightly dashboard-y, and its timing is now fixed.

**Deterministic scan:** 0 absolute ban violations. The two medium findings that survive false-positive review:
- `strokeDashoffset` on 11 aura path instances across QuizBody, QuizInterstitial, QuizCTAButton, AuraDivider — brand rule violation per `.claude/rules/aura-svg.md`. This is a deferred owner decision.
- Missing `type="button"` on 13 `<button>` elements across 8 files — low risk but worth a sweep.

---

## Overall Impression

The quiz is emotionally coherent and visually distinctive. Round 2 fixes closed the three biggest UX gaps. What remains is a copy-pacing mismatch (the most beautifully written interstitials in the flow are the ones most likely to get skipped) and a SKIP affordance gap on scale/open questions. Fix those two and the quiz is genuinely shipworthy.

---

## What's Working

**1. QuizEmailGate inline success flow** — The new dosha-accent headline + 7.5s auto-advance is exactly right. Joana gets her "your map is on its way" moment at peak intent, inside the same visual context, without a route change. Emotionally the strongest screen in the flow.

**2. Interstitial copy quality** — "Your body has said what it needed to say. Now we go somewhere less visible." is genuinely beautiful writing. The slow-draw aura + morph animation gives it the space it deserves. The problem is purely mechanical timing, not design intent.

**3. Answer re-select + sound** — Chime + 180ms window before advance lets Joana feel heard, not railroaded. Zero mechanical friction on the primary action.

---

## Priority Issues

### [P1] Interstitial auto-advance too fast for copy length
**What:** `QuizInterstitial` defaults to 4500ms. Copy fades in at ~1.95s (0.55s delay + 1.4s duration), leaving ~2.55s of visible read time. TRANSITION_COPY averages 45 words. At 250 wpm that needs ~11s.
**Why it matters:** Joana is at a pivotal emotional moment (layer transition). If she's mid-sentence when the screen advances, the emotional reframe doesn't land. The writing earns the pause — the timing doesn't give it.
**Fix:** `autoHoldMs` → 7500ms. Copy fully lands at 1.95s, leaving ~5.5s to read 45 words comfortably. The default prop is in `QuizInterstitial.tsx:20`. All three callers use the default — one line change.
**Command:** `/polish`

---

### [P2] SKIP affordance on scale and open-text questions
**What:** SKIP exists but is visually faint — users who don't know a question isn't required will either guess or abandon. Highest abandon risk in the flow.
**Why it matters:** For Joana on mobile with one thumb, a barely-visible label isn't a real affordance. She'll mis-tap or scroll past.
**Fix:** Increase SKIP label opacity and bump font size by 1–2px. Or add a subtle separator above it. Not a redesign — 3 lines of CSS.
**Command:** `/polish`

---

### [P3] `strokeDashoffset` on aura paths — owner decision needed
**What:** 11 instances across QuizBody, QuizInterstitial, QuizCTAButton, AuraDivider use path-draw animation (`strokeDashoffset` → 0). Brand rules in `.claude/rules/aura-svg.md` forbid it.
**Why it matters:** The path-draw is one of the most distinctive micro-interactions in the quiz. If it's a brand violation, it needs to be removed or the rule needs a quiz exception.
**Fix:** Owner decision. Either (a) remove path-draw animations and replace with opacity reveals, or (b) add "quiz animation exception" to the brand rules. This is not a bug — it's a policy question.
**Command:** n/a (owner decision)

---

### [P4] Missing `type="button"` on 13 buttons
**What:** All quiz `<button>` elements lack explicit `type="button"`. In a form context, a button without type defaults to `type="submit"` and can trigger unexpected form submission.
**Why it matters:** Low risk (quiz uses no `<form>` elements currently), but defensive hygiene. If a form wrapper is added later, these become silent bugs.
**Fix:** Add `type="button"` to all interactive buttons. One sweep across 8 files.
**Command:** `/harden`

---

## Persona Red Flags

**Joana (target user — exhausted, mobile, 5-second attention):**
- Hits TRANSITION_COPY at layer 2: "Your body has said what it needed to say. Now we go somewhere less visible. The place where your thoughts live before they become words..." — 44 words. Screen auto-advances at 4.5s. She has read ~12 words. She misses the reframe entirely.
- Arrives at a scale question for the first time. Sees the slider. SKIP is in the copy area below in small text. She doesn't know she can skip. She guesses.
- Submits email. Sent confirmation fades in with dosha-accent headline. Beautiful. 7.5s timer. She reads "Your map is travelling." She taps. Advances to result. **Peak-end rule: this ends well.** ✅

**First-time Ayurveda user:**
- Interstitial introduces "Dosha" without definition during the quiz. Copy says "your Dosha lives most completely" — first time the word appears in context. By this point (layer 3) they're invested enough that the mystery is earned, not confusing. Low risk.
- SKIP label on open-text: if they genuinely don't know the answer, no clear permission to proceed. May type "n/a" or abandon.

---

## Minor Observations

- `QuizSent.tsx` (`/quiz/sent`) is now only reachable via stale direct navigation or the route guard redirect to `/quiz`. The TAP TO CONTINUE hint is still present but users in the normal flow will never see it. Consider stripping the hint to avoid dead code, or accept it as harmless.
- GSAP cleanup in result sub-components (`AcademyBridge`, `RitualSection`, etc.) uses `.kill()` directly rather than `gsap.context().revert()`. No current symptom, but will leak animations if components unmount during a transition. Low priority.
- `QuizBody.tsx` is 1,832 lines. No functional issue now, but a single file with 6 question renderers, a state machine, and a dev panel will be painful to extend. Acceptable tech debt for current scope.

---

## Questions to Consider

- "The interstitial writing is some of the best copy in the flow. At 4.5s, is anyone actually reading it? Or is it decoration?"
- "The `strokeDashoffset` path-draw is one of the most distinctive micro-interactions. Is the brand rule catching something real here, or was it written for a different context?"
- "QuizSent still exists as a route. When you next touch the quiz, is it worth cleaning up or does keeping it cost nothing?"

---

## Resolved from Previous Reports

| Issue | Status |
|-------|--------|
| P0 Debug overlay in production | ✅ FALSE POSITIVE — both overlays are `NODE_ENV === "development"` gated |
| P1 /quiz/sent dead end | ✅ RESOLVED — QuizEmailGate handles success inline |
| P2 Bubble chart before emotional copy | ✅ RESOLVED — startDelay 2.45 → 3.5 |
| P3 firstName friction + silent validation | ✅ RESOLVED — field removed entirely |
| min-h-screen on mobile | ✅ RESOLVED — min-h-dvh |
| Arial fallback in font stack | ✅ RESOLVED — removed |
| Answer re-select blocked | ✅ RESOLVED — pickTimeoutRef pattern |
| Empty result page in production | ✅ RESOLVED — route guard added |

---

## Recommended Next Actions

1. **`/polish`** — Interstitial `autoHoldMs` 4500 → 7500 in `QuizInterstitial.tsx:20`. One line. High impact.
2. **`/polish`** — SKIP affordance: increase opacity + size on scale/open-text questions.
3. **`/harden`** — Add `type="button"` to all 13 buttons across 8 quiz files.
4. **Owner decision** — `strokeDashoffset` brand rule: exception for quiz animations or replace with opacity reveals.

Re-run `/critique` after fixes. Clear path to 35/40: fix P1 (interstitial timing, +1 to #5 Error Prevention) and P2 (SKIP affordance, +1 to #7 Flexibility).
