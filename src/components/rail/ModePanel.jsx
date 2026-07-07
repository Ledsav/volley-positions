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
