import { rotationLabel } from '../../domain/rotation.js';
import { COLORS, FONTS } from '../../theme.js';

export default function RotationPicker({ rotation, onPick, team }) {
  return (
    <div style={{ borderTop: '1px solid rgba(34,27,18,.16)', padding: '10px 0 2px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(34,27,18,.6)', marginBottom: 8 }}>Rotation,  setter's zone</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4, 5, 6].map(n => {
          const active = n === rotation;
          return (
            <button key={n} onClick={() => onPick(n)} style={{ flex: 1, height: 40, borderRadius: 6, border: active ? `1.5px solid ${team}` : '1.5px solid rgba(34,27,18,.25)', background: active ? team : '#fff', color: active ? COLORS.cream : COLORS.ink, fontFamily: FONTS.display, fontWeight: 700, fontSize: 18, cursor: 'pointer', padding: 0 }}>{rotationLabel(n)}</button>
          );
        })}
      </div>
    </div>
  );
}
