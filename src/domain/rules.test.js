import { describe, it, expect } from 'vitest';
import { validate, constraintsForZone, setterNeighbors } from './rules.js';

// Minimal players: only zone/label/x/y matter to the rules.
const mk = (zone, label, x, y) => ({ zone, label, x, y });

describe('validate', () => {
  it('is legal when every constrained pair is ordered correctly', () => {
    // zones laid out at their base spots (front y small, back y large; left x small)
    const players = [
      mk(4, 'OPP', 1.5, 1.6), mk(3, 'MB1', 4.5, 1.6), mk(2, 'OH1', 7.5, 1.6),
      mk(5, 'OH2', 1.5, 6.6), mk(6, 'MB2', 4.5, 6.6), mk(1, 'S', 7.5, 6.6),
    ];
    const r = validate(players, false);
    expect(r.legal).toBe(true);
    expect(r.violations).toEqual([]);
  });

  it('flags a lateral overlap (zone 4 not left of zone 3)', () => {
    const players = [
      mk(4, 'OPP', 5.0, 1.6), mk(3, 'MB1', 4.5, 1.6), mk(2, 'OH1', 7.5, 1.6),
      mk(5, 'OH2', 1.5, 6.6), mk(6, 'MB2', 4.5, 6.6), mk(1, 'S', 7.5, 6.6),
    ];
    const r = validate(players, false);
    expect(r.legal).toBe(false);
    const v = r.violations.find(x => x.a === 4 && x.b === 3);
    expect(v.axis).toBe('lat');
    expect(v.short).toBe('OPP left of MB1');
    expect(v.msg).toContain('must stay to the left of');
  });

  it('flags a depth overlap (zone 4 front not in front of zone 5 back)', () => {
    const players = [
      mk(4, 'OPP', 1.5, 7.0), mk(3, 'MB1', 4.5, 1.6), mk(2, 'OH1', 7.5, 1.6),
      mk(5, 'OH2', 1.5, 6.6), mk(6, 'MB2', 4.5, 6.6), mk(1, 'S', 7.5, 6.6),
    ];
    const r = validate(players, false);
    const v = r.violations.find(x => x.a === 4 && x.b === 5);
    expect(v.axis).toBe('dep');
    expect(v.short).toBe('OPP in front of OH2');
  });

  it('is always legal when our team is serving (overlap not judged)', () => {
    const players = [mk(4, 'OPP', 9, 9), mk(3, 'MB1', 0, 0)];
    expect(validate(players, true)).toEqual({ legal: true, violations: [] });
  });
});

describe('constraintsForZone', () => {
  it('lists the direction relative to each neighbor of a zone', () => {
    const byZone = { 4: mk(4, 'OPP', 1.5, 1.6), 3: mk(3, 'MB1', 4.5, 1.6), 5: mk(5, 'OH2', 1.5, 6.6) };
    const texts = constraintsForZone(4, byZone).map(c => c.txt);
    expect(texts).toContain('Stay left of MB1 (zone 3)');
    expect(texts).toContain('Stay in front of OH2 (zone 5)');
  });
});

describe('setterNeighbors', () => {
  it('names the setter zone neighbors with their labels', () => {
    const byZone = { 1: mk(1, 'S', 7.5, 6.6), 2: mk(2, 'OH1', 7.5, 1.6), 6: mk(6, 'MB2', 4.5, 6.6) };
    expect(setterNeighbors(1, byZone).sort()).toEqual(['zone 2 (OH1)', 'zone 6 (MB2)']);
  });
});
