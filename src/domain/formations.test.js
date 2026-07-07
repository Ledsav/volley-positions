import { describe, it, expect } from 'vitest';
import { ANSWERS, COACH_NOTES, basePositions, releaseTargets } from './formations.js';
import { derivePlayers } from './rotation.js';
import { validate } from './rules.js';

describe('formations data', () => {
  it('has answers and notes for all 6 rotations, one coord per role', () => {
    for (let rot = 1; rot <= 6; rot++) {
      expect(Object.keys(ANSWERS[rot]).sort()).toEqual(['MB1', 'MB2', 'OH1', 'OH2', 'OPP', 'S']);
      expect(typeof COACH_NOTES[rot]).toBe('string');
    }
  });
});

describe('legal invariant', () => {
  it('every base receiving formation is legal', () => {
    for (let rot = 1; rot <= 6; rot++) {
      const players = derivePlayers({ rotation: rot, positions: basePositions(rot, false), serving: false });
      expect(validate(players, false).legal).toBe(true);
    }
  });

  it("every coach's-answer formation is legal", () => {
    for (let rot = 1; rot <= 6; rot++) {
      const positions = Object.fromEntries(Object.entries(ANSWERS[rot]).map(([r, [x, y]]) => [r, { x, y }]));
      const players = derivePlayers({ rotation: rot, positions, serving: false });
      expect(validate(players, false).legal).toBe(true);
    }
  });
});

describe('basePositions', () => {
  it('parks the serving player (zone 1) at the endline', () => {
    const pos = basePositions(1, true); // S is zone 1 in rot 1
    expect(pos.S).toEqual({ x: 8.0, y: 9.35 });
  });
});

describe('releaseTargets', () => {
  it('sends the setter to the target and returns a spot for every role', () => {
    const state = { rotation: 1, positions: basePositions(1, false), serving: false };
    const targets = releaseTargets(state);
    expect(Object.keys(targets).sort()).toEqual(['MB1', 'MB2', 'OH1', 'OH2', 'OPP', 'S']);
    expect(targets.S).toEqual({ x: 6.8, y: 1.0 });
  });
});
