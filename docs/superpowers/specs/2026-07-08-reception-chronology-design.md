# Reception chronology: incoming ball + phased release

Date: 2026-07-08

## Problem

The app is fundamentally a **reception** trainer, but its interaction hides the
chronology it is meant to teach:

1. We arrange our six players in overlap-legal spots for the current rotation.
2. The **other team serves** — the server is on the far side, not one of our
   tokens.
3. At contact, our players sprint from their legal-at-contact spots into
   **receive → attack** formation.

Two things obscure this:

- **The "Serve!" button reads as if we serve.** In receive mode the button
  actually represents the *opponent's* serve triggering our sprint. Nothing on
  screen shows a ball, so the trigger is invisible.
- **The release is instant.** `SERVE_LEGAL` snaps players to their playing spots
  in a single beat, collapsing "freeze at contact" and "sprint after contact"
  into one motion.

The one genuinely different case is the sandbox **"We serve"** toggle: there one
of *our* tokens is the server (zone 1, dashed), players are already where they
play, and there is no reception.

## Model

| | Receive (learn / challenge / sandbox-receive) | We serve (sandbox toggle) |
|---|---|---|
| Trigger | **Opponent** serves | **Our** server serves |
| Ball | flies from far side (above net) → our court | flies from our server → far side |
| Players | freeze, then sprint: receive → attack | hold position |
| Button | "They serve →" | "Serve!" |

Coordinate reference (`geometry.js`): `PY(y) = 170 + y*100`, so `y = 0m` is the
net (top of the drawn court) and `y = 9m` is our endline (bottom). The strip
above the net (pixels 30–170) is the opponent's side. Incoming serve starts
above the net and travels down; our serve starts at the server (~`8.0, 9.35m`,
bottom-right) and flies up past the net.

## Design

### 1. Two-beat release with an incoming/outgoing ball

Replace the single-beat `SERVE_LEGAL` release with a phased sequence. New state
fields on the reducer:

- `ball`: `null | { kind: 'incoming' | 'outgoing' }` — which serve animation is
  playing, or none.

**Receive** (`!state.serving`), on a legal serve press:

1. Beat 1 — *the serve*: snapshot `preServe`, set `served = true`,
   `ball = { kind: 'incoming' }`. **Players do not move** (positions unchanged,
   still at legal-at-contact spots). No `releasing` yet.
2. Beat 2 — *contact release*: after the ball's travel (~600ms), set
   `positions = releaseTargets(state)` and `releasing = true` (the existing 1s
   release-sprint transition carries them to receive → attack).
3. After the release settles (~1100ms), `releasing = false`. The ball has faded
   at the end of its keyframe.

**We serve** (`state.serving`), on a legal serve press:

- Set `served = true`, `ball = { kind: 'outgoing' }`. **Do not** apply
  `releaseTargets`; players hold. Ball flies out and fades. No `releasing`.

`releaseTargets` therefore only ever runs on receive. Its internal serve branch
is left untouched for now (out of scope).

**Timing** is driven from `useTrainer.onServe` with the existing timer pattern
(`whistleTimer`, `releaseTimer`):

- Receive: dispatch beat 1 immediately; `setTimeout(~600ms)` dispatches beat 2
  (`RELEASE`); `setTimeout(~1700ms)` dispatches `RELEASE_END`.
- Serve: dispatch beat 1 (outgoing ball) immediately; `setTimeout(~700ms)`
  dispatches a `BALL_CLEAR`/`RELEASE_END` that resolves the ball but leaves
  positions untouched.

Illegal formations keep today's whistle path unchanged (no ball).

Reducer actions:

- `SERVE_LEGAL` — branches on `state.serving` to set `ball` kind and (receive
  only) snapshot `preServe`; never moves players on this beat.
- `RELEASE` (new) — receive beat 2: `positions = releaseTargets(state)`,
  `releasing = true`.
- `RELEASE_END` — `releasing = false`; keep `ball` until its keyframe ends
  (visual only) — clearing `ball` here is acceptable since the keyframe uses
  `forwards` and the element can unmount after; simplest is to clear `ball` on
  `RELEASE_END`.
- `UNSERVE` — restore `preServe` (or `basePositions`), `served = false`,
  `ball = null`, `releasing = false`.

### 2. The ball element

A single element rendered in `Court.jsx` when `state.ball` is set, positioned in
court coordinates the same way tokens are (percent of the 960×1180 viewBox).

- **incoming**: one-shot CSS `@keyframes` from above the net
  (~`x 4.5m, above y 0`) down to the reception seam (~`4.5, 6.0m`), ~600ms,
  ease-in, then a short fade.
- **outgoing**: `@keyframes` from the server (~`8.0, 9.35m`) up past the net
  and off the far side, ~700ms, then fade.
- Keyframes live in the same global stylesheet as the existing `flashIn`
  whistle animation.
- **Reduced motion** (`state.reduced`): no travel — the ball appears briefly at
  the reception point / mid-court and fades, so the beat is still readable
  without motion.
- Small, `pointerEvents: none`, styled as a volleyball (cream fill, ink seam or
  just a cream disc consistent with the court palette).

### 3. Wording

- **ActionBar** (desktop): receive → `They serve →` (idle) / `Back to receive`
  (served); serve → `Serve!` / `Back to serve`. Reset button unchanged.
- **MobileRail**: receive → `They serve` / `Receive`; serve → `Serve!` /
  `Back`.
- **status.js** (`computeStatus`):
  - Pre-serve receive hint gains a chronology sentence: e.g. "Set your
    overlap-legal spots. When they serve, everyone sprints to receive and
    attack."
  - After release (receive): head `Received → attack`, chip
    `Passed, shifting to attack`, hint reframed around contact breaking the
    freeze.
  - After serve (we serve): head `Served`, chip `Ball's over`.
- **Court** top-right chip keeps `serve incoming ●` for receive and
  `our serve,  overlap off` for serve (unchanged).

Wording lives in `status.js` / the button components only; reducer state and URL
params are untouched.

## Testing

`trainerReducer.test.js`:

- Receive `SERVE_LEGAL`: sets `ball.kind === 'incoming'`, `served === true`, and
  `positions` **unchanged** from before (players do not move on beat 1).
- `RELEASE` after a receive serve: `positions` deep-equal `releaseTargets(state)`
  and `releasing === true`.
- Serve `SERVE_LEGAL` (`serving: true`): sets `ball.kind === 'outgoing'`,
  `served === true`, and `positions` **unchanged** (no release ever applied).
- `UNSERVE`: `ball === null`, `served === false`, positions restored to
  `preServe`.

`status.js` (via existing status coverage or a focused test): post-release
receive head is `Received → attack`; serve-after head is `Served`.

Existing tests that assert the old single-beat behaviour or the old button
labels are updated to the new model.

## Out of scope

- `releaseTargets`' internal serve-side logic (kept as-is; only the *caller*
  stops invoking it when serving).
- Rotation labelling / rotation-1 no-switch work (separate spec:
  `2026-07-08-rotation-labels-and-rot1-attack-design.md`).
