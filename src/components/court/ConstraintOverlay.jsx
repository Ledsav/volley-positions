import { forwardRef } from 'react';
import { PAIRS } from '../../domain/constants.js';
import { ANSWERS } from '../../domain/formations.js';
import { PX, PY } from '../../domain/geometry.js';
import { COLORS, FONTS } from '../../theme.js';

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
      els.push(<text key={'zn' + z} x={x} y={y} textAnchor="middle" fontFamily={FONTS.display} fontWeight={700} fontSize={120} fill="rgba(34,27,18,.13)">{z}</text>);
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
          <text x={gx} y={gy + 7} textAnchor="middle" fontFamily={FONTS.display} fontWeight={700} fontSize={p.label.length > 2 ? 20 : 25} fill={COLORS.cream}>{p.label}</text>
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
          <polygon points={ah.map(p2 => p2.map(v => v.toFixed(1)).join(',')).join(' ')} fill={COLORS.cream} />
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
          <text x={mx} y={my + 6} textAnchor="middle" fontFamily={FONTS.body} fontWeight={600} fontSize={17.5} fill={COLORS.cream}>{v.short}</text>
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
