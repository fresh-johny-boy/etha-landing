# Dosha Card — Structure & Copy

This is the result screen Joana sees immediately after completing the quiz (step 03 in the funnel). It is the most emotionally important touchpoint — the moment she feels seen.

**Source reference:** `docs/source/dosha-card-reference.html` — use for structure and copy only. Design, fonts, colors, and border-radius must follow ETHA design system (Plantin/Brandon, aubergine/cream, 0px radius, brand Aura SVG).

---

## Emotional Goal

> "This is exactly me — how do they know this?"

Joana should feel validated and a little emotional. The card must make her want to screenshot it AND enter her email. The result screen comes before the email gate.

---

## Card Structure (Top → Bottom)

| Block | Content | Notes |
|---|---|---|
| **Wordmark** | E T H A | Small, tracked, top of card |
| **Aura** | Balanced aura SVG (per dosha colour) | Stroke-only, animated gentle morph |
| **Persona line** | `[FIRST NAME], YOU ARE` | Small uppercase label |
| **Dosha Name** | Vata / Pitta / Kapha | Large Plantin serif, dominant |
| **Archetype** | See per-dosha below | Small uppercase label beneath name |
| **Composition** | % primary / % secondary / % tertiary | Three columns, serif numerals |
| **Rule** | Horizontal divider | |
| **Reframe Quote** | See per-dosha below | Italic serif, emotional core of card |
| **Secondary Dosha Note** | "With [X] secondary, ..." | Explains the nuance in their profile |
| **Mirror Signals** | 3 bullet observations | "What your answers revealed" |
| **Ritual Block** | One specific practice for tonight/tomorrow | Concrete, dosha-specific |
| **CTA Button** | Get my full report | Triggers email gate |
| **CTA Hint** | "Your complete [Dosha] profile is waiting" | Below button |
| **Teaser Strip** | Plant/guide tease | Bottom, very subtle |

---

## Copy Per Dosha

### VATA — The Kinetic Mind

**Archetype:** The Kinetic Mind

**Reframe:**
> "You were built to move. Right now you are being asked to also burn."

**Composition:** 60% Vata · 30% Pitta · 10% Kapha

**Secondary note:**
With Pitta secondary, your creativity carries an edge of precision — and your burnout arrives faster than most Vatas.

**Mirror signals (what your answers revealed):**
- Your mind races when your body needs to land
- You push through tired instead of stopping
- Your thoughts arrive faster than you can place them

**Ritual (one thing for tonight):**
Lie on your back. Both hands on your belly. Breathe out completely before breathing in. Three times. Let the weight of your hands tell your nervous system the day is finished.

**CTA hint:** Your complete Vata profile is waiting

**Teaser:** Includes the one plant Vata has relied on for grounding for centuries

---

### PITTA — The Fiery Drive

**Archetype:** The Fiery Drive

**Reframe:**
> "You are not burning out. You are Pitta — and what you need is not less fire. It is a cooler vessel."

**Composition:** 58% Pitta · 32% Vata · 10% Kapha

**Secondary note:**
With Vata secondary, your fire moves fast and can scatter — brilliant and creative, but prone to burnout from doing too many things at full intensity.

**Mirror signals (what your answers revealed):**
- Your precision turns inward when there is no outlet
- You finish the day in your head long after your body has stopped
- Your frustration rises before you can name its source

**Ritual (one thing for tonight):**
Roll your tongue or part your lips. Inhale slowly through the mouth — feel the cool air travel inward. Hold briefly. Exhale through the nose. Three rounds. This is Sheetali — the oldest Pitta cooling practice in Ayurveda.

**CTA hint:** Your complete Pitta profile is waiting

**Teaser:** Includes the one plant that cools Pitta's fire without dimming its light

---

### KAPHA — The Grounded Core

**Archetype:** The Grounded Core

**Reframe:**
> "You are not stuck. You are Kapha — and the bloom is already there. It simply needs the right conditions."

**Composition:** 60% Kapha · 28% Pitta · 12% Vata

**Secondary note:**
With Pitta secondary, your depth has an edge — a will beneath the steadiness that, when activated, is formidable.

**Mirror signals (what your answers revealed):**
- Your mornings need more than one reason to begin
- You carry what others put down
- Your energy arrives slowly — and lasts the longest

**Ritual (one thing for tomorrow morning):**
Before anything else — five minutes of movement. Brisk, warm, arms and legs. Then fresh ginger tea, drunk standing. Kapha wakes from the inside out — and you already know this.

**CTA hint:** Your complete Kapha profile is waiting

**Teaser:** Includes the sacred plant that tells Kapha the morning has genuinely arrived

---

## Aura Per Dosha

| Dosha | Aura State | Stroke Colour | Notes |
|---|---|---|---|
| Vata | Energised | Citrine `#F5A800` | Angular, restless |
| Pitta | Balanced | Aquamarine `#A2E8F2` | Focused, precise |
| Kapha | Relaxed | Carnelian `#FFB3A5` | Flowing, grounded |

Gentle morph animation (same pattern as QuizInterstitial). Full opacity.

---

## Email Gate

The CTA button on the Dosha Card opens the email input (currently implemented in QuizEmailGate component). After email captured → transition to confirmation state, then Email 1 "The Mirror" sends at 15 min.

## Implementation Note

Build as `QuizResult.tsx` inside `app/src/components/quiz/`. Use ETHA design tokens — no external fonts, no rounded corners, no grey shadows. Dosha colours from `globals.css` (`vata-*`, `pitta-*`, `kapha-*` families). The reference HTML is for structure and copy only.
