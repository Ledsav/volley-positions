import { ROLES, Z0 } from './constants.js';

export const zoneOf = (role, rot) => ((Z0[role] - rot + 6) % 6) + 1;

export function derivePlayers({ rotation, positions, serving }) {
  return ROLES.map(role => {
    const zone = zoneOf(role, rotation);
    const back = zone === 5 || zone === 6 || zone === 1;
    const isLibero = (role === 'MB1' || role === 'MB2') && back && !(serving && zone === 1);
    const p = positions[role];
    return { role, zone, back, isLibero, label: isLibero ? 'L' : role, x: p.x, y: p.y, isServer: serving && zone === 1 };
  });
}
