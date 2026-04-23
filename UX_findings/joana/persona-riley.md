# Riley — Deliberate Stress Tester

Methodical. Pushes every edge. Documents gaps.

## Tests run

### 1. Refresh mid-quiz
**Action:** answered first body question, navigated to Q2 via continue, refreshed page (Cmd-R).
**Expected:** resume at Q2 with Q1 answer retained.
**Actual:** page reloads at Q1/52, no stored state. `localStorage` and `sessionStorage` both empty throughout the flow.
**Severity:** P0.
**Fix:** persist `{ answers: [...], currentIndex, layer, email? }` to `localStorage` on every state change.

### 2. Deep-link into mid-quiz route
**Action:** in a clean tab with no prior state, navigate to `http://localhost:3000/quiz/body`.
**Expected:** redirect to `/quiz` intro (no state → no entitlement), or show "start from beginning" CTA.
**Actual:** `/quiz/body` renders Q1/52 of the Body layer directly, skipping the entire intro onboarding. First-time deep-linked users see "Body" header with no context.
**Severity:** P1.
**Fix:** route guard — if no stored state, redirect to `/quiz` intro. Otherwise hydrate from storage.

### 3. Browser back button after result
**Action:** complete quiz through result page, press browser back.
**Expected:** return to email gate with email prefilled, or a "your result is saved" guard.
**Actual:** back lands on `/quiz/body` with fresh Q1/52 state. No guard; answers already submitted to API (if API exists).
**Severity:** P1.
**Fix:** intercept back from result with `history.replaceState` or a beforeunload-style confirm.

### 4. Empty email submit
**Action:** email gate modal, empty field, click BEGIN YOUR REMEMBERING.
**Expected:** button disabled until valid email typed.
**Actual:** button is indeed `disabled` until input passes some check. ✓ Clean.
**Severity:** none. Good.

### 5. Emoji-only email
**Action:** email field = "🙂🙂@🙂.com"
**Expected:** invalid — button stays disabled.
**Actual:** did not verify character-by-character, but the disabled-until-valid pattern appears to require standard email characters. Needs confirmation via automated test.
**Severity:** P3 if it accepts.
**Fix:** RFC-5322-lite regex server-side validation; client-side parse.

### 6. Very long email (500 chars)
**Not tested live.** Suspected: form accepts any length; API may reject with opaque error. Recommend `maxLength=254` (RFC max email length) on the input.
**Severity:** P3.

### 7. Paste from clipboard with trailing whitespace
**Not tested live.** Common cause of "invalid email" errors where the email is actually valid. Recommend `.trim()` before validation.
**Severity:** P3.

### 8. Open quiz in two tabs simultaneously
**Not tested live.** With `localStorage`-based persistence (once implemented), two tabs could race-write. Use `BroadcastChannel` or a single-tab lock to serialize, or accept last-writer-wins with a warning.
**Severity:** P3 (only surfaces after P0 fix).

### 9. JavaScript disabled
**Not tested live.** Expected: quiz does not function (Next.js 16 client component). Fallback would be a static "JavaScript required" message.
**Severity:** P3. Low-impact; disabled-JS is a rounding error on Joana's target demographic.

### 10. CPU throttled 4× / slow network
**Not tested live.** Next 16 Turbopack dev build may not reflect prod performance. Recommend a prod-build Lighthouse run before launch.
**Severity:** P2. Flag for a follow-up `chrome-devtools-mcp:debug-optimize-lcp` pass.

### 11. Dosha switching on result page
**Action:** on `/quiz/result`, click PITTA then KAPHA tabs.
**Expected:** result content swaps to show the alternate dosha's copy.
**Actual:** tab content does change (per snapshot), but the **primary "YOUR NATURE IS VATA"** label and **60% meter** remain, creating an inconsistent view. The tab switch appears to be a preview mechanism, not a re-score.
**Severity:** P2 — information architecture unclear. Is this intentional (preview the other two) or a bug (should re-score)?
**Fix:** add a heading clarifying "PREVIEW VATA / PITTA / KAPHA" when user taps a non-primary tab, so they understand it's a preview not a correction.

### 12. Console errors across the flow
**Checked:** `list_console_messages` at result page — **0 errors, 0 warnings.** ✓ Clean.

## Summary table

| # | Test | Severity | Status |
|---|------|----------|--------|
| 1 | Refresh mid-quiz | P0 | **FAILS** — state wiped |
| 2 | Deep-link `/quiz/body` | P1 | **FAILS** — no route guard |
| 3 | Browser back from result | P1 | **FAILS** — resets to Q1 |
| 4 | Empty email submit | ✓ | passes |
| 5 | Emoji-only email | P3 | unverified |
| 6 | 500-char email | P3 | unverified |
| 7 | Whitespace-padded email | P3 | unverified |
| 8 | Two tabs | P3 | surfaces post P0 fix |
| 9 | JS disabled | P3 | expected to degrade |
| 10 | Throttled CPU / network | P2 | needs prod-build audit |
| 11 | Result tab switch clarity | P2 | IA unclear |
| 12 | Console errors | ✓ | zero |

## Recommendation order

1. Fix P0 state persistence (1 test failing, biggest blast radius)
2. Add route guards for deep-links + back button (2 tests failing)
3. Clarify result-page tab switching (1 test ambiguous)
4. Form validation hardening (3 tests unverified, low probability but quick wins)
5. Prod-build perf / Lighthouse pass before launch
