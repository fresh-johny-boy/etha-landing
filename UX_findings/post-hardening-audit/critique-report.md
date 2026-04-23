# ETHA Quiz — Post-Hardening Critique Report

**Date:** 2026-04-23
**Baseline:** 30/40 (post-ship audit)
**Routes audited:** `/quiz`, `/quiz/body`, `/quiz/completion`, `/quiz/gate`, `/quiz/sent`, `/quiz/result`
**Method:** Independent LLM design review (Assessment A) + automated CLI + browser detection (Assessment B), synthesised.

---

## Verified Fixes

| Fix | Status | Evidence |
|-----|--------|----------|
| Answer re-select window during 180ms auto-advance | ✅ FIXED | `handlePick` no longer guards on `chosen`; `pickTimeoutRef` cancels prior timeout; all 3 button onClick handlers allow re-pick |
| Completion screen 3000 → 5500ms + TAP TO CONTINUE hint | ✅ FIXED | `delay = 5500`; hint fades in at 3.5s via GSAP |
| "Forty-three" → "Forty-five answers" copy | ✅ FIXED | `grep "Forty-three" app/src/` → zero matches |
| Route guard on `/quiz/result` in production | ✅ FIXED | `useEffect` with `router.replace("/quiz")` when `!result && NODE_ENV !== "development"` |
| Arial fallback, min-h-dvh, cream/32 → cream/30 | ✅ FIXED | `grep Arial app/src/` → zero matches; `QuizSent` uses `min-h-dvh`; bonus label uses `text-cream/30` |

---

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Progress bar solid; completion timing now adequate (5.5s); interstitial layer cards still auto-advance before copy fully reads |
| 2 | Match System / Real World | 3 | Copy is organic and brand-coherent; "Forty-five answers" now accurate; Dosha concepts introduced in context |
| 3 | User Control and Freedom | 3 | Re-select window fixed; route guard prevents empty result trap; `/quiz/sent` remains a dead end — no forward path at highest-intent moment |
| 4 | Consistency and Standards | 4 | Excellent. Brandon UPPERCASE throughout, 0px border-radius, Arial fallback removed, cream/30 correct opacity token, min-h-dvh on mobile |
| 5 | Error Prevention | 3 | Route guard hard-redirects stale result; re-select prevents mis-tap commits; first-name field in gate has silent validation (defined but not enforced on submit) |
| 6 | Recognition Rather Than Recall | 3 | Options fully visible at each step; progress through layers communicated; no reliance on cross-step memory |
| 7 | Flexibility and Efficiency | 2 | Intentionally linear (appropriate for Joana's context); no keyboard shortcuts or skip options; back button works. By-design constraint, not a defect |
| 8 | Aesthetic and Minimalist Design | 4 | Genuinely distinctive. No AI slop patterns detected. Every element earns its place. Arial removed, opacity tokens corrected, dvh fixed |
| 9 | Error Recovery | 3 | Hard redirect from empty result ✅; re-select within 180ms ✅; no broader undo path in quiz (acceptable for this format) |
| 10 | Help and Documentation | 3 | TAP TO CONTINUE hint now present at completion; quiz copy itself is warm and guiding throughout; SKIP affordance on open-text questions could be more legible |
| **Total** | | **33/40** | **Above average — ready for launch with known deferred items** |

---

## Anti-Patterns Verdict

**Does this look AI-generated? No.**

**LLM assessment (Assessment A):** The quiz does not read as AI-generated. The bespoke per-question aura SVG work, the oblique copy voice ("Your rhythm has been heard"), and the scale slider interaction are genuinely distinctive. The completion screen is a high point — aubergine full-screen, staggered Plantin lines, now with proper read time. The result page name reveal (blur-scale) is memorable. One near-miss: the bubble chart (60%/30%/10%) reads slightly clinical in isolation — the data aesthetics of health-tech that the brand opposes. It arrives before the emotional reframe copy lands, which compounds the issue.

**Deterministic scan (Assessment B):** CLI scan returned clean on the two hard-ban patterns (no border-left stripe, no gradient text). Two categories of real concern were caught that Assessment A did not specifically flag:

1. **Debug overlay rendering in production** — `QuizBody.tsx` lines ~1608–1829 and `QuizIntro.tsx` lines ~575–598 contain a developer jump/step bar with non-brand Tailwind colors (`#c084fc`, `#e879f9`, etc.), `fontSize: 10`, and visible buttons. Live browser confirmed: 23 elements with non-brand inline hex rendering on `/quiz/body`. Not gated by `process.env.NODE_ENV`. This is a P0 pre-launch blocker.

2. **Aura brand rule violations** — 18 `strokeDashoffset` uses on local quiz aura paths (per `feedback_aura_brand_rules.md` this is banned on decorative auras; may be intentional for quiz-specific animation reveals — needs owner judgment call). 6 geometric SVG elements (`<circle>`, `<rect>`, `<ellipse>`, `<line>`) in aura contexts where only cubic bezier `<path>` is permitted. 7 `fill-not-none` violations on elements that should be stroke-only.

**False positives removed:** 22 CSS token definition hits (intentional `--color-*` variables), 8 Brandon-uppercase CSS variable definition hits, 2 overflow-hidden hits on intentional modal containers.

---

## Overall Impression

The quiz flow is one of the more emotionally coherent quiz experiences in the wellness space — it doesn't feel like a form. The hardening pass closed the most user-visible UX gaps. The single biggest remaining opportunity is `/quiz/sent`: this is the highest-intent moment in the entire funnel (user has just submitted their email) and it ends in a dead end with no forward path. Every other issue is secondary to that.

---

## What's Working

**1. Completion screen** — Now with 5.5s timing and staggered Plantin lines, this is the emotional peak done right. The TAP TO CONTINUE hint lands at exactly the right moment (3.5s) — after the copy settles, before the user wonders if they're stuck.

**2. Scale slider interaction** — The drag-to-place aura handle is the most distinctive interaction in the quiz. It communicates "this brand takes your body seriously" without saying so. The aura deforms as you drag — motion as metaphor, executed.

**3. Question copy throughout** — "What does your body do at 3pm?" instead of "Rate your energy levels." The questions read as someone who knows Joana, not as a wellness survey. This is the hardest thing to design and it's genuinely good.

---

## Priority Issues

### [P0] Debug overlay renders in production
**What:** `QuizBody.tsx` and `QuizIntro.tsx` contain developer step-jump bars with Tailwind rainbow colors (`#c084fc`, `#e879f9`, `#60a5fa`, etc.) that are not gated behind `process.env.NODE_ENV !== "development"`. Live browser confirmed 23 non-brand elements rendering on `/quiz/body`.
**Why it matters:** Joana sees colored debug buttons. Immediately breaks the "ancient, alive, unpolished" illusion. Brand-destroying on first impression for any real user.
**Fix:** Wrap the entire dev toolbar JSX block in `{process.env.NODE_ENV === "development" && (...)}` in both `QuizBody.tsx` (~line 1608) and `QuizIntro.tsx` (~line 575).
**Suggested command:** `/harden`

### [P1] `/quiz/sent` is a dead end
**What:** After email submission, the sent screen has no forward path — no CTA, no link, no redirect. Assessment A confirmed this is the highest-intent moment in the funnel with zero conversion continuation.
**Why it matters:** Joana just gave her email. She's warm. The funnel drops her. She navigates away, returns cold, and the journey breaks.
**Fix:** Add a CTA — either auto-redirect to `/quiz/result` after the 8s animation completes (likely), or add a visible "See your result →" AuraButton at the bottom. The `onAdvance` prop already exists; it just needs to push to the correct route.
**Suggested command:** `/harden`

### [P2] Bubble chart arrives before emotional reframe (result page)
**What:** The 60%/30%/10% composition chart animates in at ~2.45s, before the main content block (3.0s). The data reads as clinical health-tech — exactly the aesthetic the brand opposes.
**Why it matters:** The result page's emotional job is "you are Vata" → identity recognition. Numerical percentages frame this as diagnosis, not recognition. The chart should either arrive after the reframe copy, or be styled differently.
**Fix:** Delay the bubble chart to appear after the content block (shift `startDelay` to 3.5s+), or reframe it as an aura composition rather than a percentage breakdown.
**Suggested command:** `/polish`

### [P2] First-name field: unspecified friction + silent validation bug
**What:** The email gate collects first name in addition to email, which is not in the original gate spec. `validFirstName` is defined but not enforced on form submit — a user can submit with an empty name field and the gate passes.
**Why it matters:** Extra field = measurable drop in conversion. Silent validation = potential downstream data quality issue (blank first names in Klaviyo sequences that address the user by name).
**Fix:** Either remove the first-name field (highest conversion, simplest) or enforce `validFirstName` on submit.
**Suggested command:** `/harden`

### [P3] Geometric SVG elements in aura contexts
**What:** 6 `<circle>`, `<rect>`, `<ellipse>`, `<line>` elements are used inside SVG aura contexts where only cubic bezier `<path>` is permitted by brand rules. The most visible: the ScaleNode selection indicator uses a `<circle>` fill to show the chosen state.
**Why it matters:** Geometric SVG elements break the "organic, no straight lines" brand rule. The filled circle on scale selection reads as a radio button — SaaS/form aesthetic, not ETHA.
**Fix:** Replace the `<circle>` selection indicator with a short aura path drawn on selection. `<line>` tick marks → replace with small `<path>` arcs. `<rect>` and `<ellipse>` in QuizIntro → replace with organic blob paths.
**Suggested command:** `/polish`

---

## Persona Red Flags

**Joana (Primary — exhausted, skeptical, mobile):**
- `/quiz/sent` dead end is her worst moment. She submitted her email believing something was coming. Nothing invites her forward.
- Debug overlay buttons on `/quiz/body` break trust immediately. If she sees them, the quiz reads as broken or fake.
- The 9px label text on the result page is below readable threshold at 390px. "YOUR NATURE IS" above the dosha name is 9px — she may not register it.

**Riley (Stress-tester — bookmarks routes, returns later):**
- Route guard now correctly redirects `/quiz/result` → `/quiz` in production. ✅ This was her main failure mode.
- Re-select within 180ms now works. ✅

---

## Minor Observations

- `QuizBackButton` is icon-only with no `aria-label`. Screen reader users get no affordance for back navigation.
- `result/page.tsx` "SEND MY FULL REPORT" button at line 233 has no `aria-label` — button text is descriptive but the element may not expose it correctly to AT.
- 16 inline `fontSize` values below 14px across the quiz. Most are in the debug overlay (moot once gated), but `result/page.tsx` uses 9px for labels.
- Glassmorphism (`backdrop-filter: blur`) is active on 2 routes — the email gate overlay (`blur(28px)`) and the quiz body debug bar (`blur(6px)`). The gate blur is intentional and subtle; the debug bar blur disappears once gated. No action needed post-gating.
- `AURA:strokeDashoffset` (18 instances): The brand memory marks this as banned on decorative auras. The quiz uses it for per-question aura reveals on answer selection. This may be intentional animation spec — owner judgment call on whether quiz animation is an exception to the "no path draw" rule.

---

## Questions to Consider

- "Does `/quiz/sent` need to be a screen at all, or could the email submission transition directly to the result?"
- "What would it feel like if the dosha composition was shown as an aura shape morph rather than percentage numbers?"
- "The debug overlay has been live for every real user who's visited `/quiz/body`. How many have seen it?"

---

*Report generated: 2026-04-23 | Methods: LLM design review (Assessment A) + impeccable CLI + browser injection (Assessment B) | Routes: 6*
