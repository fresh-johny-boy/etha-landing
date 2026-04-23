# ETHA Landing — Copilot / Impeccable Context

This file exists so `impeccable critique` can auto-derive a project-specific persona ("Joana") and evaluate the landing + quiz against real brand constraints, not generic heuristics. Mirrors `.impeccable.md` at project root.

## Design Context

### Users

**Joana** — early 30s, emotionally intelligent, spiritually curious, overstimulated by modern life. Demanding job. Has tried yoga, meditation apps, green juice, fancy skincare — most left her more tired. Tired of wellness brands that promise transformation and deliver generic advice. Craves permission to slow down more than another product to optimise her day.

- **Arrives from:** Instagram / Facebook ad, mostly mid-afternoon, between tasks
- **Device:** mobile 390px, one thumb, fast scroll
- **Attention:** ~3–5 seconds before she scrolls past
- **Voice she trusts:** specificity, sensory language, being seen
- **Closes tab on:** hype, pressure, jargon, wellness cliches, curated/try-hard vibes, anything that implies she is broken
- **Primary job to be done:** make her pause → feel recognised → take the Dosha quiz

She has **no insider knowledge** of ETHA. Doesn't know "Dosha" unless the page teaches her. Doesn't know the product line. First meeting through this page.

### Brand Personality

**"Playful Authority."** Three words: ancient, alive, unpolished. The brand knows something Joana hasn't remembered yet — and it waits for her to catch up. Ancient wisdom in contemporary visual language. Not spiritual kitsch. Not sterile wellness tech.

### Aesthetic Direction

- Cream `#FFEFDE` ↔ Aubergine `#3D233B` alternating sections; organic SVG wave dividers only, never a hard edge
- Plantin (serif) = all emotional weight. Brandon Grotesque UPPERCASE ONLY, 0.2em+ tracking, labels/wayfinding only
- Aura SVGs (Balanced / Relaxed / Energised) — `fill: none`, cubic beziers only, continuous stroke
- **0px border-radius everywhere**
- Motion: GSAP + Lenis. Slow, immense. Forces not animation. One well-orchestrated scroll reveal per section

### Anti-References (instant brand violations)

- Clinical perfection / SaaS / health-tech vibes
- Instagram wellness (posed yoga, filters, flat lays, curated lifestyle)
- Cosy/decorative Kinfolk (linen, candles, twee)
- Purple-to-blue wellness gradients, glow, glassmorphism
- Transformation narrative / before-after / "unlock your potential" / anything implying Joana is broken

### Color Quick Reference

- BG light `#FFEFDE` | BG dark `#3D233B` | Text-on-light `#3D233B` | Text-on-dark `#FFEFDE`
- Vata light `#86C4FB` / dark `#000F9F` / accent `#F5A800`
- Pitta light `#FF5C3A` / dark `#9D0033` / accent `#A2E8F2`
- Kapha light `#6BCDB2` / dark `#00545C` / accent `#FFB3A5`
- Antidote colours = decorative aura only, never text
- Shadows always aubergine-tinted `rgba(61,35,59,...)`

### Stack

Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 (`@theme inline`) + GSAP + ScrollTrigger + Lenis. Fonts self-hosted via `next/font/local`. All tokens in `app/src/app/globals.css`.

### Scope

Landing page + quiz flow use one design system. Quiz is emotional continuation of landing, not a separate product. Landing → quiz transition must feel like walking deeper into the same world.
