import { ROLE_NAMES } from '../../domain/constants.js';
import { PX, PY } from '../../domain/geometry.js';
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
        borderRadius: '50%',
        background: p.isLibero ? COLORS.cream : team,
        color: p.isLibero ? team : COLORS.cream,
        border: p.isServer ? '2.5px dashed rgba(34,27,18,.7)' : (p.isLibero ? `2.5px solid ${team}` : '2.5px solid rgba(246,241,230,.65)'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONTS.display, fontWeight: 700, fontSize: p.label.length > 2 ? '15px' : '19px', letterSpacing: '.5px',
        cursor: 'grab', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none',
        boxSizing: 'border-box', boxShadow: rings.join(', '), zIndex: dragging ? 20 : 5, outline: 'none',
      }}
    >{p.label}</div>
  );
}
