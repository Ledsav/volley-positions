import { COLORS, FONTS } from '../../theme.js';

export default function ChallengePanel({ rotation, challenge, challengeSuccess, onNext }) {
  return (
    <div style={{ borderTop: '1px solid rgba(34,27,18,.16)', padding: '10px 0 2px', display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ fontSize: 13.5, fontWeight: 600 }}>Set up serve receive for rotation {rotation}.</div>
      {challenge.checks.map((c, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, alignItems: 'baseline' }}>
          <span style={{ fontWeight: 700, color: c.ok ? COLORS.green : 'rgba(34,27,18,.35)', width: 14, flex: 'none' }}>{c.ok ? '✓' : '·'}</span>
          <span style={{ color: c.ok ? COLORS.ink : 'rgba(34,27,18,.55)' }}>{c.label}</span>
        </div>
      ))}
      {challengeSuccess && (
        <div style={{ borderTop: '1px solid rgba(34,27,18,.12)', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: COLORS.green, fontWeight: 500 }}>{challenge.insight}</div>
          <button onClick={onNext} style={{ height: 34, borderRadius: 6, border: 'none', background: COLORS.green, color: COLORS.cream, fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, letterSpacing: '.5px', textTransform: 'uppercase', cursor: 'pointer' }}>Next rotation →</button>
        </div>
      )}
    </div>
  );
}
