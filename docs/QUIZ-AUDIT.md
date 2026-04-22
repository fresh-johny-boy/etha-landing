# ETHA Quiz — Design Audit
_Date: 2026-04-22 · Auditor: Claude Code_
_Note: Copy quality excluded — content comes from DB._

---

## Overall Verdict

**67% — not production-ready.**

| Dimension | Score | Weight |
|---|---|---|
| Brand fidelity | 82% | 30% |
| UX / interaction | 62% | 40% |
| Dynamic content resilience | 58% | 30% |

Fix the 4 blockers → ~80%. Full list done → ~90%+.

---

## Method

- Navigated all 5 question types via dev toolbar (CHOICE, SCALE2, SCALE3, VISUAL, OPEN)
- Screenshotted every type at mobile viewport
- Checked brand rule compliance against `docs/DESIGN.md` + `CLAUDE.md`
- Dynamic content lens: does each type hold if question/answer text changes length?

---

## Design Audit — All 5 Question Types

### CHOICE

**Works:**
- Three unique aura shapes per A/B/C — on-brand, elegant
- Two-line answers stay contained within current copy lengths

**Issues:**

| Severity | Issue |
|---|---|
| Should fix | Question left-aligned, answers centered — mixed axis. Dynamic content with varying question lengths creates inconsistent vertical rhythm before cards appear |
| Nit | Aura shapes telegraph Dosha — A=oval (Vata), B=medium, C=blob (Kapha). Users who retake the quiz pattern-match shape→Dosha and bias answers. Decouple shape from position before going dynamic |
| Nit | Large dead zone below card C (~25% empty screen) regardless of question length |

---

### SCALE2

**Works:**
- Aura track line is beautiful — organic, breathing, unmistakably ETHA

**Issues:**

| Severity | Issue |
|---|---|
| **Blocker** | CONTINUE is `opacity:0` before drag — zero affordance. "DRAG TO PLACE" is the only hint and it's tiny. If that string changes or is missed, users hit a silent dead end |
| Should fix | Pole labels can bleed inward — left pole already wraps to 2 lines. Longer dynamic pole text will collide at track center |
| Nit | Dead zone below slider — after placing, CONTINUE fades in but empty space shifts bottom weight awkwardly |

---

### SCALE3

**Works:**
- Three-pole framing adds meaningful nuance vs binary scale

**Issues:**

| Severity | Issue |
|---|---|
| **Blocker** | Middle label already colliding — current content is 2 lines in center position. Any longer dynamic middle label breaks layout — nowhere to go |
| Should fix | Same pole bleed risk as SCALE2, but worse — 3 labels competing for same horizontal space |

---

### VISUAL

**Works:**
- Real photography inside organic blob masks — best-looking type in the quiz
- 2+1 grid reads naturally at mobile

**Issues:**

| Severity | Issue |
|---|---|
| Should fix | 2+1 grid gives position C permanent bottom-center prominence — more visual real estate. With dynamic content, option C may read as the "intended" answer |
| Should fix | Image masks appear circular, not irregular aura shapes |
| Nit | Labels below images could misalign — top row has 2 labels side-by-side; longer dynamic labels will collide |

---

### OPEN

**Works:**
- Textarea with aura SVG border is genuinely beautiful

**Issues:**

| Severity | Issue |
|---|---|
| **Blocker** | Question already 3 full lines at mobile. Dynamic content 10% longer pushes textarea partially off-screen on small phones |
| **Blocker** | Textarea has visible `border-radius` — `<textarea>` element corners are slightly rounded. Violates 0px rule. Aura SVG frames it organically but the element itself betrays it |
| Should fix | SKIP button: extremely low contrast, tiny faint oval, no fill. Fails WCAG AA |
| Should fix | Bonus second textarea (Spirit layer) appears with no transition — sudden layout height shift |

---

### Nav / Progress

| Severity | Issue |
|---|---|
| Should fix | `"9/45 · L1"` counter is cryptic — 45 feels like a wall, "L1" meaningless to users |
| Nit | BODY/MIND/SPIRIT active state barely distinguishable — active icon only marginally brighter |
| Nit | No visual progress bar within section — only raw counter |

---

## Priority Fix List

| # | Severity | Component | Fix |
|---|---|---|---|
| 1 | **Blocker** | SCALE2/3 | Show pulsing affordance or disabled-state CONTINUE before drag — not invisible |
| 2 | **Blocker** | SCALE3 | Cap middle pole label to 1 line max, or move label below track |
| 3 | **Blocker** | OPEN | Add `max-height` / scroll or font-size fallback for long questions |
| 4 | **Blocker** | OPEN | Force `border-radius: 0` on the `<textarea>` element |
| 5 | Should fix | OPEN | SKIP button: increase contrast, min 44px touch target |
| 6 | Should fix | OPEN | Bonus textarea: animate in with height transition, not instant shift |
| 7 | Should fix | CHOICE | Decouple aura shape from answer position before dynamic content lands |
| 8 | Should fix | VISUAL | Switch image masks to irregular aura shapes |
| 9 | Should fix | NAV | Replace `X/45 · L1` with human-readable section progress |
| 10 | Nit | SCALE | Constrain pole label `max-width` to prevent center collision |
| 11 | Nit | CHOICE | Reduce dead zone below card C |
| 12 | Nit | SCALE | Smooth CONTINUE fade-in entrance after drag placement |

---

## Brand Compliance Summary

| Rule | Status |
|---|---|
| 0px border-radius on all UI chrome | ✓ PASS |
| 0px border-radius on `<textarea>` | ✗ FAIL |
| Aubergine bg / cream text throughout | ✓ PASS |
| Plantin serif for questions | ✓ PASS |
| Brandon Grotesque UPPERCASE for nav labels | ✓ PASS |
| No neutral grey shadows | ✓ PASS |
| Aura SVG stroke-only, fill:none | ✓ PASS |
