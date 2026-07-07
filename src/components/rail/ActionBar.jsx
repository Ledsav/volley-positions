import { COLORS, FONTS } from '../../theme.js';

export default function ActionBar({ served, onServe, onReset }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid rgba(34,27,18,.16)' }}>
      <button onClick={onServe} style={{ flex: 2, height: 48, borderRadius: 8, border: 'none', background: COLORS.navy, color: COLORS.cream, fontFamily: FONTS.display, fontWeight: 800, fontSize: 21, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer' }}>{served ? 'Back to receive' : 'Serve!'}</button>
      <button onClick={onReset} style={{ flex: 1, height: 48, borderRadius: 8, border: '1.5px solid rgba(34,27,18,.35)', background: COLORS.cream, color: COLORS.ink, fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, letterSpacing: '.5px', textTransform: 'uppercase', cursor: 'pointer' }}>Reset</button>
    </div>
  );
}
