export const PX = x => 30 + x * 100;
export const PY = y => 170 + y * 100;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const dist = (p, q) => Math.hypot(p.x - q[0], p.y - q[1]);

// rect: a DOMRect-like { left, top, width, height } from the court overlay <svg>.
export function pointToMeters(rect, clientX, clientY) {
  return {
    x: ((clientX - rect.left) / rect.width * 960 - 30) / 100,
    y: ((clientY - rect.top) / rect.height * 1180 - 170) / 100,
  };
}
