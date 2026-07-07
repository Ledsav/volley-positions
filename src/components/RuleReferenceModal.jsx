import { COLORS, FONTS } from '../theme.js';

export default function RuleReferenceModal({ onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(34,27,18,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: COLORS.cream, borderRadius: 10, maxWidth: 440, width: '100%', maxHeight: '85vh', overflow: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 24, textTransform: 'uppercase', letterSpacing: '.5px' }}>The overlap rule</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>At the instant of serve contact, only <b>7 pairs</b> of neighbors constrain each other. No diagonals. Nobody else.</div>
        <div style={{ fontSize: 13, lineHeight: 1.7, background: '#fff', border: '1px solid rgba(34,27,18,.12)', borderRadius: 6, padding: '10px 14px' }}><b>Side to side:</b> 4–3 · 3–2 · 5–6 · 6–1<br /><b>Front to back:</b> 4–5 · 3–6 · 2–1</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
          1. Judged by <b>feet</b> at the instant of contact.<br />
          2. Relative to <b>where teammates stand</b>, not floor spots.<br />
          3. The <b>server is exempt</b> — nobody aligns with them.<br />
          4. One instant after contact, <b>everyone is free</b>.
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(34,27,18,.65)' }}>Back row: no blocking; attack above the net only from behind the 3 m line. Burn in: <i>neighbors only, feet only, contact only.</i></div>
        <button onClick={onClose} style={{ height: 36, borderRadius: 6, border: 'none', background: COLORS.navy, color: COLORS.cream, fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: '.5px', cursor: 'pointer' }}>Got it</button>
      </div>
    </div>
  );
}
