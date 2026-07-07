import { describe, it, expect } from 'vitest';
import { PX, PY, clamp, dist, pointToMeters } from './geometry.js';

describe('geometry', () => {
  it('PX/PY convert meters to SVG units', () => {
    expect(PX(0)).toBe(30);
    expect(PX(9)).toBe(930);
    expect(PY(0)).toBe(170);
    expect(PY(9)).toBe(1070);
  });
  it('clamp bounds a value', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(clamp(2, 0, 3)).toBe(2);
  });
  it('dist measures between a {x,y} point and an [x,y] tuple', () => {
    expect(dist({ x: 0, y: 0 }, [3, 4])).toBe(5);
  });
  it('pointToMeters inverts the court transform', () => {
    // A 960x1180 rect at origin: SVG unit == pixel, so pixel (30,170) → meters (0,0)
    const rect = { left: 0, top: 0, width: 960, height: 1180 };
    const m = pointToMeters(rect, 30, 170);
    expect(m.x).toBeCloseTo(0, 6);
    expect(m.y).toBeCloseTo(0, 6);
    const m2 = pointToMeters(rect, 930, 1070);
    expect(m2.x).toBeCloseTo(9, 6);
    expect(m2.y).toBeCloseTo(9, 6);
  });
});
