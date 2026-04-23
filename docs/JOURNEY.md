# ETHA — Joana's Journey · Think / Feel / Do

Source: `docs/source/journey-think-feel-do.pdf` + `docs/source/journey-think-feel-do.html`

This is the full customer acquisition funnel. Every touchpoint maps to Think / Feel / Do — what Joana believes, what she feels, and what she actually does next. This flow determines what gets built and in what order.

---

## Full Funnel Flow

### 01 · Social Posts (Entry Point)
10 organic static posts + May calendar

| | |
|---|---|
| **Think** | This speaks to something I feel but cannot name |
| **Feel** | Curious — not sold to, not overwhelmed |
| **Do** | Tap through to the quiz |

---

### 02 · Dosha Quiz — Full Web Experience
`[web]`

| | |
|---|---|
| **Think** | These questions actually understand me |
| **Feel** | Engaged — someone is paying real attention |
| **Do** | Answer every question honestly and fully |

**Decision gate:** Quiz completed?
- **No** → Ad Set: Quiz Abandoned → End
- **Yes** → continues to step 03

---

### 03 · Dosha Card — Result Screen `[PRODUCT ×3 dosha]`
The immediate payoff. Joana sees her result before giving her email.

| | |
|---|---|
| **Think** | This is exactly me — how do they know this? |
| **Feel** | Validated — a little emotional, genuinely seen |
| **Do** | Screenshot it. Enter email to get the full report |

**Decision gate:** Email provided?
- **No** → Ad Set: Dosha Retargeting ×3 → End
- **Yes** → continues to step 04

---

### 04 · Email 1: The Mirror `[PRODUCT: Full Report PDF]`
Sent 15 min after quiz. Dynamic — personalised per dosha.

| | |
|---|---|
| **Think** | Someone finally described me accurately |
| **Feel** | Deeply seen — I want to read everything they send |
| **Do** | Read the full report. Anticipate Email 2 |

---

### 05 · Email 2: The Guide `[×3 dosha]`
Sent day 3.

| | |
|---|---|
| **Think** | I could actually do this tomorrow morning |
| **Feel** | Hopeful and grounded — this fits my real life |
| **Do** | Try the ritual. Click through to the landing page |

---

### 06 · Ritual Landing Page `[PRODUCT: Ritual Guide generated on page · ×3 dosha]`

| | |
|---|---|
| **Think** | This is a whole system designed for exactly me |
| **Feel** | Trust building — warm, I want to go deeper |
| **Do** | Explore the ritual. Download the guide. Consider the bundle |

**Behaviour split → Email 3 (three streams):**

| Stream | Think | Feel | Do |
|--------|-------|------|----|
| **3A — Academy** | I want to understand this more deeply | Intellectually drawn in | Enrol in the first free lesson |
| **3B — Ritual + Product** | These products belong to my ritual | Ready — not pressured | Click through to the product page |
| **3C — Full Bundle** | This completes what I already started | Confident — no buyer anxiety | Begin my ritual |

---

### 08 · Purchase — Bundle Pages + Product Pages `[PRODUCT: Product Guide PDF]`

| | |
|---|---|
| **Think** | This is the natural end of a journey I chose |
| **Feel** | Grounded in the decision — not rushed into it |
| **Do** | Complete ritual. Open post-purchase onboarding |

---

## What This Means for the Build

| Touchpoint | Status | Notes |
|---|---|---|
| Dosha Quiz | In progress (sprint 1) | This repo |
| Dosha Card | **Next build priority** | Must use ETHA design system, not reference HTML fonts/styles |
| Email 1: The Mirror | Future | Dynamic personalisation per dosha |
| Email 2: The Guide | Future | ×3 versions |
| Ritual Landing Page | Future | Generated ritual guide on page |
| Email 3A/B/C | Future | Behaviour-split streams |
| Academy Page | Future | |
| Product/Bundle Pages | Future | |

## Key Design Insight

Joana's journey is built on **being seen before being sold to**. The Dosha Card comes before the email gate — she gets real value (her result) first, then chooses to continue. This is the core emotional sequence. Never reverse it.
