# Casey — Distracted Mobile User

6.1" iPhone, one-handed thumb use, frequently interrupted, possibly on slow connection.

## Primary flow: landing → quiz → result on 390×844 touch viewport.

### Thumb zone (bottom half of screen, dominant thumb arc)

| Element | Position | Thumb-reachable? |
|---------|----------|------------------|
| Intro CONTINUE button | ~60% viewport height | ✓ Yes |
| Intro BEGIN YOUR REMEMBERING | ~65% viewport height | ✓ Yes |
| Answer buttons (L1 question) | ~50–75% viewport height | ✓ Yes |
| Answer buttons (VISUAL question type) | ~50–80% | ✓ Yes |
| 2-pole / 3-pole sliders | mid viewport | ✓ Yes, but drag precision on touch may be fiddly |
| Email gate input | ~60% | ✓ Yes |
| Email gate submit | ~70% | ✓ Yes |
| Top-left "back to..." affordance | **MISSING** | N/A |
| Top-right close / help | **MISSING** | N/A |

### Interrupt resilience

**Test:** answer 5 body questions, lock screen 30s, unlock, reopen tab.

**Result:** tab refreshes (iOS Safari reclaims memory aggressively). **Progress: gone.** Back at Q1/52. **This is the single biggest Casey killer.**

**Fix required:** persist to `localStorage` on every answer change. Show a "resume?" modal on mount if state found.

### Network resilience

Slow 3G / 4G throttle not explicitly tested. Observations from dev build:
- Images (`opener-q1-a.webp`, dosha images on result) load progressively — acceptable
- No visible skeleton state for question transitions — on slow connections question text may flash empty → populated
- No lazy-load on quiz images: all preloaded on route entry

**Fix:** add skeleton placeholders for question text + answer blocks (~100ms shimmer max). Lazy-load per-question imagery via next/image (already Next 16 — cheap).

### Touch target sizes

Spot-checked via DevTools element inspect:
- Answer buttons: ≥60×60pt — well above 44pt minimum ✓
- Email submit: full-width, ~56pt tall ✓
- Layer nav dots (BODY/MIND/SPIRIT): ~24pt — **below 44pt minimum.** If tappable, these fail.
- Dev-mode jump buttons (L1, VISUAL, etc.): ~30pt — dev-only so non-issue

**Fix:** confirm BODY/MIND/SPIRIT dots are non-interactive (pure indicator). If they are clickable shortcuts, enlarge hit area to 44pt.

### Microcopy under pressure

Casey skims. The phrases she has to parse in <2s:
- "Am I who I am supposed to be?" ✓ parses instantly
- "Leave the name of your inbox" — requires a beat. Not instant. Would lose her.
- "BEGIN YOUR REMEMBERING" — poetic but semantically vague. She wants "START" or "TAKE THE QUIZ."

### Red flags (P-severity)

1. **[P0] No progress persistence across app-switch / tab-reload.** Lose a distracted mobile user the first time they check Messages mid-quiz.
2. **[P0] No back button.** Misclicks are common one-handed; Casey cannot undo.
3. **[P1] "1/52" counter is too small to register at a glance.** On 390px viewport it occupies less than 1% of screen. At arm's length on a bus she cannot tell she is 30% done.
4. **[P2] Email gate copy ("Leave the name of your inbox") too clever for skimming.** Rewrite to "Email — we'll send it now." Keep the poetry on the headline, not the input label.
5. **[P2] No skeleton / loading state** between question transitions — may flash on slow connections.

### What works for Casey

- Plantin type size on questions is generous; readable at arm's length
- Answer buttons are cream cards on aubergine with enough air — obvious as tap targets
- Single question per screen — no decision paralysis
- Primary action always fills width on mobile — thumb-friendly by default
