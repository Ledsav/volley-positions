import { ANSWERS } from './formations.js';
import { dist } from './geometry.js';
import { zoneOf } from './rotation.js';
import { setterNeighbors } from './rules.js';

export function evaluateChallenge(players, validation, rotation) {
  const ans = ANSWERS[rotation];
  const backMid = players.find(p => (p.role === 'MB1' || p.role === 'MB2') && p.back);
  const passers = [players.find(p => p.role === 'OH1'), players.find(p => p.role === 'OH2'), backMid].filter(Boolean);
  const xs = passers.map(p => p.x).sort((a, b) => a - b);
  const cPass = passers.every(p => p.y > 3.2);
  const cSeam = xs.length === 3 && xs[0] < 3.4 && xs[2] > 5.6 && xs[1] > 2.8 && xs[1] < 6.2;
  const sP = players.find(p => p.role === 'S');
  const cRelease = ans.S ? dist(sP, ans.S) < 2.3 : true;
  const checks = [
    { ok: validation.legal, label: 'Legal at serve contact' },
    { ok: cPass, label: 'Three passers behind the 3 m line' },
    { ok: cSeam, label: 'Seams covered,  left, middle, right' },
    { ok: cRelease, label: 'Setter positioned to release to target' },
  ];
  const success = checks.every(c => c.ok);
  const sZone = zoneOf('S', rotation);
  const byZone = {}; players.forEach(p => { byZone[p.zone] = p; });
  const sNbrs = setterNeighbors(sZone, byZone);
  const insight = `Legal and seamed. Your setter in zone ${sZone} only answers to ${sNbrs.join(' and ')},  keep them happy and any hiding spot works.`;
  return { checks, success, insight };
}
