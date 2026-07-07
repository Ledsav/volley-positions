import { COLORS, FONTS } from '../../theme.js';
import ConstraintOverlay from './ConstraintOverlay.jsx';
import PlayerToken from './PlayerToken.jsx';

function CourtSurface() {
  return (
    <svg viewBox="0 0 960 1180" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}>
      <rect x="0" y="0" width="960" height="1180" fill={COLORS.court} />
      <rect x="30" y="30" width="900" height="140" fill={COLORS.courtBack} stroke={COLORS.cream} strokeWidth="5" />
      <rect x="30" y="170" width="900" height="900" fill={COLORS.courtFront} stroke={COLORS.cream} strokeWidth="6" />
      <line x1="30" y1="470" x2="930" y2="470" stroke={COLORS.cream} strokeWidth="5" />
      <line x1="8" y1="170" x2="952" y2="170" stroke={COLORS.ink} strokeWidth="12" />
      <line x1="8" y1="158" x2="952" y2="158" stroke="rgba(34,27,18,.35)" strokeWidth="3" />
      <text x="920" y="452" textAnchor="end" fontFamily={FONTS.body} fontSize="24" fill="rgba(34,27,18,.45)">3 m</text>
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
        <div style={{ position: 'absolute', top: '3.6%', left: '4.8%', padding: '5px 12px', borderRadius: 14, background: status.chipBg, color: COLORS.cream, fontFamily: FONTS.display, fontWeight: 700, fontSize: 'clamp(11px, 2.4vw, 15px)', letterSpacing: '.8px', textTransform: 'uppercase', pointerEvents: 'none' }}>{status.chipText}</div>
        <div style={{ position: 'absolute', top: '3.6%', right: '4.8%', padding: '5px 12px', borderRadius: 14, background: 'rgba(34,27,18,.72)', color: COLORS.cream, fontSize: 'clamp(10px, 2vw, 12.5px)', fontWeight: 500, pointerEvents: 'none' }}>{state.serving ? 'our serve — overlap off' : 'serve incoming ●'}</div>
        {state.whistle && (
          <div style={{ position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%, -50%)', background: COLORS.red, color: COLORS.cream, fontFamily: FONTS.display, fontWeight: 800, fontSize: 'clamp(18px, 4vw, 30px)', letterSpacing: 1, textTransform: 'uppercase', padding: '14px 26px', borderRadius: 10, animation: 'flashIn 1.4s forwards', pointerEvents: 'none', whiteSpace: 'nowrap' }}>Whistle — fault at contact</div>
        )}
        <div aria-live="polite" style={{ position: 'absolute', left: -9999, top: 0 }}>{ariaLive}</div>
      </div>
    </div>
  );
}
