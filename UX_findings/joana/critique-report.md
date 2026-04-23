# Impeccable Critique — ETHA Quiz Flow

**Personas used:** Joana (project), Casey (mobile), Riley (stress tester)
**Scope:** `/quiz` → intro → body L1 → mind L2 → spirit L3 → email gate → result
**Date:** 2026-04-23

---

## Design Health Score (Nielsen's 10 Heuristics)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Progress indicator is a tiny "1/52 · L1" in a corner. User has no felt sense of where they are or how far is left. No layer transition announcement. |
| 2 | Match System / Real World | 3 | Copy speaks Joana's emotional register ("Am I who I am supposed to be?"). Loses points for untranslated Ayurveda terms (Vata/Pitta/Kapha, Dosha) appearing at the result before teaching. |
| 3 | User Control and Freedom | 1 | No visible back button on any quiz screen. Cannot return to previous answer. Cannot skip a question. Refresh wipes progress. |
| 4 | Consistency and Standards | 3 | Strong visual system consistency (type, aura, 0px radius, cream/aubergine alternation holds across 30+ screens). Minor: answer hit areas vary between question types. |
| 5 | Error Prevention | 2 | Email gate button disabled until input looks email-ish — good. But no validation feedback before submit. No guard against accidental close/navigate-away losing 52 answers. |
| 6 | Recognition Rather Than Recall | 2 | "Body / Mind / Spirit" nav at top of each layer is good. But the intro's 6 screens of prose require remembering abstract promises until the quiz actually starts. |
| 7 | Flexibility and Efficiency | 1 | No skip, no keyboard-only completion path tested (tab/enter), no shortcut for repeat users retaking. Only `dev`-mode jump buttons exist, not production aids. |
| 8 | Aesthetic and Minimalist Design | 4 | Best-scoring axis. Generous whitespace, single focal question per screen, Plantin carries emotion, no ornamental chrome, no glassmorphism, no AI-slop color palette, no gradient text. Genuinely beautiful. |
| 9 | Error Recovery | 1 | No error recovery tested beyond email gate. If the result API fails, there is no visible fallback. Refresh on body/mind/spirit route = full restart. |
| 10 | Help and Documentation | 1 | Zero in-quiz help. No tooltip for "what does this layer mean?", no "why are we asking this?", no link out to an explainer. |
| **Total** | | **20/40** | **Aesthetically A-grade, but functionally B-minus.** |

Honest read: the visual craft is exceptional. The UX safety nets are missing.

---

## Anti-Patterns Verdict

### LLM assessment
**Does this look AI-generated? No.** This is among the cleanest wellness-adjacent interfaces I've walked in a long time. The project has done the hard work:
- 0px border-radius everywhere (confirmed via computed-style audit: 0 violations across all rendered elements)
- No gradient text (confirmed: 0 `background-clip: text` usages)
- No side-stripe card borders > 1.5px (confirmed: 0 violations)
- No pure black text (confirmed: 0 `rgb(0,0,0)` text)
- No purple-to-blue wellness gradient
- No glassmorphism
- No rounded-icon-above-every-heading template
- Plantin (serif) carries emotion, Brandon Grotesque UPPERCASE + tracked for labels only — rule honored

What it DOES risk: the intro lands close to a **"come home to yourself"** cliche ("Are you ready to return to yourself?", "Begin your remembering"). On Joana's first read this hovers between genuinely distinctive and Muted-Wellness-Account. Execution saves it, but a nudge away from "return / remembering" vocabulary would make it truly ownable.

### Deterministic scan
**CLI scan skipped** — no `impeccable` CLI binary installed globally or locally (`npx impeccable` fails: missing package). Replaced with in-browser computed-style audit (see `evaluate_script` run in walkthrough) + full source grep via cline-native tools. Results above.

### Visual overlays
Live detection server not started (no CLI). If user wants the overlay pass, install `impeccable` and re-run:
```
cd app && npx impeccable live &
```
Then inject `/detect.js` into the tab labeled `[Joana]`.

---

## Overall Impression

**What works:** the visual and typographic system is the real thing. The result page is genuinely specific — Vata/Pitta/Kapha each get a named archetype ("THE KINETIC MIND"), a percentage mix, three revealed patterns, and a single tonight-ritual. That is the high point of the flow and the best peak for peak-end.

**What doesn't:** the road to that peak is too long, too loose, and too easy to lose. 6 intro screens + 52 questions + no progress preservation + no back button + no skip = a commitment Joana will not finish on her real device in her real context.

**Single biggest opportunity:** cut the intro from 6 screens to 2, show felt-progress throughout, persist state, and let the user go back. The design system doesn't need to change. The scaffolding around it does.

---

## What's Working (keep)

1. **Result page specificity.** "YOU WERE BUILT TO MOVE. RIGHT NOW YOU ARE BEING ASKED TO ALSO BURN." + "Lie on your back. Both hands on your belly. Breathe out completely before breathing in. Three times." This is the opposite of wellness-generic. It reads like ETHA actually knows Joana. Keep every word of this.
2. **Brand system enforcement.** Zero rounded corners, zero gradient text, zero color-stripe borders, zero black text in the entire tree. No AI-slop tells at all on the tested surfaces. That is rare.
3. **Per-layer nav ("BODY / MIND / SPIRIT")** at the top gives a macro orientation even when micro progress ("18/52") is buried. Good information scent.

---

## Priority Issues

### [P0] No state persistence across refresh / deep link / interruption
**Where:** `/quiz/body`, `/quiz/body/mind`-equivalent, `/quiz/result`. Deep-link to `/quiz/body` with no prior session → progress resets to Q1/52, previous layer's answers lost. `localStorage` and `sessionStorage` empty throughout flow.

**Why it matters:** Joana reads captions "from the middle of a crowded subway or late at night in bed." Casey is interrupted constantly. Losing 52 questions of work to a tab switch or a refresh is the #1 reason funnels like this die mid-flow. Currently: guaranteed funnel kill for any interrupted user.

**Fix:** persist answers + current index + layer to `localStorage` on every answer change. Hydrate on mount. Show a "resume where you left off?" prompt when a user lands mid-flow.

**Suggested command:** `/harden` (state + error-recovery), then `/clarify` for the resume prompt copy.

### [P0] No back button anywhere in the quiz
**Where:** every quiz screen (intro 1/6 through result).

**Why it matters:** Nielsen heuristic #3 (user control and freedom). Users misclick. Users want to revise. Users want to re-read the reflection that set up the current question. The only control they have is browser-back, which (combined with the above) nukes their progress. This design actively punishes correction.

**Fix:** add a "back" affordance on every quiz screen (top-left, Brandon Grotesque UPPERCASE to match label system). Store answer history; stepping back reveals the prior selection. Not a Cancel — an Undo.

**Suggested command:** `/clarify` + light `/layout` for the back-button placement.

### [P1] Intro is 6 screens of prose before the first question
**Where:** `/quiz` → intro 0/6 through 6/6.

**Why it matters:** Joana has ~5 seconds on the ad click. She has ~30 on the landing. She does not have 6 tap-to-advance reflection screens. By screen 3 ("There is a 5,000-year-old system…") she has scrolled. By screen 5 ("YOU ARE ABOUT TO RECEIVE…") she is gone. The intro is the single highest-abandonment surface in the flow.

**Fix:** collapse to 2 screens max. Screen 1 = the hook question + a one-line "this is a 3-minute rhythm map, not a personality test." Screen 2 = value ladder (map, ritual, botanicals) + the BEGIN button. Cut the "return / remembering" vocabulary from the hook — it borders on the cliche the brand explicitly avoids. Better: name what she'll know in 3 minutes that she doesn't know now.

**Suggested command:** `/distill` for compression, `/clarify` for the replacement hook copy.

### [P1] Progress indicator is invisible
**Where:** every body/mind/spirit screen. `1/52 · L1` lives in a corner in Brandon Grotesque, low contrast against cream. The layer dots in the nav are static, not filled by progress.

**Why it matters:** 52 is a scary number. Joana needs felt progress — a thin aubergine stroke that fills as she advances, a "minute 1 of 3" estimation, or stage dots (Body ●○○ / Mind ○●○ / Spirit ○○●) that actually fill. Without that she feels trapped.

**Fix:** replace "18/52" with a horizontal stroke that fills 0→100% over the full quiz (aubergine on cream). Add layer dots in the top-nav that fill darker as the user passes through each layer.

**Suggested command:** `/layout` for the meter, `/animate` for the fill transition.

### [P1] Email gate asks for email before proving the value
**Where:** gate modal after the last spirit question. Copy: "YOUR MAP IS READY. Leave the name of your inbox, and your map will find you there."

**Why it matters:** Joana has answered 52 questions. She has earned her map. Being told at the final second "also — email" feels like a pivot. She knows she will be emailed, but she needed to know at screen 1, not screen 52. Specifically the phrase **"Leave the name of your inbox"** — clever voice, but requires parsing; Jordan and Casey may miss it.

**Fix:** reveal the email requirement at the intro (value-ladder screen) — "delivered by email in 3 minutes, free, no marketing sequence unless you ask." At the gate, swap the copy to a plainer "Your email — we'll send it now." Keep the brand voice in the headline, not the input label.

**Suggested command:** `/clarify` for the microcopy, `/harden` to gate-validate before submit.

### [P2] No skip option for Alex-type returning / impatient users
**Where:** 52 questions with no shortcut.

**Why it matters:** some users retake. Some want a fast version. Currently they are walked through the full flow every time. This is a moderate-impact efficiency issue, not a blocker.

**Fix:** offer a "quick map" (10 questions) as a lower-friction alternative, or a "retake only what's changed" on repeat visits. Defer this until P0/P1 are addressed.

**Suggested command:** `/shape` to plan the dual-path before building.

---

## Persona Red Flags

See `persona-joana.md`, `persona-casey.md`, `persona-riley.md` for full walkthroughs. Summary:

**Joana (project — audience):**
- Intro screen 0 hook ("Am I who I am supposed to be?") borders on broken-user framing — the brand explicitly forbids "anything that implies Joana is broken." Close call.
- By screen 4 of intro she has started doomscrolling back to Instagram.
- If she makes it to the result, she is re-engaged. The result copy earns the 3 minutes.
- Verdict: **REWRITE** intro; **KEEP** result.

**Casey (distracted mobile):**
- Thumb-zone: CONTINUE / BEGIN buttons land in the lower-middle — reachable. Good.
- No state preserved across tab-switch / call-interrupt / low-battery — P0.
- Email input on the gate modal is full-width, touch target OK, but sits at ~70% viewport height — requires thumb-stretch on larger phones.

**Riley (stress):**
- Refresh mid-quiz → back to Q1 of Body. All Body answers gone.
- Deep-link to `/quiz/body` without prior intro → Q1 renders with no onboarding context. The first-time experience for a deep-linked URL is broken.
- Browser back from result → empty body route. No guard.
- Empty email submit → button disabled (good). Emoji-only email → button disabled (good). Very long string → not validated (needs test with API).

---

## Minor Observations

- **Dev-mode nav buttons** (STATEMENT, REFLECT·1, L1, VISUAL, etc.) are gated by `process.env.NODE_ENV === "development"` — correct, invisible in production build. No action needed; flagged only because they dominate dev screenshots.
- The **aura SVGs** draw beautifully and match the brand rules (continuous cubic beziers, fill:none, no rotation). Good.
- **Body/Mind/Spirit dots** in top nav don't update visually across layers — they stay identical. Easy win to tint the active one.
- The word **"Remembering"** appears in the CTA three times across the flow (intro 6, gate, result). Risks emptying the word of meaning. Consider varying the CTA verb.
- **"BEGIN THE REMEMBERING"** on the result page — Joana has *just* finished. Wrong verb. Should be "START TONIGHT'S RITUAL" or "OPEN THE MAP" — something that commits her to the next concrete action, not re-beginning.

---

## Questions to Consider

1. **What if the quiz were 12 questions, not 52?** The result only shows 3 revealed patterns + 1 ritual. Could the other 40 be inferred from fewer questions, scored the same? If yes, this is the single highest-leverage change possible.
2. **Does Joana need to feel the quiz is "doing work" on her, or does she need to feel it's fast?** Current design leans #1. Her real context leans #2.
3. **What would a 90-second version of this quiz look like?** Would the result still be credibly specific? If yes, build that version too and A/B.
4. **Why is the result page so much better than the lead-up?** Whatever the team did to make the result read as *specifically Joana* — do that to the intro.
5. **What if "Body / Mind / Spirit" were visible as felt chapters** (a thin line that paints each third a distinct tone of aubergine), not just text labels?

---

## Next steps (for user)

Reply with which of these to act on:
- (a) Fix the P0 state-persistence + back-button first
- (b) Cut and rewrite the intro first (biggest abandonment surface)
- (c) Add felt progress meter + layer dots first (lowest effort, visible signal)
- (d) All P0 + P1 as one sweep
- (e) Something else

After that, `/polish` closes the pass.
