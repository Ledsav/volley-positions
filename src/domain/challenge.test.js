import { describe, expect, it } from 'vitest';
import { evaluateChallenge } from './challenge.js';
import { ANSWERS, basePositions } from './formations.js';
import { derivePlayers } from './rotation.js';
import { validate } from './rules.js';

function challengeFor(rot, positions) {
  const players = derivePlayers({ rotation: rot, positions, serving: false });
  return evaluateChallenge(players, validate(players, false), rot);
}

describe('evaluateChallenge', () => {
  it('returns four labeled checks', () => {
    const res = challengeFor(1, basePositions(1, false));
    expect(res.checks).toHaveLength(4);
    expect(res.checks.map(c => c.label)).toEqual([
      'Legal at serve contact',
      'Three passers behind the 3 m line',
      'Seams covered,  left, middle, right',
      'Setter positioned to release to target',
    ]);
  });

  it("succeeds on the coach's answer formation and mentions the setter zone", () => {
    const positions = Object.fromEntries(Object.entries(ANSWERS[1]).map(([r, [x, y]]) => [r, { x, y }]));
    const res = challengeFor(1, positions);
    expect(res.success).toBe(true);
    expect(res.insight).toContain('zone 1');
  });

  it('fails when passers are bunched at the net (base positions)', () => {
    const res = challengeFor(1, basePositions(1, false));
    expect(res.success).toBe(false);
  });
});
