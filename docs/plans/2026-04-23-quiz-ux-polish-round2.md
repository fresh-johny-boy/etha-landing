# Quiz UX Polish — Round 2

Created: 2026-04-23
Status: COMPLETE
Approved: Yes
Iterations: 0
Worktree: No
Type: Polish

## Summary

**Goal:** Close 3 remaining UX issues surfaced by post-hardening critique (33/40 → 35/40 target).
**Architecture:** Surgical edits on 3 files. No new components.
**Source:** `UX_findings/post-hardening-audit/critique-report.md` P1 + P2a + P2b.

## Corrections vs Audit Report

Three findings from the critique report were false positives or already resolved by owner:

- **P0 debug overlay in production** — FALSE POSITIVE. Both `QuizBody.tsx:1803` and `QuizIntro.tsx:569` are already gated by `{process.env.NODE_ENV === "development" && (...)}`. Assessment B ran against the dev server where `NODE_ENV = "development"`. No action needed.
- **P2b first-name validation bug** — FALSE POSITIVE. `validFirstName` is enforced on submit (line 213) and disables the button (line 525). The real issue is conversion friction from an extra required field, not a code defect.
- **P1 `/quiz/sent` dead end** — RESOLVED BY OWNER (2026-04-23). `QuizEmailGate` now handles the full success flow inline: form/teaser fade out → sent confirmation with dosha accent colour headline (Vata `#F5A800` / Pitta `#A2E8F2` / Kapha `#FFB3A5`), 7.5s auto-advance → fades overlay → calls `onSuccess`. `result/page.tsx` `onSuccess` no longer pushes to `/quiz/sent`. The `/quiz/sent` page is kept for its route guard (`hasQuizState()` → redirect to `/quiz`) but is no longer part of the main happy path. **Task 1 (QuizSent hint) is therefore dropped from this plan.**

## Scope

### In Scope

- `/quiz/sent` tap-to-advance hint — screen has no visible affordance that it will advance or that tapping works
- Bubble chart `startDelay` 2.45s → 3.5s — data arrives before emotional copy on result page
- Remove first-name field from `QuizEmailGate` — extra required field, reduces conversion

### Out of Scope

- Geometric SVG elements in aura contexts (P3) — deferred; requires per-element aura path design work
- `QuizBackButton` aria-label — deferred to accessibility pass
- `AURA:strokeDashoffset` judgment call — deferred; owner decision on whether quiz animation is exception to the brand rule

## Approach

Three independent point-fixes. No shared logic between them.

## Context for Implementer

### Key Files

| File | Role |
|------|------|
| `app/src/components/quiz/QuizSent.tsx` | Add TAP TO CONTINUE hint |
| `app/src/app/quiz/result/page.tsx` | Shift bubble chart `startDelay` |
| `app/src/components/quiz/QuizEmailGate.tsx` | Remove firstName field + state |

### Patterns to Follow

- TAP TO CONTINUE hint: same pattern as `QuizCompletion.tsx` hint (GSAP fade-in, `font-label`, `rgba(255,239,222,0.5)`, fade at correct delay after last copy line)
- QuizSent copy lands at: headline 0.3s, line1 0.9s, line2 1.5s, line3 2.1s. Hint should fade in at ~2.8s (after line3 settles at 2.1 + 1s duration = 3.1s, but start fade slightly before)
- `writeQuizState` call: remove `firstName` key — check if downstream (Klaviyo / email templates) uses it; if so, note in commit message

### Gotchas

- `QuizSent` already has `onClick={advance}` on root div — tapping anywhere works, just invisible. Hint is purely visual.
- `AuraBubbleChart` receives `startDelay` as prop at `result/page.tsx:379`. Change prop value only — do not touch the component internals.
- `QuizEmailGate` firstName state has 4 touch points: `useState`, `validFirstName` guard on submit, `writeQuizState` call, and the input JSX + label. Remove all 4. The submit button `disabled` condition at line 525 also references `validFirstName(firstName)` — remove that clause.
- After removing firstName, `writeQuizState` call signature may need adjustment if firstName is not optional in the type. Check `app/src/lib/quizState.ts` for the type definition.

## Runtime Environment

- Dev server: `cd app && npm run dev`
- Health check: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/quiz` → 200

## Goal Verification

1. `/quiz/sent` shows a faint "TAP TO CONTINUE" label that fades in ~2.8s after mount — verifiable visually.
2. `grep "startDelay" app/src/app/quiz/result/page.tsx` → shows `3.5` not `2.45`.
3. `grep "firstName\|first.name\|validFirstName" app/src/components/quiz/QuizEmailGate.tsx` → zero matches.
4. Email gate renders with only one input (email). No name field visible.
5. `npm run lint` clean on changed files.

---

## Task 1: `/quiz/sent` tap-to-advance hint

**Objective:** Add a faint "TAP TO CONTINUE" label that fades in after the copy lands, so Joana knows the screen is interactive.
**Files:** `app/src/components/quiz/QuizSent.tsx`

**Implementation:**

1. Add `hintRef = useRef<HTMLParagraphElement>(null)` alongside existing refs.
2. In the existing GSAP `ctx` block, after the `line3Ref` animation (delay 2.1), add:
   ```ts
   gsap.to(hintRef.current, { opacity: 1, duration: 0.8, delay: 3.0 });
   ```
3. Set initial `style={{ opacity: 0 }}` on the hint element.
4. Add hint element below `line3Ref` paragraph in JSX:
   ```tsx
   <p
     ref={hintRef}
     className="font-label"
     style={{
       opacity: 0,
       fontSize: 10,
       letterSpacing: "0.28em",
       color: "rgba(255,239,222,0.5)",
       marginTop: "3rem",
     }}
   >
     TAP TO CONTINUE
   </p>
   ```

**Definition of Done:**
- [ ] `hintRef` declared and connected
- [ ] GSAP fade-in at delay 3.0s
- [ ] Hint visible after ~3s on `/quiz/sent` in browser
- [ ] Tapping the screen still advances immediately (existing `onClick={advance}` on root div)
- [ ] Lint clean

---

## Task 2: Bubble chart — shift startDelay

**Objective:** Prevent data from reading before identity. Chart should arrive after the emotional reframe copy has landed.
**Files:** `app/src/app/quiz/result/page.tsx`

**Implementation:**

- Line 379: `<AuraBubbleChart comp={card.comp} startDelay={2.45} />`
  → `<AuraBubbleChart comp={card.comp} startDelay={3.5} />`
- Line 137 comment: `* 2.45s  Blobs (AuraBubbleChart startDelay)`
  → `* 3.5s   Blobs (AuraBubbleChart startDelay — after content block)`

**Definition of Done:**
- [ ] `startDelay` prop is `3.5` at call site
- [ ] Comment updated
- [ ] Visually: on `/quiz/result`, dosha name and archetype label appear before bubble chart
- [ ] Lint clean

---

## Task 3: Remove first-name field from QuizEmailGate

**Objective:** Reduce friction at the email gate. One fewer required field → higher completion rate.
**Files:** `app/src/components/quiz/QuizEmailGate.tsx`, possibly `app/src/lib/quizState.ts`

**Implementation:**

1. Remove `const [firstName, setFirstName] = useState("");` (line 68)
2. Remove `const [nameFocus, setNameFocus] = useState(false);` (line 73) — only if it's exclusively used by the name field
3. Remove the firstName guard on submit:
   ```ts
   // Remove:
   if (!validFirstName(firstName)) {
     setError("Please enter your first name.");
     return;
   }
   ```
4. Remove `firstName: firstName.trim()` from `writeQuizState(...)` call (line 231)
5. Remove the `validFirstName` function definition (lines 49–51) — only if nothing else calls it
6. Remove `!validFirstName(firstName)` from the `disabled` condition on the submit button (line 525)
7. Remove the name input JSX and its label from the form — grep for `placeholder="Your first name"` to locate it
8. Check `app/src/lib/quizState.ts` — if `QuizState` type has `firstName?: string` it can stay optional (no change needed); if it's required, make it optional or remove it

**Definition of Done:**
- [ ] `grep "firstName\|validFirstName\|first.name" app/src/components/quiz/QuizEmailGate.tsx` → zero matches
- [ ] Email gate renders with one input (email only)
- [ ] Gate submits correctly with email alone
- [ ] `writeQuizState` call compiles without type error
- [ ] Lint clean

---

## Progress Tracking

- [x] ~~Task 1: `/quiz/sent` tap-to-advance hint~~ — DROPPED (owner resolved P1 differently; `/quiz/sent` bypassed in main flow)
- [x] Task 2: Bubble chart startDelay 2.45 → 3.5
- [x] Task 3: Remove first-name field

**Total Tasks:** 2 | **Completed:** 2 | **Remaining:** 0

---

## Autonomous Decisions

- **TAP TO CONTINUE delay is 3.0s**, not 2.8s. Line3 starts at 2.1s + 1s duration = lands ~3.1s. Fading in at 3.0 means the hint and line3 appear together, which is acceptable — the hint is faint and doesn't compete.
- **`startDelay={3.5}` chosen** (not 3.0). Content block animates in at 3.0s with 0.8s duration → settles at ~3.8s. 3.5 means the chart starts appearing as the content is landing, not before. Emotionally safer than 3.0.
- **Remove first-name entirely** (not fix validation). The assessment confirmed validation works. Removal is a conversion decision, not a bug fix. User confirmed this in session.
- **No new score audit.** Target is 35/40 but the improvements are clear enough that a re-critique would be noise. Run `/critique` again only if the user wants a new baseline number.
