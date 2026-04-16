# ĒTHA Homepage — Section-by-Section Creative Direction

*Creative director brainstorm: layouts, image placements, aura behavior, and element composition for every section below the hero.*

---

## The Aura Thread — The Spine of the Page

The single most important visual concept: **one continuous aura line flows through the entire page**, connecting every section like an energetic spine. It is not repeated decoration — it is a single organism that changes state as the emotional journey progresses.

| Section | Aura State | Aura Behavior |
|---------|-----------|---------------|
| Hero | Balanced | Enters from right edge, gentle curve flowing down into content |
| Three Pillars | Balanced | Continues left side, subtle vertical drift |
| Five Elements | **Energised** | Cream stroke on dark — becomes angular, restless, alive with the elements |
| Doshas | **Transitions** | Splits into 3 dosha-specific auras (Vata=energised, Pitta=balanced, Kapha=relaxed) |
| Rituals | Relaxed | Loose, flowing, organic — wraps playfully around imagery |
| Academy | Balanced (restrained) | Minimal — single thin line, almost geometric. Authority. |
| Community | Relaxed | Large, embracing loop around the community |
| Closure | Balanced | Closes the loop — path completes back to origin |

**Technical:** The thread is implemented as a page-level SVG that uses `strokeDasharray` + `strokeDashoffset` animated via GSAP ScrollTrigger, drawing itself as the user scrolls. Each section also has its own local aura decorations.

---

## Section 2: FIVE ELEMENTS — "Awe & Realisation"

### Emotional Intent
Cinematic. Sacred. Almost overwhelming. The user should feel the raw power of nature's five elements — not learn about them academically. **Visuals do the teaching. Copy is secondary.**

### Background & Color
- **Full aubergine (#3D233B) background** — first dramatic shift from cream. This is the dark dive.
- Text: cream (#FFEFDE)
- Aura stroke: cream, transitioning to energised state (more angular, restless curves)

### Layout — Vertical Cinema Panels

Five full-bleed strips, each element gets a **near-full-viewport treatment**. No cards, no grids — pure editorial cinema.

```
┌─────────────────────────────────────────────────────┐
│                    AUBERGINE BG                      │
│                                                      │
│  ── Intro line (Plantin italic, cream, centered) ──  │
│  "Five forces shape everything. Including you."      │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────┐                            │
│  │                      │   E A R T H               │
│  │   IMAGE PLACEHOLDER  │   ─────────               │
│  │   (landscape/rock    │   "Weight. Foundation.     │
│  │    texture, earthy)  │    The ground beneath      │
│  │   60% width          │    everything."            │
│  │   flush left edge    │                            │
│  │                      │   Aura line curves         │
│  └──────────────────────┘   around right side ───╮   │
│                                              ╭───╯   │
├─────────────────────────────────────────────────────┤
│                                                      │
│               W A T E R    ┌──────────────────────┐  │
│               ─────────    │                      │  │
│  "Force. Flow.             │   IMAGE PLACEHOLDER  │  │
│   The current that         │   (ocean, waterfall, │  │
│   never stops."            │    rain macro)       │  │
│                            │   60% width          │  │
│   ╭─── Aura crosses       │   flush right edge   │  │
│   ╰─── to left side       │                      │  │
│                            └──────────────────────┘  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────┐                            │
│  │                      │   F I R E                  │
│  │   IMAGE PLACEHOLDER  │   ─────────               │
│  │   (flames, lava,     │   "Heat. Transformation.  │
│  │    ember macro)       │    The spark that          │
│  │   60% width           │    changes everything."   │
│  │   flush left edge     │                            │
│  └──────────────────────┘                            │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│                A I R       ┌──────────────────────┐  │
│               ─────────    │                      │  │
│  "Movement. Breath.        │   IMAGE PLACEHOLDER  │  │
│   The invisible force      │   (wind in grass,    │  │
│   you feel but never see." │    clouds, mist)     │  │
│                            │   60% width          │  │
│                            │   flush right edge   │  │
│                            └──────────────────────┘  │
├─────────────────────────────────────────────────────┤
│                                                      │
│              ┌──────────────────────────┐            │
│              │                          │            │
│              │    IMAGE PLACEHOLDER     │            │
│              │    (cosmos, light rays,  │            │
│              │     ethereal abstraction)│            │
│              │    centered, 80% width   │            │
│              │                          │            │
│              └──────────────────────────┘            │
│                                                      │
│                  E T H E R                           │
│                  ─────────                           │
│        "Space. Connection. The source                │
│         from which everything flows."                │
│                                                      │
│         ╭── Aura encircles "Ether" ──╮              │
│         ╰────────────────────────────╯              │
│                                                      │
│         ~ (The Element marque, centered)             │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Element Treatment
- **Element name**: Brandon Grotesque, 12px, UPPERCASE, tracking 0.3em, cream — spaced wide
- **One-line tagline**: Plantin Semi Bold, ~32–40px, cream, tight leading (1.0)
- **No body paragraphs** — just the tagline. Visuals teach.
- Image placeholders: nature photography at macro and vast scale. Full-bleed to section edge on alternating sides.
- **Ether is different**: centered, larger image, more ethereal treatment. This is where we introduce the ~ Element marque.

### Aura Behavior
- Single energised-state aura line flows down the section, cream stroke ~1.5px
- Path weaves between the alternating image/text columns — left, right, left, right
- Animated via GSAP ScrollTrigger (draws as you scroll)
- Transitions from calm (top) to angular/restless (middle) back to calm (bottom/ether)

### Animation
- Each element panel fades + slides in from the image side on scroll
- Images have subtle parallax (yPercent: -15, scrub)
- Element names stagger-reveal letter by letter (GSAP SplitText or manual spans)
- The transition out should feel like emerging from depth — cream bleeds in from edges

---

## Section 3: DOSHAS — "Meaning & Recognition"

### Emotional Intent
Understanding with beauty. The user sees how the 5 elements combine into 3 constitutions and **recognises themselves**. Logic meets aesthetics. This is the quiz funnel.

### Background & Color
- **Cream (#FFEFDE) background** — return to light after the dark Five Elements
- Text: aubergine (#3D233B)
- Each dosha introduces its own color subtly: Vata blue halo, Pitta warm glow, Kapha green tint

### Layout — Staggered Triptych

```
┌─────────────────────────────────────────────────────┐
│                     CREAM BG                         │
│                                                      │
│  ── Section label ──                                 │
│  — The Three Doshas                                  │
│                                                      │
│  "Five elements. Three constitutions.                │
│   Which one are you?"                                │
│  (Plantin Semi Bold, 40–48px, aubergine)             │
│                                                      │
│  ┌─────────── ELEMENTS → DOSHAS DIAGRAM ──────────┐ │
│  │                                                  │ │
│  │   Earth ──╮              ╭── Kapha              │ │
│  │   Water ──┤   combine    │                      │ │
│  │   Fire  ──┤   into   ───►── Pitta              │ │
│  │   Air   ──┤              │                      │ │
│  │   Ether ──╯              ╰── Vata               │ │
│  │                                                  │ │
│  │  (Animated SVG — lines draw on scroll,           │ │
│  │   elements glow their dosha color)               │ │
│  └──────────────────────────────────────────────────┘ │
│                                                      │
│  ┌── THREE DOSHA PANELS (staggered, not aligned) ──┐ │
│  │                                                  │ │
│  │  ╭─────────╮                                     │ │
│  │  │  VATA   │  ← offset UP 40px                  │ │
│  │  │ Air +   │  Vata Aura SVG (energised shape)    │ │
│  │  │ Ether   │  behind panel, vata-light tint      │ │
│  │  │         │  IMAGE: person in wind, motion      │ │
│  │  │ slender │  Square crop, overlaps aura         │ │
│  │  │ frame,  │                                     │ │
│  │  │ quick.. │                                     │ │
│  │  ╰─────────╯                                     │ │
│  │         ╭─────────╮                              │ │
│  │         │  PITTA  │  ← centered baseline         │ │
│  │         │ Fire +  │  Balanced Aura SVG           │ │
│  │         │ Water   │  pitta-light warm glow       │ │
│  │         │         │  IMAGE: intense gaze,         │ │
│  │         │ intense │  athletic, fire              │ │
│  │         │ passion │                              │ │
│  │         │ ate..   │                              │ │
│  │         ╰─────────╯                              │ │
│  │                  ╭─────────╮                     │ │
│  │                  │  KAPHA  │  ← offset DOWN 40px │ │
│  │                  │ Earth + │  Relaxed Aura SVG   │ │
│  │                  │ Water   │  kapha-light tint    │ │
│  │                  │         │  IMAGE: grounded,    │ │
│  │                  │ steady  │  strong, calm        │ │
│  │                  │ ground  │                      │ │
│  │                  │ ed..    │                      │ │
│  │                  ╰─────────╯                     │ │
│  └──────────────────────────────────────────────────┘ │
│                                                      │
│  ── CTA (centered) ──                                │
│  [  DISCOVER YOUR DOSHA  ]  ← AuraButton             │
│  (Balanced aura around button)                       │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Dosha Panel Composition
Each dosha panel is NOT a card with shadow. It's a compositional unit:

1. **Dosha-specific Aura SVG** — large, background, 40% opacity stroke in the dosha's accent color
   - Vata: energised aura (angular, restless loops) in Citrine (#F5A800)
   - Pitta: balanced aura (smooth oval) in Aquamarine (#A2E8F2)
   - Kapha: relaxed aura (flowing blob) in Carnelian (#FFB3A5)
2. **Image placeholder** — square or portrait crop, overlapping the aura. Person embodying the dosha.
3. **Dosha name** — Plantin Semi Bold, 28px
4. **Element combination** — Plantin Italic, 14px ("Air + Ether")
5. **Short personality line** — Plantin Light, 15px, 3-4 lines max
6. **Color gradient halo** — subtle radial gradient in the dosha's light color, behind the panel

### Aura Behavior
- The page-level aura thread SPLITS into three paths here — one per dosha
- Each dosha's local aura is in its antidote color (not masterbrand aubergine)
- Auras animate: gentle breathing scale (1.0 → 1.02 → 1.0, 6s loop)

### Animation
- The elements-to-doshas diagram animates on scroll: lines draw, elements light up, doshas appear
- Dosha panels stagger in: Vata (from left), Pitta (from center/below), Kapha (from right)
- Aura shapes draw themselves behind each panel
- Hover: dosha panel's aura glows slightly brighter, image scales 1.02

---

## Section 4/5: RITUALS — "Playful Authority"

### Emotional Intent
"This ancient science meets me where I am." Warm, human, slightly playful. Real moments, not staged wellness. This section bridges the conceptual (elements, doshas) with the practical (how you actually live this).

### Background & Color
- **Cream primary**, with one aubergine sub-strip for contrast rhythm
- Text: aubergine on cream, cream on aubergine
- Aura: relaxed state — loose, flowing, organic

### Layout — Asymmetric Editorial

```
┌─────────────────────────────────────────────────────┐
│                     CREAM BG                         │
│                                                      │
│  ── Section label (left-aligned) ──                  │
│  — Ancient Wisdom, Modern Life                       │
│                                                      │
│  "Ayurveda is not a museum piece.                    │
│   It lives in every morning,                         │
│   every meal, every breath."                         │
│  (Plantin Semi Bold, 36–44px, left-aligned,          │
│   max-width 600px)                                   │
│                                                      │
│  ┌─── ROW 1: MORNING RITUALS ────────────────────┐  │
│  │                                                │  │
│  │  ┌──────────────────┐                          │  │
│  │  │                  │    "Begin with intention" │  │
│  │  │  IMAGE           │    ─────────────────────  │  │
│  │  │  (hands cupping  │    Plantin SemiBold 28px  │  │
│  │  │   water, morning │                          │  │
│  │  │   light, steam   │    Body text about        │  │
│  │  │   from a cup)    │    morning rituals.       │  │
│  │  │                  │    Plantin Light 16px.    │  │
│  │  │  65% width       │    3-4 lines.            │  │
│  │  │  flush LEFT      │                          │  │
│  │  │                  │    Relaxed aura SVG       │  │
│  │  │                  │    wraps from image edge   │  │
│  │  └──────────────────┘    into text area ──╮    │  │
│  │                                       ╭───╯    │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─── ROW 2: EVENING RITUALS (reversed) ─────────┐  │
│  │                                                │  │
│  │  "Close with gratitude"   ┌──────────────────┐ │  │
│  │  ─────────────────────    │                  │ │  │
│  │  Plantin SemiBold 28px    │  IMAGE           │ │  │
│  │                           │  (candle flame,  │ │  │
│  │  Body text about          │   evening sky,   │ │  │
│  │  evening wind-down.       │   hands resting) │ │  │
│  │  Plantin Light 16px.      │                  │ │  │
│  │                           │  55% width       │ │  │
│  │  ╰── Aura loops back     │  flush RIGHT     │ │  │
│  │       from right ────╮    │                  │ │  │
│  │                  ╭───╯    └──────────────────┘ │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
├─────────────────────────────────────────────────────┤
│              AUBERGINE STRIP (contrast break)        │
│                                                      │
│  ┌─── PULL QUOTE ────────────────────────────────┐  │
│  │                                                │  │
│  │  "Balance is not something you find.           │  │
│  │   It is something you create."                 │  │
│  │                                                │  │
│  │  — Plantin Regular Italic, 28–36px, cream      │  │
│  │    centered, max-width 700px                   │  │
│  │    Aura (cream stroke) flows behind quote      │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
├─────────────────────────────────────────────────────┤
│                     CREAM BG                         │
│                                                      │
│  ┌─── ROW 3: RITUAL PRODUCT TRIO ────────────────┐  │
│  │                                                │  │
│  │  Three ritual "moments" side by side:          │  │
│  │                                                │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐       │  │
│  │  │ IMAGE   │  │ IMAGE   │  │ IMAGE   │       │  │
│  │  │ (oil    │  │ (tea    │  │ (skin   │       │  │
│  │  │ pouring │  │ ritual, │  │ care,   │       │  │
│  │  │ on skin)│  │ steam)  │  │ massage)│       │  │
│  │  │         │  │         │  │         │       │  │
│  │  │ Aura    │  │ Aura    │  │ Aura    │       │  │
│  │  │ frame   │  │ frame   │  │ frame   │       │  │
│  │  ├─────────┤  ├─────────┤  ├─────────┤       │  │
│  │  │— Nourish│  │— Cleanse│  │— Restore│       │  │
│  │  │ Plantin │  │ Plantin │  │ Plantin │       │  │
│  │  │ Italic  │  │ Italic  │  │ Italic  │       │  │
│  │  │ 14px    │  │ 14px    │  │ 14px    │       │  │
│  │  └─────────┘  └─────────┘  └─────────┘       │  │
│  │                                                │  │
│  │  Each image has a relaxed aura SVG as a        │  │
│  │  frame (not a border — an organic loop         │  │
│  │  around the image, slightly offset)            │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ── CTA (centered) ──                                │
│  [  EXPLORE OUR RITUALS  ]  ← AuraButton             │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Image Direction
- **NOT product photography.** These are lifestyle moments. Hands, textures, steam, light.
- **Perfectly imperfect**: Skin texture visible. Movement blur OK. Not retouched-flat.
- **Modern context**: Contemporary spaces, not ashram/temple settings. A kitchen counter, a bathroom, a bedside.

### Aura Behavior
- Relaxed state — flowing, blob-like curves that wrap around images
- The aura acts as organic frames for the ritual trio images
- In the aubergine pull-quote strip: cream aura flows gently behind the text
- Animated: slow drift (translateX oscillation, 8s loop)

### Animation
- Row 1 image slides in from left, text from right (staggered 0.15s)
- Row 2 reverses
- Pull quote fades in with the aura drawing behind it
- Ritual trio staggers in 1-2-3 with aura frames drawing simultaneously
- Parallax on all images (subtle, yPercent: -10)

---

## Section 6: ACADEMY — "Authority & Modern Mastery"

### Emotional Intent
Credibility. Intelligence. Professional excellence. This section is **sleeker and more controlled** than everything before it. Cleaner than Masterclass, more refined than Apple. The aura is restrained here — authority doesn't need decoration.

### Background & Color
- **Aubergine (#3D233B) background** — authority, depth
- Text: cream (#FFEFDE)
- Accent: subtle cream horizontal rules for editorial structure
- Aura: cream stroke, barely visible, almost geometric — restrained balanced state

### Layout — Editorial Authority

```
┌─────────────────────────────────────────────────────┐
│                   AUBERGINE BG                       │
│                                                      │
│  ┌─── ACADEMY HEADER ───────────────────────────┐   │
│  │                                               │   │
│  │  ĒTHA ACADEMY                                 │   │
│  │  (Brandon Grotesque Bold, 12px, cream,         │   │
│  │   tracking 0.3em, UPPERCASE)                   │   │
│  │                                               │   │
│  │  ─────────── (thin cream hr, 120px wide) ──── │   │
│  │                                               │   │
│  │  "Where ancient wisdom                        │   │
│  │   meets modern minds"                         │   │
│  │  (Plantin Semi Bold, 44–52px, cream,          │   │
│  │   tight leading 1.0)                          │   │
│  │                                               │   │
│  │  Short intro paragraph.                       │   │
│  │  (Plantin Light, 18px, cream/80%)             │   │
│  │                                               │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
│  ┌─── VIDEO EMBED ───────────────────────────────┐   │
│  │                                               │   │
│  │  ┌───────────────────────────────────────┐    │   │
│  │  │                                       │    │   │
│  │  │          VIDEO PLACEHOLDER            │    │   │
│  │  │          16:9 aspect ratio             │    │   │
│  │  │          Academy promo footage         │    │   │
│  │  │                                       │    │   │
│  │  │              ▶ PLAY                    │    │   │
│  │  │                                       │    │   │
│  │  └───────────────────────────────────────┘    │   │
│  │  80% width, centered, sharp corners           │   │
│  │  Subtle aura line traces the top edge         │   │
│  │                                               │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
│  ┌─── GURU ROW ──────────────────────────────────┐   │
│  │                                               │   │
│  │  "Learn from the source"                      │   │
│  │  (Plantin Italic, 14px, cream/60%)            │   │
│  │                                               │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐          │   │
│  │  │        │  │        │  │        │          │   │
│  │  │ GURU 1 │  │ GURU 2 │  │ GURU 3 │          │   │
│  │  │ portrait│  │ portrait│  │ portrait│          │   │
│  │  │        │  │        │  │        │          │   │
│  │  │ SHARP  │  │ SHARP  │  │ SHARP  │          │   │
│  │  │ RECT   │  │ RECT   │  │ RECT   │          │   │
│  │  │ CROP   │  │ CROP   │  │ CROP   │          │   │
│  │  ├────────┤  ├────────┤  ├────────┤          │   │
│  │  │Dr. Name│  │Name    │  │Name    │          │   │
│  │  │TITLE   │  │TITLE   │  │TITLE   │          │   │
│  │  └────────┘  └────────┘  └────────┘          │   │
│  │                                               │   │
│  │  Name: Plantin Regular, 18px, cream           │   │
│  │  Title: Brandon Grotesque, 10px, cream/60%    │   │
│  │  NO rounded crops. Sharp rectangular frames.  │   │
│  │  NO circular avatars. These are thinkers,     │   │
│  │  not profile pics.                            │   │
│  │                                               │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
│  ┌─── TOPIC GRID ────────────────────────────────┐   │
│  │                                               │   │
│  │  ┌───────────────┐  ┌───────────────┐         │   │
│  │  │ TOPIC CARD    │  │ TOPIC CARD    │         │   │
│  │  │               │  │               │         │   │
│  │  │ — Nutrition   │  │ — Meditation  │         │   │
│  │  │ 12 sessions   │  │ 8 sessions    │         │   │
│  │  │               │  │               │         │   │
│  │  │ hr line ───── │  │ hr line ───── │         │   │
│  │  │               │  │               │         │   │
│  │  │ Brief desc.   │  │ Brief desc.   │         │   │
│  │  └───────────────┘  └───────────────┘         │   │
│  │  ┌───────────────┐  ┌───────────────┐         │   │
│  │  │ — Herbalism   │  │ — Movement    │         │   │
│  │  │ 10 sessions   │  │ 6 sessions    │         │   │
│  │  └───────────────┘  └───────────────┘         │   │
│  │                                               │   │
│  │  Topic cards: transparent bg, 1px cream/20%   │   │
│  │  border, sharp corners. Clean, minimal.       │   │
│  │  Hover: border brightens to cream/40%         │   │
│  │                                               │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
│  ── CTA (centered) ──                                │
│  [  ENTER THE ACADEMY  ]                             │
│  (cream border button on dark bg)                    │
│                                                      │
│  Single restrained aura line flows from              │
│  video area to CTA — barely visible, 0.06 opacity    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Typography Changes
This section is **typographically sharper** than others:
- Brandon Grotesque appears more prominently (section label, topic metadata)
- Horizontal rules (`<hr>`) as structural dividers — 1px cream at 20% opacity
- Tighter spacing between elements — confidence, not breathing room
- No italic labels here — everything is precise

### Aura Behavior
- **Minimal.** A single thin line (0.75px, cream at 6% opacity) that traces a nearly-straight path with gentle curves
- No loops, no blobs — authority is restrained
- The aura is almost invisible — it's there if you look, but it doesn't compete

### Animation
- Header: text slides up, hr draws across
- Video: scales from 95% to 100% on scroll
- Guru portraits: stagger in with slight parallax
- Topic cards: stagger-reveal in 2x2 grid order
- All animations are CRISPER here — shorter duration (0.6s vs 0.9s), sharper easing

---

## Section 7: COMMUNITY — "Raw & Human"

### Emotional Intent
Belonging. Real people, real stories. **Not testimonials — overheard moments.** The design should feel warm, intimate, slightly messy (in a good way). Anti-corporate.

### Background & Color
- **Cream (#FFEFDE) background**
- Text: aubergine
- Aura: large relaxed-state aura in aubergine at low opacity — embracing, communal

### Layout — Scattered Mosaic

```
┌─────────────────────────────────────────────────────┐
│                     CREAM BG                         │
│                                                      │
│  ── Section label ──                                 │
│  — Our Community                                     │
│                                                      │
│  "Real stories from real lives."                     │
│  (Plantin Semi Bold, 36px, aubergine)                │
│                                                      │
│  ╭──── Large Relaxed Aura SVG ────╮                  │
│  │  (background, aubergine 5%     │                  │
│  │   opacity, spans full section)  │                  │
│  │                                 │                  │
│  │  ┌────────────────┐             │                  │
│  │  │ PORTRAIT IMAGE │  "I stopped │                  │
│  │  │ (candid face,  │   fighting  │                  │
│  │  │  real emotion)  │   my body   │                  │
│  │  │                │   and started│                  │
│  │  │  offset left,  │   listening."│                  │
│  │  │  tilted -1deg  │             │                  │
│  │  └────────────────┘  — Sarah,   │                  │
│  │                       London    │                  │
│  │                                 │                  │
│  │         ┌────────────────┐      │                  │
│  │ "Etha   │ PORTRAIT IMAGE │      │                  │
│  │  didn't │ (hands making  │      │                  │
│  │  teach  │  tea, intimate │      │                  │
│  │  me     │  moment)       │      │                  │
│  │  anything│                │      │                  │
│  │  new. It │ offset right,  │      │                  │
│  │  reminded│ tilted +1deg  │      │                  │
│  │  me of  └────────────────┘      │                  │
│  │  what                           │                  │
│  │  I already                      │                  │
│  │  knew."                         │                  │
│  │                                 │                  │
│  │  — Marcus, Copenhagen           │                  │
│  │                                 │                  │
│  │  ┌────────────┐                 │                  │
│  │  │ LANDSCAPE  │   "My dosha     │                  │
│  │  │ IMAGE      │    result was   │                  │
│  │  │ (group     │    the first    │                  │
│  │  │  moment,   │    time I felt  │                  │
│  │  │  laughter) │    understood." │                  │
│  │  │            │                 │                  │
│  │  │ wider crop │   — Aiko, Tokyo │                  │
│  │  └────────────┘                 │                  │
│  │                                 │                  │
│  ╰─────────────────────────────────╯                  │
│                                                      │
│  ┌─── NUMBERS STRIP (subtle) ────────────────────┐   │
│  │                                               │   │
│  │  47,000+        85+           12              │   │
│  │  JOURNEYS       COUNTRIES     LANGUAGES       │   │
│  │  BEGUN          REACHED       SPOKEN          │   │
│  │                                               │   │
│  │  (Numbers: Plantin SemiBold, 36px             │   │
│  │   Labels: Brandon 10px UPPERCASE)             │   │
│  │                                               │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Testimonial Treatment
- **No cards.** No borders, no shadows. Just text and images floating in space.
- Quotes: Plantin Regular Italic, 22–28px, aubergine
- Attribution: Plantin Light Italic, 14px, aubergine/60% — preceded by em dash
- Images: portrait and landscape crops, **slightly rotated** (±1–2deg via CSS transform)
- Images overlap the aura background — they're part of it, not contained by it
- Layout is deliberately **asymmetric** — items placed at different horizontal positions

### Aura Behavior
- One large relaxed-state aura SVG spans the entire section background
- Aubergine stroke at ~5% opacity — a warm embrace
- The community lives "within" the aura — it encircles them
- Animated: very slow rotation (0.5deg over 20s, oscillating)

### Animation
- Testimonials stagger in as you scroll — each one from a slightly different direction
- Images have a subtle entrance rotation (from ±3deg to ±1deg)
- Numbers count up on scroll (GSAP counter animation)
- The background aura slowly draws itself as the section enters view

---

## Section 8: CLOSURE — "Return to Nature"

### Emotional Intent
Reverence. Completion. Homecoming. **"I began with nature — and I end by remembering I am nature."** This is a bow, not a sales pitch. The aura closes its loop.

### Background & Color
- **Cream → nature image → cream** — echoes the hero structure
- Text: aubergine (on cream), cream (on image)
- Aura: balanced state, completing the loop that began in the hero

### Layout — Echo of the Hero

```
┌─────────────────────────────────────────────────────┐
│                     CREAM BG                         │
│                                                      │
│  (generous whitespace — 128px top padding)           │
│                                                      │
│  ── Centered text block ──                           │
│                                                      │
│  ~ (The Element marque, small, centered, aubergine)  │
│                                                      │
│  "You are nature.                                    │
│   Return to yourself."                               │
│  (Plantin Semi Bold, 36–44px, aubergine,             │
│   centered, tight leading 1.0)                       │
│                                                      │
│  Short closing line.                                 │
│  (Plantin Light, 16px, aubergine/70%, centered)      │
│                                                      │
│  [  BEGIN YOUR JOURNEY  ]  ← AuraButton              │
│  (final CTA — invitation, not demand)                │
│                                                      │
│  ╭── Aura closes its loop here ──╮                   │
│  │   The balanced aura that began │                   │
│  │   in the hero completes its    │                   │
│  │   circuit — a visible closing  │                   │
│  │   of the organic oval          │                   │
│  ╰────────────────────────────────╯                   │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌───────────────────────────────────────────────┐   │
│  │                                               │   │
│  │            NATURE IMAGE                       │   │
│  │            (echo of hero — same scale,        │   │
│  │             but quieter: still water,          │   │
│  │             sunset, mist, dawn)               │   │
│  │            Full-width, 40vh height            │   │
│  │            NOT as tall as hero (65vh)          │   │
│  │            — this is an echo, not repeat       │   │
│  │                                               │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
├────────────────── FOOTER ───────────────────────────┤
│                                                      │
│                   AUBERGINE BG                       │
│                                                      │
│           ┌────────────────────┐                     │
│           │     ĒTHA LOGO      │                     │
│           │  (cream, centered)  │                     │
│           └────────────────────┘                     │
│                                                      │
│  SHOP    ACADEMY    OUR STORY    BLOG    CONTACT     │
│  (Brandon Grotesque, 11px, UPPERCASE, cream/60%,     │
│   tracking 0.2em, flex row centered)                 │
│                                                      │
│  ─────────── (thin hr, cream at 10%) ────────────    │
│                                                      │
│  ┌────────────────┐  ┌────────────────────────────┐  │
│  │ INSTAGRAM      │  │  Subscribe to our journey  │  │
│  │ PINTEREST      │  │  [  email input  ] [→]     │  │
│  │ YOUTUBE        │  │  (Plantin Light 14px,       │  │
│  │                │  │   Brandon btn UPPERCASE)    │  │
│  │ (Brandon 10px) │  │                            │  │
│  └────────────────┘  └────────────────────────────┘  │
│                                                      │
│  ─────────── (thin hr) ──────────────────────────    │
│                                                      │
│  © 2026 ĒTHA           PRIVACY    TERMS    COOKIES   │
│  (Brandon 10px, cream/40%)                           │
│                                                      │
│  ~ (Element marque, centered, cream/20%, closing)    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Aura Behavior
- The aura thread that has been flowing through the entire page **completes its loop** here
- Visually: the balanced oval shape draws its final segment, closing back to where it started
- This is the emotional payoff of the thread concept — the journey comes full circle
- Animated: the final closing stroke draws as you reach this section

### Animation
- Text block: gentle fade in, no dramatic entrance — this is quiet
- CTA: appears last with the aura encircling it
- Nature image: subtle parallax (less dramatic than hero)
- Footer: simple fade in, no theatrics
- The aura's closing animation is the main event — slow, deliberate, 2s duration

### Footer Notes
- Minimal, functional, not decorative
- No redundant content or marketing copy
- Email signup is the only interactive element
- The ~ Element marque at the very bottom is a quiet brand signature

---

## Page-Level Summary

| # | Section | BG | Aura State | Height | Key Visual |
|---|---------|-----|-----------|--------|------------|
| 1 | Hero | Cream | Balanced | 100vh | Nature image, overlapping text |
| 2 | Three Pillars | Cream | Balanced | Auto (~80vh) | Three icon columns |
| 3 | Five Elements | **Aubergine** | **Energised** | ~500vh (5 panels) | Alternating cinema panels |
| 4 | Doshas | Cream | Three variants | Auto (~120vh) | Staggered dosha triptych |
| 5 | Rituals | Cream + aubergine strip | Relaxed | Auto (~150vh) | Asymmetric editorial |
| 6 | Academy | **Aubergine** | Balanced (restrained) | Auto (~100vh) | Video + guru row |
| 7 | Community | Cream | Relaxed | Auto (~80vh) | Scattered testimonials |
| 8 | Closure | Cream | Balanced (closing) | Auto (~60vh) | Echo image + CTA |
| 9 | Footer | **Aubergine** | None | Auto | Minimal nav + signup |

### Color Rhythm (scroll order)
```
CREAM → CREAM → AUBERGINE → CREAM → CREAM+AUB → AUBERGINE → CREAM → CREAM → AUBERGINE
hero    pillars  elements    doshas  rituals      academy     community closure  footer
```

This light-dark-light-dark cadence creates the "tonal breathing" described in the design system.

### CTA Strategy
Every section either has a CTA or flows naturally into the next section's CTA:
- Hero: **TAKE THE DOSHA TEST** (primary — the whole page's purpose)
- Three Pillars: TAKE THE DOSHA TEST (reinforcement)
- Five Elements: *(no CTA — purely experiential)*
- Doshas: **DISCOVER YOUR DOSHA** (quiz funnel)
- Rituals: EXPLORE OUR RITUALS
- Academy: ENTER THE ACADEMY
- Community: *(no CTA — the stories speak)*
- Closure: **BEGIN YOUR JOURNEY** (final invitation)
