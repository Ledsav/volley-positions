import { COLORS, FONTS } from '../../theme.js';

export default function StatusPanel({ status, violations }) {
  return (
    <div style={{ borderTop: '1px solid rgba(34,27,18,.16)', padding: '10px 0 2px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 17, letterSpacing: '.5px', textTransform: 'uppercase', color: status.color }}>{status.head}</div>
      {violations.map((v, i) => (
        <div key={i} style={{ fontSize: 12.5, lineHeight: 1.45, color: COLORS.red, borderLeft: `3px solid ${COLORS.red}`, paddingLeft: 8 }}>{v.msg}</div>
      ))}
      <div style={{ fontSize: 12, color: 'rgba(34,27,18,.55)', lineHeight: 1.45 }}>{status.hint}</div>
    </div>
  );
}
