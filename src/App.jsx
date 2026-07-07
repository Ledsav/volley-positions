import React from 'react';

// ── Defaults (were Claude Design props) ──────────────────────────────────────
const DEFAULTS = {
  teamColor: '#24406B',
  showZoneNumbers: true,
  ghostOpacity: 0.6,
};

const ROLES = ['S', 'OH1', 'MB1', 'OPP', 'OH2', 'MB2'];
const Z0 = { S: 1, OH1: 2, MB1: 3, OPP: 4, OH2: 5, MB2: 6 };
const ROLE_NAMES = { S: 'Setter', OH1: 'Outside hitter 1', MB1: 'Middle blocker 1', OPP: 'Opposite', OH2: 'Outside hitter 2', MB2: 'Middle blocker 2' };
const ZONE_BASE = { 1: [7.5, 6.6], 2: [7.5, 1.6], 3: [4.5, 1.6], 4: [1.5, 1.6], 5: [1.5, 6.6], 6: [4.5, 6.6] };
// [zoneA, zoneB, axis] — lateral: A must be left of B; depth: A (front) must be in front of B (back)
const PAIRS = [[4, 3, 'lat'], [3, 2, 'lat'], [5, 6, 'lat'], [6, 1, 'lat'], [4, 5, 'dep'], [3, 6, 'dep'], [2, 1, 'dep']];
// Coach's-answer serve-receive formations (meters: x 0-9 left→right, y 0-9 net→endline), digitized from the reference diagrams
const ANSWERS = {
  1: { OPP: [1.2, 1.7], MB1: [4.2, 1.7], OH2: [1.5, 6.4], MB2: [4.1, 6.9], OH1: [6.6, 6.0], S: [8.0, 7.5] },
  2: { OPP: [4.2, 1.7], MB1: [6.6, 1.7], S: [5.1, 3.9], OH2: [1.4, 5.9], MB2: [3.5, 6.9], OH1: [6.9, 6.6] },
  3: { MB2: [1.2, 1.7], OPP: [6.6, 1.7], S: [0.6, 4.5], OH2: [2.6, 5.8], OH1: [4.5, 6.9], MB1: [7.1, 6.4] },
  4: { S: [0.6, 1.5], MB2: [3.9, 2.4], OH1: [0.9, 5.4], MB1: [3.8, 6.6], OH2: [6.6, 6.0], OPP: [7.8, 7.9] },
  5: { S: [4.7, 1.8], MB2: [7.1, 1.7], OPP: [4.8, 4.3], OH1: [1.4, 5.8], MB1: [3.3, 7.2], OH2: [6.9, 6.4] },
  6: { MB1: [1.2, 1.7], S: [7.1, 1.7], OH1: [2.9, 5.6], OH2: [4.7, 6.9], MB2: [7.1, 6.6], OPP: [0.6, 7.9] },
};
const COACH_NOTES = {
  1: "Setter starts back right (zone 1). Slide straight up the right sideline behind OH1, release to target on contact. Easy.",
  2: "Setter in zone 6. Creep up center behind the OPP — short diagonal release. Easy.",
  3: "Setter in zone 5. The full diagonal sprint across the court. Hard — drill this one twice as much.",
  4: "Setter in zone 4. The stack: press against the net far left, dash along it to target. Hardest rotation in the book.",
  5: "Setter in zone 3. One step to the right and you're at target. The OPP hides behind you — mid tuck or deep corner both legal.",
  6: "Setter in zone 2. Already standing at the target. Easiest — enjoy it.",
};
const zoneOf = (role, rot) => ((Z0[role] - rot + 6) % 6) + 1;
const PX = x => 30 + x * 100, PY = y => 170 + y * 100;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (p, q) => Math.hypot(p.x - q[0], p.y - q[1]);

const RulesEngine = {
  validate(players, serving) {
    if (serving) return { legal: true, violations: [] }; // our serve — no position check
    const byZone = {};
    players.forEach(p => { byZone[p.zone] = p; });
    const violations = [];
    for (const [a, b, axis] of PAIRS) {
      if (serving && (a === 1 || b === 1)) continue;
      const A = byZone[a], B = byZone[b];
      if (!A || !B) continue;
      if (axis === 'lat' && A.x >= B.x) violations.push({ a, b, axis, msg: `${A.label} (zone ${a}) must stay to the left of ${B.label} (zone ${b})`, short: `${A.label} left of ${B.label}` });
      if (axis === 'dep' && A.y >= B.y) violations.push({ a, b, axis, msg: `${A.label} (zone ${a}) must stay in front of ${B.label} (zone ${b})`, short: `${A.label} in front of ${B.label}` });
    }
    return { legal: violations.length === 0, violations };
  },
};

class SpikeAndLearn extends React.Component {
  state = {
    rotation: 1, mode: 'learn', serving: false, webOn: true, ghostsOn: true,
    positions: this.basePositions(1, false),
    selected: null, draggingRole: null, served: false, preServe: null,
    whistle: false, showRef: false, reduced: false,
  };
  _h = {};
  courtRef = React.createRef();

  basePositions(rot, serving) {
    const pos = {};
    ROLES.forEach(role => {
      const z = zoneOf(role, rot);
      let [x, y] = ZONE_BASE[z];
      if (serving && z === 1) { x = 8.0; y = 9.35; }
      pos[role] = { x, y };
    });
    return pos;
  }

  playersOf(s) {
    return ROLES.map(role => {
      const zone = zoneOf(role, s.rotation);
      const back = zone === 5 || zone === 6 || zone === 1;
      const isLibero = (role === 'MB1' || role === 'MB2') && back && !(s.serving && zone === 1);
      const p = s.positions[role];
      return { role, zone, back, isLibero, label: isLibero ? 'L' : role, x: p.x, y: p.y, isServer: s.serving && zone === 1 };
    });
  }

  pointToMeters(e) {
    const el = this.courtRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width * 960 - 30) / 100,
      y: ((e.clientY - r.top) / r.height * 1180 - 170) / 100,
    };
  }

  getH(role) {
    if (!this._h[role]) {
      this._h[role] = {
        down: e => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          const m = this.pointToMeters(e);
          if (!m) return;
          const p = this.state.positions[role];
          this._drag = { role, dx: p.x - m.x, dy: p.y - m.y };
          this.setState({ draggingRole: role, selected: role });
        },
        move: e => {
          if (!this._drag || this._drag.role !== role) return;
          const m = this.pointToMeters(e);
          if (!m) return;
          const x = clamp(m.x + this._drag.dx, 0.2, 8.8);
          const y = clamp(m.y + this._drag.dy, 0.2, 9.55);
          this.setState(s => ({ positions: { ...s.positions, [role]: { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 } } }));
        },
        up: () => { this._drag = null; this.setState({ draggingRole: null }); },
        key: e => {
          const step = e.shiftKey ? 0.5 : 0.15;
          let dx = 0, dy = 0;
          if (e.key === 'ArrowLeft') dx = -step; else if (e.key === 'ArrowRight') dx = step;
          else if (e.key === 'ArrowUp') dy = -step; else if (e.key === 'ArrowDown') dy = step;
          else return;
          e.preventDefault();
          this.setState(s => {
            const p = s.positions[role];
            return { selected: role, positions: { ...s.positions, [role]: { x: clamp(p.x + dx, 0.2, 8.8), y: clamp(p.y + dy, 0.2, 9.55) } } };
          });
        },
      };
    }
    return this._h[role];
  }

  componentDidMount() {
    try {
      const q = new URLSearchParams(location.search);
      const rot = parseInt(q.get('rotation'), 10);
      const mode = q.get('mode');
      const patch = {};
      if (rot >= 1 && rot <= 6) { patch.rotation = rot; patch.positions = this.basePositions(rot, false); }
      if (['learn', 'challenge', 'sandbox'].includes(mode)) { patch.mode = mode; patch.webOn = mode !== 'challenge'; }
      if (Object.keys(patch).length) this.setState(patch);
    } catch { /* ignore malformed URL params */ }
    this._mq = matchMedia('(prefers-reduced-motion: reduce)');
    this._mqFn = () => this.setState({ reduced: this._mq.matches });
    this._mq.addEventListener('change', this._mqFn);
    if (this._mq.matches) this.setState({ reduced: true });
  }
  componentWillUnmount() { if (this._mq) this._mq.removeEventListener('change', this._mqFn); }

  syncUrl() {
    try {
      const u = new URL(location.href);
      u.searchParams.set('rotation', this.state.rotation);
      u.searchParams.set('mode', this.state.mode);
      history.replaceState({}, '', u);
    } catch { /* ignore history/URL errors */ }
  }

  applyRotation(rot) {
    this.setState(s => ({ rotation: rot, positions: this.basePositions(rot, s.serving), served: false, preServe: null, selected: null }), () => this.syncUrl());
  }
  setMode(mode) {
    this.setState({ mode, serving: false, webOn: mode !== 'challenge', ghostsOn: true, served: false, preServe: null, selected: null, positions: this.basePositions(this.state.rotation, false) }, () => this.syncUrl());
  }
  setServing(serving) {
    this.setState(s => ({ serving, served: false, preServe: null, positions: this.basePositions(s.rotation, serving) }));
  }

  releaseTargets(s) {
    const pos = {};
    const players = this.playersOf(s);
    const liberoBack = s.serving && players.some(p => p.isLibero);
    players.forEach(p => {
      const front = !p.back;
      if (p.role === 'S') pos.S = { x: 6.8, y: 1.0 };
      else if (p.role === 'OPP') pos.OPP = front ? { x: 8.2, y: 1.6 } : { x: 7.6, y: 6.6 };
      else if (p.role === 'OH1' || p.role === 'OH2') {
        // in defense (our serve) the libero takes zone 5, so the back-row OH covers middle back
        pos[p.role] = front ? { x: 0.9, y: 1.5 } : (liberoBack ? { x: 4.6, y: 6.6 } : { x: 1.4, y: 6.1 });
      }
      else pos[p.role] = front ? { x: 4.5, y: 0.9 } : (p.isLibero && s.serving ? { x: 1.4, y: 6.3 } : { x: 4.6, y: 6.9 });
    });
    return pos;
  }

  onServe() {
    const s = this.state;
    if (s.served) { this.setState({ positions: s.preServe || this.basePositions(s.rotation, s.serving), served: false, preServe: null }); return; }
    const v = RulesEngine.validate(this.playersOf(s), s.serving);
    if (!v.legal) {
      this.setState({ whistle: true });
      clearTimeout(this._wt);
      this._wt = setTimeout(() => this.setState({ whistle: false }), 1400);
      return;
    }
    this.setState({ preServe: { ...s.positions }, served: true, positions: this.releaseTargets(s), releasing: true });
    clearTimeout(this._rt);
    this._rt = setTimeout(() => this.setState({ releasing: false }), 1100);
  }

  overlayEls(players, validation, s, team, ghostOp) {
    const els = [];
    const h = React.createElement;
    const byZone = {}; players.forEach(p => { byZone[p.zone] = p; });
    if (this.props.showZoneNumbers ?? DEFAULTS.showZoneNumbers) {
      const ZC = { 4: [180, 335], 3: [480, 335], 2: [780, 335], 5: [180, 790], 6: [480, 790], 1: [780, 790] };
      for (const z in ZC) els.push(h('text', { key: 'zn' + z, x: ZC[z][0], y: ZC[z][1], textAnchor: 'middle', fontFamily: 'Saira Condensed', fontWeight: 700, fontSize: 120, fill: 'rgba(34,27,18,.13)' }, z));
    }
    // ghosts (Learn)
    if (s.mode === 'learn' && s.ghostsOn && !s.served) {
      const ans = ANSWERS[s.rotation];
      players.forEach(p => {
        const a = ans[p.role]; if (!a) return;
        const gx = PX(a[0]), gy = PY(a[1]);
        els.push(h('g', { key: 'g' + p.role, opacity: ghostOp },
          h('circle', { cx: gx, cy: gy, r: 34, fill: 'rgba(246,241,230,.14)', stroke: '#F6F1E6', strokeWidth: 3, strokeDasharray: '7 6' }),
          h('text', { x: gx, y: gy + 7, textAnchor: 'middle', fontFamily: 'Saira Condensed', fontWeight: 700, fontSize: p.label.length > 2 ? 20 : 25, fill: '#F6F1E6' }, p.label)
        ));
      });
      // setter release arrow
      const sa = ans.S;
      if (sa) {
        const sx0 = PX(sa[0]), sy0 = PY(sa[1]), tx = PX(6.4), ty = PY(1.0);
        const cx = (sx0 + tx) / 2, cy = Math.min(sy0, ty) - 110;
        // start on the ghost circle's perimeter (r 34 + stroke), along the curve's start tangent
        const a0 = Math.atan2(cy - sy0, cx - sx0);
        const sx = sx0 + 39 * Math.cos(a0), sy = sy0 + 39 * Math.sin(a0);
        // end tangent of the quadratic = direction control → target
        const ang = Math.atan2(ty - cy, tx - cx);
        // dashed path stops at the arrowhead base so it never pokes through the head
        const bx = tx - 20 * Math.cos(ang), by = ty - 20 * Math.sin(ang);
        const ah = [[tx, ty], [tx - 24 * Math.cos(ang - 0.38), ty - 24 * Math.sin(ang - 0.38)], [tx - 24 * Math.cos(ang + 0.38), ty - 24 * Math.sin(ang + 0.38)]];
        els.push(h('g', { key: 'arrow', opacity: ghostOp },
          h('path', { d: `M${sx.toFixed(1)} ${sy.toFixed(1)} Q${cx} ${cy} ${bx.toFixed(1)} ${by.toFixed(1)}`, fill: 'none', stroke: '#F6F1E6', strokeWidth: 3.5, strokeDasharray: '9 8' }),
          h('polygon', { points: ah.map(p2 => p2.map(v => v.toFixed(1)).join(',')).join(' '), fill: '#F6F1E6' })
        ));
      }
    }
    // constraint web
    const vioSet = new Set(validation.violations.map(v => v.a + '-' + v.b));
    let pillIdx = 0;
    for (const [a, b] of PAIRS) {
      const A = byZone[a], B = byZone[b]; if (!A || !B) continue;
      const x1 = PX(A.x), y1 = PY(A.y), x2 = PX(B.x), y2 = PY(B.y);
      const exempt = s.serving;
      const violated = vioSet.has(a + '-' + b);
      if (violated) {
        els.push(h('line', { key: 'w' + a + b, x1, y1, x2, y2, stroke: '#D7402B', strokeWidth: 7, strokeLinecap: 'round' }));
      } else if (s.webOn && !s.served) {
        els.push(h('line', { key: 'w' + a + b, x1, y1, x2, y2, stroke: exempt ? 'rgba(34,27,18,.16)' : 'rgba(34,27,18,.30)', strokeWidth: 2, strokeDasharray: exempt ? '3 9' : 'none' }));
      }
      if (violated) {
        const v = validation.violations.find(v2 => v2.a === a && v2.b === b);
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + (pillIdx % 2 === 0 ? -34 : 40);
        const w = v.short.length * 9.6 + 30;
        els.push(h('g', { key: 'p' + a + b },
          h('rect', { x: mx - w / 2, y: my - 17, width: w, height: 34, rx: 17, fill: '#D7402B' }),
          h('text', { x: mx, y: my + 6, textAnchor: 'middle', fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 17.5, fill: '#F6F1E6' }, v.short)
        ));
        pillIdx++;
      }
    }
    return h('svg', { viewBox: '0 0 960 1180', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }, ref: this.courtRef }, els);
  }

  renderVals() {
    const s = this.state;
    const team = this.props.teamColor ?? DEFAULTS.teamColor;
    const ghostOp = this.props.ghostOpacity ?? DEFAULTS.ghostOpacity;
    const players = this.playersOf(s);
    const validation = RulesEngine.validate(players, s.serving);
    const vioZones = new Set();
    validation.violations.forEach(v => { vioZones.add(v.a); vioZones.add(v.b); });

    const tokens = players.map(p => {
      const hnd = this.getH(p.role);
      const dragging = s.draggingRole === p.role;
      const selected = s.selected === p.role;
      const violating = vioZones.has(p.zone);
      const rings = [];
      if (violating) rings.push('0 0 0 3.5px #D7402B');
      else if (selected) rings.push('0 0 0 3px rgba(34,27,18,.45)');
      rings.push(dragging ? '0 12px 26px rgba(34,27,18,.45)' : '0 2px 6px rgba(34,27,18,.35)');
      let transition = 'none';
      if (!s.reduced && !dragging) {
        transition = s.releasing
          ? 'left 1s cubic-bezier(.4,0,.2,1), top 1s cubic-bezier(.4,0,.2,1), transform .18s ease, box-shadow .18s ease'
          : 'left .28s cubic-bezier(.34,1.56,.64,1), top .28s cubic-bezier(.34,1.56,.64,1), transform .18s ease, box-shadow .18s ease';
      }
      return {
        role: p.role, label: p.label,
        left: (PX(p.x) / 960 * 100).toFixed(2), top: (PY(p.y) / 1180 * 100).toFixed(2),
        bg: p.isLibero ? '#F6F1E6' : team,
        fg: p.isLibero ? team : '#F6F1E6',
        border: p.isServer ? '2.5px dashed rgba(34,27,18,.7)' : (p.isLibero ? `2.5px solid ${team}` : '2.5px solid rgba(246,241,230,.65)'),
        fontSize: p.label.length > 2 ? '15px' : '19px',
        scale: dragging ? '1.08' : '1',
        z: dragging ? 20 : 5,
        shadow: rings.join(', '),
        transition,
        aria: `${p.isLibero ? 'Libero' : ROLE_NAMES[p.role]}, zone ${p.zone}${p.isServer ? ', serving, exempt from overlap' : ''}. Use arrow keys to move.`,
        onDown: hnd.down, onMove: hnd.move, onUp: hnd.up, onKey: hnd.key,
      };
    });

    // learn matched
    const ans = ANSWERS[s.rotation];
    const learnMatched = s.mode === 'learn' && !s.served && validation.legal && players.every(p => ans[p.role] && dist(p, ans[p.role]) < 0.9);

    // challenge checks
    const backMid = players.find(p => (p.role === 'MB1' || p.role === 'MB2') && p.back);
    const passers = [players.find(p => p.role === 'OH1'), players.find(p => p.role === 'OH2'), backMid].filter(Boolean);
    const xs = passers.map(p => p.x).sort((a, b) => a - b);
    const cPass = passers.every(p => p.y > 3.2);
    const cSeam = xs.length === 3 && xs[0] < 3.4 && xs[2] > 5.6 && xs[1] > 2.8 && xs[1] < 6.2;
    const sP = players.find(p => p.role === 'S');
    const cRelease = ans.S ? dist(sP, ans.S) < 2.3 : true;
    const checksRaw = [
      { ok: validation.legal, label: 'Legal at serve contact' },
      { ok: cPass, label: 'Three passers behind the 3 m line' },
      { ok: cSeam, label: 'Seams covered — left, middle, right' },
      { ok: cRelease, label: 'Setter positioned to release to target' },
    ];
    const checks = checksRaw.map(c => ({ icon: c.ok ? '✓' : '·', color: c.ok ? '#3E6B4F' : 'rgba(34,27,18,.35)', txtColor: c.ok ? '#221B12' : 'rgba(34,27,18,.55)', label: c.label }));
    const challengeSuccess = s.mode === 'challenge' && checksRaw.every(c => c.ok);
    const sZone = zoneOf('S', s.rotation);
    const byZone = {}; players.forEach(p => { byZone[p.zone] = p; });
    const sNbrs = PAIRS.filter(([a, b]) => a === sZone || b === sZone)
      .filter(([a, b]) => !(s.serving && (a === 1 || b === 1)))
      .map(([a, b]) => { const nz = a === sZone ? b : a; return `zone ${nz} (${byZone[nz].label})`; });
    const challengeInsight = `Legal and seamed. Your setter in zone ${sZone} only answers to ${sNbrs.join(' and ')} — keep them happy and any hiding spot works.`;

    // status
    const n = validation.violations.length;
    let statusHead, statusColor, chipText, chipBg;
    if (s.served) { statusHead = 'Released'; statusColor = '#3E6B4F'; chipText = 'Released — legal spot ≠ playing spot'; chipBg = '#3E6B4F'; }
    else if (!validation.legal) { statusHead = n === 1 ? '1 fault' : `${n} faults`; statusColor = '#D7402B'; chipText = statusHead; chipBg = '#D7402B'; }
    else if (challengeSuccess) { statusHead = 'Challenge complete'; statusColor = '#3E6B4F'; chipText = 'Legal ✓ seamed ✓'; chipBg = '#3E6B4F'; }
    else if (learnMatched) { statusHead = "Coach's answer ✓"; statusColor = '#3E6B4F'; chipText = "Coach's answer ✓"; chipBg = '#3E6B4F'; }
    else if (s.serving) { statusHead = 'Our serve — no checks'; statusColor = '#3E6B4F'; chipText = 'Overlap off'; chipBg = 'rgba(34,27,18,.72)'; }
    else { statusHead = 'Legal at contact'; statusColor = '#3E6B4F'; chipText = 'Legal'; chipBg = 'rgba(34,27,18,.72)'; }

    const statusHint = s.served
      ? 'The freeze ended at contact — everyone sprinted to their playing positions. Serve again or Reset.'
      : (validation.legal ? 'Drag anyone. The web shows only the 7 real constraints — diagonals are always free.' : 'Only the broken pair lights up. Fix those two players; nobody else matters.');

    // selected card
    const sel = players.find(p => p.role === s.selected);
    let selConstraints = [];
    if (sel) {
      if (sel.isServer) selConstraints = [{ txt: 'Server — exempt from all overlap constraints until contact.' }];
      else if (s.serving) selConstraints = [{ txt: 'Our serve — no overlap constraints apply. Stand anywhere.' }];
      else selConstraints = PAIRS
        .filter(([a, b]) => (a === sel.zone || b === sel.zone) && !(s.serving && (a === 1 || b === 1)))
        .map(([a, b, axis]) => {
          const other = byZone[a === sel.zone ? b : a];
          const oz = a === sel.zone ? b : a;
          let d;
          if (axis === 'lat') d = a === sel.zone ? 'left of' : 'right of';
          else d = a === sel.zone ? 'in front of' : 'behind';
          return { txt: `Stay ${d} ${other.label} (zone ${oz})` };
        });
    }

    const mkRot = nn => ({
      n: nn,
      bg: nn === s.rotation ? team : '#fff', fg: nn === s.rotation ? '#F6F1E6' : '#221B12',
      border: nn === s.rotation ? `1.5px solid ${team}` : '1.5px solid rgba(34,27,18,.25)',
      onClick: () => this.applyRotation(nn),
    });
    const mkMode = (id, label) => ({
      label,
      bg: s.mode === id ? '#221B12' : '#fff', fg: s.mode === id ? '#F6F1E6' : '#221B12',
      border: s.mode === id ? '1.5px solid #221B12' : '1.5px solid rgba(34,27,18,.25)',
      onClick: () => this.setMode(id),
    });

    const modeDescs = {
      learn: "Ghost markers show the coach's answer for this rotation. Drag players onto them — ghosts are guidance, not snap targets.",
      challenge: 'No ghosts. Build a legal serve receive: three passers seamed, setter ready to release.',
      sandbox: 'Free play. Toggle who serves, watch the constraint web react live.',
    };

    return {
      rotation: s.rotation,
      isLearn: s.mode === 'learn', isChallenge: s.mode === 'challenge', isSandbox: s.mode === 'sandbox',
      tokens,
      webOverlay: this.overlayEls(players, validation, s, team, ghostOp),
      chipText, chipBg,
      serveChip: s.serving ? 'our serve — overlap off' : 'serve incoming ●',
      whistle: s.whistle,
      ariaLive: validation.legal ? 'Formation legal.' : `${n} fault${n === 1 ? '' : 's'}: ` + validation.violations.map(v => v.msg).join('; '),
      rotationBtns: [1, 2, 3, 4, 5, 6].map(mkRot),
      modeBtns: [mkMode('learn', 'Learn'), mkMode('challenge', 'Challenge'), mkMode('sandbox', 'Sandbox')],
      modeDesc: modeDescs[s.mode],
      coachNote: COACH_NOTES[s.rotation],
      setReceiving: () => this.setServing(false),
      setServing: () => this.setServing(true),
      recvBg: !s.serving ? '#221B12' : '#fff', recvFg: !s.serving ? '#F6F1E6' : '#221B12', recvBorder: '1.5px solid rgba(34,27,18,.3)',
      servBg: s.serving ? '#221B12' : '#fff', servFg: s.serving ? '#F6F1E6' : '#221B12', servBorder: '1.5px solid rgba(34,27,18,.3)',
      toggleWeb: () => this.setState({ webOn: !s.webOn }),
      webBtnLabel: `Constraint web: ${s.webOn ? 'ON' : 'OFF'}`,
      webBtnBg: s.webOn ? '#221B12' : '#fff', webBtnFg: s.webOn ? '#F6F1E6' : '#221B12',
      toggleGhosts: () => this.setState({ ghostsOn: !s.ghostsOn }),
      ghostBtnLabel: `Ghosts: ${s.ghostsOn ? 'ON' : 'OFF'}`,
      ghostBtnBg: s.ghostsOn ? '#221B12' : '#fff', ghostBtnFg: s.ghostsOn ? '#F6F1E6' : '#221B12',
      checks, challengeSuccess, challengeInsight,
      nextRotation: () => this.applyRotation(s.rotation % 6 + 1),
      statusHead, statusColor,
      violationMsgs: validation.violations.map(v => ({ msg: v.msg })),
      showStatusHint: true, statusHint,
      hasSelected: !!sel,
      selLabel: sel ? sel.label : '', selName: sel ? (sel.isLibero ? `Libero (in for ${ROLE_NAMES[sel.role]})` : ROLE_NAMES[sel.role]) : '',
      selZoneText: sel ? `Zone ${sel.zone} · ${sel.back ? 'back row — no blocking, attack from behind 3 m' : 'front row'}` : '',
      selBg: sel && sel.isLibero ? '#F6F1E6' : team, selFg: sel && sel.isLibero ? team : '#F6F1E6',
      selBorder: sel && sel.isLibero ? `2px solid ${team}` : '2px solid rgba(246,241,230,.6)',
      selConstraints,
      onServe: () => this.onServe(),
      serveLabel: s.served ? 'Back to receive' : 'Serve!',
      onReset: () => this.setState({ positions: this.basePositions(s.rotation, s.serving), served: false, preServe: null }),
      showRef: s.showRef,
      toggleRef: () => this.setState({ showRef: !s.showRef }),
      swallow: e => e.stopPropagation(),
    };
  }

  render() {
    const v = this.renderVals();
    const saira = "'Saira Condensed', sans-serif";
    return (
      <div style={{ height: '100dvh', display: 'flex', flexWrap: 'wrap', overflow: 'auto' }}>

        {/* COURT */}
        <div style={{ flex: '1 1 480px', minWidth: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, boxSizing: 'border-box' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 'min(880px, calc((100dvh - 24px) * 0.8135))', aspectRatio: '960 / 1180' }}>
            <svg viewBox="0 0 960 1180" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}>
              <rect x="0" y="0" width="960" height="1180" fill="#B98A52" />
              <rect x="30" y="30" width="900" height="140" fill="#C79758" stroke="#F6F1E6" strokeWidth="5" />
              <rect x="30" y="170" width="900" height="900" fill="#D8A968" stroke="#F6F1E6" strokeWidth="6" />
              <line x1="30" y1="470" x2="930" y2="470" stroke="#F6F1E6" strokeWidth="5" />
              <line x1="8" y1="170" x2="952" y2="170" stroke="#221B12" strokeWidth="12" />
              <line x1="8" y1="158" x2="952" y2="158" stroke="rgba(34,27,18,.35)" strokeWidth="3" />
              <text x="940" y="452" textAnchor="end" fontFamily="IBM Plex Sans" fontSize="24" fill="rgba(34,27,18,.45)">3 m</text>
            </svg>
            {v.webOverlay}
            {v.tokens.map(p => (
              <div
                key={p.role}
                onPointerDown={p.onDown}
                onPointerMove={p.onMove}
                onPointerUp={p.onUp}
                onKeyDown={p.onKey}
                tabIndex={0}
                role="button"
                aria-label={p.aria}
                style={{
                  position: 'absolute', left: `${p.left}%`, top: `${p.top}%`,
                  width: 'clamp(44px, 10.5%, 58px)', aspectRatio: '1',
                  transform: `translate(-50%, -50%) scale(${p.scale})`, transition: p.transition,
                  borderRadius: '50%', background: p.bg, color: p.fg, border: p.border,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: saira, fontWeight: 700, fontSize: p.fontSize, letterSpacing: '.5px',
                  cursor: 'grab', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none',
                  boxSizing: 'border-box', boxShadow: p.shadow, zIndex: p.z, outline: 'none',
                }}
              >{p.label}</div>
            ))}
            <div style={{ position: 'absolute', top: '1.6%', left: '2.8%', padding: '5px 12px', borderRadius: 14, background: v.chipBg, color: '#F6F1E6', fontFamily: saira, fontWeight: 700, fontSize: 'clamp(11px, 2.4vw, 15px)', letterSpacing: '.8px', textTransform: 'uppercase', pointerEvents: 'none' }}>{v.chipText}</div>
            <div style={{ position: 'absolute', top: '1.6%', right: '2.8%', padding: '5px 12px', borderRadius: 14, background: 'rgba(34,27,18,.72)', color: '#F6F1E6', fontSize: 'clamp(10px, 2vw, 12.5px)', fontWeight: 500, pointerEvents: 'none' }}>{v.serveChip}</div>
            {v.whistle && (
              <div style={{ position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%, -50%)', background: '#D7402B', color: '#F6F1E6', fontFamily: saira, fontWeight: 800, fontSize: 'clamp(18px, 4vw, 30px)', letterSpacing: 1, textTransform: 'uppercase', padding: '14px 26px', borderRadius: 10, animation: 'flashIn 1.4s forwards', pointerEvents: 'none', whiteSpace: 'nowrap' }}>Whistle — fault at contact</div>
            )}
            <div aria-live="polite" style={{ position: 'absolute', left: -9999, top: 0 }}>{v.ariaLive}</div>
          </div>
        </div>

        {/* RAIL */}
        <div style={{ flex: '1 1 272px', maxWidth: 340, minWidth: 260, height: '100%', overflowY: 'auto', boxSizing: 'border-box', background: '#F6F1E6', borderLeft: '1px solid rgba(34,27,18,.16)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ fontFamily: saira, fontWeight: 800, fontSize: 24, lineHeight: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Spike &amp; Learn</div>
              <div style={{ fontSize: 11.5, color: 'rgba(34,27,18,.65)', fontWeight: 500, marginTop: 4 }}>5-1 rotation trainer · where can you stand at serve contact?</div>
            </div>
            <button onClick={v.toggleRef} aria-label="Rule reference" style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid rgba(34,27,18,.4)', background: 'none', color: '#221B12', fontFamily: saira, fontWeight: 700, fontSize: 16, cursor: 'pointer', flex: 'none', padding: 0 }}>?</button>
          </div>

          <div style={{ borderTop: '1px solid rgba(34,27,18,.16)', padding: '10px 0 2px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(34,27,18,.6)', marginBottom: 8 }}>Rotation — setter's zone</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {v.rotationBtns.map(r => (
                <button key={r.n} onClick={r.onClick} style={{ flex: 1, height: 40, borderRadius: 6, border: r.border, background: r.bg, color: r.fg, fontFamily: saira, fontWeight: 700, fontSize: 18, cursor: 'pointer', padding: 0 }}>{r.n}</button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(34,27,18,.16)', padding: '10px 0 2px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {v.modeBtns.map(m => (
                <button key={m.label} onClick={m.onClick} style={{ flex: 1, height: 36, borderRadius: 6, border: m.border, background: m.bg, color: m.fg, fontFamily: saira, fontWeight: 700, fontSize: 15, letterSpacing: '.5px', textTransform: 'uppercase', cursor: 'pointer', padding: 0 }}>{m.label}</button>
              ))}
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.45, color: 'rgba(34,27,18,.7)' }}>{v.modeDesc}</div>
            {v.isLearn && (
              <div style={{ fontSize: 13, lineHeight: 1.5, borderTop: '1px solid rgba(34,27,18,.12)', paddingTop: 8 }}><b>Coach:</b> {v.coachNote}</div>
            )}
            {v.isSandbox && (
              <div style={{ display: 'flex', gap: 6, borderTop: '1px solid rgba(34,27,18,.12)', paddingTop: 8 }}>
                <button onClick={v.setReceiving} style={{ flex: 1, height: 32, borderRadius: 6, border: v.recvBorder, background: v.recvBg, color: v.recvFg, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}>We receive</button>
                <button onClick={v.setServing} style={{ flex: 1, height: 32, borderRadius: 6, border: v.servBorder, background: v.servBg, color: v.servFg, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}>We serve</button>
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={v.toggleWeb} style={{ flex: 1, minWidth: 110, height: 30, borderRadius: 6, border: '1px solid rgba(34,27,18,.3)', background: v.webBtnBg, color: v.webBtnFg, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>{v.webBtnLabel}</button>
              {v.isLearn && (
                <button onClick={v.toggleGhosts} style={{ flex: 1, minWidth: 110, height: 30, borderRadius: 6, border: '1px solid rgba(34,27,18,.3)', background: v.ghostBtnBg, color: v.ghostBtnFg, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>{v.ghostBtnLabel}</button>
              )}
            </div>
          </div>

          {v.isChallenge && (
            <div style={{ borderTop: '1px solid rgba(34,27,18,.16)', padding: '10px 0 2px', display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>Set up serve receive for rotation {v.rotation}.</div>
              {v.checks.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, color: c.color, width: 14, flex: 'none' }}>{c.icon}</span>
                  <span style={{ color: c.txtColor }}>{c.label}</span>
                </div>
              ))}
              {v.challengeSuccess && (
                <div style={{ borderTop: '1px solid rgba(34,27,18,.12)', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: '#3E6B4F', fontWeight: 500 }}>{v.challengeInsight}</div>
                  <button onClick={v.nextRotation} style={{ height: 34, borderRadius: 6, border: 'none', background: '#3E6B4F', color: '#F6F1E6', fontFamily: saira, fontWeight: 700, fontSize: 15, letterSpacing: '.5px', textTransform: 'uppercase', cursor: 'pointer' }}>Next rotation →</button>
                </div>
              )}
            </div>
          )}

          <div style={{ borderTop: '1px solid rgba(34,27,18,.16)', padding: '10px 0 2px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontFamily: saira, fontWeight: 700, fontSize: 17, letterSpacing: '.5px', textTransform: 'uppercase', color: v.statusColor }}>{v.statusHead}</div>
            {v.violationMsgs.map((vm, i) => (
              <div key={i} style={{ fontSize: 12.5, lineHeight: 1.45, color: '#D7402B', borderLeft: '3px solid #D7402B', paddingLeft: 8 }}>{vm.msg}</div>
            ))}
            {v.showStatusHint && (
              <div style={{ fontSize: 12, color: 'rgba(34,27,18,.55)', lineHeight: 1.45 }}>{v.statusHint}</div>
            )}
          </div>

          {v.hasSelected && (
            <div style={{ borderTop: '1px solid rgba(34,27,18,.16)', padding: '10px 0 2px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: v.selBg, color: v.selFg, border: v.selBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: saira, fontWeight: 700, fontSize: 15, boxSizing: 'border-box', flex: 'none' }}>{v.selLabel}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{v.selName}</div>
                  <div style={{ fontSize: 12, color: 'rgba(34,27,18,.6)' }}>{v.selZoneText}</div>
                </div>
              </div>
              {v.selConstraints.map((sc, i) => (
                <div key={i} style={{ fontSize: 12.5, lineHeight: 1.4, color: 'rgba(34,27,18,.8)' }}>· {sc.txt}</div>
              ))}
              <div style={{ fontSize: 11.5, color: 'rgba(34,27,18,.5)' }}>Arrow keys nudge · Shift+arrows for big steps</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid rgba(34,27,18,.16)' }}>
            <button onClick={v.onServe} style={{ flex: 2, height: 48, borderRadius: 8, border: 'none', background: '#24406B', color: '#F6F1E6', fontFamily: saira, fontWeight: 800, fontSize: 21, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer' }}>{v.serveLabel}</button>
            <button onClick={v.onReset} style={{ flex: 1, height: 48, borderRadius: 8, border: '1.5px solid rgba(34,27,18,.35)', background: '#F6F1E6', color: '#221B12', fontFamily: saira, fontWeight: 700, fontSize: 15, letterSpacing: '.5px', textTransform: 'uppercase', cursor: 'pointer' }}>Reset</button>
          </div>
        </div>

        {v.showRef && (
          <div onClick={v.toggleRef} style={{ position: 'fixed', inset: 0, background: 'rgba(34,27,18,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 20 }}>
            <div onClick={v.swallow} style={{ background: '#F6F1E6', borderRadius: 10, maxWidth: 440, width: '100%', maxHeight: '85vh', overflow: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontFamily: saira, fontWeight: 800, fontSize: 24, textTransform: 'uppercase', letterSpacing: '.5px' }}>The overlap rule</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>At the instant of serve contact, only <b>7 pairs</b> of neighbors constrain each other. No diagonals. Nobody else.</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, background: '#fff', border: '1px solid rgba(34,27,18,.12)', borderRadius: 6, padding: '10px 14px' }}><b>Side to side:</b> 4–3 · 3–2 · 5–6 · 6–1<br /><b>Front to back:</b> 4–5 · 3–6 · 2–1</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                1. Judged by <b>feet</b> at the instant of contact.<br />
                2. Relative to <b>where teammates stand</b>, not floor spots.<br />
                3. The <b>server is exempt</b> — nobody aligns with them.<br />
                4. One instant after contact, <b>everyone is free</b>.
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(34,27,18,.65)' }}>Back row: no blocking; attack above the net only from behind the 3 m line. Burn in: <i>neighbors only, feet only, contact only.</i></div>
              <button onClick={v.toggleRef} style={{ height: 36, borderRadius: 6, border: 'none', background: '#24406B', color: '#F6F1E6', fontFamily: saira, fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: '.5px', cursor: 'pointer' }}>Got it</button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default SpikeAndLearn;
