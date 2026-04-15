# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ETHA landing page — a single-page site for an Ayurvedic wellness brand ("the Apple of Ayurveda"). The page educates users about Ayurveda, the five elements, and three Doshas (Vata, Pitta, Kapha), then funnels them to a Dosha quiz. Built to Awwwards-level design quality with scroll animations.

## Repository Structure

This is a two-layer repo: **design assets at root**, **Next.js app inside `app/`**.

```
etha-landing/                      # Design docs + brand assets (NOT a Node project)
├── DESIGN.md                      # Visual design system — THE source of truth
├── SECTIONS.md                    # Section-by-section creative direction + layouts
├── landing-brief.md               # Condensed brief (mobile-first, single CTA focus)
├── design_brief.md                # 94-slide agency brief (emotional direction per section)
├── brand-guide.md                 # Mother London brand guide (text-extracted, 134 pages)
├── guides.md                      # Awwwards best practices + animation library guidance
├── .claude/rules/aura-svg.md      # Aura SVG generation rules (3 states, color logic, animation)
├── Etha fonts/                    # Source OTF files (Plantin + Brandon Grotesque)
├── ETHA logo/                     # SVG + PNG logos
├── ETHA design elements/          # Additional design assets
└── app/                           # Next.js 16 application
    ├── CLAUDE.md                  # App-specific guidance (commands, stack, anti-patterns)
    ├── AGENTS.md                  # Next.js 16 breaking changes warning
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx         # Root layout — loads fonts via CSS variables
    │   │   ├── fonts.ts           # Plantin + Brandon Grotesque (next/font/local)
    │   │   ├── globals.css        # Tailwind v4 @theme inline tokens + utility classes
    │   │   └── page.tsx           # All sections composed here
    │   ├── fonts/                 # OTF files for next/font/local
    │   └── components/            # One component per section + shared components
    └── public/images/             # etha-logo-dark.svg, etha-logo-light.png
```

## Commands

All commands run from `app/`:

```bash
cd app
npm run dev      # Next.js 16 dev server (Turbopack default)
npm run build    # Production build
npm run lint     # ESLint (flat config, Next.js core-web-vitals + TS)
```

No test framework is configured. No Lenis JS initialization exists yet (only CSS rules in globals.css).

## Next.js 16 Breaking Changes

Read `node_modules/next/dist/docs/` before writing code. Key changes from training data:

- `params` and `searchParams` are **Promises** — must be awaited
- Image `priority` prop is **deprecated** — use `preload={true}`
- `cookies()`, `headers()`, `draftMode()` are **async**
- Turbopack is the **default** bundler
- Tailwind CSS v4 uses `@theme inline {}` in CSS, not `tailwind.config.js`

## Current State

**Animations are disabled.** Every component has GSAP animations wrapped in `/* ANIMATIONS DISABLED FOR FIGMA EXPORT */` comments. All GSAP + ScrollTrigger code is written but commented out. The only active GSAP is the AuraButton hover distortion and MobileCTA scroll visibility.

**Image placeholders everywhere.** No real photography exists. Every section has gradient placeholders with descriptive hints (e.g., `"Landscape — rock formations, raw earth texture"`). The `image-placeholder` CSS class is defined in globals.css.

**All sections are implemented** as components: Nav, Hero, ThreePillars, FiveElements, Doshas, Rituals, Academy, Community, Closure, Footer, MobileCTA.

## Architecture

### Fonts

Defined in `app/src/app/fonts.ts` using `next/font/local`. Exposed as CSS variables `--font-plantin` and `--font-brandon`, mapped to Tailwind tokens in globals.css:
- `font-serif` → Plantin (all headlines, body, emotional content)
- `font-sans` → Brandon Grotesque (**UPPERCASE ONLY** — use `.font-label` utility class which adds `uppercase` + `letter-spacing: 0.2em`)

### Tailwind v4 Tokens

All brand tokens defined in `globals.css` via `@theme inline {}`:
- Colors: `cream`, `aubergine`, `aubergine-light`, `aubergine-faint`, `aubergine-border`
- Dosha families: `vata-light`/`dark`/`accent`, `pitta-*`, `kapha-*`
- Shadows: `shadow-subtle`, `shadow-standard`, `shadow-elevated`

### Path Alias

`@/*` resolves to `./src/*` (tsconfig paths).

### Shared Components

- **AuraButton** (`AuraButton.tsx`): Primary CTA with organic Balanced Aura SVG border. Mouse-directional morph using GSAP — the stroke deforms toward cursor position using a raised-cosine falloff. 22 control points decomposed from a balanced oval.
- **MobileCTA** (`MobileCTA.tsx`): Fixed bottom bar (mobile only). Appears after 400px scroll. Auto-flips colors (aubergine ↔ cream) when overlapping `bg-aubergine` sections via ScrollTrigger.
- **AuraSvg** (`AuraSvg.tsx`): Background SVG with radial gradient blurs on aubergine — currently unused in any section.

### Section Pattern

Every section component follows the same structure:
1. `"use client"` directive (GSAP requires client-side)
2. GSAP + ScrollTrigger import and registration
3. `useRef` for animated elements
4. Commented-out `useEffect` with all scroll animations
5. JSX with: background aura SVG → content → optional CTA (hidden on mobile, MobileCTA handles it)

### The Aura System

The Aura is the brand's core visual element — organic SVG line art representing energy states. Three states:
- **Balanced**: simple organic oval (4-8 cubic beziers). Used in Hero, ThreePillars, Closure
- **Relaxed**: flowing blob with internal loops. Used in Rituals, Community
- **Energised**: angular with self-crossings. Used in FiveElements, Vata dosha

Rules: always `fill: none`, stroke-only, continuous path, cubic bezier curves only (no `<circle>`/`<rect>`/`<line>`), `stroke-linecap: round`, `overflow: visible`. See `.claude/rules/aura-svg.md` for full generation reference.

## Design Constraints

**Mandatory:**
- Border-radius is **0px everywhere** — organic shapes come from Aura SVGs, not UI rounding
- Shadows are **aubergine-tinted** (`rgba(61,35,59,...)`) — never neutral grey
- Text is always Aubergine on cream, Cream on aubergine — never `#000000`
- Brandon Grotesque is **UPPERCASE ONLY** with wide tracking
- Dosha colors never cross families (no Vata blue on Pitta sections)
- Antidote colors (Citrine, Aquamarine, Carnelian) are **decorative only** — never used for text

**Landing brief conflicts to be aware of:**
- `landing-brief.md` specifies a single CTA ("Begin your remembering") and wants Rituals/Academy stats removed. The current implementation has multiple CTAs and all sections present. These represent two different creative directions that haven't been reconciled.

## Figma MCP Server Rules

Reference guide: `mcp-server-guide-main/` (skills, steering docs, power workflows).

**When implementing FROM Figma (design-to-code):** Follow the 7-step workflow — parse URL, `get_design_context`, `get_screenshot` (once per task), download assets, translate to ETHA tokens, build, validate. Use `get_metadata` first for large designs. Use `get_variable_defs` for token extraction. Use `search_design_system` before recreating components.

**When writing TO Figma (code-to-design):** Use `generate_figma_design` to capture running pages into Figma files. Use `use_figma` for creating/modifying native Figma content (frames, components, variables, auto layout). Use `create_new_file` to create blank Figma files.

**Asset rules:**
- If MCP returns `localhost` source for images/SVGs, use directly — no placeholders, no new icon packages
- All assets come from the Figma payload, not external sources

## Key Reference Docs

| Doc | Use For |
|-----|---------|
| `DESIGN.md` | Visual system: colors, typography, components, spacing, Tailwind tokens |
| `SECTIONS.md` | Creative direction per section: layouts, aura behavior, image placement |
| `.claude/rules/aura-svg.md` | Generating new Aura SVG paths: states, colors, animation patterns |
| `landing-brief.md` | Condensed brief: mobile-first, single CTA, what to remove |
| `design_brief.md` | Emotional direction per section from agency slides |
| `brand-guide.md` | Full Mother London brand identity (art direction, dos/don'ts, Dosha materials) |
| `guides.md` | Awwwards animation best practices, GSAP/Lenis/Playwright guidance |
