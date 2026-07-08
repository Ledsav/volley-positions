import { useState } from 'react';
import { rotationLabel } from '../../domain/rotation.js';
import { COLORS, FONTS, MOBILE_BAR_HEIGHT } from '../../theme.js';
import ChallengePanel from './ChallengePanel.jsx';
import ModePanel from './ModePanel.jsx';
import SelectionCard from './SelectionCard.jsx';
import StatusPanel from './StatusPanel.jsx';

const MODES = ['learn', 'challenge', 'sandbox'];
const MODE_LABELS = { learn: 'Learn', challenge: 'Challenge', sandbox: 'Sandbox' };

const stepBtnStyle = {
  width: 28, height: 36, borderRadius: 6, border: '1px solid rgba(34,27,18,.3)', background: '#fff',
  color: COLORS.ink, fontSize: 16, fontWeight: 700, cursor: 'pointer', padding: 0, flex: 'none',
};

// Mobile control bar: slim, always-visible strip (rotation stepper, mode, serve)
// with an expandable sheet above it for status/challenge/selection detail + reset.
export default function MobileRail({ state, derived, actions, team }) {
  const [expanded, setExpanded] = useState(false);

  const cycleMode = () => {
    const i = MODES.indexOf(state.mode);
    actions.setMode(MODES[(i + 1) % MODES.length]);
  };
  const prevRotation = () => actions.applyRotation(state.rotation === 1 ? 6 : state.rotation - 1);
  const nextRotation = () => actions.applyRotation(state.rotation % 6 + 1);

  return (
    <div style={{ position: 'relative', flex: 'none', width: '100%', boxSizing: 'border-box' }}>
      {expanded && (
        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: MOBILE_BAR_HEIGHT, maxHeight: '65dvh',
          overflowY: 'auto', background: COLORS.cream, borderTop: '1px solid rgba(34,27,18,.16)',
          borderRadius: '14px 14px 0 0', boxShadow: '0 -6px 18px rgba(34,27,18,.18)',
          padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10, boxSizing: 'border-box', zIndex: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 21, lineHeight: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Spike &amp; Learn</div>
              <div style={{ fontSize: 11, color: 'rgba(34,27,18,.65)', fontWeight: 500, marginTop: 4 }}>Rotation {rotationLabel(state.rotation)} · {MODE_LABELS[state.mode]}</div>
            </div>
            <button onClick={actions.toggleRef} aria-label="Rule reference" style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid rgba(34,27,18,.4)', background: 'none', color: COLORS.ink, fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, cursor: 'pointer', flex: 'none', padding: 0 }}>?</button>
          </div>
          <ModePanel state={state} actions={actions} />
          {state.mode === 'challenge' && (
            <ChallengePanel rotation={state.rotation} challenge={derived.challenge} challengeSuccess={derived.challengeSuccess} onNext={actions.nextRotation} />
          )}
          <StatusPanel status={derived.status} violations={derived.validation.violations} />
          <SelectionCard selected={state.selected} players={derived.players} byZone={derived.byZone} serving={state.serving} team={team} />
          <button onClick={actions.onReset} style={{ height: 40, borderRadius: 8, border: '1.5px solid rgba(34,27,18,.35)', background: '#fff', color: COLORS.ink, fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, letterSpacing: '.5px', textTransform: 'uppercase', cursor: 'pointer' }}>Reset</button>
        </div>
      )}
      <div style={{
        height: MOBILE_BAR_HEIGHT, display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px',
        background: COLORS.cream, borderTop: '1px solid rgba(34,27,18,.16)', boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 'none' }}>
          <button onClick={prevRotation} aria-label="Previous rotation" style={stepBtnStyle}>‹</button>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, minWidth: 30, textAlign: 'center' }}>R{rotationLabel(state.rotation)}</div>
          <button onClick={nextRotation} aria-label="Next rotation" style={stepBtnStyle}>›</button>
        </div>
        <button onClick={cycleMode} style={{ flex: '1 1 auto', minWidth: 0, height: 36, borderRadius: 6, border: '1.5px solid rgba(34,27,18,.3)', background: '#fff', color: COLORS.ink, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: '0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{MODE_LABELS[state.mode]}</button>
        <button
          onClick={() => setExpanded(e => !e)}
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
          aria-expanded={expanded}
          style={{ ...stepBtnStyle, width: 32 }}
        >{expanded ? '▾' : '▴'}</button>
        <button onClick={actions.onServe} style={{ flex: '1 1 auto', minWidth: 0, height: 40, borderRadius: 8, border: 'none', background: COLORS.navy, color: COLORS.cream, fontFamily: FONTS.display, fontWeight: 800, fontSize: 14.5, letterSpacing: '.5px', textTransform: 'uppercase', cursor: 'pointer', padding: '0 8px' }}>{state.served ? 'Receive' : 'Serve!'}</button>
      </div>
    </div>
  );
}
