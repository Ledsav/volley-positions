# Rotation labelling by setter zone + rotation-1 no-switch attack

Date: 2026-07-08

## Problem

1. **Rotation numbers don't match the setter's position.** The UI labels rotations
   with the internal physical index `1 2 3 4 5 6`, but coaches name rotations by the
   setter's court zone. For the internal sequence, the setter actually sits in zones
   `1 6 5 4 3 2`. The displayed number should be the setter's zone.

2. **Rotation 1 attack does the hard switch.** After receiving in rotation 1 the
   front row is OH1 (zone 2, right), MB1 (zone 3, middle), OPP (zone 4, left).
   `releaseTargets` currently makes OPP and OH1 cross to their "natural" pins
   (OPP → right x 8.2, OH1 → left x 0.9). That crossover is difficult. The default
   should keep them where they rotated: OPP attacks from position 4 (left), OH1 from
   position 2 (right), no switch. This applies **only to rotation 1** on receive.

## Design

### 1. Display label = setter's zone

- Add `rotationLabel(rot)` to `src/domain/rotation.js`, returning `zoneOf('S', rot)`.
- Use it wherever the rotation number is shown to the user:
  - `RotationPicker` — iterate the physical indices `[1..6]` (so `onPick`/`active`
    still use the internal index), but render `rotationLabel(n)`. Left-to-right the
    buttons read **1 6 5 4 3 2**.
  - `ChallengePanel` heading "Set up serve receive for rotation N".
  - `MobileRail` `R#` chip and the "Rotation #" subtitle.
- Internals unchanged: `ANSWERS`/`COACH_NOTES` keys, reducer state, and the URL
  `rotation` param stay the physical index. Only the rendered number changes.

### 2. Rotation-1 no-switch attack

- In `releaseTargets`, when `state.rotation === 1` and the team is receiving
  (`!state.serving`): front-row OPP releases to the left-pin attack spot
  (~`{1.0, 1.6}`) and front-row OH1 releases to the right-pin attack spot
  (~`{8.2, 1.6}`). MB1 middle release is unchanged. All other rotations keep the
  existing crossover behaviour.

## Testing

- `rotation.test.js`: `rotationLabel` maps `1→1, 2→6, 3→5, 4→4, 5→3, 6→2`.
- `formations.test.js`: in rotation 1 receiving, `releaseTargets` puts OPP left of
  OH1 (OPP.x < OH1.x) — i.e. no crossover; unchanged rotations keep OPP on the right.
