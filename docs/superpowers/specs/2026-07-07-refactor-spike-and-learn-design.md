# Spike & Learn — Separation-of-Concerns Refactor

**Date:** 2026-07-07
**Status:** Approved design
**Type:** Structural refactor (zero intended behavior change)

## Goal

The app currently lives in a single ~600-line `src/App.jsx` React **class** component that
mixes four concerns:

1. **Domain** — volleyball constants, the overlap rule engine, coordinate geometry, coach formations.
2. **State / interaction** — positions, drag, serve sequence, URL sync, reduced-motion.
3. **View-model derivation** — the monolithic `renderVals()` object.
4. **Rendering** — court SVG, six rail panels, the rule-reference modal, player tokens.

Refactor into compartmentalized layers so each unit has one clear purpose, a well-defined
interface, and can be understood/tested independently. Convert from a class component to
function components with a custom hook. No visual or behavioral change is intended.

## Decisions (locked)

- **Paradigm:** function components + a custom `useTrainer()` hook. No class components remain.
- **Granularity:** medium — Court (with `PlayerToken` + `ConstraintOverlay` children), the rail
  split into its ~6 panels, and a standalone modal. ~12 focused components.
- **Tests:** add **Vitest** and unit-test the pure domain.
- **Hook internals:** `useReducer` for trainer state; `useEffect`/`useRef` for side effects.

## Target structure

```
src/
  theme.js                 palette + font tokens (removes repeated hex/font-family strings)
  domain/                  PURE — no React, no DOM globals; fully unit-tested
    constants.js           ROLES, Z0, ROLE_NAMES, ZONE_BASE, PAIRS
    rotation.js            zoneOf(role, rot); derivePlayers({rotation, positions, serving})
    geometry.js            PX, PY, clamp, dist, pointToMeters(rect, clientX, clientY)
    rules.js               validate(players, serving); constraintsForZone(zone, serving);
                           setterNeighbors(rotation, serving, byZone)
    formations.js          ANSWERS, COACH_NOTES, basePositions(rot, serving),
                           releaseTargets(state)
    challenge.js           evaluateChallenge(players, validation, rotation)
                           → { checks[], success, insight }
    status.js              computeStatus(state, validation, derived)
                           → { head, color, chipText, chipBg, hint }
  hooks/
    useTrainer.js          owns all state + interactions + effects;
                           returns { state, derived, actions, courtRef }
  components/
    court/
      Court.jsx            static court SVG surface + overlay + tokens + chips + whistle + aria-live
      PlayerToken.jsx      one draggable/keyboard-movable token
      ConstraintOverlay.jsx  SVG overlay: zone numbers, ghosts, setter arrow, web lines, pills
    rail/
      Rail.jsx             composes the panels + header
      RotationPicker.jsx   1–6 rotation buttons
      ModePanel.jsx        Learn/Challenge/Sandbox switch, mode description, coach note,
                           sandbox serve toggle, web/ghost toggles
      ChallengePanel.jsx   challenge checklist + success insight + "next rotation"
      StatusPanel.jsx      status head, violation messages, hint
      SelectionCard.jsx    selected player card + constraint list
      ActionBar.jsx        Serve!/Back-to-receive + Reset
    RuleReferenceModal.jsx overlap-rule modal
  App.jsx                  thin: outer flex layout; wires useTrainer into Court/Rail/Modal
  main.jsx                 unchanged
```

## Data flow

`useTrainer()` is the single source of truth. It:

- Holds trainer state via `useReducer`.
- Computes shared **derived** values once per render by calling pure domain functions:
  `players` (`derivePlayers`), `validation` (`rules.validate`), `vioZones`, `challenge`
  (`evaluateChallenge`), `status` (`computeStatus`), and `learnMatched`.
- Exposes `actions` (see below), the scratch drag ref internally, and a `courtRef`
  that `Court` attaches to the overlay `<svg>` (used by `pointToMeters` for drag math).

Returns `{ state, derived, actions, courtRef }`. Components read from `state`/`derived` and
call `actions`; they are presentational. **`renderVals()` is deleted** — each panel derives only
what it needs, so no single large view-model object exists.

### Actions (reducer-backed)

`applyRotation(n)`, `setMode(mode)`, `setServing(bool)`, `toggleWeb()`, `toggleGhosts()`,
`toggleRef()`, `onServe()`, `onReset()`, `nextRotation()`, `select(role)`,
`dragStart/dragMove/dragEnd(role, event)`, `nudge(role, event)` (arrow-key move).

### Reducer + effects boundary

- **Reducer (pure):** all synchronous state transitions, including the reset cascades in
  `applyRotation`/`setMode` and the `onServe` legal-branch that swaps in `releaseTargets`.
  Named action types make transitions explicit and unit-testable.
- **Effects/refs (in the hook):** URL param read on mount + `syncUrl` on rotation/mode change;
  `prefers-reduced-motion` media-query listener; whistle (`1400ms`) and release (`1100ms`)
  timeouts; the `_drag` scratch `useRef`; `courtRef`.

## Behavior preservation

Pure structural refactor. Same court geometry, same 7-pair overlap rules, same drag/serve/URL
behavior, same fonts/colors/animation. `ConstraintOverlay` is rewritten as declarative JSX
instead of `React.createElement` calls but must render an identical SVG tree
(zone numbers, ghost markers, setter release arrow, web lines, violation pills).

## Testing

Vitest, **node** environment (domain has no DOM dependency). Add dev dependency and a
`"test": "vitest run"` script (plus `"test:watch": "vitest"`).

- `domain/rotation.test.js` — `zoneOf` mapping across all 6 rotations; `derivePlayers`
  zone/`back`/`isLibero`/`isServer`/`label` flags including the serving-zone-1 exception.
- `domain/rules.test.js` — a known-legal formation returns `legal:true`; a lateral swap and a
  depth swap each produce the right single violation with correct `msg`/`short`; `serving`
  short-circuits to legal.
- `domain/geometry.test.js` — `PX`/`PY`/`clamp`/`dist`; `pointToMeters` maps a rect + client
  point to meters correctly.
- `domain/formations.test.js` — **invariant:** every `ANSWERS[rot]` formation and every
  `basePositions(rot, false)` validates as legal (guards the digitized coordinates and the
  base layout against regressions).

## Verification (end of implementation)

1. `npm run test` — all domain tests pass.
2. `npm run lint` — clean.
3. `npm run build` — succeeds.
4. SSR render smoke test across all 3 modes × 6 rotations + serve/whistle/ref-modal states
   (as used in the initial port) — no runtime errors.

## Out of scope

- No visual redesign or new features.
- No shared UI-primitive component library (`Button`/`Chip`/`Panel`) — inline styles remain,
  with only color/font tokens extracted to `theme.js`.
- No removal of the now-unused Tailwind config files (separate cleanup if desired).
- No changes to `main.jsx` or the build tooling beyond adding Vitest.
