# UX_findings — Joana on ETHA Quiz

**Date:** 2026-04-23
**Flow tested:** `/quiz` → intro (6 screens) → body layer (L1) → mind (L2) → spirit (L3) → email gate → result (Vata/Pitta/Kapha)
**Viewport:** 390×844 mobile primary, 1440×900 desktop spot-check
**Personas:** Joana (project), Casey (mobile), Riley (stress)
**Dev server:** `http://localhost:3000` (Next.js 16 Turbopack)

## Files

| File | Content |
|------|---------|
| `critique-report.md` | Main report: Nielsen scoring, anti-patterns, priority issues, persona red flags |
| `persona-joana.md` | Joana walkthrough — blind first-read reactions, brand-voice fit |
| `persona-casey.md` | Mobile/thumb-zone test |
| `persona-riley.md` | Stress test — refresh, deep-link, bad input, back-button |
| `01-*.png` … `24-*.png` | Screenshots from each step of the walkthrough |

## Screenshot index

- `01-intro-statement.png` — intro 0/6 "Am I who I am supposed to be?"
- `02-intro-reflect1.png` — intro 1/6 reflection copy
- `03-intro-reflect2.png` — intro 2/6 "system older than medicine"
- `04-intro-twolines.png` — intro 3/6
- `05-intro-reflect4.png` — intro 4/6 "Your body has a blueprint"
- `06-intro-value.png` — intro 5/6 "YOU ARE ABOUT TO RECEIVE"
- `07-intro-gate.png` — intro 6/6 "Are you ready to return to yourself?"
- `08-body-entry.png` — Body layer opening
- `09-body-L1-q1-answered.png` — Q1 answered
- `10-body-visual.png` — visual-type question
- `11-body-choice.png` — choice-type question
- `12-body-scale2.png` — 2-pole slider
- `13-body-tempo.png` — tempo scale
- `14-body-open.png` — open-text input
- `15-body-L2-transition.png` — Body → Mind layer transition
- `16-mind-scale3.png` — 3-pole slider
- `17-spirit-L3.png` — Spirit layer
- `18-email-gate.png` — Email gate modal
- `19-email-filled.png` — Email gate with valid input
- `20-result-vata.png` — Result page (Vata primary)
- `21-result-pitta.png` — Result page (Pitta switch)
- `22-result-kapha.png` — Result page (Kapha switch)
- `23-desktop-intro.png` — Desktop 1440px view
- `24-refresh-body-no-state.png` — Deep-link to `/quiz/body`: progress lost, resets to Q1
