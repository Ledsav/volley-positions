# Spike & Learn Separation-of-Concerns Refactor,  Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decompose the monolithic ~600-line `src/App.jsx` React class component into pure domain modules, a `useTrainer` hook (reducer + effects), and medium-granularity view components, backed by Vitest unit tests,  with zero intended behavior change.

**Architecture:** Four layers,  (1) pure `src/domain/*` modules with no React/DOM; (2) a `src/hooks/trainerReducer.js` pure reducer + `src/hooks/useTrainer.js` hook that owns state, effects, and interaction handlers and returns `{ state, derived, actions, courtRef }`; (3) presentational components under `src/components/court/*`, `src/components/rail/*`, and `RuleReferenceModal.jsx`; (4) a thin `App.jsx` that wires the hook into the layout. Design tokens live in `src/theme.js`.

**Tech Stack:** React 19, Vite 7, Vitest (node environment), ESLint 9.

## Global Constraints

- **No behavior/visual change.** Same court geometry, 7-pair overlap rules, drag/serve/URL behavior, fonts, colors, and animations. The refactor is structural only.
- **Domain layer is pure:** no `import` of React, and no DOM globals (`window`, `matchMedia`, `location`, `getBoundingClientRect`). `src/theme.js` is also pure and may be imported by domain.
- **ESLint:** `no-unused-vars` errors on unused vars/args **except names matching `^[A-Z_]`**. No unused function parameters. Empty `catch` blocks must contain a comment.
- **Node coordinate conventions (do not change):** court SVG viewBox is `0 0 960 1180`; `PX(x)=30+x*100`, `PY(y)=170+y*100`; drag clamp is `x∈[0.2,8.8]`, `y∈[0.2,9.55]`; positions rounded to 2 decimals on drag.
- **Every file ends with a trailing newline.** Match existing 2-space indentation.
- **Commit after every task** with the exact message given.
- **Reference source:** the current implementation is committed at `src/App.jsx` (branch `refactor/separate-concerns`, commit `70d6ecc`). "Copy verbatim from current `src/App.jsx`" means copy that exact literal.

---

### Task 1: Vitest setup + theme tokens + constants + rotation module

**Files:**
- Modify: `package.json` (add devDependency + scripts)
- Modify: `vite.config.js` (add `test` config)
- Create: `src/theme.js`
- Create: `src/domain/constants.js`
- Create: `src/domain/rotation.js`
- Test: `src/domain/rotation.test.js`

**Interfaces:**
- Produces: `COLORS` (object: `court`,`courtBack`,`courtFront`,`cream`,`ink`,`navy`,`red`,`green`), `FONTS` (`display`,`body`) from `src/theme.js`.
- Produces: `ROLES` (string[6]), `Z0`, `ROLE_NAMES`, `ZONE_BASE`, `PAIRS` (array of `[a,b,axis]`) from `src/domain/constants.js`.
- Produces: `zoneOf(role, rot) → 1..6`, `derivePlayers({rotation, positions, serving}) → player[]` where each player is `{ role, zone, back, isLibero, label, x, y, isServer }`, from `src/domain/rotation.js`.

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest`
Expected: adds `vitest` to devDependencies (a Node 20.19+ engine warning like Vite's is acceptable; install still succeeds).

- [ ] **Step 2: Add test scripts to `package.json`**

In the `"scripts"` block, add these two entries alongside the existing ones:

```json
    "test": "vitest run",
    "test:watch": "vitest",
```

- [ ] **Step 3: Add Vitest config to `vite.config.js`**

Replace the file with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 4: Create `src/theme.js`**

```js
// Design tokens for the sandy-court aesthetic. Pure,  safe to import anywhere.
export const COLORS = {
  court: '#B98A52',       // outer surround / attack-line base
  courtBack: '#C79758',   // front-zone strip
  courtFront: '#D8A968',  // main court fill
  cream: '#F6F1E6',       // court lines, light tokens
  ink: '#221B12',         // primary text / dark tokens
  navy: '#24406B',        // team color / serve button
  red: '#D7402B',         // faults
  green: '#3E6B4F',       // success
};

export const FONTS = {
  display: "'Saira Condensed', sans-serif",
  body: "'IBM Plex Sans', sans-serif",
};
```

- [ ] **Step 5: Create `src/domain/constants.js`**

Copy the five literals verbatim from current `src/App.jsx` (`ROLES`, `Z0`, `ROLE_NAMES`, `ZONE_BASE`, `PAIRS`), each as a named `export const`:

```js
export const ROLES = ['S', 'OH1', 'MB1', 'OPP', 'OH2', 'MB2'];
export const Z0 = { S: 1, OH1: 2, MB1: 3, OPP: 4, OH2: 5, MB2: 6 };
export const ROLE_NAMES = { S: 'Setter', OH1: 'Outside hitter 1', MB1: 'Middle blocker 1', OPP: 'Opposite', OH2: 'Outside hitter 2', MB2: 'Middle blocker 2' };
export const ZONE_BASE = { 1: [7.5, 6.6], 2: [7.5, 1.6], 3: [4.5, 1.6], 4: [1.5, 1.6], 5: [1.5, 6.6], 6: [4.5, 6.6] };
// [zoneA, zoneB, axis],  lateral: A must be left of B; depth: A (front) must be in front of B (back)
export const PAIRS = [[4, 3, 'lat'], [3, 2, 'lat'], [5, 6, 'lat'], [6, 1, 'lat'], [4, 5, 'dep'], [3, 6, 'dep'], [2, 1, 'dep']];
```

- [ ] **Step 6: Write the failing test `src/domain/rotation.test.js`**

```js
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
    // In rot 3, MB2 is in zone 1 (back) → libero
    const mb2 = players.find(p => p.role === 'MB2');
    expect(mb2.isLibero).toBe(true);
    expect(mb2.label).toBe('L');
  });
  it('does not treat the serving back-middle (zone 1, our serve) as a libero', () => {
    const players = derivePlayers({ rotation: 3, positions, serving: true });
    const mb2 = players.find(p => p.role === 'MB2'); // zone 1 while serving
    expect(mb2.isLibero).toBe(false);
    expect(mb2.isServer).toBe(true);
    expect(mb2.label).toBe('MB2');
  });
  it('carries through x/y from positions', () => {
    const players = derivePlayers({ rotation: 1, positions, serving: false });
    expect(players[0]).toMatchObject({ x: 1, y: 2 });
  });
});
```

- [ ] **Step 7: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL,  cannot resolve `./rotation.js` (module not found).

- [ ] **Step 8: Create `src/domain/rotation.js`**

```js
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
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `npm run test`
Expected: PASS (all `rotation.test.js` cases green).

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json vite.config.js src/theme.js src/domain/constants.js src/domain/rotation.js src/domain/rotation.test.js
git commit -m "$(printf 'refactor: add vitest, theme tokens, domain constants + rotation\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 2: Geometry module

**Files:**
- Create: `src/domain/geometry.js`
- Test: `src/domain/geometry.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `PX(x)→number`, `PY(y)→number`, `clamp(v,a,b)→number`, `dist(p,q)→number` (where `p={x,y}`, `q=[x,y]`), `pointToMeters(rect, clientX, clientY) → {x,y}` (where `rect` is `{left,top,width,height}`).

- [ ] **Step 1: Write the failing test `src/domain/geometry.test.js`**

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL,  cannot resolve `./geometry.js`.

- [ ] **Step 3: Create `src/domain/geometry.js`**

```js
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/geometry.js src/domain/geometry.test.js
git commit -m "$(printf 'refactor: extract pure geometry helpers\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 3: Rules module

**Files:**
- Create: `src/domain/rules.js`
- Test: `src/domain/rules.test.js`

**Interfaces:**
- Consumes: `PAIRS` from `constants.js`.
- Produces:
  - `validate(players, serving) → { legal: boolean, violations: [{a,b,axis,msg,short}] }`.
  - `constraintsForZone(zone, byZone) → [{txt}]` (byZone maps zone→player).
  - `setterNeighbors(sZone, byZone) → string[]` (e.g. `"zone 2 (OH1)"`).

- [ ] **Step 1: Write the failing test `src/domain/rules.test.js`**

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL,  cannot resolve `./rules.js`.

- [ ] **Step 3: Create `src/domain/rules.js`**

```js
import { PAIRS } from './constants.js';

export function validate(players, serving) {
  if (serving) return { legal: true, violations: [] }; // our serve,  no position check
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

// Human-readable constraints for one zone's neighbors,  used by the selection card.
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/rules.js src/domain/rules.test.js
git commit -m "$(printf 'refactor: extract overlap rules engine + constraint text helpers\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 4: Formations module

**Files:**
- Create: `src/domain/formations.js`
- Test: `src/domain/formations.test.js`

**Interfaces:**
- Consumes: `ROLES`, `ZONE_BASE` from `constants.js`; `zoneOf`, `derivePlayers` from `rotation.js`.
- Produces:
  - `ANSWERS` (`{1..6: {role:[x,y]}}`), `COACH_NOTES` (`{1..6: string}`).
  - `basePositions(rot, serving) → {role:{x,y}}`.
  - `releaseTargets(state) → {role:{x,y}}` where `state` has `{rotation, positions, serving}`.

- [ ] **Step 1: Write the failing test `src/domain/formations.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { ANSWERS, COACH_NOTES, basePositions, releaseTargets } from './formations.js';
import { derivePlayers } from './rotation.js';
import { validate } from './rules.js';

describe('formations data', () => {
  it('has answers and notes for all 6 rotations, one coord per role', () => {
    for (let rot = 1; rot <= 6; rot++) {
      expect(Object.keys(ANSWERS[rot]).sort()).toEqual(['MB1', 'MB2', 'OH1', 'OH2', 'OPP', 'S']);
      expect(typeof COACH_NOTES[rot]).toBe('string');
    }
  });
});

describe('legal invariant', () => {
  it('every base receiving formation is legal', () => {
    for (let rot = 1; rot <= 6; rot++) {
      const players = derivePlayers({ rotation: rot, positions: basePositions(rot, false), serving: false });
      expect(validate(players, false).legal).toBe(true);
    }
  });

  it("every coach's-answer formation is legal", () => {
    for (let rot = 1; rot <= 6; rot++) {
      const positions = Object.fromEntries(Object.entries(ANSWERS[rot]).map(([r, [x, y]]) => [r, { x, y }]));
      const players = derivePlayers({ rotation: rot, positions, serving: false });
      expect(validate(players, false).legal).toBe(true);
    }
  });
});

describe('basePositions', () => {
  it('parks the serving player (zone 1) at the endline', () => {
    const pos = basePositions(1, true); // S is zone 1 in rot 1
    expect(pos.S).toEqual({ x: 8.0, y: 9.35 });
  });
});

describe('releaseTargets', () => {
  it('sends the setter to the target and returns a spot for every role', () => {
    const state = { rotation: 1, positions: basePositions(1, false), serving: false };
    const targets = releaseTargets(state);
    expect(Object.keys(targets).sort()).toEqual(['MB1', 'MB2', 'OH1', 'OH2', 'OPP', 'S']);
    expect(targets.S).toEqual({ x: 6.8, y: 1.0 });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL,  cannot resolve `./formations.js`.

- [ ] **Step 3: Create `src/domain/formations.js`**

Copy the `ANSWERS` and `COACH_NOTES` object literals verbatim from current `src/App.jsx` into the marked spots below, and keep the two functions exactly as written here:

```js
import { ROLES, ZONE_BASE } from './constants.js';
import { zoneOf, derivePlayers } from './rotation.js';

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

export function basePositions(rot, serving) {
  const pos = {};
  ROLES.forEach(role => {
    const z = zoneOf(role, rot);
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
  const liberoBack = state.serving && players.some(p => p.isLibero);
  players.forEach(p => {
    const front = !p.back;
    if (p.role === 'S') pos.S = { x: 6.8, y: 1.0 };
    else if (p.role === 'OPP') pos.OPP = front ? { x: 8.2, y: 1.6 } : { x: 7.6, y: 6.6 };
    else if (p.role === 'OH1' || p.role === 'OH2') {
      // in defense (our serve) the libero takes zone 5, so the back-row OH covers middle back
      pos[p.role] = front ? { x: 0.9, y: 1.5 } : (liberoBack ? { x: 4.6, y: 6.6 } : { x: 1.4, y: 6.1 });
    }
    else pos[p.role] = front ? { x: 4.5, y: 0.9 } : (p.isLibero && state.serving ? { x: 1.4, y: 6.3 } : { x: 4.6, y: 6.9 });
  });
  return pos;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test`
Expected: PASS,  including the legal-invariant checks for all 6 rotations.

- [ ] **Step 5: Commit**

```bash
git add src/domain/formations.js src/domain/formations.test.js
git commit -m "$(printf 'refactor: extract formations, base positions, release targets\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 5: Challenge + status derivation

**Files:**
- Create: `src/domain/challenge.js`
- Create: `src/domain/status.js`
- Test: `src/domain/challenge.test.js`

**Interfaces:**
- `challenge.js` consumes: `zoneOf` (rotation), `dist` (geometry), `ANSWERS` (formations), `setterNeighbors` (rules).
  - Produces: `evaluateChallenge(players, validation, rotation) → { checks: [{ok,label}], success: boolean, insight: string }`.
- `status.js` consumes: `COLORS` from theme.
  - Produces: `computeStatus(state, validation, { challengeSuccess, learnMatched }) → { head, color, chipText, chipBg, hint }`. `state` fields used: `served`, `serving`.

- [ ] **Step 1: Write the failing test `src/domain/challenge.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { evaluateChallenge } from './challenge.js';
import { derivePlayers } from './rotation.js';
import { validate } from './rules.js';
import { ANSWERS, basePositions } from './formations.js';

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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL,  cannot resolve `./challenge.js`.

- [ ] **Step 3: Create `src/domain/challenge.js`**

```js
import { zoneOf } from './rotation.js';
import { dist } from './geometry.js';
import { ANSWERS } from './formations.js';
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
```

- [ ] **Step 4: Create `src/domain/status.js`**

```js
import { COLORS } from '../theme.js';

const NEUTRAL_CHIP = 'rgba(34,27,18,.72)';

// Derives the rail status header + court chip text/colors from the current state.
export function computeStatus(state, validation, { challengeSuccess, learnMatched }) {
  const n = validation.violations.length;
  let head, color, chipText, chipBg;
  if (state.served) { head = 'Released'; color = COLORS.green; chipText = 'Released,  legal spot ≠ playing spot'; chipBg = COLORS.green; }
  else if (!validation.legal) { head = n === 1 ? '1 fault' : `${n} faults`; color = COLORS.red; chipText = head; chipBg = COLORS.red; }
  else if (challengeSuccess) { head = 'Challenge complete'; color = COLORS.green; chipText = 'Legal ✓ seamed ✓'; chipBg = COLORS.green; }
  else if (learnMatched) { head = "Coach's answer ✓"; color = COLORS.green; chipText = "Coach's answer ✓"; chipBg = COLORS.green; }
  else if (state.serving) { head = 'Our serve,  no checks'; color = COLORS.green; chipText = 'Overlap off'; chipBg = NEUTRAL_CHIP; }
  else { head = 'Legal at contact'; color = COLORS.green; chipText = 'Legal'; chipBg = NEUTRAL_CHIP; }

  const hint = state.served
    ? 'The freeze ended at contact,  everyone sprinted to their playing positions. Serve again or Reset.'
    : (validation.legal ? 'Drag anyone. The web shows only the 7 real constraints,  diagonals are always free.' : 'Only the broken pair lights up. Fix those two players; nobody else matters.');

  return { head, color, chipText, chipBg, hint };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain/challenge.js src/domain/status.js src/domain/challenge.test.js
git commit -m "$(printf 'refactor: extract challenge evaluation + status derivation\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 6: Trainer reducer (pure state machine)

**Files:**
- Create: `src/hooks/trainerReducer.js`
- Test: `src/hooks/trainerReducer.test.js`

**Interfaces:**
- Consumes: `basePositions`, `releaseTargets` from `../domain/formations.js`.
- Produces:
  - `initialState()` → the default trainer state object.
  - `reducer(state, action)` → next state. Action `type`s: `INIT` (`{rotation?,mode?}`), `APPLY_ROTATION` (`{n}`), `SET_MODE` (`{mode}`), `SET_SERVING` (`{serving}`), `TOGGLE_WEB`, `TOGGLE_GHOSTS`, `TOGGLE_REF`, `SELECT` (`{role}`), `DRAG_START` (`{role}`), `DRAG_MOVE` (`{role,x,y}`), `DRAG_END`, `NUDGE` (`{role,dx,dy}`), `RESET`, `SET_REDUCED` (`{reduced}`), `SERVE_ILLEGAL`, `WHISTLE_OFF`, `SERVE_LEGAL`, `RELEASE_END`, `UNSERVE`.
- State shape: `{ rotation, mode, serving, webOn, ghostsOn, positions, selected, draggingRole, served, preServe, whistle, showRef, reduced, releasing }`.

- [ ] **Step 1: Write the failing test `src/hooks/trainerReducer.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { initialState, reducer } from './trainerReducer.js';
import { derivePlayers } from '../domain/rotation.js';
import { validate } from '../domain/rules.js';

describe('trainerReducer', () => {
  it('starts in learn mode, rotation 1, receiving, web + ghosts on', () => {
    const s = initialState();
    expect(s).toMatchObject({ rotation: 1, mode: 'learn', serving: false, webOn: true, ghostsOn: true, served: false });
    expect(Object.keys(s.positions).sort()).toEqual(['MB1', 'MB2', 'OH1', 'OH2', 'OPP', 'S']);
  });

  it('APPLY_ROTATION swaps positions and clears served/selection', () => {
    const s0 = { ...initialState(), served: true, selected: 'S', preServe: {} };
    const s1 = reducer(s0, { type: 'APPLY_ROTATION', n: 4 });
    expect(s1.rotation).toBe(4);
    expect(s1.served).toBe(false);
    expect(s1.selected).toBe(null);
    expect(s1.preServe).toBe(null);
  });

  it('SET_MODE turns the web off for challenge and resets to receiving', () => {
    const s1 = reducer(initialState(), { type: 'SET_MODE', mode: 'challenge' });
    expect(s1.mode).toBe('challenge');
    expect(s1.webOn).toBe(false);
    expect(s1.serving).toBe(false);
  });

  it('NUDGE moves a role and clamps within court bounds', () => {
    const s0 = initialState();
    const s1 = reducer(s0, { type: 'NUDGE', role: 'S', dx: -100, dy: 100 });
    expect(s1.positions.S.x).toBeCloseTo(0.2, 6); // clamped low
    expect(s1.positions.S.y).toBeCloseTo(9.55, 6); // clamped high
    expect(s1.selected).toBe('S');
  });

  it('SERVE_LEGAL snapshots positions and swaps in release targets', () => {
    const s0 = initialState();
    const s1 = reducer(s0, { type: 'SERVE_LEGAL' });
    expect(s1.served).toBe(true);
    expect(s1.releasing).toBe(true);
    expect(s1.preServe).toEqual(s0.positions);
    expect(s1.positions.S).toEqual({ x: 6.8, y: 1.0 });
  });

  it('UNSERVE restores the pre-serve snapshot', () => {
    const s0 = initialState();
    const served = reducer(s0, { type: 'SERVE_LEGAL' });
    const back = reducer(served, { type: 'UNSERVE' });
    expect(back.served).toBe(false);
    expect(back.positions).toEqual(s0.positions);
  });

  it('keeps the base receiving formation legal after INIT to a rotation', () => {
    const s = reducer(initialState(), { type: 'INIT', rotation: 4, mode: 'sandbox' });
    expect(s.rotation).toBe(4);
    expect(s.mode).toBe('sandbox');
    const players = derivePlayers(s);
    expect(validate(players, s.serving).legal).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL,  cannot resolve `./trainerReducer.js`.

- [ ] **Step 3: Create `src/hooks/trainerReducer.js`**

```js
import { basePositions, releaseTargets } from '../domain/formations.js';
import { clamp } from '../domain/geometry.js';

export function initialState() {
  return {
    rotation: 1, mode: 'learn', serving: false, webOn: true, ghostsOn: true,
    positions: basePositions(1, false),
    selected: null, draggingRole: null, served: false, preServe: null,
    whistle: false, showRef: false, reduced: false, releasing: false,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case 'INIT': {
      let s = state;
      if (action.rotation) s = { ...s, rotation: action.rotation, positions: basePositions(action.rotation, false) };
      if (action.mode) s = { ...s, mode: action.mode, webOn: action.mode !== 'challenge' };
      return s;
    }
    case 'APPLY_ROTATION':
      return { ...state, rotation: action.n, positions: basePositions(action.n, state.serving), served: false, preServe: null, selected: null };
    case 'SET_MODE':
      return { ...state, mode: action.mode, serving: false, webOn: action.mode !== 'challenge', ghostsOn: true, served: false, preServe: null, selected: null, positions: basePositions(state.rotation, false) };
    case 'SET_SERVING':
      return { ...state, serving: action.serving, served: false, preServe: null, positions: basePositions(state.rotation, action.serving) };
    case 'TOGGLE_WEB':
      return { ...state, webOn: !state.webOn };
    case 'TOGGLE_GHOSTS':
      return { ...state, ghostsOn: !state.ghostsOn };
    case 'TOGGLE_REF':
      return { ...state, showRef: !state.showRef };
    case 'SELECT':
      return { ...state, selected: action.role };
    case 'DRAG_START':
      return { ...state, draggingRole: action.role, selected: action.role };
    case 'DRAG_MOVE':
      return { ...state, positions: { ...state.positions, [action.role]: { x: action.x, y: action.y } } };
    case 'DRAG_END':
      return { ...state, draggingRole: null };
    case 'NUDGE': {
      const p = state.positions[action.role];
      return { ...state, selected: action.role, positions: { ...state.positions, [action.role]: { x: clamp(p.x + action.dx, 0.2, 8.8), y: clamp(p.y + action.dy, 0.2, 9.55) } } };
    }
    case 'RESET':
      return { ...state, positions: basePositions(state.rotation, state.serving), served: false, preServe: null };
    case 'SET_REDUCED':
      return { ...state, reduced: action.reduced };
    case 'SERVE_ILLEGAL':
      return { ...state, whistle: true };
    case 'WHISTLE_OFF':
      return { ...state, whistle: false };
    case 'SERVE_LEGAL':
      return { ...state, preServe: { ...state.positions }, served: true, positions: releaseTargets(state), releasing: true };
    case 'RELEASE_END':
      return { ...state, releasing: false };
    case 'UNSERVE':
      return { ...state, positions: state.preServe || basePositions(state.rotation, state.serving), served: false, preServe: null };
    default:
      return state;
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/trainerReducer.js src/hooks/trainerReducer.test.js
git commit -m "$(printf 'refactor: add pure trainer reducer state machine\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 7: useTrainer hook (state + effects + interaction handlers)

**Files:**
- Create: `src/hooks/useTrainer.js`

**Interfaces:**
- Consumes: `reducer`, `initialState` (trainerReducer); `derivePlayers` (rotation); `validate` (rules); `evaluateChallenge` (challenge); `computeStatus` (status); `ANSWERS` (formations); `pointToMeters`, `dist`, `clamp` (geometry).
- Produces: `useTrainer() → { state, derived, actions, courtRef }` where:
  - `derived = { players, validation, vioZones (Set of zone numbers), byZone, ans, learnMatched, challenge, challengeSuccess, status }`.
  - `actions = { applyRotation(n), setMode(mode), setServing(bool), toggleWeb(), toggleGhosts(), toggleRef(), select(role), dragStart(role,e), dragMove(role,e), dragEnd(role), nudge(role,e), onServe(), onReset(), nextRotation() }`.
  - `courtRef`,  a ref to attach to the court overlay `<svg>` (drag math reads its bounding rect).

- [ ] **Step 1: Create `src/hooks/useTrainer.js`**

```js
import { useReducer, useRef, useEffect } from 'react';
import { reducer, initialState } from './trainerReducer.js';
import { derivePlayers } from '../domain/rotation.js';
import { validate } from '../domain/rules.js';
import { evaluateChallenge } from '../domain/challenge.js';
import { computeStatus } from '../domain/status.js';
import { ANSWERS } from '../domain/formations.js';
import { pointToMeters, dist, clamp } from '../domain/geometry.js';

export function useTrainer() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // Latest-state mirror so pointer handlers read fresh positions without re-binding.
  const stateRef = useRef(state);
  stateRef.current = state;

  const courtRef = useRef(null);
  const dragRef = useRef(null);
  const whistleTimer = useRef(null);
  const releaseTimer = useRef(null);

  // --- effects -------------------------------------------------------------
  // Read rotation/mode from the URL once on mount.
  useEffect(() => {
    try {
      const q = new URLSearchParams(location.search);
      const rot = parseInt(q.get('rotation'), 10);
      const mode = q.get('mode');
      const patch = {};
      if (rot >= 1 && rot <= 6) patch.rotation = rot;
      if (['learn', 'challenge', 'sandbox'].includes(mode)) patch.mode = mode;
      if (Object.keys(patch).length) dispatch({ type: 'INIT', ...patch });
    } catch { /* ignore malformed URL params */ }
  }, []);

  // Keep the URL in sync with rotation/mode.
  useEffect(() => {
    try {
      const u = new URL(location.href);
      u.searchParams.set('rotation', state.rotation);
      u.searchParams.set('mode', state.mode);
      history.replaceState({}, '', u);
    } catch { /* ignore history/URL errors */ }
  }, [state.rotation, state.mode]);

  // Respect prefers-reduced-motion.
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => dispatch({ type: 'SET_REDUCED', reduced: mq.matches });
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Clear timers on unmount.
  useEffect(() => () => { clearTimeout(whistleTimer.current); clearTimeout(releaseTimer.current); }, []);

  // --- interaction handlers ------------------------------------------------
  function dragStart(role, e) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = courtRef.current?.getBoundingClientRect();
    if (!rect) return;
    const m = pointToMeters(rect, e.clientX, e.clientY);
    const p = stateRef.current.positions[role];
    dragRef.current = { role, dx: p.x - m.x, dy: p.y - m.y };
    dispatch({ type: 'DRAG_START', role });
  }

  function dragMove(role, e) {
    const d = dragRef.current;
    if (!d || d.role !== role) return;
    const rect = courtRef.current?.getBoundingClientRect();
    if (!rect) return;
    const m = pointToMeters(rect, e.clientX, e.clientY);
    const x = clamp(m.x + d.dx, 0.2, 8.8);
    const y = clamp(m.y + d.dy, 0.2, 9.55);
    dispatch({ type: 'DRAG_MOVE', role, x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
  }

  function dragEnd() {
    dragRef.current = null;
    dispatch({ type: 'DRAG_END' });
  }

  function nudge(role, e) {
    const step = e.shiftKey ? 0.5 : 0.15;
    let dx = 0, dy = 0;
    if (e.key === 'ArrowLeft') dx = -step; else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step; else if (e.key === 'ArrowDown') dy = step;
    else return;
    e.preventDefault();
    dispatch({ type: 'NUDGE', role, dx, dy });
  }

  function onServe() {
    const s = stateRef.current;
    if (s.served) { dispatch({ type: 'UNSERVE' }); return; }
    const v = validate(derivePlayers(s), s.serving);
    if (!v.legal) {
      dispatch({ type: 'SERVE_ILLEGAL' });
      clearTimeout(whistleTimer.current);
      whistleTimer.current = setTimeout(() => dispatch({ type: 'WHISTLE_OFF' }), 1400);
      return;
    }
    dispatch({ type: 'SERVE_LEGAL' });
    clearTimeout(releaseTimer.current);
    releaseTimer.current = setTimeout(() => dispatch({ type: 'RELEASE_END' }), 1100);
  }

  const actions = {
    applyRotation: n => dispatch({ type: 'APPLY_ROTATION', n }),
    setMode: mode => dispatch({ type: 'SET_MODE', mode }),
    setServing: serving => dispatch({ type: 'SET_SERVING', serving }),
    toggleWeb: () => dispatch({ type: 'TOGGLE_WEB' }),
    toggleGhosts: () => dispatch({ type: 'TOGGLE_GHOSTS' }),
    toggleRef: () => dispatch({ type: 'TOGGLE_REF' }),
    select: role => dispatch({ type: 'SELECT', role }),
    nextRotation: () => dispatch({ type: 'APPLY_ROTATION', n: state.rotation % 6 + 1 }),
    onReset: () => dispatch({ type: 'RESET' }),
    dragStart, dragMove, dragEnd, nudge, onServe,
  };

  // --- derived (pure, recomputed each render) ------------------------------
  const players = derivePlayers(state);
  const validation = validate(players, state.serving);
  const vioZones = new Set();
  validation.violations.forEach(v => { vioZones.add(v.a); vioZones.add(v.b); });
  const byZone = {};
  players.forEach(p => { byZone[p.zone] = p; });
  const ans = ANSWERS[state.rotation];
  const learnMatched = state.mode === 'learn' && !state.served && validation.legal && players.every(p => ans[p.role] && dist(p, ans[p.role]) < 0.9);
  const challenge = evaluateChallenge(players, validation, state.rotation);
  const challengeSuccess = state.mode === 'challenge' && challenge.success;
  const status = computeStatus(state, validation, { challengeSuccess, learnMatched });

  const derived = { players, validation, vioZones, byZone, ans, learnMatched, challenge, challengeSuccess, status };
  return { state, derived, actions, courtRef };
}
```

- [ ] **Step 2: Lint the new hook**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTrainer.js
git commit -m "$(printf 'refactor: add useTrainer hook (reducer + effects + handlers)\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 8: Court component subtree

**Files:**
- Create: `src/components/court/PlayerToken.jsx`
- Create: `src/components/court/ConstraintOverlay.jsx`
- Create: `src/components/court/Court.jsx`

**Interfaces:**
- `PlayerToken` props: `{ p, team, dragging, selected, violating, reduced, releasing, onDown, onMove, onUp, onKey }`. `p` is a derived player.
- `ConstraintOverlay` is a `forwardRef` component; props: `{ rotation, players, validation, mode, ghostsOn, served, webOn, serving, showZoneNumbers?=true, ghostOp?=0.6 }`; the forwarded ref attaches to its root `<svg>`.
- `Court` props: `{ state, derived, actions, courtRef }`.

- [ ] **Step 1: Create `src/components/court/PlayerToken.jsx`**

```jsx
import { PX, PY } from '../../domain/geometry.js';
import { ROLE_NAMES } from '../../domain/constants.js';
import { COLORS, FONTS } from '../../theme.js';

const SPRING = 'left .28s cubic-bezier(.34,1.56,.64,1), top .28s cubic-bezier(.34,1.56,.64,1), transform .18s ease, box-shadow .18s ease';
const RELEASE = 'left 1s cubic-bezier(.4,0,.2,1), top 1s cubic-bezier(.4,0,.2,1), transform .18s ease, box-shadow .18s ease';

export default function PlayerToken({ p, team, dragging, selected, violating, reduced, releasing, onDown, onMove, onUp, onKey }) {
  const left = (PX(p.x) / 960 * 100).toFixed(2);
  const top = (PY(p.y) / 1180 * 100).toFixed(2);

  const rings = [];
  if (violating) rings.push('0 0 0 3.5px ' + COLORS.red);
  else if (selected) rings.push('0 0 0 3px rgba(34,27,18,.45)');
  rings.push(dragging ? '0 12px 26px rgba(34,27,18,.45)' : '0 2px 6px rgba(34,27,18,.35)');

  let transition = 'none';
  if (!reduced && !dragging) transition = releasing ? RELEASE : SPRING;

  const aria = `${p.isLibero ? 'Libero' : ROLE_NAMES[p.role]}, zone ${p.zone}${p.isServer ? ', serving, exempt from overlap' : ''}. Use arrow keys to move.`;

  return (
    <div
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onKeyDown={onKey}
      tabIndex={0}
      role="button"
      aria-label={aria}
      style={{
        position: 'absolute', left: `${left}%`, top: `${top}%`,
        width: 'clamp(44px, 10.5%, 58px)', aspectRatio: '1',
        transform: `translate(-50%, -50%) scale(${dragging ? 1.08 : 1})`, transition,
        borderRadius: '50%', background: p.isLibero ? COLORS.cream : team, color: p.isLibero ? team : COLORS.cream,
        border: p.isServer ? '2.5px dashed rgba(34,27,18,.7)' : (p.isLibero ? `2.5px solid ${team}` : '2.5px solid rgba(246,241,230,.65)'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONTS.display, fontWeight: 700, fontSize: p.label.length > 2 ? '15px' : '19px', letterSpacing: '.5px',
        cursor: 'grab', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none',
        boxSizing: 'border-box', boxShadow: rings.join(', '), zIndex: dragging ? 20 : 5, outline: 'none',
      }}
    >{p.label}</div>
  );
}
```

- [ ] **Step 2: Create `src/components/court/ConstraintOverlay.jsx`**

This reproduces the old `overlayEls` output as JSX. Build an `els` array and render it inside the `<svg>`.

```jsx
import { forwardRef } from 'react';
import { PX, PY } from '../../domain/geometry.js';
import { PAIRS } from '../../domain/constants.js';
import { ANSWERS } from '../../domain/formations.js';
import { COLORS } from '../../theme.js';

const ZONE_LABEL_POS = { 4: [180, 335], 3: [480, 335], 2: [780, 335], 5: [180, 790], 6: [480, 790], 1: [780, 790] };

const ConstraintOverlay = forwardRef(function ConstraintOverlay(
  { rotation, players, validation, mode, ghostsOn, served, webOn, serving, showZoneNumbers = true, ghostOp = 0.6 },
  ref,
) {
  const byZone = {};
  players.forEach(p => { byZone[p.zone] = p; });
  const vioSet = new Set(validation.violations.map(v => v.a + '-' + v.b));
  const els = [];

  // faint zone numbers
  if (showZoneNumbers) {
    for (const z in ZONE_LABEL_POS) {
      const [x, y] = ZONE_LABEL_POS[z];
      els.push(<text key={'zn' + z} x={x} y={y} textAnchor="middle" fontFamily="Saira Condensed" fontWeight={700} fontSize={120} fill="rgba(34,27,18,.13)">{z}</text>);
    }
  }

  // ghost markers + setter release arrow (Learn only)
  if (mode === 'learn' && ghostsOn && !served) {
    const ans = ANSWERS[rotation];
    players.forEach(p => {
      const a = ans[p.role];
      if (!a) return;
      const gx = PX(a[0]), gy = PY(a[1]);
      els.push(
        <g key={'g' + p.role} opacity={ghostOp}>
          <circle cx={gx} cy={gy} r={34} fill="rgba(246,241,230,.14)" stroke={COLORS.cream} strokeWidth={3} strokeDasharray="7 6" />
          <text x={gx} y={gy + 7} textAnchor="middle" fontFamily="Saira Condensed" fontWeight={700} fontSize={p.label.length > 2 ? 20 : 25} fill={COLORS.cream}>{p.label}</text>
        </g>,
      );
    });
    const sa = ans.S;
    if (sa) {
      const sx0 = PX(sa[0]), sy0 = PY(sa[1]), tx = PX(6.4), ty = PY(1.0);
      const cx = (sx0 + tx) / 2, cy = Math.min(sy0, ty) - 110;
      const a0 = Math.atan2(cy - sy0, cx - sx0);
      const sx = sx0 + 39 * Math.cos(a0), sy = sy0 + 39 * Math.sin(a0);
      const ang = Math.atan2(ty - cy, tx - cx);
      const bx = tx - 20 * Math.cos(ang), by = ty - 20 * Math.sin(ang);
      const ah = [[tx, ty], [tx - 24 * Math.cos(ang - 0.38), ty - 24 * Math.sin(ang - 0.38)], [tx - 24 * Math.cos(ang + 0.38), ty - 24 * Math.sin(ang + 0.38)]];
      els.push(
        <g key="arrow" opacity={ghostOp}>
          <path d={`M${sx.toFixed(1)} ${sy.toFixed(1)} Q${cx} ${cy} ${bx.toFixed(1)} ${by.toFixed(1)}`} fill="none" stroke={COLORS.cream} strokeWidth={3.5} strokeDasharray="9 8" />
          <polygon points={ah.map(p2 => p2.map(n => n.toFixed(1)).join(',')).join(' ')} fill={COLORS.cream} />
        </g>,
      );
    }
  }

  // constraint web lines + violation pills
  let pillIdx = 0;
  for (const [a, b] of PAIRS) {
    const A = byZone[a], B = byZone[b];
    if (!A || !B) continue;
    const x1 = PX(A.x), y1 = PY(A.y), x2 = PX(B.x), y2 = PY(B.y);
    const exempt = serving;
    const violated = vioSet.has(a + '-' + b);
    if (violated) {
      els.push(<line key={'w' + a + b} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS.red} strokeWidth={7} strokeLinecap="round" />);
    } else if (webOn && !served) {
      els.push(<line key={'w' + a + b} x1={x1} y1={y1} x2={x2} y2={y2} stroke={exempt ? 'rgba(34,27,18,.16)' : 'rgba(34,27,18,.30)'} strokeWidth={2} strokeDasharray={exempt ? '3 9' : 'none'} />);
    }
    if (violated) {
      const v = validation.violations.find(v2 => v2.a === a && v2.b === b);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + (pillIdx % 2 === 0 ? -34 : 40);
      const w = v.short.length * 9.6 + 30;
      els.push(
        <g key={'p' + a + b}>
          <rect x={mx - w / 2} y={my - 17} width={w} height={34} rx={17} fill={COLORS.red} />
          <text x={mx} y={my + 6} textAnchor="middle" fontFamily="IBM Plex Sans" fontWeight={600} fontSize={17.5} fill={COLORS.cream}>{v.short}</text>
        </g>,
      );
      pillIdx++;
    }
  }

  return (
    <svg viewBox="0 0 960 1180" ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {els}
    </svg>
  );
});

export default ConstraintOverlay;
```

- [ ] **Step 3: Create `src/components/court/Court.jsx`**

```jsx
import PlayerToken from './PlayerToken.jsx';
import ConstraintOverlay from './ConstraintOverlay.jsx';
import { COLORS, FONTS } from '../../theme.js';

function CourtSurface() {
  return (
    <svg viewBox="0 0 960 1180" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}>
      <rect x="0" y="0" width="960" height="1180" fill={COLORS.court} />
      <rect x="30" y="30" width="900" height="140" fill={COLORS.courtBack} stroke={COLORS.cream} strokeWidth="5" />
      <rect x="30" y="170" width="900" height="900" fill={COLORS.courtFront} stroke={COLORS.cream} strokeWidth="6" />
      <line x1="30" y1="470" x2="930" y2="470" stroke={COLORS.cream} strokeWidth="5" />
      <line x1="8" y1="170" x2="952" y2="170" stroke={COLORS.ink} strokeWidth="12" />
      <line x1="8" y1="158" x2="952" y2="158" stroke="rgba(34,27,18,.35)" strokeWidth="3" />
      <text x="940" y="452" textAnchor="end" fontFamily="IBM Plex Sans" fontSize="24" fill="rgba(34,27,18,.45)">3 m</text>
    </svg>
  );
}

export default function Court({ state, derived, actions, courtRef }) {
  const team = COLORS.navy;
  const { players, validation, vioZones, status } = derived;
  const n = validation.violations.length;
  const ariaLive = validation.legal
    ? 'Formation legal.'
    : `${n} fault${n === 1 ? '' : 's'}: ` + validation.violations.map(v => v.msg).join('; ');

  return (
    <div style={{ flex: '1 1 480px', minWidth: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, boxSizing: 'border-box' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 'min(880px, calc((100dvh - 24px) * 0.8135))', aspectRatio: '960 / 1180' }}>
        <CourtSurface />
        <ConstraintOverlay
          ref={courtRef}
          rotation={state.rotation}
          players={players}
          validation={validation}
          mode={state.mode}
          ghostsOn={state.ghostsOn}
          served={state.served}
          webOn={state.webOn}
          serving={state.serving}
        />
        {players.map(p => (
          <PlayerToken
            key={p.role}
            p={p}
            team={team}
            dragging={state.draggingRole === p.role}
            selected={state.selected === p.role}
            violating={vioZones.has(p.zone)}
            reduced={state.reduced}
            releasing={state.releasing}
            onDown={e => actions.dragStart(p.role, e)}
            onMove={e => actions.dragMove(p.role, e)}
            onUp={() => actions.dragEnd(p.role)}
            onKey={e => actions.nudge(p.role, e)}
          />
        ))}
        <div style={{ position: 'absolute', top: '1.6%', left: '2.8%', padding: '5px 12px', borderRadius: 14, background: status.chipBg, color: COLORS.cream, fontFamily: FONTS.display, fontWeight: 700, fontSize: 'clamp(11px, 2.4vw, 15px)', letterSpacing: '.8px', textTransform: 'uppercase', pointerEvents: 'none' }}>{status.chipText}</div>
        <div style={{ position: 'absolute', top: '1.6%', right: '2.8%', padding: '5px 12px', borderRadius: 14, background: 'rgba(34,27,18,.72)', color: COLORS.cream, fontSize: 'clamp(10px, 2vw, 12.5px)', fontWeight: 500, pointerEvents: 'none' }}>{state.serving ? 'our serve,  overlap off' : 'serve incoming ●'}</div>
        {state.whistle && (
          <div style={{ position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%, -50%)', background: COLORS.red, color: COLORS.cream, fontFamily: FONTS.display, fontWeight: 800, fontSize: 'clamp(18px, 4vw, 30px)', letterSpacing: 1, textTransform: 'uppercase', padding: '14px 26px', borderRadius: 10, animation: 'flashIn 1.4s forwards', pointerEvents: 'none', whiteSpace: 'nowrap' }}>Whistle,  fault at contact</div>
        )}
        <div aria-live="polite" style={{ position: 'absolute', left: -9999, top: 0 }}>{ariaLive}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/court/PlayerToken.jsx src/components/court/ConstraintOverlay.jsx src/components/court/Court.jsx
git commit -m "$(printf 'refactor: extract Court, PlayerToken, ConstraintOverlay components\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 9: Rail component subtree + rule reference modal

**Files:**
- Create: `src/components/rail/RotationPicker.jsx`
- Create: `src/components/rail/ModePanel.jsx`
- Create: `src/components/rail/ChallengePanel.jsx`
- Create: `src/components/rail/StatusPanel.jsx`
- Create: `src/components/rail/SelectionCard.jsx`
- Create: `src/components/rail/ActionBar.jsx`
- Create: `src/components/rail/Rail.jsx`
- Create: `src/components/RuleReferenceModal.jsx`

**Interfaces:**
- `RotationPicker` props: `{ rotation, onPick, team }`.
- `ModePanel` props: `{ state, actions }` (uses `state.mode/serving/webOn/ghostsOn/rotation`; calls `setMode/setServing/toggleWeb/toggleGhosts`; needs coach note + mode description).
- `ChallengePanel` props: `{ rotation, challenge, challengeSuccess, onNext }`.
- `StatusPanel` props: `{ status, violations }` (`violations` is `validation.violations`).
- `SelectionCard` props: `{ selected, players, byZone, serving, team }`.
- `ActionBar` props: `{ served, onServe, onReset }`.
- `Rail` props: `{ state, derived, actions }`.
- `RuleReferenceModal` props: `{ onClose }`.

- [ ] **Step 1: Create `src/components/rail/RotationPicker.jsx`**

```jsx
import { COLORS, FONTS } from '../../theme.js';

export default function RotationPicker({ rotation, onPick, team }) {
  return (
    <div style={{ borderTop: '1px solid rgba(34,27,18,.16)', padding: '10px 0 2px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(34,27,18,.6)', marginBottom: 8 }}>Rotation,  setter's zone</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4, 5, 6].map(n => {
          const active = n === rotation;
          return (
            <button key={n} onClick={() => onPick(n)} style={{ flex: 1, height: 40, borderRadius: 6, border: active ? `1.5px solid ${team}` : '1.5px solid rgba(34,27,18,.25)', background: active ? team : '#fff', color: active ? COLORS.cream : COLORS.ink, fontFamily: FONTS.display, fontWeight: 700, fontSize: 18, cursor: 'pointer', padding: 0 }}>{n}</button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/rail/ModePanel.jsx`**

```jsx
import { COACH_NOTES } from '../../domain/formations.js';
import { COLORS, FONTS } from '../../theme.js';

const MODES = [['learn', 'Learn'], ['challenge', 'Challenge'], ['sandbox', 'Sandbox']];
const MODE_DESCS = {
  learn: "Ghost markers show the coach's answer for this rotation. Drag players onto them,  ghosts are guidance, not snap targets.",
  challenge: 'No ghosts. Build a legal serve receive: three passers seamed, setter ready to release.',
  sandbox: 'Free play. Toggle who serves, watch the constraint web react live.',
};
const toggleStyle = (on) => ({ flex: 1, minWidth: 110, height: 30, borderRadius: 6, border: '1px solid rgba(34,27,18,.3)', background: on ? COLORS.ink : '#fff', color: on ? COLORS.cream : COLORS.ink, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 });
const pillStyle = (active) => ({ flex: 1, height: 32, borderRadius: 6, border: '1.5px solid rgba(34,27,18,.3)', background: active ? COLORS.ink : '#fff', color: active ? COLORS.cream : COLORS.ink, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: 0 });

export default function ModePanel({ state, actions }) {
  const isLearn = state.mode === 'learn';
  const isSandbox = state.mode === 'sandbox';
  return (
    <div style={{ borderTop: '1px solid rgba(34,27,18,.16)', padding: '10px 0 2px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {MODES.map(([id, label]) => {
          const active = state.mode === id;
          return (
            <button key={id} onClick={() => actions.setMode(id)} style={{ flex: 1, height: 36, borderRadius: 6, border: active ? '1.5px solid #221B12' : '1.5px solid rgba(34,27,18,.25)', background: active ? COLORS.ink : '#fff', color: active ? COLORS.cream : COLORS.ink, fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, letterSpacing: '.5px', textTransform: 'uppercase', cursor: 'pointer', padding: 0 }}>{label}</button>
          );
        })}
      </div>
      <div style={{ fontSize: 12.5, lineHeight: 1.45, color: 'rgba(34,27,18,.7)' }}>{MODE_DESCS[state.mode]}</div>
      {isLearn && (
        <div style={{ fontSize: 13, lineHeight: 1.5, borderTop: '1px solid rgba(34,27,18,.12)', paddingTop: 8 }}><b>Coach:</b> {COACH_NOTES[state.rotation]}</div>
      )}
      {isSandbox && (
        <div style={{ display: 'flex', gap: 6, borderTop: '1px solid rgba(34,27,18,.12)', paddingTop: 8 }}>
          <button onClick={() => actions.setServing(false)} style={pillStyle(!state.serving)}>We receive</button>
          <button onClick={() => actions.setServing(true)} style={pillStyle(state.serving)}>We serve</button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={actions.toggleWeb} style={toggleStyle(state.webOn)}>Constraint web: {state.webOn ? 'ON' : 'OFF'}</button>
        {isLearn && (
          <button onClick={actions.toggleGhosts} style={toggleStyle(state.ghostsOn)}>Ghosts: {state.ghostsOn ? 'ON' : 'OFF'}</button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/rail/ChallengePanel.jsx`**

```jsx
import { COLORS, FONTS } from '../../theme.js';

export default function ChallengePanel({ rotation, challenge, challengeSuccess, onNext }) {
  return (
    <div style={{ borderTop: '1px solid rgba(34,27,18,.16)', padding: '10px 0 2px', display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ fontSize: 13.5, fontWeight: 600 }}>Set up serve receive for rotation {rotation}.</div>
      {challenge.checks.map((c, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, alignItems: 'baseline' }}>
          <span style={{ fontWeight: 700, color: c.ok ? COLORS.green : 'rgba(34,27,18,.35)', width: 14, flex: 'none' }}>{c.ok ? '✓' : '·'}</span>
          <span style={{ color: c.ok ? COLORS.ink : 'rgba(34,27,18,.55)' }}>{c.label}</span>
        </div>
      ))}
      {challengeSuccess && (
        <div style={{ borderTop: '1px solid rgba(34,27,18,.12)', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: COLORS.green, fontWeight: 500 }}>{challenge.insight}</div>
          <button onClick={onNext} style={{ height: 34, borderRadius: 6, border: 'none', background: COLORS.green, color: COLORS.cream, fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, letterSpacing: '.5px', textTransform: 'uppercase', cursor: 'pointer' }}>Next rotation →</button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/rail/StatusPanel.jsx`**

```jsx
import { COLORS, FONTS } from '../../theme.js';

export default function StatusPanel({ status, violations }) {
  return (
    <div style={{ borderTop: '1px solid rgba(34,27,18,.16)', padding: '10px 0 2px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 17, letterSpacing: '.5px', textTransform: 'uppercase', color: status.color }}>{status.head}</div>
      {violations.map((v, i) => (
        <div key={i} style={{ fontSize: 12.5, lineHeight: 1.45, color: COLORS.red, borderLeft: `3px solid ${COLORS.red}`, paddingLeft: 8 }}>{v.msg}</div>
      ))}
      <div style={{ fontSize: 12, color: 'rgba(34,27,18,.55)', lineHeight: 1.45 }}>{status.hint}</div>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/rail/SelectionCard.jsx`**

```jsx
import { ROLE_NAMES } from '../../domain/constants.js';
import { constraintsForZone } from '../../domain/rules.js';
import { COLORS, FONTS } from '../../theme.js';

export default function SelectionCard({ selected, players, byZone, serving, team }) {
  const sel = players.find(p => p.role === selected);
  if (!sel) return null;

  let constraints;
  if (sel.isServer) constraints = [{ txt: 'Server,  exempt from all overlap constraints until contact.' }];
  else if (serving) constraints = [{ txt: 'Our serve,  no overlap constraints apply. Stand anywhere.' }];
  else constraints = constraintsForZone(sel.zone, byZone);

  const name = sel.isLibero ? `Libero (in for ${ROLE_NAMES[sel.role]})` : ROLE_NAMES[sel.role];
  const zoneText = `Zone ${sel.zone} · ${sel.back ? 'back row,  no blocking, attack from behind 3 m' : 'front row'}`;

  return (
    <div style={{ borderTop: '1px solid rgba(34,27,18,.16)', padding: '10px 0 2px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: sel.isLibero ? COLORS.cream : team, color: sel.isLibero ? team : COLORS.cream, border: sel.isLibero ? `2px solid ${team}` : '2px solid rgba(246,241,230,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, boxSizing: 'border-box', flex: 'none' }}>{sel.label}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
          <div style={{ fontSize: 12, color: 'rgba(34,27,18,.6)' }}>{zoneText}</div>
        </div>
      </div>
      {constraints.map((c, i) => (
        <div key={i} style={{ fontSize: 12.5, lineHeight: 1.4, color: 'rgba(34,27,18,.8)' }}>· {c.txt}</div>
      ))}
      <div style={{ fontSize: 11.5, color: 'rgba(34,27,18,.5)' }}>Arrow keys nudge · Shift+arrows for big steps</div>
    </div>
  );
}
```

- [ ] **Step 6: Create `src/components/rail/ActionBar.jsx`**

```jsx
import { COLORS, FONTS } from '../../theme.js';

export default function ActionBar({ served, onServe, onReset }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid rgba(34,27,18,.16)' }}>
      <button onClick={onServe} style={{ flex: 2, height: 48, borderRadius: 8, border: 'none', background: COLORS.navy, color: COLORS.cream, fontFamily: FONTS.display, fontWeight: 800, fontSize: 21, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer' }}>{served ? 'Back to receive' : 'Serve!'}</button>
      <button onClick={onReset} style={{ flex: 1, height: 48, borderRadius: 8, border: '1.5px solid rgba(34,27,18,.35)', background: COLORS.cream, color: COLORS.ink, fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, letterSpacing: '.5px', textTransform: 'uppercase', cursor: 'pointer' }}>Reset</button>
    </div>
  );
}
```

- [ ] **Step 7: Create `src/components/RuleReferenceModal.jsx`**

```jsx
import { COLORS, FONTS } from '../theme.js';

export default function RuleReferenceModal({ onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(34,27,18,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: COLORS.cream, borderRadius: 10, maxWidth: 440, width: '100%', maxHeight: '85vh', overflow: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 24, textTransform: 'uppercase', letterSpacing: '.5px' }}>The overlap rule</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>At the instant of serve contact, only <b>7 pairs</b> of neighbors constrain each other. No diagonals. Nobody else.</div>
        <div style={{ fontSize: 13, lineHeight: 1.7, background: '#fff', border: '1px solid rgba(34,27,18,.12)', borderRadius: 6, padding: '10px 14px' }}><b>Side to side:</b> 4–3 · 3–2 · 5–6 · 6–1<br /><b>Front to back:</b> 4–5 · 3–6 · 2–1</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
          1. Judged by <b>feet</b> at the instant of contact.<br />
          2. Relative to <b>where teammates stand</b>, not floor spots.<br />
          3. The <b>server is exempt</b>,  nobody aligns with them.<br />
          4. One instant after contact, <b>everyone is free</b>.
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(34,27,18,.65)' }}>Back row: no blocking; attack above the net only from behind the 3 m line. Burn in: <i>neighbors only, feet only, contact only.</i></div>
        <button onClick={onClose} style={{ height: 36, borderRadius: 6, border: 'none', background: COLORS.navy, color: COLORS.cream, fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: '.5px', cursor: 'pointer' }}>Got it</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Create `src/components/rail/Rail.jsx`**

```jsx
import RotationPicker from './RotationPicker.jsx';
import ModePanel from './ModePanel.jsx';
import ChallengePanel from './ChallengePanel.jsx';
import StatusPanel from './StatusPanel.jsx';
import SelectionCard from './SelectionCard.jsx';
import ActionBar from './ActionBar.jsx';
import { COLORS, FONTS } from '../../theme.js';

export default function Rail({ state, derived, actions }) {
  const team = COLORS.navy;
  return (
    <div style={{ flex: '1 1 272px', maxWidth: 340, minWidth: 260, height: '100%', overflowY: 'auto', boxSizing: 'border-box', background: COLORS.cream, borderLeft: '1px solid rgba(34,27,18,.16)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 24, lineHeight: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Spike &amp; Learn</div>
          <div style={{ fontSize: 11.5, color: 'rgba(34,27,18,.65)', fontWeight: 500, marginTop: 4 }}>5-1 rotation trainer · where can you stand at serve contact?</div>
        </div>
        <button onClick={actions.toggleRef} aria-label="Rule reference" style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid rgba(34,27,18,.4)', background: 'none', color: COLORS.ink, fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, cursor: 'pointer', flex: 'none', padding: 0 }}>?</button>
      </div>

      <RotationPicker rotation={state.rotation} onPick={actions.applyRotation} team={team} />
      <ModePanel state={state} actions={actions} />
      {state.mode === 'challenge' && (
        <ChallengePanel rotation={state.rotation} challenge={derived.challenge} challengeSuccess={derived.challengeSuccess} onNext={actions.nextRotation} />
      )}
      <StatusPanel status={derived.status} violations={derived.validation.violations} />
      <SelectionCard selected={state.selected} players={derived.players} byZone={derived.byZone} serving={state.serving} team={team} />
      <ActionBar served={state.served} onServe={actions.onServe} onReset={actions.onReset} />
    </div>
  );
}
```

- [ ] **Step 9: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add src/components/rail src/components/RuleReferenceModal.jsx
git commit -m "$(printf 'refactor: extract rail panels + rule reference modal\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 10: Thin App wiring + render smoke test + full verification

**Files:**
- Modify: `src/App.jsx` (replace the entire class component with the thin composition)
- Create: `src/App.render.test.jsx`

**Interfaces:**
- Consumes: `useTrainer`, `Court`, `Rail`, `RuleReferenceModal`.
- Produces: default-exported `App` component.

- [ ] **Step 1: Replace `src/App.jsx` with the thin composition**

```jsx
import { useTrainer } from './hooks/useTrainer.js';
import Court from './components/court/Court.jsx';
import Rail from './components/rail/Rail.jsx';
import RuleReferenceModal from './components/RuleReferenceModal.jsx';

export default function App() {
  const { state, derived, actions, courtRef } = useTrainer();
  return (
    <div style={{ height: '100dvh', display: 'flex', flexWrap: 'wrap', overflow: 'auto' }}>
      <Court state={state} derived={derived} actions={actions} courtRef={courtRef} />
      <Rail state={state} derived={derived} actions={actions} />
      {state.showRef && <RuleReferenceModal onClose={actions.toggleRef} />}
    </div>
  );
}
```

- [ ] **Step 2: Write the render smoke test `src/App.render.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import App from './App.jsx';

// renderToStaticMarkup does not run effects, so matchMedia/location are never touched.
// This exercises the full component tree + all derived domain calls for the default state.
describe('App', () => {
  it('renders the trainer without throwing', () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain('Spike');
    expect(html).toContain('Rotation'); // rail rendered
    expect(html).toContain('viewBox="0 0 960 1180"'); // court + overlay svgs rendered
  });
});
```

- [ ] **Step 3: Run the full test suite**

Run: `npm run test`
Expected: PASS,  all domain tests, the reducer test, and the App render test are green.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: succeeds (a Node-version warning from Vite is acceptable; "✓ built" must appear).

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/App.render.test.jsx
git commit -m "$(printf 'refactor: thin App wiring over useTrainer + render smoke test\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

- [ ] **Step 7: Final manual verification (optional but recommended)**

Run: `npm run dev` and click through: switch rotations 1–6, switch Learn/Challenge/Sandbox, drag a player to create a fault (red web + pill + whistle on Serve!), press Serve! on a legal formation (release animation), toggle the web/ghosts, open the rule modal, use arrow keys to nudge a selected player. Confirm behavior matches the pre-refactor app. Stop the dev server when done.

---

## Notes for the implementer

- **Import extension:** always import local modules with the explicit `.js`/`.jsx` extension, matching the examples.
- **Do not add** a shared Button/Chip/Panel component library,  inline styles stay; only `COLORS`/`FONTS` are shared.
- **rgba(34,27,18,.XX)** ink-with-alpha strings are intentionally left inline (they are not tokens). Copy them exactly.
- **The Tailwind config files** (`tailwind.config.js`, `postcss.config.js`) are unused but out of scope,  leave them.
- If any domain unit test fails after a verbatim copy, the copy is wrong,  diff against `src/App.jsx` at commit `70d6ecc`, do not "fix" the expectation.
