# Design System for ĒTHA

## 1. Visual Theme & Atmosphere

ĒTHA is an Ayurvedic health and wellbeing brand that blends ancient wisdom with contemporary design. The visual identity is built on a striking duality: warm cream (`#FFEFDE`) and deep aubergine (`#3D233B`) create an atmosphere that is simultaneously grounding and elevated, traditional and modern. The overall impression is of a luxury wellness brand that takes its craft seriously but never takes itself too seriously — what the brand calls "Playful Authority."

The primary typeface, Plantin, is a timeless serif with rounded curves and classic structure that balances the traditional and the modern. It's exceptionally legible and feels scholarly without being stuffy. The secondary typeface, Brandon Grotesque, is a geometric sans-serif used exclusively in uppercase for labels and details, lending a clean, contemporary edge. This serif-plus-sans pairing — Plantin for warmth and authority, Brandon for modern precision — mirrors the brand's core tension between ancient and contemporary.

The most distinctive decorative element is "The Aura" — organic, hand-drawn line art that flows through all brand communications. These continuous, never-broken stroke paths come in three states: Balanced (simple organic loops), Relaxed (flowing blob forms), and Energised (angular, star-like forms). The Aura represents ether — the first element, the energy source from which the brand derives its name. On cream backgrounds the Aura is drawn in aubergine; on dark backgrounds it appears in cream or the Dosha's antidote colour. The imperfect, organic quality of these lines is intentional — "there are no straight lines or 90-degree angles in nature."

**Key Characteristics:**
- Plantin serif as the primary voice — warm, timeless, legible
- Brandon Grotesque in UPPERCASE ONLY for labels, details, and navigation
- Cream (`#FFEFDE`) and Aubergine (`#3D233B`) as the masterbrand foundation
- Three Dosha colour families (Vata, Pitta, Kapha) for product differentiation
- The Aura: organic line-art decoration, always continuous, never broken
- The Element (~): a tilde-like brand marque above the logo's E
- Nature photography (landscapes, textures, water) as background imagery
- "Perfectly Imperfect" — no rigid geometry, embrace organic irregularity

## 2. Color Palette & Roles

### Masterbrand
- **Cream** (`#FFEFDE`): Primary light background, page surface, card fills, light text on dark. A warm off-white with a subtle peach undertone — not stark, not cold.
- **Aubergine** (`#3D233B`): Primary dark background, heading text on light, logo colour, dark sections. A deep plum-burgundy — not black, not brown, but a rich purple-tinged dark that brings authority.

### Vata — Air and Ether
- **Sky Blue** (`#86C4FB`): Vata energise/light. Soft periwinkle-lavender for light Vata contexts.
- **Indigo** (`#000F9F`): Vata relax/dark. Deep royal blue for immersive Vata sections.
- **Citrine** (`#F5A800`): Vata antidote colour. Warm amber-gold, derived from citrine crystal. Used for Aura lines and decorative accents on Vata backgrounds only.

### Pitta — Fire and Water
- **Fire Red** (`#FF5C3A`): Pitta energise/light. Vibrant coral-orange for energetic Pitta contexts.
- **Cool Red** (`#9D0033`): Pitta relax/dark. Deep crimson-burgundy for immersive Pitta sections.
- **Aquamarine** (`#A2E8F2`): Pitta antidote colour. Cool mint-cyan, derived from aquamarine crystal. Aura lines and decorative accents on Pitta backgrounds only.

### Kapha — Earth and Water
- **Sea Green** (`#6BCDB2`): Kapha energise/light. Fresh mint-teal for light Kapha contexts.
- **Forest Green** (`#00545C`): Kapha relax/dark. Deep teal-emerald for immersive Kapha sections.
- **Carnelian** (`#FFB3A5`): Kapha antidote colour. Warm peach-salmon, derived from carnelian crystal. Aura lines and decorative accents on Kapha backgrounds only.

### Text on Colours
- On cream backgrounds: Aubergine text
- On aubergine backgrounds: Cream text
- On Dosha colour backgrounds: Aubergine or White text only
- Never set text in antidote colours (Citrine, Aquamarine, Carnelian)

### Shadow Colours
- **Soft Aubergine** (`rgba(61,35,59,0.12)`): Primary shadow — brand-tinted depth
- **Neutral** (`rgba(0,0,0,0.06)`): Secondary ambient shadow

## 3. Typography Rules

### Font Families
- **Primary**: `Plantin`, with fallback: `"Playfair Display", Georgia, "Times New Roman", serif`
- **Secondary**: `"Brandon Grotesque"`, with fallback: `"Gill Sans", "Segoe UI", sans-serif`
- **Brandon Grotesque is UPPERCASE ONLY** — never use it in lowercase or mixed case.

### Hierarchy

| Role | Font | Weight | Leading | Tracking | Case | Notes |
|------|------|--------|---------|----------|------|-------|
| Display Hero | Plantin | Semi Bold (600) | 100% (1.0) | 0 | Sentence | Largest headlines, hero sections |
| Display Large | Plantin | Semi Bold (600) | 100% (1.0) | 0 | Sentence | Section headlines |
| Section Heading | Plantin | Semi Bold (600) | 100% (1.0) | 0 | Sentence | Sub-section titles |
| Body Large | Plantin | Regular (400) | 110% (1.1) | 0 | Sentence | Lead paragraphs, intro text |
| Body | Plantin | Light (300) | 110% (1.1) | 0 | Sentence | Standard reading text |
| Body Italic | Plantin | Light Italic (300i) | 110% (1.1) | 0 | Sentence | Emphasis, Dosha names, brand name |
| Subhead Italic | Plantin | Regular Italic (400i) | 110% (1.1) | 0 | Sentence | Category labels ("— Etha", "— Vata") |
| Detail Label | Brandon Grotesque | Medium (500) | 110% (1.1) | 80 (~5px) | UPPERCASE | Navigation, product details, ingredients, metadata |
| Detail Label Bold | Brandon Grotesque | Bold (700) | 110% (1.1) | 80 (~5px) | UPPERCASE | Section labels, category headers |
| Detail Small | Brandon Grotesque | Regular (400) | 110% (1.1) | 80 (~5px) | UPPERCASE | Fine print, captions |

### Suggested Web Sizes

| Role | Desktop | Mobile |
|------|---------|--------|
| Display Hero | 56px–72px | 36px–48px |
| Display Large | 40px–48px | 28px–36px |
| Section Heading | 28px–32px | 22px–26px |
| Body Large | 20px–22px | 18px–20px |
| Body | 16px–18px | 16px |
| Detail Label | 12px–14px | 11px–12px |

### Principles
- **Plantin carries the voice**: All emotional, storytelling, and headline content uses Plantin. It is the brand's personality in type.
- **Brandon for wayfinding**: Navigation, labels, metadata, ingredients, and structural elements use Brandon Grotesque in uppercase. It is functional, never decorative.
- **Leading distinction**: Headlines are tight (100% / 1.0 line-height) for impact. Body text breathes (110% / 1.1 line-height) for readability.
- **No tracking on Plantin**: Plantin is set with 0 letter-spacing at all sizes. Its natural proportions are trusted.
- **Wide tracking on Brandon**: Brandon Grotesque always uses tracking 80 (approximately `letter-spacing: 0.3em` at small sizes, `5px` at body sizes) to create open, modern label styling.
- **Italic as emphasis system**: Plantin Italic (both Regular and Light) is used purposefully — for the brand name in body text ("— *Etha*"), for Dosha names ("*Vata*"), and for pull quotes. It is never decorative noise.

## 4. Component Stylings

### Buttons

**Primary (Aubergine)**
- Background: `#3D233B`
- Text: `#FFEFDE` (Cream)
- Font: Brandon Grotesque Medium, 14px, UPPERCASE, tracking 80
- Padding: 14px 32px
- Border-radius: 0px (sharp corners — organic shapes come from Aura, not UI chrome)
- Hover: background lightens to `#5a3957`
- Use: Primary CTAs ("SHOP NOW", "DISCOVER")

**Secondary (Outlined)**
- Background: transparent
- Text: `#3D233B`
- Border: 1px solid `#3D233B`
- Font: Brandon Grotesque Medium, 14px, UPPERCASE, tracking 80
- Padding: 14px 32px
- Border-radius: 0px
- Hover: background fills to `rgba(61,35,59,0.06)`
- Use: Secondary actions ("LEARN MORE", "EXPLORE")

**On Dark (Cream outline)**
- Background: transparent
- Text: `#FFEFDE`
- Border: 1px solid `#FFEFDE`
- Font: Brandon Grotesque Medium, 14px, UPPERCASE, tracking 80
- Padding: 14px 32px
- Border-radius: 0px
- Hover: background fills to `rgba(255,239,222,0.1)`
- Use: CTAs on aubergine or dark Dosha sections

**Aura Button (Primary CTA)**

The main CTA uses the Balanced Aura shape as its border instead of a rectangular outline. The stroke is an organic, imperfect oval SVG `<path>` — not a CSS border or `<ellipse>`.

- Background: transparent
- Text: Brandon Grotesque Medium, 11px, UPPERCASE, tracking 0.2em, aubergine or cream
- Border: Balanced Aura SVG path, `stroke-width: 0.75`, `stroke-opacity: 0.45`
- Padding: equivalent to `px-14 py-6` (56px horizontal, 24px vertical)
- Hover interaction: **Mouse-directional morph** — the aura stroke deforms toward the cursor position:
  - The side nearest the cursor bulges outward (soft radial push, up to 16px)
  - Uses a squared raised-cosine falloff `((cos(θ)+1)/2)²` for perfectly smooth corners — no angular kinks
  - GSAP animates the SVG `d` attribute to the distorted path (0.45s, `power3.out`)
  - On mouse leave: elastic snap-back to the base shape (0.9s, `elastic.out(1, 0.4)`)
  - Stroke opacity increases from 0.45 → 0.75 and stroke-width from 0.75 → 0.9 on hover
- The base path is decomposed into 22 control points (M + 7 cubic beziers). The `distort()` function computes a new path on each `mousemove` via `requestAnimationFrame`, where each control point is pushed radially outward based on its angular alignment with the cursor direction.
- The result feels like pressing a soft membrane — the aura yields to the cursor and springs back when released.
- Use: Hero CTA ("BEGIN SELF-DISCOVERY"), Doshas CTA ("DISCOVER YOUR DOSHA"), Closure CTA, Rituals CTA
- Implementation: `AuraButton.tsx`

### Cards & Containers
- Background: `#FFEFDE` (cream) or `#ffffff` (white)
- Border: none or `1px solid rgba(61,35,59,0.1)`
- Border-radius: 0px (sharp, architectural)
- Shadow (elevated): `rgba(61,35,59,0.12) 0px 8px 24px, rgba(0,0,0,0.06) 0px 2px 8px`
- Hover: shadow deepens to `rgba(61,35,59,0.18) 0px 12px 32px`
- Content padding: 32px–48px

### Navigation
- Cream (`#FFEFDE`) background bar with bottom border `1px solid rgba(61,35,59,0.1)`
- Logo: ĒTHA centered, using logo image (SVG preferred), aubergine on cream
- Left links: Brandon Grotesque Medium, 11px–12px, UPPERCASE, tracking 80, aubergine text
- Right links: Same styling for account/cart
- Structure: `ABOUT  EXPLORE  |  ĒTHA  |  SHOP  MY ACCOUNT  CART`
- Mobile: hamburger toggle, logo centered

### Inputs & Forms
- Background: `#ffffff` or `#FFEFDE`
- Border: 1px solid `rgba(61,35,59,0.2)`
- Border-radius: 0px
- Focus: border changes to `1px solid #3D233B`
- Label: Brandon Grotesque Medium, 11px, UPPERCASE, tracking 80, `#3D233B`
- Input text: Plantin Regular, 16px, `#3D233B`
- Placeholder: Plantin Light Italic, 16px, `rgba(61,35,59,0.4)`

### The Aura (Decorative Line Art)
- Rendered as SVG `<path>` elements with `fill: none` and `stroke` only
- Stroke width: 1px–2px (thin, delicate lines)
- Stroke colour: Aubergine (`#3D233B`) on cream; Cream (`#FFEFDE`) on dark; antidote colour on Dosha backgrounds
- Shapes: organic, imperfect loops and curves — never geometric circles or straight lines
- Always a continuous, unbroken path
- States: Balanced (simple oval/loop), Relaxed (flowing blob), Energised (angular/star)
- Typically placed as background decoration, partially extending beyond container edges

### The Element (Brand Marque)
- The tilde (~) shape used as favicon, social avatar, and condensed brand mark
- Rendered in aubergine on light, cream on dark
- Minimum digital size: 16px
- Never displayed alongside the full ĒTHA logo

### Dosha Category Labels
- Format: `— *Dosha Name*` (em dash + italic Plantin)
- Example: `— *Vata*`, `— *Pitta*`, `— *Kapha*`
- Used on product cards, packaging displays, and section dividers

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px, 96px, 128px
- Section padding: 96px–128px vertical on desktop, 48px–64px on mobile

### Grid & Container
- Max content width: 1200px, centered
- Hero: full-width with nature imagery, Aura overlay, centered Plantin headline
- Feature sections: 2-column or 3-column grids
- Product grids: 3-column on desktop, 2 on tablet, 1 on mobile
- Typography grids: headlines can be offset and staggered across grid rows for dynamic layouts (as shown in brand guide)

### Whitespace Philosophy
- **Generous and intentional**: ĒTHA uses abundant whitespace to create calm, breathing room that mirrors the wellness ethos. Sections are never crowded.
- **Asymmetric balance**: Layouts often use off-center placement — a headline left with imagery right, text that staggers across grid lines. This reflects the "Perfectly Imperfect" principle.
- **Nature as texture**: Large nature photography (water, landscapes, botanical textures) serves as section backgrounds, with headlines overlaid in white Plantin. The Aura line art weaves through these images.
- **Dark/light rhythm**: Cream sections alternate with aubergine sections (or Dosha-coloured sections), creating a rich tonal cadence.

### Border Radius Scale
- 0px everywhere. ĒTHA uses sharp, architectural corners on all UI elements (buttons, cards, inputs, containers). The organic quality comes from the Aura line art and nature imagery, not from rounded UI chrome.

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, inline text, section backgrounds |
| Subtle (Level 1) | `rgba(61,35,59,0.06) 0px 2px 8px` | Slight lift on hover hints, divider emphasis |
| Standard (Level 2) | `rgba(61,35,59,0.12) 0px 8px 24px, rgba(0,0,0,0.06) 0px 2px 8px` | Product cards, content panels, image containers |
| Elevated (Level 3) | `rgba(61,35,59,0.18) 0px 16px 40px, rgba(0,0,0,0.08) 0px 4px 12px` | Modals, dropdowns, featured cards |
| Overlay | `rgba(61,35,59,0.5)` background | Modal overlays, lightboxes |

**Shadow Philosophy**: Shadows are tinted with aubergine (`rgba(61,35,59,...)`) rather than neutral grey or black. This keeps even elevation on-brand — shadows feel warm and plum-toned rather than cold. The brand uses minimal shadow overall; depth is primarily created through colour contrast (cream vs aubergine sections) and layered photography rather than drop shadows.

## 7. Do's and Don'ts

### Do
- Use Plantin for all headlines, body text, and emotional content — it IS the brand voice
- Use Brandon Grotesque ONLY in uppercase with wide tracking for labels and navigation
- Keep the masterbrand palette to Cream (`#FFEFDE`) and Aubergine (`#3D233B`) for non-Dosha content
- Use The Aura as organic, continuous-stroke SVG decoration — imperfect loops and flows
- Set text on Dosha colours in Aubergine or White only
- Use each Dosha's own antidote colour for its Aura lines (Citrine for Vata, Aquamarine for Pitta, Carnelian for Kapha)
- Keep border-radius at 0px on all UI elements — sharp corners are intentional
- Use generous whitespace and let the design breathe
- Place the logo centered, either at top or bottom of the frame
- Use nature photography (water, earth, sky, botanicals) for atmospheric imagery

### Don't
- Don't use Brandon Grotesque in lowercase or mixed case — UPPERCASE ONLY
- Don't mix Dosha colours across families (no Vata blue on a Pitta section)
- Don't set text in antidote colours (Citrine, Aquamarine, Carnelian are decorative only)
- Don't use the ĒTHA logo alongside The Element (~) — they are separate assets
- Don't alter, rotate, recolour, or distort the logo
- Don't use pill-shaped or rounded buttons/cards — the organic quality comes from Aura, not UI rounding
- Don't use cold, clinical design — embrace warmth, imperfection, and nature
- Don't use harsh black (`#000000`) for text — always Aubergine (`#3D233B`)
- Don't break The Aura's path — lines must always be continuous and joined
- Don't use the logo smaller than 40px in digital
- Don't use geometric circles or straight lines for decorative elements — keep shapes organic

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <640px | Single column, stacked layout, hamburger nav, reduced hero type |
| Tablet | 640–1024px | 2-column grids, moderate padding |
| Desktop | 1024–1280px | Full layout, 3-column product grids |
| Large Desktop | >1280px | Centered content with generous side margins |

### Touch Targets
- Buttons: minimum 48px height with comfortable padding (14px 32px)
- Navigation links: adequate spacing between Brandon Grotesque labels
- Mobile nav toggle: full-height touch target

### Collapsing Strategy
- Hero: 56px–72px display → 36px–48px on mobile, Plantin Semi Bold maintained
- Navigation: horizontal label bar → hamburger with logo centered
- Product cards: 3-column → 2-column → single column stacked
- Section padding: 96px–128px → 48px–64px on mobile
- The Aura: simplify SVG complexity on mobile, maintain stroke weight
- Nature imagery: maintain full-width treatment, adjust focal crop
- Dark/light section rhythm: maintained at all sizes

### Image Behavior
- Nature photography: full-width or contained, always with The Aura overlay where appropriate
- Product images: maintain sharp-cornered containers at all sizes
- Logo: centred placement maintained; scales down but never below 40px

## 9. Agent Prompt Guide

### Quick Colour Reference
- Background (light): Cream (`#FFEFDE`)
- Background (dark): Aubergine (`#3D233B`)
- Heading text (on light): Aubergine (`#3D233B`)
- Heading text (on dark): Cream (`#FFEFDE`)
- Body text (on light): Aubergine (`#3D233B`)
- Body text (on dark): Cream (`#FFEFDE`) or `rgba(255,239,222,0.8)`
- Label text: Aubergine (`#3D233B`) — Brandon Grotesque UPPERCASE
- Border: `rgba(61,35,59,0.1)` on cream
- Link: Aubergine (`#3D233B`) with underline
- Vata light: `#86C4FB` | Vata dark: `#000F9F` | Vata accent: `#F5A800`
- Pitta light: `#FF5C3A` | Pitta dark: `#9D0033` | Pitta accent: `#A2E8F2`
- Kapha light: `#6BCDB2` | Kapha dark: `#00545C` | Kapha accent: `#FFB3A5`

### Font Files Available
- `Etha fonts/Plantin.otf` (Regular)
- `Etha fonts/Plantin-Light.otf` (Light)
- `Etha fonts/Plantin-Italic.otf` (Italic)
- `Etha fonts/Brandon_bld.otf` (Bold)
- `Etha fonts/Brandon_med.otf` (Medium)
- `Etha fonts/Brandon_reg.otf` (Regular)
- Additional weights: Brandon thin, light, black (+ italics for all)

### Logo Files Available
- `ETHA logo/Etha-black.svg` (vector, preferred for web)
- `ETHA logo/Etha-color.png`, `ETHA logo/Color.png`
- `ETHA logo/Etha-White.png`, `ETHA logo/White.png`
- `ETHA logo/Black.png`

### Example Component Prompts
- "Create a hero section on cream (#FFEFDE) background with a full-width nature photograph. Overlay a large organic Aura line (1px stroke, cream on the photo). Centre the headline in Plantin Semi Bold at 56px, line-height 1.0, colour #3D233B. Add a subtitle in Plantin Light Italic at 20px, line-height 1.1. Place a CTA button: Brandon Grotesque Medium 14px UPPERCASE, letter-spacing 5px, #FFEFDE text on #3D233B background, 14px 32px padding, 0px border-radius."
- "Design a product card: cream (#FFEFDE) background, no border-radius, shadow rgba(61,35,59,0.12) 0px 8px 24px. Product image at top. Below: Dosha label in Plantin Regular Italic ('— *Vata*') at 16px, product name in Plantin Light at 22px, line-height 1.1. Details line in Brandon Grotesque Medium 11px UPPERCASE, tracking 5px, colour #3D233B."
- "Build navigation: cream (#FFEFDE) bar, 1px bottom border rgba(61,35,59,0.1). ĒTHA logo SVG centred. Left: 'ABOUT' and 'EXPLORE' in Brandon Grotesque Medium 11px UPPERCASE, tracking 5px, #3D233B. Right: 'SHOP', 'MY ACCOUNT', 'CART' same styling."
- "Create an aubergine (#3D233B) brand section: full-width dark background. Headline in Plantin Semi Bold 48px, cream (#FFEFDE) text, line-height 1.0. Body in Plantin Light 18px, rgba(255,239,222,0.8). Aura SVG decoration: 1px cream stroke, organic flowing loop shape extending beyond section edges."
- "Design a Dosha colour section for Pitta: Fire Red (#FF5C3A) background. Headline in white, Plantin Semi Bold 40px. Aura line decoration in Aquamarine (#A2E8F2), 1px stroke. CTA button with white text, transparent background, 1px white border, 0px radius."

### Iteration Guide
1. All headlines and body text use Plantin — never Brandon for reading content
2. Brandon Grotesque is UPPERCASE ONLY with wide letter-spacing (tracking 80 / ~5px)
3. Border-radius is 0px everywhere — organic shapes come from Aura SVG, not UI rounding
4. Shadows use aubergine-tinted `rgba(61,35,59,...)` — never pure grey/black shadows
5. Text colour on light = Aubergine (`#3D233B`), on dark = Cream (`#FFEFDE`)
6. Each Dosha has exactly 3 colours: energise (light), relax (dark), antidote (decorative accent)
7. The Aura is always a continuous SVG stroke path — never filled, never broken
8. Nature photography is the primary image style — water, earth, botanicals, landscapes
9. Generous whitespace is essential — the design should breathe and feel calm

## 10. Tech Stack & Animation Implementation

### Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 with `@theme inline` custom tokens
- **Animation**: GSAP + ScrollTrigger (timeline sequencing, scroll-driven interactions)
- **Smooth Scroll**: Lenis (buttery momentum scrolling, compatible with `position: sticky`)
- **Fonts**: `next/font/local` for Plantin + Brandon Grotesque (self-hosted, no external requests)

### Tailwind CSS Variables (defined in `globals.css`)

```css
@theme inline {
  --font-serif: var(--font-plantin), "Playfair Display", Georgia, serif;
  --font-sans: var(--font-brandon), "Gill Sans", "Segoe UI", sans-serif;
  --color-cream: #FFEFDE;
  --color-aubergine: #3D233B;
  --color-vata-light: #86C4FB;  --color-vata-dark: #000F9F;  --color-vata-accent: #F5A800;
  --color-pitta-light: #FF5C3A; --color-pitta-dark: #9D0033; --color-pitta-accent: #A2E8F2;
  --color-kapha-light: #6BCDB2; --color-kapha-dark: #00545C; --color-kapha-accent: #FFB3A5;
}
```

Use `font-serif` for Plantin (headings, body), `font-sans` for Brandon (labels, nav — always with `.font-label` utility class that adds `uppercase` + `letter-spacing: 0.2em`).

### Motion & Animation Principles

**The Aura is NOT decoration — it is the visual metaphor for energy states.** All Aura animation must communicate state (balanced, relaxed, energised), not just look pretty.

**Motion philosophy** (from design brief):
- Motion over stillness — nothing feels static, frozen, or posed
- Movement should feel like **forces**, not animation
- Slow but immense — parallax depth, long loops, gravity
- Everything should feel: alive, in motion, temporarily captured

### GSAP + ScrollTrigger Patterns

**Hero section — Parallax depth:**
```tsx
gsap.to(".hero-image", {
  yPercent: -20,
  ease: "none",
  scrollTrigger: {
    trigger: ".hero-section",
    start: "top top",
    end: "bottom top",
    scrub: true,
  },
});
```

**Section reveal — Staggered fade-in:**
```tsx
gsap.from(".section-content > *", {
  y: 40,
  opacity: 0,
  duration: 0.8,
  stagger: 0.15,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".section-content",
    start: "top 80%",
  },
});
```

**Aura SVG path drawing:**
```tsx
const path = document.querySelector(".aura-path");
const length = path.getTotalLength();
gsap.fromTo(path,
  { strokeDasharray: length, strokeDashoffset: length },
  {
    strokeDashoffset: 0,
    duration: 3,
    ease: "power1.inOut",
    scrollTrigger: {
      trigger: path,
      start: "top 70%",
      end: "bottom 30%",
      scrub: 1,
    },
  }
);
```

**Lenis initialization:**
```tsx
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
// Sync with GSAP ScrollTrigger
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

### Aura SVG Implementation

The Aura must be generated as organic SVG `<path>` elements. Use cubic bezier curves (`C` commands) for smooth, imperfect shapes. Never use `<circle>`, `<rect>`, or straight `<line>` elements.

**Balanced state** — gentle, nearly-elliptical closed loop:
```svg
<svg viewBox="0 0 400 300" class="aura-line">
  <path d="M200,30 C320,30 370,120 360,180 C350,240 280,270 200,270 C120,270 50,240 40,180 C30,120 80,30 200,30Z"
    stroke="currentColor" />
</svg>
```

Aura paths should be animated with GSAP (path drawing, slow morphing, gentle drift) and should partially extend beyond their container using `overflow: visible` on the SVG and `overflow: hidden` on the parent section.

### Performance Rules
- Use `will-change: transform` only on elements actively being animated
- Prefer `transform` and `opacity` for animations (GPU-composited)
- Lazy-load images below the fold
- Keep Aura SVGs simple (< 10 path commands per shape)
- Use `gsap.matchMedia()` to disable complex animations on mobile
- Respect `prefers-reduced-motion`: disable scroll animations, keep content visible

## 11. Landing Page — Emotional Journey & Section Guide

Each section has a defined emotional purpose. The design must serve the feeling first, content second.

### Section 1: HERO — "Return to the Source"
- **Feeling**: Overwhelming nature. Belonging. Awe. "I have come home."
- **Visual**: Nature dominates the frame. Vast landscapes, raw elements, scale. Water that moves. Light that feels ancient.
- **Human presence**: Secondary — absorbed into nature, not posing within it.
- **Motion**: Slow but immense. Parallax depth, long loops, gravity. Forces, not animation.
- **Typography**: Large Plantin Semi Bold headline that feels carved, not decorative.
- **CTA**: Feels like a threshold — "BEGIN SELF-DISCOVERY" leading to Dosha quiz. This is the KEY CTA of the entire page.
- **Avoid**: Polished wellness imagery, lifestyle shots that feel curated, anything "cosy" or decorative.

### Section 2: FIVE ELEMENTS — "Awe & Realisation"
- **Feeling**: Reverence for nature's power. "I didn't fully grasp how powerful nature is — yet it lives inside me."
- **Visual**: Striking, almost cinematic. Macro + vast scale contrasts. Fire that breathes. Water with force.
- **Motion**: Essential. Elements should move independently. Depth matters.
- **Copy**: Secondary role. Short lines. Let visuals do the teaching.
- **Transition**: Visual cue that what exists "out there" also flows "in here".
- **Avoid**: Flat illustrations, static layouts, scientific/educational tone.

### Section 3: DOSHAS — "Meaning & Recognition"
- **Feeling**: Understanding. Beauty with logic. "I recognise myself in the result."
- **Visual**: Aesthetics meet structure. Clear visual logic showing how 5 elements → 3 Doshas.
- **Dosha colour**: Subtle but intentional. Gradients, halos, aura effects.
- **Aura**: Doshas feel alive, moving, breathing.
- **Flow**: Elements → Doshas → Self → unique constitution.
- **CTA**: "DISCOVER YOUR DOSHA" — link to quiz.
- **Avoid**: Tables that feel instructional, overloaded copy, anything diagnostic.

### Section 4 & 5: ANCIENT WISDOM / RITUALS — "Playful Authority"
- **Feeling**: Relevance. Humanity. "This ancient science meets me where I am."
- **Visual**: Perfectly imperfect imagery. Real human moments. Skin texture, movement, pause.
- **Tone**: Not heavy. Slightly playful, warm confidence.
- **Aesthetic**: Elevated but human. Rituals feel lived, not staged.
- **Avoid**: Ascetic or overly spiritual visuals, instructional layouts, anything preachy.

### Section 6: ACADEMY — "Authority & Modern Mastery"
- **Feeling**: Credibility. Intelligence. Modern excellence.
- **Visual**: Sleeker than other sections. Cleaner than Masterclass. More refined than Apple.
- **Gurus**: Central, clear, respected. Framed as thinkers, not influencers.
- **Typography**: Sharp hierarchy. Confident restraint.
- **Avoid**: Course-platform clichés, "Learn more" fluff, casual aesthetics.

### Section 7: COMMUNITY — "Raw & Human"
- **Feeling**: Belonging. Recognition. "These people are like me."
- **Visual**: Human-first. Imperfect, candid moments. Emotion over polish.
- **Stories**: Feel overheard, not written for marketing.
- **Avoid**: Influencer vibes, transformation narratives, testimonials that sell.

### Section 8: CLOSURE — "Return to Nature"
- **Feeling**: Reverence. Completion. Homecoming. "I end by remembering I am nature."
- **Visual**: Echo of the hero. Same elemental force, transformed.
- **Tone**: Quiet, grounded, timeless.
- **CTA**: An invitation to continue, not a demand.
- **Avoid**: Sales-driven endings, new concepts, breaking the calm.

## 12. Anti-Patterns — What NOT to Build

This section exists because AI code generation defaults to generic patterns. Every item below is explicitly forbidden:

- **Generic system fonts**: No Inter, Roboto, Arial, or system font stacks. Plantin + Brandon Grotesque only.
- **Purple gradients on white**: The ETHA palette is Cream + Aubergine — not generic purple-to-blue gradients.
- **Symmetric centered layouts**: Use asymmetry, offset headlines, staggered grid placements.
- **Rounded cards with shadows**: Border-radius is 0px. Depth comes from colour contrast and photography, not card shadows.
- **Cookie-cutter component patterns**: No generic hero → features → pricing → footer. Follow the emotional journey.
- **Static, frozen layouts**: Everything must feel alive. Use GSAP ScrollTrigger for reveal animations.
- **Polished wellness clichés**: No flat-lay product shots, no Instagram-perfect yoga poses, no clean-white-studio aesthetics.
- **Over-designed ornamental elements**: The Aura is restrained and intentional. It communicates energy state, not decoration.
- **Dark mode toggle**: ETHA alternates between cream and aubergine sections by design. There is no "dark mode" — both tones coexist.
- **Excessive micro-interactions**: One well-orchestrated scroll-triggered reveal per section beats scattered hover effects.
