import { ROLE_NAMES } from '../../domain/constants.js';
import { constraintsForZone } from '../../domain/rules.js';
import { COLORS, FONTS } from '../../theme.js';

export default function SelectionCard({ selected, players, byZone, serving, team }) {
  const sel = players.find(p => p.role === selected);
  if (!sel) return null;

  let constraints;
  if (sel.isServer) constraints = [{ txt: 'Server — exempt from all overlap constraints until contact.' }];
  else if (serving) constraints = [{ txt: 'Our serve — no overlap constraints apply. Stand anywhere.' }];
  else constraints = constraintsForZone(sel.zone, byZone);

  const name = sel.isLibero ? `Libero (in for ${ROLE_NAMES[sel.role]})` : ROLE_NAMES[sel.role];
  const zoneText = `Zone ${sel.zone} · ${sel.back ? 'back row — no blocking, attack from behind 3 m' : 'front row'}`;

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
