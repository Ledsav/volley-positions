import { COLORS, FONTS } from '../../theme.js';
import ActionBar from './ActionBar.jsx';
import ChallengePanel from './ChallengePanel.jsx';
import ModePanel from './ModePanel.jsx';
import RotationPicker from './RotationPicker.jsx';
import SelectionCard from './SelectionCard.jsx';
import StatusPanel from './StatusPanel.jsx';

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
