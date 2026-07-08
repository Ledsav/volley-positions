import { COLORS } from '../theme.js';

const NEUTRAL_CHIP = 'rgba(34,27,18,.72)';

// Derives the rail status header + court chip text/colors from the current state.
export function computeStatus(state, validation, { challengeSuccess, learnMatched }) {
  const n = validation.violations.length;
  let head, color, chipText, chipBg;
  if (state.served) {
    if (state.serving) { head = 'Served'; color = COLORS.green; chipText = "Ball's over"; chipBg = NEUTRAL_CHIP; }
    else { head = 'Received → attack'; color = COLORS.green; chipText = 'Passed,  shifting to attack'; chipBg = COLORS.green; }
  }
  else if (!validation.legal) { head = n === 1 ? '1 fault' : `${n} faults`; color = COLORS.red; chipText = head; chipBg = COLORS.red; }
  else if (challengeSuccess) { head = 'Challenge complete'; color = COLORS.green; chipText = 'Legal ✓ seamed ✓'; chipBg = COLORS.green; }
  else if (learnMatched) { head = "Coach's answer ✓"; color = COLORS.green; chipText = "Coach's answer ✓"; chipBg = COLORS.green; }
  else if (state.serving) { head = 'Our serve,  no checks'; color = COLORS.green; chipText = 'Overlap off'; chipBg = NEUTRAL_CHIP; }
  else { head = 'Legal at contact'; color = COLORS.green; chipText = 'Legal'; chipBg = NEUTRAL_CHIP; }

  const hint = state.served
    ? (state.serving
        ? 'You served; the ball is on their side now. Serve again or Reset.'
        : 'Contact broke the freeze — passers received, attackers shifted up. They serve again or Reset.')
    : (state.serving
        ? 'Set your serving formation. Overlap rules relax once you serve.'
        : (validation.legal
            ? 'Set your overlap-legal spots. When they serve, everyone sprints to receive and attack.'
            : 'Only the broken pair lights up. Fix those two players; nobody else matters.'));

  return { head, color, chipText, chipBg, hint };
}
