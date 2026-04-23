# Impeccable UX Test — Joana on ETHA Landing + Quiz

Test scenario for `impeccable critique`. Walks the "Joana" project persona (auto-derived from `.github/copilot-instructions.md`) through the real user flow. Pair with the predefined personas **Casey** (distracted mobile) and **Riley** (stress tester) per `personas.md` landing-page guidance.

Personas to run: **Joana** (project) + **Casey** + **Riley**.

---

## Context to load before testing

1. `.github/copilot-instructions.md` — Design Context (Joana, brand rules, anti-references)
2. `.impeccable.md` — mirror of the above
3. `docs/JOURNEY.md` — full 8-step funnel (Social → Quiz → Card → Emails → Purchase). Landing is step 02, quiz is 03.
4. `docs/DESIGN.md` + `docs/SECTIONS.md` — visual system + per-section creative direction
5. `docs/landing-brief.md` — single-CTA intent ("Begin your remembering")
6. `.claude/rules/aura-svg.md` — aura hard rules

---

## Devices

- **Primary:** iPhone 14 / 390×844 — Joana's real context
- **Secondary:** 1440×900 desktop — for completeness only

Run test on mobile first. If the mobile flow breaks for Joana, desktop pass is irrelevant.

---

## Scenario 1 — Landing page first impression (the 5-second test)

**Entry:** Joana taps an Instagram ad, lands on `/` cold. She has ~5 seconds.

**Flow to walk:**
1. Hero loads
2. She scrolls one thumb-flick
3. She scrolls to Three Pillars / Five Elements / Doshas
4. She reaches the primary CTA

**Test questions (ask as Joana, not as a designer):**
- What is this? Who is it for? (Must be answerable in 5s without reading everything.)
- Does the hero copy feel like every wellness brand she's muted, or does it land specifically on her body?
- Does the first headline imply she is broken / needs fixing / needs to transform? **If yes → brand violation.**
- Is there a single, unambiguous next action, or is she choosing between competing CTAs?
- Does the Brandon Grotesque copy stay UPPERCASE-only for labels, or leak into voice?
- Any hard edges / 90° dividers / rounded UI chrome / wellness-purple gradients? **All are violations.**
- Any Instagram-wellness cliches in copy or image direction ("unlock", "journey", "elevate", "glow")?

**Red flags to report specifically:**
- Hero aura not visible or overpowered by text
- MobileCTA not reachable in thumb zone / invisible
- Copy that performs spirituality instead of speaking plainly
- Transformation narrative anywhere in the first fold
- More than one primary CTA competing for attention

---

## Scenario 2 — Landing → Quiz handoff

**Entry:** Joana taps the CTA. She expects the same world, not a different app.

**Flow to walk:**
1. CTA press → quiz route
2. First quiz screen (opener) load
3. First interaction (slider / answer selection)
4. Interstitial / layer transition
5. Email gate (aura input)
6. Result page

**Test questions:**
- Does the quiz feel like the landing continued, or did she switch products?
- Is the first question answerable in ≤10 seconds, without jargon?
- Do the aura states on answers read as energy states, or as generic decoration?
- At the email gate — does she know *why* her email is being asked, before she's asked? Is the value she's trading for email visible?
- After submitting, does the result screen explain her dosha without assuming she remembers the word from earlier?
- Does the Brandon / Plantin split hold across every quiz screen?

**Red flags to report specifically:**
- Visual language breaks (different type scale, new colour, hard edges introduced)
- Forced onboarding / skippable tutorial missing for Alex-like impatient sub-users
- Quiz screens that scroll instead of filling viewport (breaks "step-by-step, no long scroll" constraint from `.impeccable.md`)
- Email gate before Joana has been given a reason to hand over email
- Result page that reads like a horoscope instead of a recognisable portrait of her state

---

## Scenario 3 — Riley stress test

Run **Riley** (from `personas.md`) against the same flow. Specifically probe:

- Refresh mid-quiz: is progress preserved?
- Answer with all A's, all B's, all C's — do all three dosha results render correctly, or does one path break?
- Submit email gate with: empty string, emoji, 200-char input, copy-pasted whitespace
- Navigate backward with browser back button — does quiz state survive?
- Open landing in two tabs, start quiz in both — any state collision?
- Disable JavaScript — does the landing degrade to a readable page, or blank?
- Throttle to Slow 3G — does the hero image LCP arrive in <4s?

Report anything that silently fails or leaves the UI in a broken state.

---

## Scenario 4 — Casey thumb-zone test

Run **Casey** against the mobile landing:

- Is the primary CTA reachable by right thumb on a 6.1" iPhone without shifting grip?
- MobileCTA bar — does it auto-flip colours correctly when overlapping aubergine sections? Any flashes?
- Tap targets ≥44×44pt across nav, CTA, quiz answers, email submit?
- Does the page preserve scroll position if she switches apps for 30s and returns?
- Does anything important require two-handed use or precise aim?

---

## Output format expected from `impeccable critique`

For each persona, the critique should return:

```
## Joana (project persona)
- What I saw in 5 seconds:
- What I felt:
- What I did / would do:
- Brand violations observed:
- Verdict: KEEP / REWRITE / SCROLL PAST
- Single most important fix:

## Casey (mobile)
- Red flags (specific):
- Severity per flag (P0–P3):

## Riley (stress test)
- Edge cases broken (specific):
- Severity per flag (P0–P3):

## Cross-cutting findings
- Hard brand rule violations (border-radius, font usage, hard edges, transformation language, etc.)
- Prioritised fix list (top 5), P0 first
```

---

## How to invoke

```
/impeccable critique --persona joana,casey,riley --flow tests/impeccable/joana-ux-test.md
```

Or paste the scenarios above directly into the critique skill along with the running `npm run dev` URL (`http://localhost:3000/`).

---

## Related persona source (for grounding, do not re-derive)

- `etha-content-skills/skills/etha-joana-check/SKILL.md` — Joana's content-reaction persona (voice, psychology, what makes her leave). Use this as the source of truth for how Joana *speaks and reacts*, then apply it to UI rather than copy.
- `.agents/skills/critique/reference/personas.md` — the 5 predefined personas (Alex, Jordan, Sam, Riley, Casey)
