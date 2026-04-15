# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See also: `../CLAUDE.md` for full project context (design docs, brand assets, Aura system, reference doc index).

## Commands

```bash
npm run dev      # Next.js 16 dev server (Turbopack)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint (flat config: core-web-vitals + TS)
```

No test framework configured. No Lenis JS initialization yet (CSS rules only in globals.css).

## Next.js 16 Breaking Changes

This project runs **Next.js 16.2.3**. Check `node_modules/next/dist/docs/` before writing code.

- `params` and `searchParams` are **Promises** — must be awaited
- Image `priority` is **deprecated** — use `preload={true}`
- `cookies()`, `headers()`, `draftMode()` are **async**
- Turbopack is the **default** bundler
- Tailwind CSS v4 uses `@theme inline {}` in CSS, not `tailwind.config.js`

## Key Files

| File | Role |
|------|------|
| `src/app/layout.tsx` | Root layout — loads Plantin + Brandon Grotesque via CSS variables |
| `src/app/fonts.ts` | Font definitions (`next/font/local`) |
| `src/app/globals.css` | Tailwind v4 `@theme inline` tokens, `.font-label` utility, `.aura-line` base, Lenis CSS |
| `src/app/page.tsx` | Single-page composition of all section components |
| `src/components/AuraButton.tsx` | Primary CTA — Aura SVG border with mouse-directional morph (22 control points, raised-cosine falloff, GSAP) |
| `src/components/MobileCTA.tsx` | Fixed bottom CTA bar — auto-flips colors over dark sections via ScrollTrigger |

## Current State

**Animations disabled.** Every section has GSAP/ScrollTrigger code wrapped in `/* ANIMATIONS DISABLED FOR FIGMA EXPORT */`. Active GSAP: AuraButton hover + MobileCTA scroll visibility only.

**All images are placeholders.** Gradient fills with descriptive text hints — no real photography.

**All 8 sections implemented** as components plus Nav, Footer, MobileCTA.

## Animation Pattern (When Re-enabling)

Each section component follows the same pattern:

```tsx
"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// Inside useEffect:
const ctx = gsap.context(() => {
  // animations here, using ScrollTrigger
}, sectionRef);
return () => ctx.revert();
```

All animation code checks `prefers-reduced-motion` before running. GSAP context scoping via `gsap.context()` ensures cleanup.

## Design Rules (Quick Reference)

- **Fonts**: `font-serif` (Plantin) for content, `.font-label` class for Brandon Grotesque (auto-uppercase + tracking)
- **Colors**: `bg-cream`/`text-cream` (#FFEFDE), `bg-aubergine`/`text-aubergine` (#3D233B)
- **Border-radius**: 0px everywhere — organic shapes from Aura SVGs only
- **Shadows**: aubergine-tinted `rgba(61,35,59,...)` — never neutral grey
- **Path alias**: `@/*` → `./src/*`

## Anti-Patterns (Explicitly Forbidden)

- Generic fonts (Inter, Roboto, Arial, system stacks)
- Purple gradients on white backgrounds
- Rounded cards/buttons (border-radius must be 0px)
- Brandon Grotesque in lowercase (UPPERCASE ONLY)
- Black `#000000` for text (always Aubergine `#3D233B`)
- Mixing Dosha colors across families
- Polished wellness clichés (flat-lays, studio yoga poses)
