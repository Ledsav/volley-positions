import { COLORS } from '../theme.js';

const NEUTRAL_CHIP = 'rgba(34,27,18,.72)';

// Derives the rail status header + court chip text/colors from the current state.
export function computeStatus(state, validation, { challengeSuccess, learnMatched }) {
  const n = validation.violations.length;
  let head, color, chipText, chipBg;
  if (state.served) { head = 'Released'; color = COLORS.green; chipText = 'Released,  legal spot ≠ playing spot'; chipBg = COLORS.green; }
  else if (!validation.legal) { head = n === 1 ? '1 fault' : `${n} faults`; color = COLORS.red; chipText = head; chipBg = COLORS.red; }
  else if (challengeSuccess) { head = 'Challenge complete'; color = COLORS.green; chipText = 'Legal ✓ seamed ✓'; chipBg = COLORS.green; }
  else if (learnMatched) { head = "Coach's answer ✓"; color = COLORS.green; chipText = "Coach's answer ✓"; chipBg = COLORS.green; }
  else if (state.serving) { head = 'Our serve,  no checks'; color = COLORS.green; chipText = 'Overlap off'; chipBg = NEUTRAL_CHIP; }
  else { head = 'Legal at contact'; color = COLORS.green; chipText = 'Legal'; chipBg = NEUTRAL_CHIP; }

  const hint = state.served
    ? 'The freeze ended at contact,  everyone sprinted to their playing positions. Serve again or Reset.'
    : (validation.legal ? 'Drag anyone. The web shows only the 7 real constraints,  diagonals are always free.' : 'Only the broken pair lights up. Fix those two players; nobody else matters.');

  return { head, color, chipText, chipBg, hint };
}
