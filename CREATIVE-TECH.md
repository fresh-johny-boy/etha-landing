# Creative + Tech Roadmap

Awwwards-level enhancements grounded in the Visual DNA: organic, alive, in motion, temporarily captured. No generic tricks — everything serves the brand.

## Priority System

- **TOP** — User-selected, implement first
- **HIGH** — Strong impact, implement after TOP
- **LATER** — Nice-to-have, revisit after core is solid

---

## TOP PRIORITY

### 4. Scroll-Velocity-Aware Effects
**DNA:** "Alive, in motion"

GSAP reads Lenis scroll velocity. The page physically responds to how you move through it.

- Fast scroll: aura thread wobbles more, text gets subtle motion blur (CSS `filter: blur` driven by velocity)
- Slow scroll: everything settles, breathes, micro-details emerge
- Stop scrolling: ambient state kicks in — nothing is ever fully still

**Tech:** Lenis `onScroll` velocity → GSAP `quickSetter` on CSS custom properties → elements bind to `--scroll-velocity` variable.

**Depends on:** Lenis JS init (implement that first as prerequisite).

---

### 5. The Aura as Living Organism
**DNA:** "Organic, imperfect forms" / "Nothing feels static"

The aura thread is the brand's protagonist. Right now it draws and recolors. Three upgrades:

**Breathing:** When scrolling stops, the visible thread portion oscillates (scale 1.0 to 1.015, 4s sine loop). Never fully still.

**Mouse proximity repulsion:** Within ~200px of cursor, nearest path segment pushes away. Same raised-cosine falloff as AuraButton but on the thread. The line is aware of you.

**Section-driven character:** Amplify the existing path shape differences with a subtle `feTurbulence` SVG filter. Increase turbulence in energised sections (Five Elements), decrease in calm sections (Rituals, Closure). The line doesn't just change color — it changes personality.

**Tech:** GSAP `quickTo` for breathing, `pointermove` listener + path point manipulation for repulsion, ScrollTrigger-driven `feTurbulence` `baseFrequency` tweening.

---

### 6. Element-Specific Micro-Atmospheres
**DNA:** "Nature as force, not decoration"

Each Five Elements panel gets one ambient effect behind the image area. Lightweight CSS/SVG — not WebGL. The effect IS the element.

| Element | Effect | Tech |
|---------|--------|------|
| **Fire** | Slow heat-shimmer distortion | SVG `feTurbulence` + `feDisplacementMap`, animated `baseFrequency` |
| **Earth** | Subtle geological grain texture | CSS noise via tiny repeating SVG pattern, low opacity |
| **Water** | Light refraction simulation | Slow CSS `background-position` animation on layered radial gradients |
| **Air** | Drifting barely-visible particles | Pure CSS animation, 4-5 small circles with `translateX` + `translateY` keyframes |
| **Space** | Distant star breathing | Single radial gradient pulsing in opacity, very slow sine rhythm |

Each effect is subtle enough to feel atmospheric, strong enough to subconsciously communicate the element. If you removed the text label, you should still feel which element you're looking at.

---

### 8. Hero: Parallax Depth with Organic Mask
**DNA:** "Temporarily captured" / "Motion over stillness"

**Direction TBD** — considering parallax multiple images layered at different depths rather than video. Either way, the structural idea:

- Multiple image/gradient layers at different parallax speeds create physical depth
- The outermost layer is masked by an oversized Balanced Aura SVG shape — nature seen through an organic aperture, not a rectangle
- On scroll down, the mask expands toward full-bleed, layers separate further, then the hero dissolves into Five Elements
- The transition should feel like falling forward into the landscape

**Option A — Multi-layer parallax (leaning toward this):**
3-4 stacked landscape layers (foreground texture, midground, sky/atmosphere) each moving at different scrub rates. Creates cinematic depth without video. Works with static images, feels alive through scroll.

**Option B — Slow-motion nature loop:**
5-second video (mist, water over rock). Simpler to implement but needs real video asset. Masked by aura shape.

**Tech:** GSAP ScrollTrigger scrub on each layer's `yPercent`, SVG `clipPath` with animated path for the organic mask, CSS `will-change: transform` for performance.

---

## HIGH PRIORITY

### 1. Lenis Smooth Scroll Init
**Prerequisite for #4 and overall feel.**

CSS rules exist in `globals.css`. JS initialization is missing. This is the single biggest "feel" upgrade — every scroll interaction immediately goes from browser-default to premium. Without it, GSAP scrub animations feel stepped.

**Tech:** ~15 lines in a shared client component or layout effect. Lenis instance + GSAP ticker integration.

---

### 2. Split-Text Headline Reveals
**DNA:** "Temporarily captured"

Headlines reveal word-by-word or character-by-character with stagger, not as monolithic blocks. Plantin's serif letterforms are beautiful individually. The effect feels like the words are being written as you arrive.

**Tech:** Manual span wrapping (no SplitText plugin needed — it's a Club plugin). `useRef` + split utility function + GSAP stagger on children. Each section heading gets this treatment.

---

### 3. Image Clip-Path Reveals
**DNA:** "Nature as force"

When real photography arrives, images reveal through an organic wipe — `clip-path: inset()` or `polygon()` that expands on scroll. The image isn't placed, it's unveiled. Direction of reveal matches the panel's alignment (left panels reveal left-to-right, right panels right-to-left, center panels expand from center).

**Tech:** GSAP ScrollTrigger + `clipPath` tween. Organic = use a slightly curved polygon, not a hard rectangle.

---

### 7. Magnetic + Organic Cursor
**DNA:** "Organic, imperfect forms"

Replace default cursor with a small aura dot (12px, aubergine on cream, cream on aubergine). Follows actual cursor with spring-easing lag. On hoverable elements, expands to an organic oval (not perfectly round). On AuraButton, gets absorbed into the aura border.

**Tech:** GSAP `quickTo` for position tracking, CSS `mix-blend-mode` for auto-color-switching, scale tween on `mouseenter`/`mouseleave` of interactive elements.

---

## LATER

### 9. Doshas: Interactive Dosha Preview
Hover/tap on dosha cards triggers their aura animating to full scale, background shifts to dosha color family. A preview of "what you are" before the quiz.

### 10. Page Preloader with Aura Genesis
2-3 second loader: single point expands into Balanced Aura (stroke draws outward), then floats up to become the AuraThread's start. Sets tone immediately.

---

## Explicitly NOT Doing

- **No WebGL/Three.js** — restraint is the brand. SVG + CSS + GSAP is the ceiling.
- **No parallax on everything** — selective depth only (hero, element images). Parallax on text/buttons = gimmicky.
- **No page transitions** — single page. Smooth scroll IS the transition.
- **No sound** — intrusive for wellness.
- **No scroll-jacking/pinning** — editorial cinema = flowing, not locked.

---

## Implementation Order

```
1. Lenis JS init          (prerequisite, unlocks #4)
2. Split-text reveals      (all headlines)
3. Scroll-velocity effects (#4 — needs Lenis)
4. Aura breathing + repulsion (#5)
5. Aura section-driven character (#5 continued)
6. Element micro-atmospheres (#6)
7. Hero parallax depth + organic mask (#8)
8. Image clip-path reveals (#3 — needs real images)
9. Custom cursor (#7)
```
