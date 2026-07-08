import { ROLES, ZONE_BASE } from './constants.js';
import { derivePlayers, zoneOf } from './rotation.js';

// Coach's-answer serve-receive formations (meters: x 0-9 left→right, y 0-9 net→endline),
// digitized from the reference diagrams.
export const ANSWERS = {
  1: { OPP: [1.2, 1.7], MB1: [4.2, 1.7], OH2: [1.5, 6.4], MB2: [4.1, 6.9], OH1: [6.6, 6.0], S: [8.0, 7.5] },
  2: { OPP: [4.2, 1.7], MB1: [6.6, 1.7], S: [5.1, 3.9], OH2: [1.4, 5.9], MB2: [3.5, 6.9], OH1: [6.9, 6.6] },
  3: { MB2: [1.2, 1.7], OPP: [6.6, 1.7], S: [0.6, 4.5], OH2: [2.6, 5.8], OH1: [4.5, 6.9], MB1: [7.1, 6.4] },
  4: { S: [0.6, 1.5], MB2: [3.9, 2.4], OH1: [0.9, 5.4], MB1: [3.8, 6.6], OH2: [6.6, 6.0], OPP: [7.8, 7.9] },
  5: { S: [4.7, 1.8], MB2: [7.1, 1.7], OPP: [4.8, 4.3], OH1: [1.4, 5.8], MB1: [3.3, 7.2], OH2: [6.9, 6.4] },
  6: { MB1: [1.2, 1.7], S: [7.1, 1.7], OH1: [2.9, 5.6], OH2: [4.7, 6.9], MB2: [7.1, 6.6], OPP: [0.6, 7.9] },
};

export const COACH_NOTES = {
  1: "Setter starts back right (zone 1). Slide straight up the right sideline behind OH1, release to target on contact. Easy.",
  2: "Setter in zone 6. Creep up center behind the OPP,  short diagonal release. Easy.",
  3: "Setter in zone 5. The full diagonal sprint across the court. Hard,  drill this one twice as much.",
  4: "Setter in zone 4. The stack: press against the net far left, dash along it to target. Hardest rotation in the book.",
  5: "Setter in zone 3. One step to the right and you're at target. The OPP hides behind you,  mid tuck or deep corner both legal.",
  6: "Setter in zone 2. Already standing at the target. Easiest,  enjoy it.",
};

// Zone each role visually occupies. On defense (serving) the back-row libero
// always anchors zone 5, trading places with whoever naturally rotated there
// — unless the back-row middle is the one about to serve from zone 1, in
// which case no libero has entered yet.
function defenseZones(rot, serving) {
  const zones = Object.fromEntries(ROLES.map(role => [role, zoneOf(role, rot)]));
  if (!serving) return zones;
  const libero = ROLES.find(role => (role === 'MB1' || role === 'MB2') && zones[role] === 6);
  if (!libero) return zones;
  const zone5Role = ROLES.find(role => zones[role] === 5);
  return { ...zones, [libero]: 5, [zone5Role]: 6 };
}

export function basePositions(rot, serving) {
  const zones = defenseZones(rot, serving);
  const pos = {};
  ROLES.forEach(role => {
    const z = zones[role];
    let [x, y] = ZONE_BASE[z];
    if (serving && z === 1) { x = 8.0; y = 9.35; }
    pos[role] = { x, y };
  });
  return pos;
}

// Where each player sprints the instant after serve contact ("release" animation targets).
export function releaseTargets(state) {
  const pos = {};
  const players = derivePlayers(state);
  const liberoBack = players.some(p => p.isLibero);
  // Rotation 1 receive: OH1 (zone 2) and OPP (zone 4) would have to cross to reach
  // their natural pins. That switch is hard, so keep them where they rotated —
  // OPP attacks from position 4 (left), OH1 from position 2 (right).
  const noSwitch = !state.serving && state.rotation === 1;
  players.forEach(p => {
    const front = !p.back;
    if (p.role === 'S') pos.S = { x: 6.8, y: 1.0 };
    else if (p.role === 'OPP') pos.OPP = front ? (noSwitch ? { x: 1.0, y: 1.6 } : { x: 8.2, y: 1.6 }) : { x: 7.6, y: 6.6 };
    else if (p.role === 'OH1' || p.role === 'OH2') {
      // the libero always defends zone 5, so the back-row OH covers middle back
      const frontTarget = noSwitch && p.role === 'OH1' ? { x: 8.2, y: 1.6 } : { x: 0.9, y: 1.5 };
      pos[p.role] = front ? frontTarget : (liberoBack ? { x: 4.6, y: 6.6 } : { x: 1.4, y: 6.1 });
    }
    else pos[p.role] = front ? { x: 4.5, y: 0.9 } : (p.isLibero ? { x: 1.4, y: 6.3 } : { x: 4.6, y: 6.9 });
  });
  return pos;
}
