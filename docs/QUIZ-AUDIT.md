# ETHA Quiz — Unified Audit

_Last compiled: 2026-04-22 · Claude · Merges v1 + v2 + design lens + Kristian's inline comments. Source for the spec round._

**Scope:** on-brand design + voice + UX of the whole quiz journey — landing CTA → intro → 45-question body → result. Weighted against:

- `etha-content-skills/BRAND-KNOWLEDGE.md` + the seven content skills (voice, hard-rules, differentiation, Joana filter).
- `Deep Dive_ Long Quiz Conversion Strategy.docx` — 7-phase conversion framework + 20-point checklist.
- `docs/DESIGN.md`, `docs/SECTIONS.md`, `docs/landing-brief.md`, `.claude/rules/aura-svg.md`.

**Method:** Walked the intro (all 7 screens) + every question type (CHOICE / SCALE2 / SCALE3 / VISUAL / OPEN) + layer screens + the result page at 412×915 mobile viewport via chrome-devtools-mcp. Screenshots archived at `/tmp/quiz-screenshots/`. Read every line of `QuizIntro.tsx`, `QuizBody.tsx` (1472 lines), `QuizCTAButton.tsx`, quiz page/layout files, `Nav.tsx`.

> Tags: **[D]** design / visual / interaction · **[V]** voice / copy / brand-rules · **[U]** UX / flow / strategy.
> **[ADMIN]** = Kristian's comment from prior v1 audit, honored in this pass.

---

## 0. Top-line verdict

| Dimension                                                     | Score         | What drives it                                                                                                            |
| ------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Visual brand fidelity (aura, type, color, 0px radius, motion) | **88%** | Craft is high. Aura system is the brand's strongest artifact.                                                             |
| Voice / copy on-brand                                         | **72%** | Intro copy is strong; landing CTAs, gate CTA, and page metadata violate `BRAND-KNOWLEDGE.md`.                           |
| UX alignment w/ Deep-Dive strategy                            | **42%** | Phases 1–4 executed structurally. Phases 5, 6, 7 (interstitials, email gate, result) are effectively**not built**. |
| Dynamic-content resilience                                    | **58%** | SCALE3 / OPEN near their limits at current copy.                                                                          |

**Single highest-impact gap:** the result page is a loading placeholder — `Your map is forming. / This will take just a moment.` No archetype reveal, no mirror, no ritual timeline, no email capture, no commerce bridge. This is where ≥ 80% of the strategy's conversion value lives, and it is absent. Every other fix is secondary.

---

## 1. v1 items dropped per admin review

These were in v1 but **[ADMIN]** rejected them. Dropped from the active fix list.

| v1 item                                                                        | Admin call                                             |
| ------------------------------------------------------------------------------ | ------------------------------------------------------ |
| CHOICE mixed axis (left-aligned question vs centered cards)                    | Rejected.                                              |
| CHOICE aura shapes telegraph Dosha (A=oval/Vata, B=medium/Pitta, C=blob/Kapha) | Rejected. Keeping the aura-shape identity per option.  |
| SCALE dead zone below slider after placement                                   | Rejected. "May looks we shall see" — dropped for now. |
| VISUAL image masks look circular                                               | Rejected strongly. The blob silhouettes stay as-is.    |
| NAV `"X/45 · L1"` counter cryptic                                           | Rejected — dev-toolbar only, not in production.       |

These issues stay off the list unless admin re-opens them.

---

## 2. Additional items dropped per admin (resolved on v2 pass)

| Item                                                                | Admin call                                                                                                                                       | Disposition                                                                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| CHOICE dead zone below card C                                       | "DROP IT"                                                                                                                                        | ❌ Removed.                                                                                                           |
| VISUAL 2+1 grid, C permanent bottom-center prominence               | "drop it"                                                                                                                                        | ❌ Removed.                                                                                                           |
| VISUAL top-row label collision                                      | "dont worry"                                                                                                                                     | ❌ Removed.                                                                                                           |
| VISUAL entry stagger (0.18 / 0.44 / 0.70)                           | "dont agree"                                                                                                                                     | ❌ Removed.                                                                                                           |
| `<textarea>` visible `border-radius` flagged as a 0px-rule FAIL     | "drop it"                                                                                                                                        | ❌ Removed.                                                                                                           |

---

## 3. What stays as-is (do not touch)

- **[D]** Aura-border `QuizCTAButton` — mouse-directional distortion via GSAP, 22 control points, raised-cosine falloff. High-craft, unique to ETHA.
- **[D]** SCALE slider organic track + breathing handle aura — best single on-brand interaction in the product.
- **[D]** VISUAL blob-masked photography — air / fire / earth webp inside three distinct organic clip paths (0.67 / 1.07 / 1.81 aspect). `[ADMIN]` agrees: blob silhouettes stay.
- **[D]** Per-option aura shapes (A/B/C) on CHOICE — `[ADMIN]` agrees to keep the shape identity per option.
- **[D]** BODY / MIND / SPIRIT nav — custom SVG icons + wave progress draw. Legible, on-brand, paced correctly. Active state (icon 0.85 vs upcoming 0.20) is plenty distinct.
- **[D]** LAYER screens — massive `clamp(5rem, 16vw, 10.5rem)` Plantin reveal. Correct reverence scale.
- **[V]** Intro's core poetic copy: `5,000-year-old system`, `rhythm map`, `blueprint your body was born with`, `Your answers are private. Be honest. That is the only way this works.` Strongest voice moments in the product.
- **[D]** Aura-SVG discipline: all `fill: none`, stroke-only, single continuous cubic-bezier `<path>`, `overflow: visible`.
- **[D]** Color discipline — aubergine + cream only. No neutrals, no greys.

---

## 4. Global / cross-cutting

### 4.1 Landing entry CTAs are off-brand  [V]

`BRAND-KNOWLEDGE.md` maps explicitly: `Take the quiz!` → `Begin your remembering`. `docs/landing-brief.md` reinforces: *one CTA. Always "Begin your remembering." Never vary the wording.*

| File                   | Current                  | Rule                                                                                                         |
| ---------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `Hero.tsx`           | `BEGIN SELF-DISCOVERY` | Off-brand.                                                                                                   |
| `Doshas.tsx`         | `DISCOVER YOUR DOSHA`  | Off-brand twice: (a) "Discover" is not the rule; (b) strategy + brand both say don't lead with "Dosha" cold. |
| `Closure.tsx`        | `BEGIN SELF-DISCOVERY` | Off-brand.                                                                                                   |
| `QuizIntro.tsx` gate | `Discover yourself`    | Off-brand; this is the commitment moment — it should be `Begin your remembering`.                         |

**Effect:** Joana meets two brands — the landing/gate uses the exact phrasing brand-knowledge forbids, then the quiz interior flips to on-brand voice.

### 4.2 Page metadata leaks length  [V] [U]

| File                       | Current                                                                             | Issue                                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `app/quiz/page.tsx`      | title:`Discover Your Dosha — ĒTHA`                                              | Surfaces "Dosha" to SERP / share previews.                                                                    |
| `app/quiz/body/page.tsx` | description:`43 questions across three layers. One map that belongs only to you.` | Surfaces the number `43` — violates strategy rule 1 ("Never number questions sequentially").               |
| `QuizIntro.tsx:31`       | value screen:`In the next 15 minutes, you will receive:`                          | Surfaces duration. Brand uses "3 minutes" as the reassurance number. Strategy says don't state length at all. |

### 4.4 Em-dash usage in answer labels  [V]

Every CHOICE answer uses `—` (`Lean and light — hard to gain weight`). The `etha-write` + `etha-hard-rules` skills ban em dashes in brand copy ("use periods + new lines"). Grey area — these are UI labels, not body copy. Decision needed, globally.

### 4.5 Clinical-leaning question answers  [V]

~10 of 45 answers lean medical: `elimination` / `inflammation` / `congestion` / `reactive` / `prone to` / `sensitive or prone to sores`. Brand-knowledge: *"Sacred, but never new-age vague. Clean, but never sterile."* Not a blocker — a tonal pass could soften without losing diagnostic signal.

---

## 5. `QuizIntro` — 7 intro screens → gate

### 5.1 Opening statement semantics  [V]

Screen 0: `Am I who I am supposed to be?`

- Brand's hidden beliefs for Joana: `I should be doing better.` · `I'm tired of fixing — I want to remember who I am.`
- Implicit rule: `You're not broken.` · `Let's remember, not rebuild.`
- "supposed to be" is precisely the frame ETHA should *unseat*, not invoke. Screen 3 (`Not who you should become. Who you already are.`) is the correct reframe — but by then the "should" hook is already planted.

**Option A:** Keep as deliberate pattern-interrupt, defend it.
**Option B:** Flip to a single inverted screen: *You are not who you should be. You are who you already are.*

### 5.2 Intro pacing  [U]

7 reflection screens (~60–80s of reading) before Q1, then a jump into Prakriti body questions. Strategy wants: *commit first, interrogate second.* The gate is correctly placed, but those 7 screens ask for attention before earning a micro-commitment.

**Option A:** Trim to 4–5 screens.
**Option B:** Convert one reflection into a low-stakes image-led question ("How do you want to feel when you wake up?") *before* the gate — builds commitment.

(admin comment: not sure about it maybe redure animation or idk)

### 5.3 Gate CTA copy  [V]

See 4.1 — `Discover yourself` → `Begin your remembering`.

### 5.4 Value screen  [V]

`In the next 15 minutes, you will receive:` — see 4.2. The 3-item list itself is excellent:

- `Your personal rhythm map, the blueprint your body was born with.`
- `A morning-to-night ritual designed for your specific constitution.`
- `Botanical recommendations matched to where you are right now.`

Keep the items; remove the duration prefix.

---

## 6. `QuizBody` — shared chrome

### 6.1 LayerView auto-advance timing  [D]

`LayerView` (huge "Body / Mind / Spirit" title reveal) auto-advances at 2.8s (first layer: 5.6s). Visually beautiful; 2.8s is too short to register the typographic moment. Hold 4.0–4.5s.

### 6.2 No interstitial reassurance between layers  [U]

Layer screens are visual-only — typographic title + icon. Strategy Step 5 demands: *"You are doing beautifully. We are starting to see a distinct pattern in your digestion. Let's look at your sleep to confirm this hypothesis…"* Currently missing.

### 6.3 No sensory tempo shift in the last 5 questions  [U] [D]

Last 5 questions (SPIRIT L3 tail) animate identically to the first. Strategy Step 6 demands slower entrance easing + "We have almost finished mapping your rhythm." copy cue. Neither exists.

### 6.4 BgAura — two uncorrelated sine loops  [D]

`BgAura` runs `scale 1.05, duration 7s` AND `rotation ±8°, duration 22s` — yoyo, independent. Uncorrelated loops can produce a subtle "hunting" feel on long sessions. Tie to a single master clock or phase-offset intentionally.

### 6.5 Unused easing language  [D] 

`QuizBody.tsx` L9–11 declares `AIR / WATER / FIRE / EARTH` eases; in practice transitions only use `AIR` + `FIRE`. Either use them per screen-type intentionally (SPIRIT uses WATER, BODY uses EARTH…), or remove the dead vocabulary.

### 6.6 Nav wave is geometrically flat  [D] (admin comment:agree make it more intresting)

For a quiz pitched as a *journey*, the progress line is purely horizontal. Minor poetic mismatch. (P3.)

---

## 7. `QuizBody` — CHOICE type

**Works:**

- Three unique aura shapes per A/B/C — on-brand, elegant at rest. **[ADMIN agrees — keep.]**
- Two-line answers stay contained at current copy lengths.
- Selection animation: aura draws, unpicked dim to 12% opacity.

### 7.1 Selection feedback too fast  [D]

Picked aura redraws over 0.9s with `power2.inOut`. Auto-advance fires at 460ms. The draw barely finishes before the screen transitions. Either speed the draw to ~0.5s **or** hold the screen until the draw completes before the advance. ""(admin commentagree  teh draw speed is good maybe let the screen 200 to 300ms more before changing it)""

### 7.2 No micro-confirmation moment  [D]

Between pick and advance there is no *noted* cue — chime + aura draw + opacity change is fine but reads as a web form, not a ritual. Consider a one-beat confirmation (breath of the aura, dot fill) before advance. "'(admin comment NOT SURE ABOUT WHAT THIS MEANS)"

### 7.4 Em-dash in answer labels

See 4.4.

---

## 8. `QuizBody` — SCALE2 / SCALE3 (slider)

**Works:**

- Track line + handle aura is the single best on-brand interaction in the app. Keep.
- Pole label opacity driven by handle position — subtle, correct.
- Three-pole framing (SCALE3) adds meaningful nuance vs binary.

### 8.1 CONTINUE has zero affordance before drag  [D] [U]  **BLOCKER**

Pre-drag: `opacity: 0` + `pointer-events: none`. Only affordance is 8px tracking-wide `DRAG TO PLACE`. If that label is missed (tiny / dimmed), the user hits a silent dead end. Needs a visible disabled-state, pulsing aura on the handle, or some indication CONTINUE exists. (admin comment(admin comment)) agreee

### 8.2 SCALE3 middle pole label collision  [D]  **BLOCKER**

Middle label already wraps 2–3 lines at current copy (`I lock in and push through, even when I should rest.`). 30% width cap leaves no room to grow. Cap middle to 1 line, or move label below the track.

### 8.3 SCALE2/3 pole label bleed  [D]

`max-width: 44%` (scale2), `30%` (scale3). Close to collision at track center. Set tighter max-width or allow center gap with min-gutter.

### 8.4 CONTINUE reveal after drag is flat  [D]

After drop, aura re-draws (correct) but CONTINUE button fades in with a plain CSS opacity transition. No correlation between placement and reveal. A subtle aura-path draw on the CONTINUE button would reinforce "the button is reacting to you."

### 8.5 Hard bucket cliff in SCALE3  [D] [U]

Only three buckets (`a < 0.33`, `b 0.33–0.67`, `c > 0.67`). A user at 0.32 is Vata; at 0.34 is Pitta. No snap, no visual bucket boundaries. For a sensory ritual this feels un-ETHA. Either show soft bucket zones on the track, or drop buckets and score continuously.

### 8.6 Re-drag state seam  [D]

Re-drag after drop kills aura breathing and doesn't cleanly restart. Minor but visible to attentive users.

---

## 9. `QuizBody` — VISUAL type

**Works:**

- Real photography (air/fire/earth webp) inside organic clip paths — best-looking question type.
- Three distinct blob aspect ratios (0.67 / 1.07 / 1.81). **[ADMIN agrees — masks stay as-is.]**

---

## 10. `QuizBody` — OPEN type

**Works:**

- Aura-bordered textarea is genuinely beautiful.
- SKIP exists — preserves "invitation, not pressure" tone.
- Focus state brightens the aura — subtle, on-brand.
- Bonus second textarea (SPIRIT layer only) adds layered depth at the final reveal.

### 10.2 Question overflow risk  [D] [U]  **BLOCKER**

Question already 3–4 lines at 412px (`One sentence, or skip. What does your body most need right now that it is not getting?`). Textarea is 7 rows. SKIP + bonus reveal fills the viewport. Any copy growth clips. Need max-height + scroll on textarea, or clamp font-size on the question.

### 10.3 SKIP contrast fails WCAG AA  [D]

`text-cream/38` on aubergine ≈ **2.6:1**. Fails AA (4.5:1 required). 48×48 hit target is present but the visual target reads smaller. Raise opacity to ≥ 62%.

### 10.4 Bonus textarea reveal is a layout snap  [D]

`showBonus` flips on first keystroke → instant height jump. Needs animated height + fade.

### 10.5 Bonus textarea re-hide flicker  [D]

`showBonus = val.trim().length > 0`. Typing "n" then backspacing un-mounts the bonus. Keep mounted once revealed; only the reveal should be gated.

### 10.6 CONTINUE reveal on first keystroke  [D]

Same instant-reveal flatness. Needs a soft fade-in over ~300ms.

---

## 11. Phases missing entirely  [U]

### 11.1 Mid-module interstitials (strategy Phase 4)

Between layers: *"We're starting to see a pattern in your body. Let's look at your mind to confirm."* Not built.

### 11.2 Sensory transition (strategy Phase 6, Q36–40)

Tempo shift + reassurance copy as quiz closes. Not built.

### 11.3 Email gate / curiosity loop (strategy Phase 5)

Blurred archetype peek → *"Your unique rhythm has been identified. Where should we send your comprehensive blueprint?"* Not built at all. Current flow: last question → hard cut → `/quiz/result`.

### 11.4 Result architecture (strategy Phase 6) — **P0**

Current `/quiz/result` page is 10 lines of React: `Your map is forming. This will take just a moment.` A placeholder. Missing:

- **Identity validation** (Mirror Effect) — echo specific answers back.
- **Accessible science** — modern analogies for the Ayurvedic mechanism.
- **Ritual timeline** — chronological daily recommendations (7am / 2pm / 9pm).
- **Transparent botanical recommendations** — "why this, for you."
- **Educational bridge** — Academy hand-off.
- **Page title** — currently defaults to `ĒTHA — Ancient Wisdom for Modern Living`. Generic after 45 questions of personalization.

---

## 12. Q1–Q3 sequence — wrong shape for an opener  [U] [V]

Strategy Step 3 (The Ascent) demands: low cognitive load, highly visual, aspirational — first 3 questions must feel effortless to earn commitment.

Current:

- Q1: `My body frame is naturally…` (CHOICE — direct Prakriti self-assessment)
- Q2: `My skin tends to be…` (CHOICE)
- Q3: `My hair is naturally…` (CHOICE)

All three are body-type diagnostic, forcing physical self-assessment before any commitment has been built. The first VISUAL doesn't appear until Q10.

**Fix:** Reshuffle so Q1–Q3 are aspirational (e.g. `How do you want to feel when you wake up?`), preferably VISUAL. Move body-frame / skin / hair to Q4+. (admin comment MAKE THE QUESTIONS VISSUALLY HEAVY either think of a new template for questions just first 3 or use visual question template we laready have.)

---

## 13. Consolidated priority fix list

Severity: **P0** must fix before any public test · **P1** must fix before launch · **P2** quality pass · **P3** polish.

| #  | P            | Tag    | Area                          | Fix                                                                                                                                     | Ref        |
| -- | ------------ | ------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1  | **P0** | [U][V] | Result page                   | Build the full result architecture — archetype reveal, mirror, science, ritual timeline, product bridge, Academy CTA.                  | 11.4       |
| 2  | **P0** | [U][V] | Email gate                    | Curiosity-loop email capture between last question and archetype reveal (dedicated screen, not modal).                                  | 11.3       |
| 3  | **P0** | [V]    | Landing CTAs                  | Replace `BEGIN SELF-DISCOVERY` / `DISCOVER YOUR DOSHA` / `Discover yourself` with `Begin your remembering`. 4 files.            | 4.1, 5.3   |
| 4  | **P0** | [V][U] | Metadata + copy               | Remove `43 questions` from body page meta; remove `15 minutes` from intro value screen; revise quiz page title away from `Dosha`. | 4.2, 5.4   |
| 5  | **P0** | [D]    | SCALE2/3                      | Visible CONTINUE affordance before drag (disabled-state + pulse on handle or label).                                                    | 8.1        |
| 6  | **P0** | [D]    | OPEN overflow                 | Max-height + scroll (or font-size clamp) so long questions never clip the textarea.                                                     | 10.2       |
| 7  | **P1** | [U][V] | Phase 4 interstitials         | Between layers: "We're starting to see a pattern in your [layer]…" as a held screen (not auto-advance).                                | 6.2, 11.1  |
| 8  | **P1** | [U]    | Q1–Q3 reshuffle              | Aspirational, visual, effortless. Move body-frame / skin / hair to Q4+.                                                                 | 12         |
| 9  | **P1** | [U][D] | Phase 6 sensory transition    | Last 5 questions: slower entrance easing +`We have almost finished mapping your rhythm.` lead-in.                                     | 6.3, 11.2  |
| 10 | **P1** | [D]    | SCALE3 middle label           | Cap to 1 line, or move label below track.                                                                                               | 8.2        |
| 11 | **P1** | [D]    | OPEN SKIP contrast            | ≥ 4.5:1, min 44×44 visual target.                                                                                                     | 10.3       |
| 12 | **P1** | [D]    | OPEN bonus reveal             | Animated height + fade. Keep mounted once revealed.                                                                                     | 10.4, 10.5 |
| 13 | **P1** | [D]    | OPEN CONTINUE reveal          | Soft fade-in over ~300ms when threshold hit.                                                                                            | 10.6       |
| 14 | **P1** | [V]    | Opening statement             | Pattern-interrupt vs inversion — decide.                                                                                               | 5.1        |
| 15 | **P1** | [U]    | Intro pacing                  | Trim to 4–5 screens, or convert one reflection to a low-stakes visual question.                                                        | 5.2        |
| 16 | **P2** | [V]    | Em-dashes in answers          | Global keep-or-swap decision.                                                                                                           | 4.4, 7.4   |
| 17 | **P2** | [V]    | Clinical-leaning answers      | Soften ~10 of 45 without losing diagnostic signal.                                                                                      | 4.5        |
| 18 | **P2** | [D]    | CHOICE selection feedback     | One-beat confirmation before auto-advance; speed aura draw to ~0.5s or hold screen until draw completes.                                | 7.1, 7.2   |
| 19 | **P2** | [D]    | LayerView hold duration       | 4.0–4.5s (from 2.8s).                                                                                                                  | 6.1        |
| 20 | **P2** | [D]    | SCALE CONTINUE reveal         | Aura-path draw-on-reveal instead of flat fade.                                                                                          | 8.4        |
| 21 | **P2** | [D]    | SCALE3 bucket feel            | Soft bucket zones, or continuous scoring.                                                                                               | 8.5        |
| 22 | **P2** | [D]    | SCALE pole bleed              | Tighter max-width or min-gutter between poles.                                                                                          | 8.3        |
| 23 | **P3** | [D]    | SCALE re-drag seam            | Clean aura breathing re-start.                                                                                                          | 8.6        |
| 24 | **P3** | [D]    | BODY/MIND/SPIRIT done state   | Done-icon opacity 0.45 → 0.60 to separate from upcoming 0.20.                                                                          | —         |
| 25 | **P3** | [D]    | BgAura loops                  | Tie scale + rotation to a shared clock.                                                                                                 | 6.4        |
| 26 | **P3** | [D]    | Easing vocabulary             | Use `WATER` / `EARTH` intentionally, or remove dead variables.                                                                      | 6.5        |
| 27 | **P3** | [D]    | Nav wave shape                | Subtle vertical travel — a journey shape.                                                                                              | 6.6        |

---

## 14. Brand-rule status (post-admin)

| Rule                                               | Status                                                    |
| -------------------------------------------------- | --------------------------------------------------------- |
| 0px border-radius on all UI chrome                 | ✓ PASS                                                   |
| Aubergine bg / cream text throughout               | ✓ PASS                                                   |
| Plantin serif for questions                        | ✓ PASS                                                   |
| Brandon Grotesque UPPERCASE for nav labels         | ✓ PASS                                                   |
| No neutral grey shadows                            | ✓ PASS                                                   |
| Aura SVG stroke-only, fill: none                   | ✓ PASS                                                   |
| Landing + gate CTAs use `Begin your remembering` | ✗ FAIL (4 files)                                         |
| Quiz copy avoids "Dosha" at cold entry             | ✗ FAIL (Doshas.tsx CTA + quiz page title)                |
| Quiz metadata hides length                         | ✗ FAIL (body meta + intro value screen)                  |
| Em dashes banned in copy                           | Grey area — admin to decide                              |

---

## 15. Open questions for the spec round

These are decisions the spec needs to call, not fix prescriptions:

1. **Archetype naming.** Strategy recommends poetic archetypes (*Kinetic Mind / Fiery Drive / Grounded Core*) mapped 1:1 to Vata / Pitta / Kapha. Full replace, or poetic + subtitle ("Kinetic Mind — the Vata rhythm")?
2. **Scoring model.** Currently CHOICE/VISUAL/SCALE → a/b/c tally. OPEN answers not wired into scoring. Is OPEN signal or ritual?
3. **Bonus layer (second textarea).** Only the final OPEN has a bonus. Keep asymmetry, or wire all OPENs for consistency?
4. **Email gate position.** (a) pre-result (best for conversion); (b) post-archetype-teaser (better for premium feel, leaks leads on bounce). Pick.
5. **Academy hand-off.** Does the result page lead Academy-first or product-first?
6. **Viewport commitment.** Mobile-first verified at 412px. Not verified at 768+. Mobile-only for v1, or tablet/desktop variants?
7. **Retake behavior.** No retake path exists. Invite retakes (rhythm changes are on-brand) or lock once?
8. **Em-dash decision** (ref #18). Keep or swap globally.
9. **Opening statement decision** (ref #16). Pattern-interrupt, or inversion.
10. **Result page composition.** Editorial magazine vs vertical ritual scroll?

---

_End of unified audit. Edits welcome anywhere — spec follows after your pass._
