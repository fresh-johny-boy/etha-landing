# LLM Independent Design Review — ETHA Quiz UI
**Date:** 2026-04-23  
**Reviewer:** Claude Sonnet 4.6 (independent, not shown to user until instructed)  
**Viewport:** 390×844 (iPhone 14 / Joana primary device)  
**Routes reviewed:** /quiz, /quiz/body (all question types), /quiz/completion, /quiz/gate, /quiz/sent, /quiz/result

---

## AI Slop Verdict

**NO — this is not AI slop.**

The quiz does not commit the canonical AI-generated wellness sins: no gradient text, no glassmorphism, no hero metric cards, no transformation narrative ("unlock your potential"), no generic purple gradients, no identical card grids. The use of hand-crafted SVG aura paths as interactive geometry (blob masks, slider tracks, button borders) is genuinely distinctive — this level of bespoke SVG work is rare and signals intentional craft. The copy is oblique in the right way ("Am I who I am supposed to be?" is a real provocation, not a motivational poster).

One near-miss: the result screen's cobalt/navy background with large citrine "Vata" wordmark and floating percentage bubbles reads slightly close to a data-viz dashboard. The bubble chart is doing double duty as identity reveal and analytics readout, which creates a minor tonal split.

---

## Nielsen Heuristic Scores (0–4)

| # | Heuristic | Score | Specific Finding |
|---|-----------|-------|-----------------|
| 1 | Visibility of System Status | 3 | The BODY/MIND/SPIRIT progress bar with the animated underline is clear. The "4/52 · L1" counter in dev toolbar won't ship, but the nav underline doing its own pacing work is good. Scale questions show disabled CONTINUE until the handle is placed — correct. Missing: no indication of approximate time remaining at quiz entry. |
| 2 | Match System / Real World | 4 | Dosha language is explained through felt-sense questions, not jargon. "Not posing. Just passing by. The mirror. What do you actually see?" is the best example — real-world body observation reframed, not a clinical survey. |
| 3 | User Control and Freedom | 2 | BACK exists at top-left on quiz body. Resume modal ("Continue where you left off") handles session recovery. But: there is no escape from the gate overlay without going back — onCancel is wired but no visible cancel/close affordance exists in the gate UI. On the result screen, the VATA/PITTA/KAPHA tabs let you explore other doshas, which is a nice freedom. Open questions show a SKIP but it is positioned low, easily missed on a small screen. |
| 4 | Consistency and Standards | 3 | Aura SVG borders on all buttons and text areas — consistent system. CONTINUE appears in the same bottom-anchor position across intro and scale questions. Minor inconsistency: choice questions auto-advance immediately on tap, scale questions require a CONTINUE press after placing. This two-pattern approach is intentional but may confuse users who have learned auto-advance. |
| 5 | Error Prevention | 2 | Email validation exists (regex, "A complete email, please."). Scale questions are disabled until handle is placed. But: the gate does not validate firstName before submission despite the first name field existing — `validFirstName` is defined but if the name field is empty the submit proceeds. The open text fields have no character limit indication. |
| 6 | Recognition Rather Than Recall | 3 | The layer transition screens (Body/Mind/Spirit) visually confirm which domain you're in. Choice answers are always fully visible. The scale slider shows pole labels and A/B markers simultaneously — good. The result screen signals are written as echo-recognitions ("Your mind races when your body needs to land") which feel like recognition, not diagnosis. |
| 7 | Flexibility and Efficiency | 2 | No skip mechanism during the full question sequence — every question must be answered (except open/bonus text). Power users or returning visitors have no accelerated path. The dev toolbar jump buttons exist, but only in dev mode. The 52-question length (implied by "0/52" counter) is significant friction for Joana who is between tasks with low patience. |
| 8 | Aesthetic and Minimalist Design | 3 | The intro screen (aubergine + single serif question + aura rings + organic CTA button) is extremely clean. The body question screens are well-composed. Result screen is the most visually complex and has the most elements competing: the dosha name, bubble chart, secondary note, "WHAT YOUR ANSWERS REVEALED" list, ritual, teaser, and CTA — it is dense on mobile. The completion and sent screens are correctly sparse. |
| 9 | Error Recovery | 2 | The "Something held this back. Please try again." gate error message is adequate but generic. No recovery path is shown if the quiz state is lost mid-flow (user just gets redirected to /quiz start). The resume modal ("Continue where you left off") partially addresses this but there is no confirmation that saved state is complete. |
| 10 | Help and Documentation | 1 | No contextual help anywhere in the flow. The layer transition interstitials ("Your body has said what it needed to say. Now we go somewhere less visible...") function as beautiful orientation copy, but they auto-advance after 4.5 seconds — too fast to read on mobile for a paragraph this long. A user who doesn't understand a question has no support path. |

**Average: 2.5/4**

---

## Cognitive Load Assessment (8-item checklist)

| Item | Pass/Fail | Notes |
|------|-----------|-------|
| 1. Single primary action per screen | PASS | Each question screen has one decision |
| 2. Text under 40 words per screen | FAIL | Interstitial transition copy ("Your body has said what it needed to say. Now we go somewhere less visible...") runs ~60 words and auto-advances at 4.5s — ~13 words/second |
| 3. No competing CTAs | PASS | Scale questions correctly show disabled CONTINUE until action taken |
| 4. Progress is legible | PASS | BODY/MIND/SPIRIT nav indicator is clear |
| 5. Error states are in-place | FAIL | Email error appears inline — good. But name field has no validation feedback; error only surfaces on submit |
| 6. Inputs are distinct from decorative elements | FAIL | The open text textarea has an aura SVG border with `strokeOpacity: 0.2` — very similar visual weight to surrounding decorative auras. The input boundary is faint, especially in the gate form where the email field aura has `strokeOpacity: 0.28` at rest |
| 7. Tappable targets >= 44px | FAIL | The SKIP button on open questions renders as a small text link at bottom-left. From source: `className="..."` — no explicit height enforcement. The BACK link in the nav is text-only without padding enforcement |
| 8. No orphaned screens (every state has a forward path) | FAIL | The /quiz/sent screen has no forward CTA — it ends with "You listened." with no button, link, or next step visible in the screenshot |

**Cognitive load failures: 4/8**

---

## Emotional Journey

| Screen | Primary Emotion | Notes |
|--------|----------------|-------|
| /quiz intro | Intrigue, mild unease (good) | "Am I who I am supposed to be?" lands as a real question, not a marketing hook. The ripple rings animate slowly and the single CTA creates appropriate gravitas |
| /quiz/body — choice | Quiet focus | Large serif question + spaced answer options. The gap between answer options (gap-12) gives them ceremony. Correct |
| /quiz/body — scale2 | Slight confusion risk | The aura line slider is beautiful but unfamiliar. "DRAG TO PLACE" cue at 60% opacity is marginal. First-time drag interactions on mobile have higher abandonment |
| /quiz/body — open | Vulnerability | The open question type is the highest-risk screen. The large blank textarea on a dark background can feel exposing. The SKIP positioning at bottom-left reduces its discoverability as a safety valve |
| /quiz/completion | Deceleration, anticipation | "Your rhythm has been heard." + aura oval framing the copy works well. "Almost ready" activates Zeigarnik correctly. The absence of UI chrome here is the right call |
| /quiz/gate | Anticipation → slight anxiety | The gate currently shows as a resume/continue screen when accessed directly. In context after completion, the Vata archetype heading + "Where should we send your report?" is well-framed. The first-name field is a non-standard addition that adds friction vs. the spec which only asks for email |
| /quiz/sent | Closure, warmth | "You listened." is genuinely moving. However the screen is a dead end — no CTA, no next step, no return path. This kills momentum rather than channelling it |
| /quiz/result | Identity pride + slight data-anxiety | "Vata / THE KINETIC MIND" with the cobalt background and Citrine name is visually striking. The bubble chart is the anxiety spike: 60%/30%/10% feels clinical. The copy immediately below ("You were built to move. Right now you are being asked to also burn.") is the emotional peak — but the bubbles arrive first and they are visual noise before meaning |

**Peak moment (result screen): Mostly positive, with one avoidable anxiety spike from the bubble chart positioning.**

---

## What Is Working

1. **The question copy throughout the body flow.** "Not posing. Just passing by. The mirror. What do you actually see?" / "Your body has known this for years. The temperature your body keeps." — these are genuinely distinctive, non-wellness-cliché prompts. They treat Joana as an adult.

2. **The completion screen.** Minimal, well-spaced, with the aura oval framing the copy. Auto-advance combined with tap affordance is correct. This is the best screen in the flow — it earns its silence.

3. **The scale slider interaction.** Using an organic aura line as the slider track is a rare piece of design that makes the metaphor physical. The pole labels fading in real time with position, the lit/dim track segments, the breathing handle — this is the kind of interaction that creates word-of-mouth. It also auto-disables until placed, which is the right constraint.

---

## Priority Issues

### P1 — /quiz/sent is a dead end
**What:** The sent confirmation screen ends with "You listened." and no forward path. No CTA, no link to result, no offer to return to landing.  
**Why it matters:** This is immediately post email submission — Joana's highest intent moment in the funnel. Dropping her into a dead end breaks the continuity to the result screen and introduces doubt ("Did it work?").  
**Fix:** Add a "See your full result now" AuraButton CTA below the confirmation copy, routing to /quiz/result. The result is already computed; there's no reason to block.

### P2 — Bubble chart on result screen arrives before meaning
**What:** The 60%/30%/10% circle chart renders above the reframe copy ("You were built to move..."). The bubbles read as analytics data before the user has received emotional context.  
**Why it matters:** For Joana — exhausted, skeptical — the first thing she sees after waiting through 52 questions is a percentage chart. This is the exact health-tech aesthetic ETHA is trying to avoid.  
**Fix:** Invert the content order: (1) Dosha name reveal, (2) archetype, (3) reframe copy, (4) signals list, (5) bubble chart as supporting evidence at bottom. The percentages should confirm identity, not introduce it.

### P3 — First-name field in the gate adds unspecified friction
**What:** QuizEmailGate collects firstName in addition to email. The spec PDF and brief only specify email. The `validFirstName` check is defined but not enforced on submit (no guard). The field focus auto-advances to email after 900ms, which is disorienting.  
**Why it matters:** Every additional form field reduces conversion. The name field is listed in the gate copy as "Enter your name and email" — this was not in the original gate copy spec ("Enter your email to read it in full"). The validation gap (defined but not enforced) means an empty first name silently passes.  
**Fix:** Either (a) remove the name field and align with the spec, or (b) enforce validation consistently and remove the auto-focus side-effect.

### P4 — Interstitial transition text auto-advances too fast
**What:** Layer transition interstitials (e.g., "Your body has said what it needed to say. Now we go somewhere less visible...") are ~60 words, displayed for 4,500ms. Reading speed at ~200wpm = 18 seconds needed; they auto-advance at 4.5 seconds.  
**Why it matters:** These screens carry the most narrative weight of the experience — they're the "going deeper" moments. Joana will often miss them entirely. Missing them reduces the felt sense of journey.  
**Fix:** Set `autoHoldMs` to at least 8,000ms, or add a tap-to-advance affordance that is visually obvious (not just the whole screen). Consider treating these as fully manual advance with an explicit "I'm ready" or tap cue.

### P5 — Open question SKIP is not legible as an escape valve
**What:** The SKIP button on open text questions renders as small text at bottom-left with no clear button treatment. Given the question type is emotionally exposing ("Your body has been asking for something. What is it?"), the skip option needs to be immediately visible as a safe exit.  
**Why it matters:** A user who doesn't see SKIP may abandon the entire quiz rather than answer a question they find uncomfortable. This is the highest abandon-risk question type.  
**Fix:** Render SKIP with the same aura-oval treatment as CONTINUE (just smaller/lighter), positioned clearly in the CTA anchor zone at the bottom. Or place it as "or skip →" inline below the textarea.

---

## Minor Observations

- The dev toolbar (STATEMENT, REFLECT-1, VALUE, GATE, etc.) is visible at the bottom of all quiz screens in development. Ensure it is completely removed in production — the `process.env.NODE_ENV === "development"` guard exists but should be double-checked in the build output.
- The result page background is cobalt/navy (`#000F9F` area) for Vata. This is a significant departure from the aubergine/cream system used everywhere else. It is intentional per the dosha theme system, but it means the result screen does not feel like the same brand world as the quiz flow. This may be by design.
- The BACK link in the nav during the quiz body has no visible hit-state padding. On mobile, tapping "← BACK" at the top-left while scrolling is a genuine miss-tap risk.
- The `validFirstName` function in QuizEmailGate is defined but the submit guard only checks `validEmail(email)` — the first name can be empty and submission proceeds. This is a quiet bug.
- The result screen "PREVIEW" badge that appears on some dosha card content (when email is not yet submitted) is visible in source but not clearly seen in the Vata screenshot — confirm this renders correctly for states where the gate hasn't been completed.
- The choice answer options use `gap-12` (48px) vertical separation between options — very generous. On a 390px screen with 3 options, this pushes the third option near or below the fold. Verify the third answer option is always fully visible without scrolling on a 390×667 (iPhone SE) viewport.

---

## Provocative Questions

1. **52 questions is the stated length. Joana is between tasks, on her phone, low patience.** What is the measured drop-off rate between Q1 and Q52? Has the question sequence been tested for abandonment vs. a shorter 20-question version? The depth may be a differentiator or a graveyard.

2. **The reframe copy on the result screen ("You were built to move. Right now you are being asked to also burn.") is the best single line in the entire quiz.** Is it visible above the fold on first load, or does it appear below the bubble chart and get missed by Joana who doesn't scroll?

3. **The quiz has no explicit "why Ayurveda?" onboarding before Q1.** A skeptical user (Joana's profile) landing cold on "Am I who I am supposed to be?" has no context frame. Should the intro screen include a single sentence of permission — not marketing, just orientation?

4. **The gate collects email before showing the full result, but the result page already shows substantial content (archetype, reframe, signals, ritual).** What exactly is behind the gate? If Joana can read her full result without giving her email (just by navigating directly to /quiz/result), the gate has no teeth.

5. **The sent screen is the emotional summit — "You listened."** — but it has no forward path. Is the design intent that Joana will immediately check her email, or that she will click into the result? If the result is the next destination, why is the sent screen in between at all?
