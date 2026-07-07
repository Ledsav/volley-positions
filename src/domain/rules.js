import { PAIRS } from './constants.js';

export function validate(players, serving) {
  if (serving) return { legal: true, violations: [] }; // our serve — no position check
  const byZone = {};
  players.forEach(p => { byZone[p.zone] = p; });
  const violations = [];
  for (const [a, b, axis] of PAIRS) {
    const A = byZone[a], B = byZone[b];
    if (!A || !B) continue;
    if (axis === 'lat' && A.x >= B.x) violations.push({ a, b, axis, msg: `${A.label} (zone ${a}) must stay to the left of ${B.label} (zone ${b})`, short: `${A.label} left of ${B.label}` });
    if (axis === 'dep' && A.y >= B.y) violations.push({ a, b, axis, msg: `${A.label} (zone ${a}) must stay in front of ${B.label} (zone ${b})`, short: `${A.label} in front of ${B.label}` });
  }
  return { legal: violations.length === 0, violations };
}

// Human-readable constraints for one zone's neighbors — used by the selection card.
export function constraintsForZone(zone, byZone) {
  return PAIRS
    .filter(([a, b]) => a === zone || b === zone)
    .map(([a, b, axis]) => {
      const other = byZone[a === zone ? b : a];
      const oz = a === zone ? b : a;
      let d;
      if (axis === 'lat') d = a === zone ? 'left of' : 'right of';
      else d = a === zone ? 'in front of' : 'behind';
      return { txt: `Stay ${d} ${other.label} (zone ${oz})` };
    });
}

export function setterNeighbors(sZone, byZone) {
  return PAIRS
    .filter(([a, b]) => a === sZone || b === sZone)
    .map(([a, b]) => { const nz = a === sZone ? b : a; return `zone ${nz} (${byZone[nz].label})`; });
}
