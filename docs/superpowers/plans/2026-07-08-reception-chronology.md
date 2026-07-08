# Reception Chronology Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the serve-receive chronology legible — the opponent's serve (a ball flying in from the far side) is what triggers our players' freeze-then-sprint into receive → attack; when *we* serve, our server sends a ball out and players hold.

**Architecture:** Split the single-beat `SERVE_LEGAL` release into two beats plus a `ball` field on reducer state. Beat 1 spawns an incoming/outgoing ball and (receive only) snapshots positions without moving anyone; beat 2 (`RELEASE`, receive only) runs the existing sprint to `releaseTargets`. `useTrainer.onServe` sequences the beats with timers. `Court.jsx` renders the ball, animated by one-shot CSS keyframes in `index.css`. Button and status copy become context-aware on `serving`/`served`.

**Tech Stack:** React 19, Vite 7, Vitest, plain CSS keyframes, inline-style components.

## Global Constraints

- Reducer state and URL params (`rotation`, `mode`) are untouched; only rendered copy and animation state change.
- `releaseTargets` internal logic is **not** modified — the caller simply stops invoking it when serving.
- Respect `state.reduced` (prefers-reduced-motion): ball fades in place, no travel.
- Follow existing style: inline-style JSX components, `COLORS`/`FONTS` from `theme.js`, timer refs cleared on unmount.
- Test runner: `npx vitest run <path>` (non-watch).

---

### Task 1: Reducer — two-beat state machine + `ball` field

**Files:**
- Modify: `src/hooks/trainerReducer.js`
- Test: `src/hooks/trainerReducer.test.js`

**Interfaces:**
- Consumes: `basePositions`, `releaseTargets` from `../domain/formations.js` (already imported).
- Produces:
  - `initialState()` gains `ball: null`.
  - Action `SERVE_LEGAL` — branches on `state.serving`. Receive: `{ preServe: {...positions}, served: true, ball: { kind: 'incoming' } }`, positions unchanged, `releasing` stays false. Serve: `{ served: true, ball: { kind: 'outgoing' } }`, positions unchanged.
  - Action `RELEASE` (new) — `{ positions: releaseTargets(state), releasing: true }`.
  - Action `RELEASE_END` — `{ releasing: false, ball: null }`.
  - Action `UNSERVE` — also clears `ball` and sets `releasing: false`.
  - `APPLY_ROTATION`, `SET_MODE`, `SET_SERVING`, `RESET` all set `ball: null, releasing: false`.

- [ ] **Step 1: Rewrite the serve tests**

Replace the existing `SERVE_LEGAL ...` test (lines 37–44) and keep/extend `UNSERVE`. In `src/hooks/trainerReducer.test.js`, add the `releaseTargets` import to the top import line and replace the two serve-related `it(...)` blocks with:

```js
import { releaseTargets } from '../domain/formations.js';
```

```js
  it('SERVE_LEGAL (receiving) spawns an incoming ball and does NOT move players', () => {
    const s0 = initialState(); // serving: false
    const s1 = reducer(s0, { type: 'SERVE_LEGAL' });
    expect(s1.served).toBe(true);
    expect(s1.ball).toEqual({ kind: 'incoming' });
    expect(s1.releasing).toBe(false);
    expect(s1.positions).toEqual(s0.positions); // frozen at legal-at-contact spots
    expect(s1.preServe).toEqual(s0.positions);
  });

  it('RELEASE swaps in the release targets and starts the sprint', () => {
    const s0 = initialState();
    const served = reducer(s0, { type: 'SERVE_LEGAL' });
    const s1 = reducer(served, { type: 'RELEASE' });
    expect(s1.releasing).toBe(true);
    expect(s1.positions).toEqual(releaseTargets(served));
    expect(s1.positions.S).toEqual({ x: 6.8, y: 1.0 });
  });

  it('SERVE_LEGAL (serving) spawns an outgoing ball and holds positions', () => {
    const serving = reducer(initialState(), { type: 'SET_SERVING', serving: true });
    const s1 = reducer(serving, { type: 'SERVE_LEGAL' });
    expect(s1.served).toBe(true);
    expect(s1.ball).toEqual({ kind: 'outgoing' });
    expect(s1.releasing).toBe(false);
    expect(s1.positions).toEqual(serving.positions); // no release when we serve
  });

  it('RELEASE_END clears the ball and ends the sprint', () => {
    const served = reducer(initialState(), { type: 'SERVE_LEGAL' });
    const ended = reducer(reducer(served, { type: 'RELEASE' }), { type: 'RELEASE_END' });
    expect(ended.releasing).toBe(false);
    expect(ended.ball).toBe(null);
  });

  it('UNSERVE restores the pre-serve snapshot and clears the ball', () => {
    const s0 = initialState();
    const served = reducer(s0, { type: 'SERVE_LEGAL' });
    const back = reducer(served, { type: 'UNSERVE' });
    expect(back.served).toBe(false);
    expect(back.preServe).toBe(null);
    expect(back.ball).toBe(null);
    expect(back.positions).toEqual(s0.positions);
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/hooks/trainerReducer.test.js`
Expected: FAIL — `RELEASE` is unhandled (returns state unchanged so `releasing` stays false), and `SERVE_LEGAL` currently moves players / sets `releasing: true`.

- [ ] **Step 3: Update the reducer**

In `src/hooks/trainerReducer.js`:

Add `ball: null` to `initialState()`'s returned object (alongside `releasing: false`):

```js
    whistle: false, showRef: false, reduced: false, releasing: false, ball: null,
```

Add `ball: null, releasing: false` to the state-resetting cases. Replace the four case bodies:

```js
    case 'APPLY_ROTATION':
      return { ...state, rotation: action.n, positions: basePositions(action.n, state.serving), served: false, preServe: null, selected: null, ball: null, releasing: false };
    case 'SET_MODE':
      return { ...state, mode: action.mode, serving: false, webOn: action.mode !== 'challenge', ghostsOn: true, served: false, preServe: null, selected: null, positions: basePositions(state.rotation, false), ball: null, releasing: false };
    case 'SET_SERVING':
      return { ...state, serving: action.serving, served: false, preServe: null, positions: basePositions(state.rotation, action.serving), ball: null, releasing: false };
```

```js
    case 'RESET':
      return { ...state, positions: basePositions(state.rotation, state.serving), served: false, preServe: null, ball: null, releasing: false };
```

Replace the `SERVE_LEGAL` case and add `RELEASE`; update `RELEASE_END` and `UNSERVE`:

```js
    case 'SERVE_LEGAL':
      return state.serving
        ? { ...state, served: true, ball: { kind: 'outgoing' } }
        : { ...state, preServe: { ...state.positions }, served: true, ball: { kind: 'incoming' } };
    case 'RELEASE':
      return { ...state, positions: releaseTargets(state), releasing: true };
    case 'RELEASE_END':
      return { ...state, releasing: false, ball: null };
    case 'UNSERVE':
      return { ...state, positions: state.preServe || basePositions(state.rotation, state.serving), served: false, preServe: null, ball: null, releasing: false };
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/hooks/trainerReducer.test.js`
Expected: PASS (all reducer tests green).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/trainerReducer.js src/hooks/trainerReducer.test.js
git commit -m "feat: two-beat serve state machine with incoming/outgoing ball"
```

---

### Task 2: `useTrainer.onServe` — sequence the beats with timers

**Files:**
- Modify: `src/hooks/useTrainer.js`

**Interfaces:**
- Consumes: reducer actions `SERVE_LEGAL`, `RELEASE`, `RELEASE_END` from Task 1.
- Produces: unchanged `actions.onServe` signature; adds a `releaseEndTimer` ref cleared on unmount.

**Note:** `useTrainer` has no unit test in this repo (hooks require a renderer). Verify via the reducer tests (Task 1) plus the running app in Task 6.

- [ ] **Step 1: Add the release-end timer ref**

In `src/hooks/useTrainer.js`, next to the existing `releaseTimer` ref (~line 20), add:

```js
  const releaseEndTimer = useRef(null);
```

- [ ] **Step 2: Sequence the serve beats**

Replace the `dispatch({ type: 'SERVE_LEGAL' })` block at the end of `onServe` (the lines from `dispatch({ type: 'SERVE_LEGAL' });` through the existing `releaseTimer` setTimeout) with:

```js
    dispatch({ type: 'SERVE_LEGAL' });
    clearTimeout(releaseTimer.current);
    clearTimeout(releaseEndTimer.current);
    if (s.serving) {
      // Our serve: ball flies out, players hold. Just clear the ball when it lands.
      releaseEndTimer.current = setTimeout(() => dispatch({ type: 'RELEASE_END' }), 900);
    } else {
      // Their serve: ball travels in (~600ms), THEN players sprint to receive+attack.
      releaseTimer.current = setTimeout(() => dispatch({ type: 'RELEASE' }), 600);
      releaseEndTimer.current = setTimeout(() => dispatch({ type: 'RELEASE_END' }), 1700);
    }
```

- [ ] **Step 3: Clear the new timer on unmount**

Replace the unmount cleanup effect (`useEffect(() => () => { clearTimeout(whistleTimer.current); clearTimeout(releaseTimer.current); }, []);`) with:

```js
  useEffect(() => () => { clearTimeout(whistleTimer.current); clearTimeout(releaseTimer.current); clearTimeout(releaseEndTimer.current); }, []);
```

- [ ] **Step 4: Verify the suite still passes**

Run: `npx vitest run`
Expected: PASS (no test exercises the timers directly; nothing regresses).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTrainer.js
git commit -m "feat: sequence ball-then-sprint on receive, ball-only on serve"
```

---

### Task 3: The ball — keyframes + Court element

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/court/Court.jsx`

**Interfaces:**
- Consumes: `state.ball` (`null | { kind: 'incoming' | 'outgoing' }`), `state.reduced` from reducer.
- Produces: a court-overlay ball element; no new exports.

Coordinate note (fixed endpoints, so percentages are hardcoded): incoming travels from above the net (`top ~2%`) to the reception seam (`x 4.5m → left 50%`, `y 6.0m → top ~65%`); outgoing travels from the server (`x 8.0m → left 86%`, `y 9.35m → top ~94%`) up over the far side (`left 50%`, `top ~2%`).

- [ ] **Step 1: Add the ball keyframes**

Append to `src/index.css`:

```css
@keyframes ballIncoming {
  0%   { top: 2%;  opacity: 0; }
  10%  { opacity: 1; }
  35%  { top: 65%; opacity: 1; }
  72%  { top: 65%; opacity: 1; }
  100% { top: 65%; opacity: 0; }
}

@keyframes ballOutgoing {
  0%   { top: 94%; left: 86%; opacity: 0; }
  10%  { opacity: 1; }
  78%  { top: 2%;  left: 50%; opacity: 1; }
  100% { top: 2%;  left: 50%; opacity: 0; }
}

@keyframes ballFade {
  0%, 100% { opacity: 0; }
  30%, 70% { opacity: 1; }
}
```

- [ ] **Step 2: Render the ball in Court**

In `src/components/court/Court.jsx`, add a `Ball` component above `Court` (after `CourtSurface`):

```jsx
function Ball({ ball, reduced }) {
  const incoming = ball.kind === 'incoming';
  // Reduced motion: no travel — fade in place at the landing / mid point.
  const animation = reduced
    ? 'ballFade 1s forwards'
    : incoming
      ? 'ballIncoming 1.7s cubic-bezier(.45,0,.55,1) forwards'
      : 'ballOutgoing .9s cubic-bezier(.45,0,.55,1) forwards';
  const base = reduced ? (incoming ? { top: '65%' } : { top: '48%' }) : {};
  return (
    <div style={{
      position: 'absolute', left: '50%', top: '2%', ...base,
      width: 'clamp(16px, 3.4%, 22px)', aspectRatio: '1', borderRadius: '50%',
      background: COLORS.cream, border: `2px solid ${COLORS.ink}`,
      transform: 'translate(-50%, -50%)', boxShadow: '0 2px 6px rgba(34,27,18,.4)',
      pointerEvents: 'none', zIndex: 15, animation,
    }} />
  );
}
```

Then render it inside the court container. Add this line right after the closing `</ConstraintOverlay>`-sibling `{players.map(...)}` block (before the status chip `<div>`), using a fresh `key` on `state.ball` so a new serve restarts the animation:

```jsx
        {state.ball && <Ball key={`${state.ball.kind}-${state.served}`} ball={state.ball} reduced={state.reduced} />}
```

- [ ] **Step 3: Verify the render test still passes**

Run: `npx vitest run src/App.render.test.jsx`
Expected: PASS (default state has `ball: null`, so nothing new renders; tree still builds).

- [ ] **Step 4: Commit**

```bash
git add src/index.css src/components/court/Court.jsx
git commit -m "feat: render incoming/outgoing serve ball with keyframe travel"
```

---

### Task 4: Context-aware button wording

**Files:**
- Modify: `src/components/rail/ActionBar.jsx`
- Modify: `src/components/rail/Rail.jsx`
- Modify: `src/components/rail/MobileRail.jsx`

**Interfaces:**
- Consumes: `state.serving`, `state.served`.
- Produces: `ActionBar` gains a `serving` prop.

- [ ] **Step 1: ActionBar label logic**

In `src/components/rail/ActionBar.jsx`, change the signature and the button label expression:

```jsx
export default function ActionBar({ served, serving, onServe, onReset }) {
```

Replace the serve button's label `{served ? 'Back to receive' : 'Serve!'}` with:

```jsx
{served ? (serving ? 'Back to serve' : 'Back to receive') : (serving ? 'Serve!' : 'They serve →')}
```

- [ ] **Step 2: Pass `serving` from Rail**

In `src/components/rail/Rail.jsx`, update the `ActionBar` usage (line ~34):

```jsx
      <ActionBar served={state.served} serving={state.serving} onServe={actions.onServe} onReset={actions.onReset} />
```

- [ ] **Step 3: MobileRail label logic**

In `src/components/rail/MobileRail.jsx`, replace the serve button's label `{state.served ? 'Receive' : 'Serve!'}` with:

```jsx
{state.served ? (state.serving ? 'Back' : 'Receive') : (state.serving ? 'Serve!' : 'They serve')}
```

- [ ] **Step 4: Verify the render test still passes**

Run: `npx vitest run src/App.render.test.jsx`
Expected: PASS (default state is receiving + not served → button reads "They serve →"; tree builds).

- [ ] **Step 5: Commit**

```bash
git add src/components/rail/ActionBar.jsx src/components/rail/Rail.jsx src/components/rail/MobileRail.jsx
git commit -m "feat: button copy reflects who serves (they serve vs we serve)"
```

---

### Task 5: Chronology in the status copy

**Files:**
- Modify: `src/domain/status.js`
- Test: `src/domain/status.test.js` (create)

**Interfaces:**
- Consumes: `state` (`served`, `serving`), `validation`, `{ challengeSuccess, learnMatched }`.
- Produces: `computeStatus` returns the same shape `{ head, color, chipText, chipBg, hint }`; the `served` branch now distinguishes serve vs receive.

- [ ] **Step 1: Write the status test**

Create `src/domain/status.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { computeStatus } from './status.js';

const legal = { legal: true, violations: [] };
const flags = { challengeSuccess: false, learnMatched: false };

describe('computeStatus', () => {
  it('after receiving a serve, heads to attack', () => {
    const s = computeStatus({ served: true, serving: false }, legal, flags);
    expect(s.head).toBe('Received → attack');
    expect(s.chipText).toBe('Passed,  shifting to attack');
  });

  it('after we serve, the ball is over', () => {
    const s = computeStatus({ served: true, serving: true }, legal, flags);
    expect(s.head).toBe('Served');
    expect(s.chipText).toBe("Ball's over");
  });

  it('pre-serve receive hint spells out the chronology', () => {
    const s = computeStatus({ served: false, serving: false }, legal, flags);
    expect(s.hint).toContain('they serve');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/domain/status.test.js`
Expected: FAIL — current `served` branch heads "Released" for both, and the pre-serve hint lacks the chronology sentence.

- [ ] **Step 3: Update computeStatus**

In `src/domain/status.js`, replace the `if (state.served) { ... }` line and the `hint` assignment.

Replace the served branch:

```js
  if (state.served) {
    if (state.serving) { head = 'Served'; color = COLORS.green; chipText = "Ball's over"; chipBg = NEUTRAL_CHIP; }
    else { head = 'Received → attack'; color = COLORS.green; chipText = 'Passed,  shifting to attack'; chipBg = COLORS.green; }
  }
```

Replace the `hint` assignment:

```js
  const hint = state.served
    ? (state.serving
        ? 'You served; the ball is on their side now. Serve again or Reset.'
        : 'Contact broke the freeze — passers received, attackers shifted up. They serve again or Reset.')
    : (state.serving
        ? 'Set your serving formation. Overlap rules relax once you serve.'
        : (validation.legal
            ? 'Set your overlap-legal spots. When they serve, everyone sprints to receive and attack.'
            : 'Only the broken pair lights up. Fix those two players; nobody else matters.'));
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/domain/status.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/status.js src/domain/status.test.js
git commit -m "feat: status copy narrates receive→attack vs served chronology"
```

---

### Task 6: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the whole suite**

Run: `npx vitest run`
Expected: PASS — all files green (reducer, status, App render, and the untouched domain suites).

- [ ] **Step 2: Drive the app**

Run: `npm run dev` and open the app. Verify:
- Default (receive, learn): button reads **"They serve →"**. Press it → a ball drops from above the net, players stay frozen ~0.6s, then sprint into receive→attack; status head reads **"Received → attack"**. Button now reads **"Back to receive"**; press to rewind.
- Sandbox → **"We serve"**: button reads **"Serve!"**. Press → ball flies from the zone-1 server up over the net; players **hold**; status head reads **"Served"**.
- Toggle prefers-reduced-motion (DevTools rendering emulation): the ball fades in place instead of travelling; players still relocate on receive.
- Mobile width (< 720px): serve button reads **"They serve"** / **"Serve!"** accordingly.

- [ ] **Step 3: Final commit if any polish was needed**

```bash
git add -A
git commit -m "chore: reception chronology polish"
```
(Skip if nothing changed.)
