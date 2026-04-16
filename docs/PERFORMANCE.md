# Animation Performance Audit

Date: 2026-04-16

## Summary

The landing page has laggy animations on mobile and a visible glitch at the Hero → ThreePillars transition on GitHub Pages. Root causes: competing scroll systems, too many simultaneous animations, Lenis misconfiguration, and poor mobile aura visibility.

---

## Issues Found

### 1. AuraThread — Raw scroll listener competing with Lenis + GSAP

**File:** `app/src/components/AuraThread.tsx:97-118`
**Severity:** High — primary cause of Hero→ThreePillars glitch

A raw `window.addEventListener("scroll", onScroll)` fires on every scroll event (60-120x/sec). Each call does:
- `document.body.scrollHeight` calculation
- `svg.setAttribute("viewBox", ...)` — forces layout recalculation
- `path.setAttribute("stroke", ...)` — forces style recalculation

This creates a third scroll system fighting Lenis (virtualised scroll) and GSAP ScrollTrigger (scrub-linked tweens). When the Hero pin releases, all three systems try to reconcile position simultaneously, causing a 1-3 frame desync — the visible "glitch."

The stroke color is also hardcoded to white on every frame (`line 116: path!.setAttribute("stroke", "#FFFFFF")`), making the color logic in lines 44-55 dead code.

**Fix:** Replace the raw scroll listener with a ScrollTrigger-driven viewBox pan. Use `gsap.quickSetter` for the viewBox attribute. Remove the dead color detection code.

### 2. Lenis lerp too low + GSAP lagSmoothing disabled

**File:** `app/src/components/SmoothScroll.tsx:12-21`
**Severity:** Medium — makes everything feel sluggish

`lerp: 0.1` means scroll position only moves 10% toward target per frame. Takes ~23 frames (~380ms at 60fps) to reach 90% of target. On GitHub Pages where initial frames are heavier due to network-loaded assets, this compounds perceived lag.

`gsap.ticker.lagSmoothing(0)` (line 21) disables GSAP's frame-drop recovery. On a slow device, GSAP falls further behind instead of skipping frames to catch up.

**Fix:** Increase `lerp` to `0.12`. Remove `lagSmoothing(0)` — let GSAP handle frame drops naturally.

### 3. Hero pin + Lenis desync

**File:** `app/src/components/Hero.tsx:83-97`
**Severity:** Medium — the Hero→ThreePillars seam

`pin: true` on the Hero ScrollTrigger creates a GSAP-managed pin that manipulates `position: fixed` and inserts a spacer div. Lenis intercepts native scroll and virtualizes it. When the pin releases, Lenis's lerped position and GSAP's pin math desync for 1-2 frames — visible as a "jump" between sections.

**Fix:** Add `anticipatePin: 1` to the ScrollTrigger config. This tells GSAP to start the pin transition 1 pixel early, giving Lenis time to synchronise. Also explicitly set `pinSpacing: true` to ensure consistent spacer behavior.

### 4. FiveElements — 20 simultaneous ScrollTriggers + 5 infinite loops

**File:** `app/src/components/FiveElements.tsx:82-191`
**Severity:** Medium — mobile performance drain

Each of the 5 panels runs 4 scroll-linked animations (clip morph, stroke morph, text slide, breathing loop) = 20 active ScrollTriggers. Plus 5 `repeat: -1` breathing tweens that run forever, even when panels are off-screen.

On mobile, all panels are stacked vertically (no tabs/carousel), so all 20 ScrollTriggers are active in the scroll range simultaneously. The breathing tweens consume GPU cycles even when the user is nowhere near the section.

**Fix:**
- Wrap breathing tweens in ScrollTrigger `toggleActions` so they pause when off-screen
- Use `gsap.matchMedia()` to reduce animation count on mobile (e.g., skip stroke morph on small screens — it's nearly invisible anyway)

### 5. Doshas — 3 breathing auras running forever

**File:** `app/src/components/Doshas.tsx:121-130`
**Severity:** Low-Medium — unnecessary GPU work

Three `repeat: -1` scale breathing tweens on dosha aura SVGs run forever once triggered. Not paused when off-screen.

**Fix:** Same as #4 — use ScrollTrigger `toggleActions: "play pause play pause"` on the breathing tweens.

### 6. AuraThread strokeDashoffset on massive path

**File:** `app/src/components/AuraThread.tsx:70-88`
**Severity:** Low-Medium — expensive on low-end devices

The SVG path has ~100 cubic bezier segments spanning viewBox height 10000. `getTotalLength()` on this path is expensive. Animating `strokeDashoffset` with `scrub: 0.2` forces the browser to recalculate stroke rendering every scroll frame.

**Fix:** Consider breaking the path into 3-4 segments that draw independently, or increasing scrub to `0.6` to reduce update frequency.

### 7. FiveElements shadow SVGs — 15 extra DOM nodes

**File:** `app/src/components/FiveElements.tsx:252-276`
**Severity:** Low — adds DOM weight, especially on mobile

Each of the 5 panels has 3 shadow SVGs (light, medium, heavy blur) = 15 extra SVG elements. On mobile with small screens, these shadows are barely visible but still composited.

**Fix:** Hide the 2nd and 3rd shadow layers on mobile via `hidden md:block` or a `gsap.matchMedia()` check.

### 8. Mobile aura visibility — Hero blob too subtle

**File:** `app/src/components/Hero.tsx:23-26, 116-131`
**Severity:** Medium — UX issue, not performance

The mobile aura path (`AURA_SHAPE_MOBILE`) is a flattened horizontal oval that barely contrasts against the cream background on small screens. Combined with:
- `inset-[-2%]` on the mask container bleeds the image slightly outside
- The cream bg and image content have similar tonal values on mobile
- The blob is only ~229px tall on a 390px-wide screen

The aura shape is the signature visual — if users can't see it, the hero loses its identity.

**Fix:**
- Make the mobile blob slightly larger (reduce the 65% compression to ~58%)
- Add a subtle border/edge treatment: a faint `box-shadow` or a thin stroke SVG overlay at the blob boundary
- Increase the scrim contrast on mobile (stronger gradient overlay)

---

## Optimization Plan (Priority Order)

### Phase 1 — Fix the glitch (Hero → ThreePillars)
1. Add `anticipatePin: 1` and `pinSpacing: true` to Hero ScrollTrigger
2. Replace AuraThread raw scroll listener with ScrollTrigger
3. Increase Lenis `lerp` to `0.12`, remove `lagSmoothing(0)`

### Phase 2 — Reduce animation load
4. Pause all `repeat: -1` tweens when off-screen (FiveElements + Doshas)
5. Use `gsap.matchMedia()` to skip non-essential animations on mobile
6. Hide extra shadow SVGs on mobile in FiveElements

### Phase 3 — Mobile aura visibility
7. Enlarge mobile aura blob path
8. Strengthen hero scrim gradient on mobile
9. Add subtle edge treatment at blob boundary

---

## Animation Inventory

| Component | ScrollTriggers | Infinite tweens | Raw scroll listeners |
|-----------|---------------|-----------------|---------------------|
| Hero | 1 (pin+scrub) | 2 (breathing, float) | 0 |
| AuraThread | 1 (draw) | 0 | 1 (viewBox pan) |
| FiveElements | 15 (3 per panel) | 5 (breathing) | 0 |
| Doshas | 4 (header, diagram, cards) | 3 (aura breathing) | 0 |
| Rituals | 5 (header, rows, quote, trio) | 0 | 0 |
| MobileCTA | 1 + N dark sections | 0 | 0 |
| AuraButton | 0 | 0 | 0 (uses rAF) |
| **TOTAL** | **~29** | **10** | **1** |

## Asset Sizes

| File | Size | Notes |
|------|------|-------|
| hero-section.webp | 128 KB | 1200x853, good |
| fire.webp | 160 KB | 1200x600, good |
| space.webp | 192 KB | could compress further |
| water.webp | 144 KB | good |
| earth.webp | 52 KB | good |
| air.webp | 24 KB | good |
| etha-logo-light.webp | 8 KB | good |
| etha-logo-dark.svg | <4 KB | good |

Images are well-optimized. No image performance issues.
