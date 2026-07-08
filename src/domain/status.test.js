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
