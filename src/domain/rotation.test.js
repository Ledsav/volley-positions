import { describe, it, expect } from 'vitest';
import { zoneOf, derivePlayers } from './rotation.js';
import { ZONE_BASE } from './constants.js';

describe('zoneOf', () => {
  it('maps each role to its base zone in rotation 1', () => {
    expect(zoneOf('S', 1)).toBe(1);
    expect(zoneOf('OH1', 1)).toBe(2);
    expect(zoneOf('MB2', 1)).toBe(6);
  });
  it('rotates zones clockwise as the rotation index increases', () => {
    // Setter is in zone 1 at rot 1, zone 6 at rot 2, zone 2 at rot 6
    expect(zoneOf('S', 2)).toBe(6);
    expect(zoneOf('S', 6)).toBe(2);
  });
  it('always returns a zone in 1..6', () => {
    for (let rot = 1; rot <= 6; rot++)
      for (const role of ['S', 'OH1', 'MB1', 'OPP', 'OH2', 'MB2'])
        expect(zoneOf(role, rot)).toBeGreaterThanOrEqual(1), expect(zoneOf(role, rot)).toBeLessThanOrEqual(6);
  });
});

describe('derivePlayers', () => {
  const positions = Object.fromEntries(['S', 'OH1', 'MB1', 'OPP', 'OH2', 'MB2'].map(r => [r, { x: 1, y: 2 }]));

  it('flags back-row zones (5,6,1) as back', () => {
    const players = derivePlayers({ rotation: 1, positions, serving: false });
    const byRole = Object.fromEntries(players.map(p => [p.role, p]));
    expect(byRole.S.back).toBe(true);   // zone 1
    expect(byRole.OH1.back).toBe(false); // zone 2
  });
  it('shows a back-row middle as libero labeled "L" when receiving', () => {
    const players = derivePlayers({ rotation: 3, positions, serving: false });
    // In rot 3, MB1 is in zone 1 (back) → libero
    const mb1 = players.find(p => p.role === 'MB1');
    expect(mb1.isLibero).toBe(true);
    expect(mb1.label).toBe('L');
  });
  it('does not treat the serving back-middle (zone 1, our serve) as a libero', () => {
    const players = derivePlayers({ rotation: 3, positions, serving: true });
    const mb1 = players.find(p => p.role === 'MB1'); // zone 1 while serving
    expect(mb1.isLibero).toBe(false);
    expect(mb1.isServer).toBe(true);
    expect(mb1.label).toBe('MB1');
  });
  it('carries through x/y from positions', () => {
    const players = derivePlayers({ rotation: 1, positions, serving: false });
    expect(players[0]).toMatchObject({ x: 1, y: 2 });
  });
});
