# ETHA Dosha Report Page — Implementation Plan

Created: 2026-04-24
Status: PENDING
Approved: No
Iterations: 0
Worktree: No
Type: Feature

## Summary

**Goal:** Build an Awwwards-quality animated dosha report page — a single scrollable experience at `/report/[dosha]` that works for all three doshas by swapping a theme config. Full 11-section structure from the HTML guidance templates, with heavy GSAP scroll animation, a new scroll-driven `ReportAuraThread`, brand SVG auras from `assets/design-elements/`, `BlobImage` placeholders, `SectionDivider` wave transitions, and dosha-specific colour themes from the existing Tailwind tokens.

**Architecture:** One shared layout component (`DoshaReport`) receives a `dosha` prop and a `theme` object. The route `app/src/app/report/[dosha]/page.tsx` resolves static params `['vata','pitta','kapha']`. `reportTheme.ts` maps dosha → all design-decisions: colours, copy, aura SVG paths, element SVG references. Every section is its own component file under `app/src/components/report/sections/`.

**Tech Stack:** Next.js 16 (App Router, static export), Tailwind v4 (existing tokens), GSAP + ScrollTrigger (already installed), Lenis (SmoothScroll reused), BlobImage (reused), SectionDivider (reused), auraShapes.ts (reused).

---

## Scope

### In Scope
- Route `/report/vata`, `/report/pitta`, `/report/kapha` — direct public URLs for design/preview
- `reportTheme.ts` config mapping dosha → colors, copy, SVG paths, aura state
- `ReportAuraThread` — new scroll-driven aura line, dosha-accent coloured
- `DoshaReport.tsx` — orchestrator: SmoothScroll + AuraThread + all 12 sections
- **12 sections:** Hero, Intro, DoshaAura, Composition (animated bars), Personality, Balance, Body/Mind/Spirit, PathForward, Morning, Evening, Nourishment, FinalCard (12 distinct components = 12 sections; "11 sections" label was incorrect, FinalCard is its own section)
- All images = `BlobImage` in placeholder mode (no `image` prop) — ready for real images later
- SVGs from `assets/design-elements/doshas/`, `auras/`, `elements/`, `ui/`
- GSAP animations on every section: stagger reveals, path draws, bar counters, breathing auras
- Wave `SectionDivider` transitions between every section background change
- Full WCAG AA contrast compliance (cream on dark / aubergine on cream only)
- Mobile responsive (single column, stacked layout)

### Out of Scope
- Real photography (all images = placeholders)
- Email delivery or PDF export
- Auth/guard logic (the user said: design first, wire logic later)
- Editing/CMS for report copy (hardcoded per dosha in theme config)
- Animations that need `MorphSVGPlugin` (GSAP Club) — use `strokeDashoffset` only

---

## Approach

**Chosen:** Shared layout component + theme config map, static route per dosha

**Why:** One `DoshaReport` component with a `theme` prop means all design changes propagate to all 3 doshas. No code duplication. The theme config holds the one place where the three doshas diverge (colours, copy snippets, SVG file paths). Static `generateStaticParams` means all 3 pages are pre-built at deploy time, zero JS required for routing.

**Alternatives considered:**
- Three separate page files (`vata/page.tsx`, `pitta/page.tsx`, `kapha/page.tsx`) — rejected: pure duplication, diverges over time
- Single `/report` page reading localStorage — rejected: user wants direct URLs for design preview

---

## Context for Implementer

> Written for an implementer who has never touched this repo.

**Patterns to follow:**
- Section component structure: `app/src/components/Hero.tsx:1–30` — `"use client"`, GSAP import + `registerPlugin`, `useRef`, `useEffect` with `gsap.context(() => { ... }, sectionRef)`, return `() => ctx.revert()`
- BlobImage placeholder: `<BlobImage shape={SHAPE_X} placeholderHint="ritual scene" variant="on-aubergine" className="w-full aspect-square" />` — omit `image` prop entirely for placeholder
- Wave divider between sections: `<SectionDivider fill="cream" variant={2} />` placed at top of the section that has the lighter bg (cream), so it covers the dark section above it. `fill` = the colour of THIS section (the one with the divider at top).
- Tailwind v4 uses `@theme inline {}` — no `tailwind.config.js`. Use `bg-vata-dark`, `text-vata-accent`, `text-cream` etc — these tokens already exist in `globals.css`.
- GSAP ScrollTrigger standard pattern (used in every existing section):
  ```tsx
  const ctx = gsap.context(() => {
    gsap.from(el, {
      y: 60, opacity: 0, duration: 1.2, ease: "power2.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none none" }
    });
  }, sectionRef);
  return () => ctx.revert();
  ```
- AuraThread scroll pattern: `app/src/components/AuraThread.tsx:80–120` — `path.getTotalLength()`, `strokeDasharray = length`, `strokeDashoffset = length * (1 - progress)` inside ScrollTrigger `onUpdate`
- Brandon Grotesque section labels: `<p className="font-label text-xs text-cream/50 mb-6">YOUR PATTERN</p>` — the `.font-label` utility adds `font-sans uppercase tracking-[0.2em]`
- Next.js 16: `generateStaticParams` is required for `[dosha]` routes to work in static export

**Key files:**
- `app/src/components/auraShapes.ts` — `SEED`, `SHAPE_FIRE`, `SHAPE_EARTH`, `SHAPE_SPACE`, `SHAPE_AIR`, `SHAPE_WATER` — all `objectBoundingBox` format for BlobImage
- `app/src/components/BlobImage.tsx` — reuse as-is; omit `image` for placeholder mode
- `app/src/components/SectionDivider.tsx` — 5 wave variants, `fill="cream"` or `fill="aubergine"`
- `app/src/components/AuraThread.tsx` — study the viewBox pan + strokeDashoffset pattern for ReportAuraThread
- `app/src/components/SmoothScroll.tsx` — wraps Lenis; import in DoshaReport

**Gotchas:**
- `overflow: visible` on all SVG elements — auras bleed past containers deliberately
- No border-radius anywhere in ETHA design — zero. Not on cards, not on pills, not on bars.
- Brandon Grotesque (`font-sans`) is **UPPERCASE ONLY** — always add `.font-label` class or `uppercase` manually. Never use it for mixed-case text.
- Accent colours (citrine `#F5A800`, aquamarine `#A2E8F2`, carnelian `#FFB3A5`) are **decorative only** — never body text, only inline highlights (`<span style={{color: theme.accent}}>`) or SVG strokes
- `NEXT_PUBLIC_BASE_PATH` prefix needed for all `/images/` paths. Use `process.env.NEXT_PUBLIC_BASE_PATH ?? ""` prefix. But for SVGs in `assets/` folder read inline via `fs.readFileSync` at build time — or simply inline them as JSX SVG paths to avoid the base-path issue. Recommendation: inline SVG paths directly in the components (copy the `d` attribute from the SVG file).
- `"use client"` required on every component that uses GSAP or `useRef`/`useEffect`
- `params` in Next.js 16 App Router is a Promise — `const { dosha } = await params`

**Domain context:**
- Three doshas: Vata (Air+Ether, energised/angular), Pitta (Fire+Water, balanced/focused), Kapha (Earth+Water, relaxed/flowing)
- Report reads like a personalised letter — second-person "you", poetic prose, never clinical
- Brand voice: ancient wisdom + modern luxury — Plantin serif carries all emotional weight

---

## Runtime Environment

- **Start:** `cd app && npm run dev` → http://localhost:3000
- **Preview routes:** http://localhost:3000/report/vata, /report/pitta, /report/kapha
- **Build:** `npm run build` (must pass before done)

---

## Theme Config Design (`reportTheme.ts`)

The theme config is the single source of truth for all dosha differences:

```ts
type DoshaTheme = {
  dosha: "vata" | "pitta" | "kapha";
  // Tailwind class names (use existing tokens)
  bgDark: string;        // "bg-vata-dark" | "bg-pitta-dark" | "bg-kapha-dark"
  bgLight: string;       // "bg-vata-light" | etc.
  textAccent: string;    // inline CSS color for accent highlights
  accent: string;        // hex for accent SVG strokes
  accentTailwind: string; // "text-vata-accent" | etc.
  // Copy
  name: string;          // "Vata" | "Pitta" | "Kapha"
  tagline: string;       // 3-4 line hero tagline
  elements: string;      // "Air + Ether" | "Fire + Water" | "Earth + Water"
  introHeadline: string; // 3-4 word scattered headline
  introParagraphs: string[]; // 3 intro body paragraphs
  auraTagline: string;   // italic aura description
  composition: { vata: number; pitta: number; kapha: number }; // percentages
  compositionNote: string;
  personalityHeadline: string;
  personalityParagraphs: string[];
  balanceItems: Array<{ icon: string; headline: string; body: string }>;
  bodyPanel: { title: string; body: string };
  mindPanel: { title: string; body: string };
  spiritPanel: { title: string; body: string };
  pathForward: string[];  // 4 recommendation lines
  morningRituals: string[]; // 4 paragraphs
  eveningRituals: string[]; // 3 paragraphs
  nourishment: string[];   // 3-4 paragraphs
  finalTagline: string;
  // SVG paths (relative to assets/design-elements/)
  auraSvgState: "balanced" | "energised" | "relaxed";
  // Blob shapes for images (from auraShapes.ts)
  heroShape: string;  // SHAPE constant name for BlobImage
};
```

Vata → `bgDark: "bg-vata-dark"`, accent `#F5A800`, aura: energised
Pitta → `bgDark: "bg-pitta-dark"`, accent `#A2E8F2`, aura: balanced
Kapha → `bgDark: "bg-kapha-dark"`, accent `#FFB3A5`, aura: relaxed

---

## Section-by-Section UX Design

### S1: ReportHero
- **Bg:** `bgDark` (full viewport `min-h-dvh`)
- **Layout:** 55/45 two-column desktop, stacked mobile
- **Left:** Stacked vertically centered
  - `font-label text-cream/40`: "ETHA DOSHA REPORT"
  - Plantin italic `text-cream/60 text-[clamp(1.5rem,3vw,2.5rem)]`: "You are"
  - Plantin bold `text-cream text-[clamp(5rem,14vw,13rem)] leading-[0.9]`: DOSHA NAME
  - 3-line italic tagline `text-cream/70 text-lg font-light`
  - Scroll indicator: vertical thin cream line + rotated "DISCOVER YOUR PATTERN" font-label
- **Right:** Dosha SVG from `assets/design-elements/doshas/[dosha].svg` inlined, ~400×500px, cream stroke, breathing gsap loop (scale 1.0↔1.03 yoyo, 6s sine.inOut)
- **Background aura:** faint relaxed/energised aura behind right column at 6% opacity, slow drift
- **Entry animation (timeline, no scroll):** aura draws in (strokeDashoffset→0) → name fades up (y:40→0) → tagline fades in → scroll indicator fades in

### S2: ReportIntro
- **Bg:** cream
- **SectionDivider:** `fill="cream" variant={1}` at top
- **Layout:** two-column alternating prose blocks
  - Block A: Large italic Plantin pull-quote left (60%), small body-text right (40%)
  - Block B: BlobImage placeholder left (40%), personality para right (60%) — `breathDir="left"`
  - Block C: body text centered, accent-coloured emphasis word inline
- **Background:** faint aura SVG `aura-balanced-01.svg` at 4% opacity, slow drift animation
- **GSAP:** stagger y:50→0 on each block as it enters

### S3: ReportDoshaAura
- **Bg:** `bgDark`
- **SectionDivider:** `fill="aubergine"` — but override fill to dosha dark using inline style
- **Layout:** full-width aura SVG taking 70vh, centered
  - Inline the correct aura SVG (energised-01 for Vata, balanced-01 for Pitta, relaxed-01 for Kapha)
  - Stroke: cream, width 2px
  - `strokeDashoffset` draws in as section enters viewport (ScrollTrigger scrub 1)
- **Text block** overlaid at bottom center:
  - `font-label text-cream/40`: "YOUR PATTERN"
  - Plantin `text-cream text-4xl font-semibold`: "Your Dosha Aura"
  - Italic `text-accent text-lg`: "the energetic signature you've been carrying your whole life."
- **GSAP:** SVG path draw + text fade-up on scroll

### S4: ReportComposition
- **Bg:** cream
- **SectionDivider:** `fill="cream" variant={3}`
- **Headline:** `"Your unique composition."` Plantin h2
- **Three bars:** each row contains:
  - Left: dosha name (Plantin bold, dosha-specific color class) + elements subtitle (font-label tiny)
  - Element icon pair (inline SVG from design-elements/elements/) — 24px, decorative
  - Center: bar track (full width, `bg-aubergine/10`), bar fill (`bg-[doshaLight]`) grows 0→target%
  - Right: percentage counter `0 → 60%` counting up
- **GSAP:** on ScrollTrigger, `gsap.to(barEl, { width: "60%", duration: 1.5, ease: "power2.out" })` + separate number counter via `gsap.to({ val: 0 }, { val: 60, onUpdate: () => el.textContent = Math.round(obj.val) + "%" })`
- **Note text:** `"Everyone carries all three doshas..."` in light Plantin italic below

### S5: ReportPersonality
- **Bg:** `bgDark`
- **SectionDivider**
- **Layout:**
  - `font-label text-cream/40`: "WHO ARE YOU?"
  - Giant Plantin headline (3-4 words) left-aligned, `text-[clamp(2.5rem,6vw,5rem)]`
  - BlobImage placeholder right (350px), `variant="on-aubergine"`, breathing drift
  - 3 paragraphs of personality prose, stagger reveal
  - Accent-colored italic emphasis word in first paragraph
- **GSAP:** headline scales from 0.9→1.0 + fades, paragraphs stagger y:40→0

### S6: ReportBalance
- **Bg:** cream
- **SectionDivider:** `fill="cream" variant={0}`
- **Headline:** `font-label`: "WHERE YOU LOST BALANCE"
- **Three cards** staggered vertically:
  - Card 1: full-left
  - Card 2: `ml-[12%]` (shifted right)
  - Card 3: full-left
  - Each card: `border-l-2 border-[accent] pl-6` — left accent border
  - Icon: inline SVG from ui icons (quiet.svg / ritual.svg / dosha.svg), 32px, `stroke-aubergine/40`
  - Headline: Plantin `text-xl font-semibold`
  - Body: light Plantin prose
- **GSAP:** stagger y:60→0 each card with 0.2s delay between

### S7: ReportBodyMindSpirit
- **Bg:** `bgDark`
- **SectionDivider**
- `font-label text-cream/40`: "BODY · MIND · SPIRIT"
- **Three panels:** `grid-cols-3 gap-px` desktop, stacked mobile
  - Each panel: `px-10 py-16 border-r border-cream/10`
  - Icon top: 40px inline SVG (quiet.svg / dosha.svg / ritual.svg)
  - Label: font-label cream/60 small
  - Body: Plantin light `text-cream/80` prose
- **Background:** faint dosha aura SVG at 5% opacity
- **GSAP:** panels stagger from left, each 0.15s offset

### S8: ReportPathForward
- **Bg:** cream
- **SectionDivider:** `fill="cream" variant={2}`
- `font-label`: "YOUR PATH FORWARD"
- Plantin `"Here is where the remembering begins."` large h2
- **Layout:** 45/55 — BlobImage left (placeholder, portrait), recommendations right
- 4 recommendation lines: each `border-b border-aubergine/10 pb-4 mb-4`, Plantin light
- **AuraButton** at bottom: `"Begin Your Ritual"` — reuse existing component
- **GSAP:** image reveals, text stagger

### S9: ReportMorning
- **Bg:** cream (gentle morning feeling)
- `font-label`: "MORNING RITUALS"
- Inline `ritual.svg` icon, 60px, centered, `stroke-aubergine/30`
- Plantin italic `"Morning (Sunrise Bliss)"` h3 centered
- 4 prose paragraphs, max-w-xl centered
- BlobImage right float (placeholder) on paragraph 2
- **GSAP:** paragraphs stagger y:30→0

### S10: ReportEvening
- **Bg:** `bgDark`
- **SectionDivider**
- `font-label text-cream/40`: "EVENING RITUALS"
- Plantin italic `"Evening (The Quiet Hours)"` h3 centered, cream
- 3 prose paragraphs in `max-w-lg mx-auto`, cream/80
- BlobImage left (placeholder), `variant="on-aubergine"` — dims toward the right
- **GSAP:** slow reveals, larger y:60→0, longer duration 1.5s (meditative feel)

### S11: ReportNourishment
- **Bg:** cream
- **SectionDivider:** `fill="cream" variant={4}`
- `font-label`: "NOURISHMENT WISDOM"
- **Layout:** scattered — text left 55%, BlobImage right 40%; then BlobImage left, text right
- Element icons (air/fire/earth as inline SVG) between paragraphs as separators
- 3-4 prose paragraphs
- **GSAP:** alternating sides reveal

### S12: ReportFinalCard
- **Bg:** radial gradient on `bgDark` — `radial-gradient(ellipse at 30% 20%, rgba([accent-rgb],0.18) 0%, [bgDark] 60%)`
- Full viewport `min-h-dvh`, flex center
- **ETHA Dosha Card** floats in center:
  - 340px wide, dosha dark bg, shadow-elevated
  - Inner: ETHA wordmark, dosha name large, inline aura SVG, final tagline text
  - Card has a gentle breathing scale animation
- **Below card:**
  - Italic Plantin `"Your card. Your ritual. Your remembering."` cream, centered
  - `AuraButton`: `"Return to your journey →"` in cream variant
- **GSAP:** card enters scale:0.85→1 + y:80→0, shadow expands, then starts breathing animation
- **ReportAuraThread** is visible prominently in this final section (thread has been drawing all the way down)

---

## ReportAuraThread Design

New component, inspired by but distinct from `AuraThread.tsx`:

- **Fixed SVG** `position: fixed, inset: 0, pointer-events: none, z-index: 3` (below content z-10, above backgrounds)
- **ViewBox:** `0 0 800 3000` — tall, designed for single-column report proportions (not the 1440px landing page width)
- **Path:** Snake pattern weaving center-left-center-right down the full 3000px height. Starts top-right of content area, weaves organically every ~300px of vertical height.
- **Stroke color:** dosha accent color (`theme.accent`) — this is the KEY visual difference from the landing AuraThread (which uses aubergine/cream). The report AuraThread is dosha-colored.
- **Stroke opacity:** `0.35` — visible but not overwhelming
- **Stroke width:** `1.5px`
- **StrokeDashoffset animation:** decreases from `length` to `0` as user scrolls page from top to bottom. Same pattern as `AuraThread.tsx:80–110`.
- **No viewBox pan** — unlike the landing AuraThread, the report thread doesn't pan (it's designed for the full page height, not section-by-section).
- Props: `{ dosha: "vata" | "pitta" | "kapha" }` — derives accent color from theme.

---

## Assumptions

- GSAP and ScrollTrigger are already installed in `app/package.json` — confirmed by usage in `Hero.tsx`, `BlobImage.tsx`, `AuraThread.tsx`
- Lenis is installed — confirmed by `SmoothScroll.tsx`
- Tailwind v4 tokens `vata-dark`, `vata-light`, `vata-accent`, `pitta-*`, `kapha-*` all defined in `globals.css` — confirmed
- `BlobImage` works with `placeholderHint` and no `image` prop (placeholder mode) — confirmed in component source
- `SectionDivider` accepts `fill="cream"` and `fill="aubergine"` — confirmed; note: does NOT support dosha-dark fills, so sections transitioning between two dark sections will use `fill="aubergine"` which is close enough for now
- SVG files in `assets/design-elements/` are NOT in `app/public/` — so they cannot be referenced by URL. They must be either: (a) inlined as JSX SVG, or (b) copied to `app/public/`. **Decision: inline the path `d` attributes directly in the component.** This avoids base-path issues and keeps all SVG under GSAP control.
- `generateStaticParams` must be used for `[dosha]` dynamic route to work with `output: "export"` in `next.config.ts`

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ReportAuraThread viewBox hardcoded at 3000px but 12-section report exceeds this on mobile | High | Medium | At mount, read `document.documentElement.scrollHeight`; if taller than 3000 scale the viewBox height to match. Set viewBox dynamically: `svgEl.setAttribute("viewBox", \`0 0 800 ${scrollH}\`)` |
| `SectionDivider` only supports cream/aubergine fills — incompatible with dosha-dark hex (#000F9F, #9D0033) | High | Medium | **Task 1 must add `customFill?: string` hex prop to `SectionDivider.tsx`**. When set, overrides the FILL_COLORS lookup. All dosha-dark→cream transitions use `<SectionDivider fill="cream" customFill={theme.darkHex} />` |
| Breathing loop animations spawned outside `gsap.context()` scope cause memory leaks on unmount | High | Medium | All `gsap.timeline({ repeat:-1 })` ambient loops must be created inside `const ctx = gsap.context(() => { … }, sectionRef)` — `ctx.revert()` will kill them automatically |
| No `prefers-reduced-motion` handling on heavy animation page | High | High | Every section's useEffect checks `window.matchMedia("(prefers-reduced-motion: reduce)").matches` first — if true, skip all `gsap.from` / `gsap.timeline` calls. Show content statically at final positions. Pattern already used in `BlobImage.tsx` — follow same pattern |
| Scroll animation jank from many simultaneous ScrollTriggers | Medium | Medium | Keep total active ScrollTriggers ≤ 15; use `toggleActions: "play none none none"` (not scrub) for text reveals |
| Base path prefix missing on public SVG assets | High | Medium | Inline SVG path data directly — no URL required |
| Section count stated as "11" in multiple places | Fixed | — | Corrected to 12 throughout (Hero/Intro/DoshaAura/Composition/Personality/Balance/BMS/PathForward/Morning/Evening/Nourishment/FinalCard) |

---

## Goal Verification

### Truths

1. Visiting `/report/vata`, `/report/pitta`, `/report/kapha` each render a distinct themed page (different background colors, different dosha name)
2. Scrolling from top to bottom reveals every section with staggered GSAP animations (elements enter from y:40-60 with opacity 0→1)
3. The ReportAuraThread draws progressively as the user scrolls — by page bottom, the full path is visible
4. Composition bars animate from 0 to their target % when the composition section enters viewport
5. All text maintains WCAG AA contrast (cream on dark bg, aubergine on cream bg — no accent-color body text)
6. BlobImage components display placeholder gradients in blob shapes (no broken image icons)
7. SectionDivider organic waves appear between every section background transition
8. `npm run build` exits 0 with no TypeScript errors

### Artifacts

- `app/src/app/report/[dosha]/page.tsx`
- `app/src/components/report/DoshaReport.tsx`
- `app/src/components/report/ReportAuraThread.tsx`
- `app/src/components/report/reportTheme.ts`
- `app/src/components/report/sections/` (11 section files)

---

## E2E Test Scenarios

### TS-001: Vata report renders full page
**Priority:** Critical
**Preconditions:** Dev server running

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/report/vata` | Page loads, hero shows "VATA" in huge Plantin, dark blue background |
| 2 | Verify hero text | "You are" + "VATA" visible, cream text, no overflow |
| 3 | Scroll slowly to bottom | All 11 sections appear in sequence, each with content visible |
| 4 | Check aura thread | Dosha-accent colored line progressively drawn as scrolling |
| 5 | Reach final section | ETHA Dosha Card component visible, AuraButton present |

### TS-002: Pitta theme is distinct
**Priority:** Critical
**Preconditions:** TS-001 passed

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/report/pitta` | Dark red/crimson hero background (`pitta-dark` #9D0033) |
| 2 | Compare hero to Vata | "PITTA" text, aquamarine accent color (not citrine) |

### TS-003: Kapha theme is distinct
**Priority:** Critical

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/report/kapha` | Dark teal hero background (`kapha-dark` #00545C) |
| 2 | Scroll to composition | Kapha bar shows highest % (dominant dosha) |

### TS-004: Composition animation fires
**Priority:** High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/report/vata` | — |
| 2 | Scroll to composition section | Bars animate growing from left, numbers count up |
| 3 | Wait 2 seconds | Bars reach target width, numbers show final % |

### TS-005: BlobImage placeholders render
**Priority:** High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/report/vata` | — |
| 2 | Scroll through all sections | No broken images, all blob shapes show gradient placeholders |

### TS-006: Build passes clean
**Priority:** Critical

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Run `npm run build` in `app/` | Exit 0, no TypeScript errors, all 3 report routes in output |

---

## Progress Tracking

- [ ] Task 1: Foundation — route, theme config, orchestrator, ReportAuraThread
- [ ] Task 2: ReportHero
- [ ] Task 3: ReportIntro + ReportDoshaAura
- [ ] Task 4: ReportComposition (animated bars — split from Task 3, complex enough standalone)
- [ ] Task 5: ReportPersonality + ReportBalance
- [ ] Task 6: ReportBodyMindSpirit + ReportPathForward
- [ ] Task 7: ReportMorning + ReportEvening
- [ ] Task 8: ReportNourishment + ReportFinalCard

**Total Tasks:** 8 | **Completed:** 0 | **Remaining:** 8

---

## Implementation Tasks

### Task 1: Foundation — Route, Theme Config, Orchestrator, ReportAuraThread

**Objective:** Set up the structural skeleton: the Next.js route, the dosha theme config map, the `DoshaReport` orchestrator shell (with SmoothScroll + ReportAuraThread wired), and the new `ReportAuraThread` component. After this task, `/report/vata` renders a dark page with the aura thread visible and nothing else.

**Dependencies:** None

**Files:**
- Create: `app/src/app/report/[dosha]/page.tsx`
- Create: `app/src/components/report/reportTheme.ts`
- Create: `app/src/components/report/DoshaReport.tsx`
- Create: `app/src/components/report/ReportAuraThread.tsx`
- Modify: `app/src/components/SectionDivider.tsx` (add `customFill?: string` hex prop)

**Key Decisions / Notes:**

`page.tsx` — use `generateStaticParams` returning `[{ dosha: 'vata' }, { dosha: 'pitta' }, { dosha: 'kapha' }]`. `params` is a Promise in Next.js 16 — `const { dosha } = await params`. Pass `dosha` to `<DoshaReport dosha={dosha} />`.

`reportTheme.ts` — export a `REPORT_THEMES` record keyed by dosha. Populate all copy (taglines, paragraphs, ritual text) from the HTML templates in `reports_guidance/`. Use Tailwind class names for bg/text where possible, hex strings for SVG stroke colors:
```ts
export const REPORT_THEMES: Record<"vata"|"pitta"|"kapha", DoshaTheme> = {
  vata: {
    bgDark: "bg-vata-dark", bgLight: "bg-vata-light", accent: "#F5A800",
    accentTailwind: "text-vata-accent", name: "Vata", elements: "Air + Ether", ...
  },
  pitta: { bgDark: "bg-pitta-dark", accent: "#A2E8F2", name: "Pitta", elements: "Fire + Water", ... },
  kapha: { bgDark: "bg-kapha-dark", accent: "#FFB3A5", name: "Kapha", elements: "Earth + Water", ... }
};
```

`DoshaReport.tsx` — `"use client"`, receives `dosha` prop, reads `REPORT_THEMES[dosha]`. Wraps everything in `<SmoothScroll>`. Renders `<ReportAuraThread dosha={dosha} />` as first child (fixed, z-3). Section components will be added in later tasks — leave TODO comments as placeholders.

`ReportAuraThread.tsx` — study `AuraThread.tsx` for the strokeDashoffset pattern. Key differences:
- No viewBox pan (fixed viewBox `0 0 800 3000`)
- Stroke color = `theme.accent` (dosha colored)
- Path snakes down the 800×3000 space weaving ±250px around x=400 (center)
- Example path start:
  ```
  M 550,0 C 600,150 250,300 350,500 C 450,700 650,850 500,1100 C 350,1350 200,1500 400,1750 ...
  ```
  (continue pattern for ~3000px height, approximately 10 oscillations)
- `strokeOpacity: 0.35`, `strokeWidth: 1.5`
- Use `document.documentElement.scrollHeight` at runtime to check if viewBox height needs adjusting (log a warning if page is taller than 3000px)

**Definition of Done:**
- [ ] `npm run build` exits 0 with no TS errors
- [ ] `http://localhost:3000/report/vata` returns 200, shows dark blue page
- [ ] `http://localhost:3000/report/pitta` shows dark red page
- [ ] `http://localhost:3000/report/kapha` shows dark teal page
- [ ] ReportAuraThread SVG is visible in DOM (inspect: `data-report-aura-thread` attribute)
- [ ] Scrolling shows aura thread drawing (dosha accent color)

**Verify:**
- `npm run build` — passes
- `npm run dev` — navigate to all 3 URLs and inspect

---

### Task 2: ReportHero

**Objective:** Build the full-viewport hero section for each dosha — the first impression. The hero must feel like a luxury editorial reveal: dosha name in massive Plantin, breathing dosha SVG on the right, staggered entry animation on page load.

**Dependencies:** Task 1

**Files:**
- Create: `app/src/components/report/sections/ReportHero.tsx`
- Modify: `app/src/components/report/DoshaReport.tsx` (add `<ReportHero>` as first section)

**Key Decisions / Notes:**

Hero is the ONLY section with a **page-load** (not scroll-triggered) entry animation. Use `gsap.timeline()` in useEffect with no ScrollTrigger — fires immediately. Sequence:
1. t=0: dosha SVG path draws in via strokeDashoffset (duration: 2s, ease: power1.inOut)
2. t=0.5: "You are" fades up (y:30→0, opacity:0→1, duration:0.8)
3. t=0.8: DOSHA NAME scales up (scale:0.92→1, opacity:0→1, duration:1.0, ease: power2.out)
4. t=1.2: tagline lines stagger in (3 lines, 0.15s apart)
5. t=1.6: scroll indicator fades in (opacity: 0→1)
6. After load: ambient breathing on dosha SVG (gsap.to scale: 1.0↔1.025, yoyo, repeat:-1, duration:5, ease:sine.inOut)

Dosha SVG inlining: read the path data from `assets/design-elements/doshas/vata.svg`, `pitta.svg`, `kapha.svg` and embed the `d` attribute as a constant in `reportTheme.ts`. The SVG element itself is inline JSX:
```tsx
<svg viewBox="..." fill="none" overflow="visible" ref={auraSvgRef}>
  <path d={theme.doshaAuraDPath} stroke="#FFEFDE" strokeWidth={1.5} fill="none" strokeLinecap="round" />
</svg>
```

Scroll indicator: a `<div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">` containing a 1px cream vertical line (60px tall, GSAP breathing height animation) + `<p className="font-label text-cream/40 text-[10px] rotate-0">SCROLL TO DISCOVER</p>`

Layout: `<section ref={sectionRef} className="relative min-h-dvh {bgDark} flex flex-col md:flex-row overflow-hidden">`

Contrast check: cream text (#FFEFDE) on `vata-dark` (#000F9F) = ~10:1 ✓, on `pitta-dark` (#9D0033) = ~5.5:1 ✓, on `kapha-dark` (#00545C) = ~6.8:1 ✓ — all pass AA.

**Definition of Done:**
- [ ] Hero visible at all 3 `/report/[dosha]` URLs
- [ ] Entry animation fires on page load (no scroll needed)
- [ ] Dosha SVG visible and breathing after load
- [ ] Dosha name uses correct Tailwind color class per dosha
- [ ] Mobile: single column, dosha SVG below text, not cut off

**Verify:**
- Visually in browser at all 3 URLs
- Resize to 375px mobile width

---

### Task 3: ReportIntro + ReportDoshaAura

**Objective:** Three consecutive sections after the hero: the personality intro (cream), the large aura visual (dark), and the animated composition bars (cream). These are the core "what you are" sections.

**Dependencies:** Task 2

**Files:**
- Create: `app/src/components/report/sections/ReportIntro.tsx`
- Create: `app/src/components/report/sections/ReportDoshaAura.tsx`
- Create: `app/src/components/report/sections/ReportComposition.tsx`
- Modify: `app/src/components/report/DoshaReport.tsx`

**Key Decisions / Notes:**

**ReportIntro:**
- `<SectionDivider fill="cream" variant={1} />` at top (covers dark hero below)
- Background: `bg-cream` — for the faint aura bg use `aura-balanced-ai.svg` path inlined at 4% stroke opacity
- 3 content blocks with stagger: Block A (pull quote left, intro text right), Block B (BlobImage placeholder left `SHAPE_SPACE` or `SHAPE_AIR`, personality para right), Block C (centered accent text)
- Pull quote text size: `text-[clamp(1.8rem,4vw,3.2rem)] font-serif italic` — this is the ETHA brand "scattered text" style
- Accent word: `<span style={{ color: theme.accent }}>restless</span>` pattern for Vata

**ReportDoshaAura:**
- `<SectionDivider fill="cream" customFill={theme.darkHex} variant={2} />` — uses the new `customFill` prop added in Task 1 so the wave fill exactly matches the dosha-dark background above it
- Large aura SVG: take path `d` attribute from `assets/design-elements/aura-energised-01.svg` (Vata), `aura-balanced-01.svg` (Pitta), `aura-relaxed-01.svg` (Kapha). Stored in `reportTheme.ts` as `mainAuraDPath` and `mainAuraViewBox`.
- SVG: `width="100%" height="70vh" preserveAspectRatio="xMidYMid meet" overflow="visible"`
- GSAP: `ScrollTrigger start:"top 80%", end:"top 30%", scrub:1` — draws aura in as section enters
- Text overlaid: absolutely positioned bottom-center of section, `z-10`

**ReportComposition:**
- `<SectionDivider fill="cream" variant={3} />`
- Data from `theme.composition: { vata: 60, pitta: 30, kapha: 10 }` for Vata, etc.
- Bar animation using ref array: `barRefs.current[i]` for each bar fill element
- GSAP in single `gsap.context()`:
  ```tsx
  bars.forEach((bar, i) => {
    gsap.from(bar, { width: "0%", duration: 1.4, ease: "power2.out", delay: i * 0.2,
      scrollTrigger: { trigger: sectionRef.current, start: "top 70%", toggleActions: "play none none none" }
    });
  });
  ```
- Number counter: use `{ val: 0 }` object approach — see AuraThread for gsap object animation pattern
- Element icons: inline SVG for air (wind strokes), fire (flame), earth (circle), ether (dot + ring), water (wave) — taken from design-elements/elements/ path data

**Definition of Done:**
- [ ] Intro section visible below hero with wave divider
- [ ] 3 intro content blocks render with BlobImage placeholder
- [ ] Dosha aura section draws SVG on scroll (not instantly)
- [ ] Composition bars animate from 0 on scroll trigger
- [ ] Numbers count up 0→target alongside bars
- [ ] No horizontal overflow at any section

**Verify:**
- Scroll through first 4 sections in browser
- Check overflow-x: `document.documentElement.scrollWidth === window.innerWidth`

---

### Task 4: ReportPersonality + ReportBalance

**Objective:** The "mirror" sections — Who You Are (dark bg) tells the truth about the user's nature, Where You Lost Balance (cream) surfaces their shadows. Emotionally the most important sections.

**Dependencies:** Task 3

**Files:**
- Create: `app/src/components/report/sections/ReportPersonality.tsx`
- Create: `app/src/components/report/sections/ReportBalance.tsx`
- Modify: `app/src/components/report/DoshaReport.tsx`

**Key Decisions / Notes:**

**ReportPersonality:**
- Dark bg `{bgDark}`
- `font-label text-cream/40 mb-4`: "WHO ARE YOU?"
- Two-column desktop: left 60% has the large headline + 3 paragraphs; right 40% has BlobImage
- Headline: `text-[clamp(2.5rem,6vw,5rem)] font-serif font-semibold text-cream leading-[1.1]`
- BlobImage: `shape={SHAPE_GURU_B}`, `variant="on-aubergine"`, `className="w-[280px] h-[340px]"`, `breathDir="left"`, `breathDelay={0.3}`
- GSAP: headline enters `scale:0.95→1 + opacity:0→1`; paragraphs stagger `y:40→0`
- Copy from `theme.personalityHeadline` and `theme.personalityParagraphs`

**ReportBalance:**
- Cream bg, `<SectionDivider fill="cream" variant={1} />`
- `font-label`: "WHERE YOU LOST BALANCE"
- `"The places you forget yourself."` subtitle in light Plantin italic
- 3 cards from `theme.balanceItems`:
  - Each: `border-l-[3px]` with `borderColor: theme.accent`, `pl-6 py-4 mb-8`
  - Card 1: no indent
  - Card 2: `ml-[10%]`
  - Card 3: `ml-[5%]`
  - Icon: 28px inline SVG from ui set (quiet.svg, ritual.svg, dosha.svg) — stroke aubergine/50
  - Headline: `font-serif text-xl font-semibold text-aubergine`
  - Body: `font-serif text-sm font-light text-aubergine/70`
- GSAP: cards stagger `y:60→0` with 0.2s offset each, triggered at section top 70%

**Definition of Done:**
- [ ] Personality section: large headline visible, BlobImage in blob shape right side
- [ ] Personality paragraphs reveal on scroll
- [ ] Balance section: 3 cards visible, each with accent left border
- [ ] Card stagger animation works (cards appear sequentially, not all at once)
- [ ] Accent border color matches dosha theme (citrine for Vata, etc.)

**Verify:**
- Navigate `/report/vata` and `/report/pitta`, compare accent border colors

---

### Task 5: ReportBodyMindSpirit + ReportPathForward

**Objective:** The prescription sections — how the dosha manifests across Body/Mind/Spirit (dark bg triptych) and what to do about it (Path Forward, cream, with CTA).

**Dependencies:** Task 4

**Files:**
- Create: `app/src/components/report/sections/ReportBodyMindSpirit.tsx`
- Create: `app/src/components/report/sections/ReportPathForward.tsx`
- Modify: `app/src/components/report/DoshaReport.tsx`

**Key Decisions / Notes:**

**ReportBodyMindSpirit:**
- Dark bg
- `font-label text-cream/40`: "BODY · MIND · SPIRIT"
- Desktop: `grid grid-cols-3` with vertical `border-r border-cream/10` between columns
- Mobile: stacked, each panel full-width, `border-b border-cream/10`
- Each panel structure:
  ```tsx
  <div className="flex flex-col items-start px-8 py-16">
    <svg ...>…inline icon path…</svg>  {/* quiet.svg / dosha.svg / ritual.svg — 36px */}
    <p className="font-label text-cream/50 text-[10px] mt-4 mb-3">{panel.label}</p>
    <p className="font-serif text-cream/80 text-sm font-light leading-[1.7]">{panel.body}</p>
  </div>
  ```
- Data from `theme.bodyPanel`, `theme.mindPanel`, `theme.spiritPanel`
- Background: faint aura SVG at 5% opacity, no animation (static)
- GSAP: `gsap.from(panels, { x:-20, opacity:0, stagger:0.2, ... })`

**ReportPathForward:**
- Cream bg, `<SectionDivider fill="cream" variant={0} />`
- `font-label`: "YOUR PATH FORWARD"
- `"Here is where the remembering begins."` — Plantin h2 `text-[clamp(2rem,5vw,4rem)] font-semibold text-aubergine`
- Two-column: 45/55 — BlobImage left (`SHAPE_GURU_C`, `variant="on-cream"`, portrait) + recommendations right
- 4 recommendations from `theme.pathForward`: each `border-b border-aubergine/10 py-4 font-serif text-sm text-aubergine/70`
- `<AuraButton>` at bottom right: import from `@/components/AuraButton`, text `"Begin Your Ritual →"`. Set `className="mt-8"`
- GSAP: BlobImage reveals, recommendations stagger y:30→0

**Definition of Done:**
- [ ] Body/Mind/Spirit: 3-column grid renders, icons visible
- [ ] Panel stagger animation (left→right)
- [ ] Path Forward: 4 recommendation lines with bottom borders
- [ ] AuraButton renders and is clickable (href can be `"/"` for now)
- [ ] Two-column layout collapses properly on mobile

**Verify:**
- Resize to mobile, confirm all columns stack

---

### Task 6: ReportMorning + ReportEvening

**Objective:** The ritual sections — morning (grounding, nourishing, cream) and evening (quieting, introspective, dark). These are the most prose-heavy sections; typography and spacing carry the weight.

**Dependencies:** Task 5

**Files:**
- Create: `app/src/components/report/sections/ReportMorning.tsx`
- Create: `app/src/components/report/sections/ReportEvening.tsx`
- Modify: `app/src/components/report/DoshaReport.tsx`

**Key Decisions / Notes:**

**ReportMorning:**
- Cream bg, `<SectionDivider fill="cream" variant={4} />`
- Layout: centered column `max-w-2xl mx-auto px-6` (intentionally narrow — editorial feel)
- `font-label`: "MORNING RITUALS"
- `ritual.svg` icon: inline SVG, 56px, centered, `stroke-aubergine/25` — no animation
- Plantin italic h3: `"Morning — the first kind act"` centered
- 4 prose paragraphs from `theme.morningRituals` with `leading-[1.85]` — generous line height
- BlobImage: floated right on paragraph 2 using `float-right ml-8 mb-4 w-[200px] h-[220px]` — clearfixed container
- Subtle aura: small balanced aura SVG bottom-right corner, 6% opacity, no animation
- GSAP: paragraphs stagger y:30→0 with 0.15s gaps

**ReportEvening:**
- Dark bg `{bgDark}`, `<SectionDivider fill="cream" customFill={theme.darkHex} variant={1} flipX />` — uses `customFill` so wave matches dosha-dark bg
- Layout: centered `max-w-xl mx-auto px-6`
- `font-label text-cream/40`: "EVENING RITUALS"
- `quiet.svg` icon: 48px, cream/25, centered
- Plantin italic h3: `"Evening — the quiet hours"` cream, centered
- 3 prose paragraphs from `theme.eveningRituals`, cream/75, larger line-height `leading-[2]`
- BlobImage: left float on paragraph 2, `variant="on-aubergine"`, `w-[180px] h-[200px]`
- GSAP: slower reveals (duration:1.6, ease:power1.out) for meditative feel

**Definition of Done:**
- [ ] Morning section: ritual icon visible, 4 paragraphs with generous spacing
- [ ] BlobImage float right in morning section
- [ ] Evening section: dark bg, slower reveals
- [ ] Wave divider visible between Morning and Evening sections
- [ ] Copy matches dosha (morning routines are dosha-appropriate)

**Verify:**
- Scroll speed through both ritual sections

---

### Task 7: ReportNourishment + ReportFinalCard

**Objective:** The final two sections — nourishment wisdom (cream, scattered blobs) and the ETHA dosha card reveal (full-viewport dark, the emotional peak of the whole report).

**Dependencies:** Task 6

**Files:**
- Create: `app/src/components/report/sections/ReportNourishment.tsx`
- Create: `app/src/components/report/sections/ReportFinalCard.tsx`
- Modify: `app/src/components/report/DoshaReport.tsx`

**Key Decisions / Notes:**

**ReportNourishment:**
- Cream bg, `<SectionDivider fill="cream" variant={2} />`
- `font-label`: "NOURISHMENT WISDOM"
- Scattered layout — 2 content blocks alternating sides:
  - Block A: text left 55%, BlobImage right 40% (`SHAPE_EARTH`, `variant="on-cream"`, `breathDir="right"`)
  - Block B: BlobImage left 38% (`SHAPE_WATER`, `variant="on-cream"`, `breathDir="left"`), text right 58%
- Element icon decorators between blocks: `earth.svg`, `water.svg` at 32px, `stroke-aubergine/20`
- 3-4 paragraphs from `theme.nourishment`
- GSAP: alternating side reveals — Block A from x:40, Block B from x:-40

**ReportFinalCard:**
- Full viewport `min-h-dvh`, centered flex
- Background: `style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(R,G,B,0.18) 0%, [bgDarkHex] 60%)" }}` — RGB from dosha accent color
- `<SectionDivider fill="aubergine" />` (or dosha dark approximation)
- **ETHA Dosha Card** component: 340px wide inline card:
  ```tsx
  <div className="w-[340px] max-w-[92%] relative" ref={cardRef}
       style={{ background: doshaCardBg, boxShadow: theme.cardShadow }}>
    <p className="font-label text-cream/40 text-[10px] text-center pt-6">Ē T H A</p>
    <p className="font-serif text-[13px] text-center text-cream/60 mt-2">{theme.name} — {theme.elements}</p>
    {/* Inline aura SVG — small version of dosha aura */}
    <svg ...><path d={theme.doshaAuraDPath} stroke={theme.accent} .../></svg>
    <p className="font-serif text-[28px] font-semibold text-cream text-center">{theme.name}</p>
    <p className="font-serif text-[13px] italic text-cream/60 text-center px-8 pb-6">{theme.finalTagline}</p>
  </div>
  ```
- Below card: `"Your card. Your ritual. Your remembering."` — Plantin italic cream/70 centered
- `<AuraButton>` centered: `"Return to your journey"` — href `"/"`
- GSAP: card enters `scale:0.85→1, y:80→0, duration:1.4, ease:power3.out` with ScrollTrigger. After entrance, starts breathing scale:1.0↔1.015 ambient loop.
- Card box-shadow: `0 28px 70px rgba([accent-rgb],0.28), 0 0 0 1px rgba(255,239,222,0.06)` — dramatic, elevated

**Definition of Done:**
- [ ] Nourishment section: 2 alternating BlobImage + text blocks, element icons visible
- [ ] Final card section: card visible, radial gradient bg, ETHA wordmark on card
- [ ] Card entrance animation fires on scroll (scale + y)
- [ ] Card ambient breathing loop active after entrance
- [ ] AuraButton present below card
- [ ] Report AuraThread visibly reaching the bottom of the page (fully drawn)

**Verify:**
- Scroll all the way to the end on all 3 report URLs
- Confirm card shadows and gradients look premium (not flat)
- Run `npm run build` — must exit 0

---

## Open Questions

None remaining.

### Deferred Ideas
- Report progress sidebar: a sticky vertical chapter indicator (dot nav) showing current section — deferred, not in scope for design phase
- Real photography: BlobImage placeholders will be replaced with actual dosha imagery later
- PDF/print version of the report — post-design phase
- Personalisation with user's first name from localStorage — deferred; design phase uses generic copy, logic wired later
- Lottie animation for element icons — may look better than inline SVG, evaluate post-implementation
