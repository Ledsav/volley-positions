import { useEffect, useReducer, useRef } from 'react';
import { evaluateChallenge } from '../domain/challenge.js';
import { ANSWERS } from '../domain/formations.js';
import { clamp, dist, pointToMeters } from '../domain/geometry.js';
import { derivePlayers } from '../domain/rotation.js';
import { validate } from '../domain/rules.js';
import { computeStatus } from '../domain/status.js';
import { initialState, reducer } from './trainerReducer.js';

export function useTrainer() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // Latest-state mirror so pointer handlers read fresh positions without re-binding.
  const stateRef = useRef(state);
  stateRef.current = state;

  const courtRef = useRef(null);
  const dragRef = useRef(null);
  const whistleTimer = useRef(null);
  const releaseTimer = useRef(null);

  // --- effects -------------------------------------------------------------
  // Read rotation/mode from the URL once on mount.
  useEffect(() => {
    try {
      const q = new URLSearchParams(location.search);
      const rot = parseInt(q.get('rotation'), 10);
      const mode = q.get('mode');
      const rotation = (rot >= 1 && rot <= 6) ? rot : undefined;
      const validMode = ['learn', 'challenge', 'sandbox'].includes(mode) ? mode : undefined;
      if (rotation || validMode) dispatch({ type: 'INIT', rotation, mode: validMode });
    } catch { /* ignore malformed URL params */ }
  }, []);

  // Keep the URL in sync with rotation/mode.
  useEffect(() => {
    try {
      const u = new URL(location.href);
      u.searchParams.set('rotation', state.rotation);
      u.searchParams.set('mode', state.mode);
      history.replaceState({}, '', u);
    } catch { /* ignore history/URL errors */ }
  }, [state.rotation, state.mode]);

  // Respect prefers-reduced-motion.
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => dispatch({ type: 'SET_REDUCED', reduced: mq.matches });
    mq.addEventListener('change', onChange);
    if (mq.matches) dispatch({ type: 'SET_REDUCED', reduced: true });
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Clear timers on unmount.
  useEffect(() => () => { clearTimeout(whistleTimer.current); clearTimeout(releaseTimer.current); }, []);

  // --- interaction handlers ------------------------------------------------
  function dragStart(role, e) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = courtRef.current?.getBoundingClientRect();
    if (!rect) return;
    const m = pointToMeters(rect, e.clientX, e.clientY);
    const p = stateRef.current.positions[role];
    dragRef.current = { role, dx: p.x - m.x, dy: p.y - m.y };
    dispatch({ type: 'DRAG_START', role });
  }

  function dragMove(role, e) {
    const d = dragRef.current;
    if (!d || d.role !== role) return;
    const rect = courtRef.current?.getBoundingClientRect();
    if (!rect) return;
    const m = pointToMeters(rect, e.clientX, e.clientY);
    const x = clamp(m.x + d.dx, 0.2, 8.8);
    const y = clamp(m.y + d.dy, 0.2, 9.55);
    dispatch({ type: 'DRAG_MOVE', role, x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
  }

  function dragEnd() {
    dragRef.current = null;
    dispatch({ type: 'DRAG_END' });
  }

  function nudge(role, e) {
    const step = e.shiftKey ? 0.5 : 0.15;
    let dx = 0, dy = 0;
    if (e.key === 'ArrowLeft') dx = -step; else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step; else if (e.key === 'ArrowDown') dy = step;
    else return;
    e.preventDefault();
    dispatch({ type: 'NUDGE', role, dx, dy });
  }

  function onServe() {
    const s = stateRef.current;
    if (s.served) { dispatch({ type: 'UNSERVE' }); return; }
    const players = derivePlayers(s);
    const v = validate(players, s.serving);
    if (!v.legal) {
      dispatch({ type: 'SERVE_ILLEGAL' });
      clearTimeout(whistleTimer.current);
      whistleTimer.current = setTimeout(() => dispatch({ type: 'WHISTLE_OFF' }), 1400);
      return;
    }
    dispatch({ type: 'SERVE_LEGAL' });
    clearTimeout(releaseTimer.current);
    releaseTimer.current = setTimeout(() => dispatch({ type: 'RELEASE_END' }), 1100);
  }

  const actions = {
    applyRotation: n => dispatch({ type: 'APPLY_ROTATION', n }),
    setMode: mode => dispatch({ type: 'SET_MODE', mode }),
    setServing: serving => dispatch({ type: 'SET_SERVING', serving }),
    toggleWeb: () => dispatch({ type: 'TOGGLE_WEB' }),
    toggleGhosts: () => dispatch({ type: 'TOGGLE_GHOSTS' }),
    toggleRef: () => dispatch({ type: 'TOGGLE_REF' }),
    select: role => dispatch({ type: 'SELECT', role }),
    onReset: () => dispatch({ type: 'RESET' }),
    nextRotation: () => dispatch({ type: 'APPLY_ROTATION', n: state.rotation % 6 + 1 }),
    dragStart, dragMove, dragEnd, nudge, onServe,
  };

  // --- derived (pure, recomputed each render) ------------------------------
  const players = derivePlayers(state);

  const validation = validate(players, state.serving || state.served);
  const vioZones = new Set();
  validation.violations.forEach(v => { vioZones.add(v.a); vioZones.add(v.b); });
  const byZone = {};
  players.forEach(p => { byZone[p.zone] = p; });
  const ans = ANSWERS[state.rotation];
  const learnMatched = state.mode === 'learn' && !state.served && validation.legal && players.every(p => ans[p.role] && dist(p, ans[p.role]) < 0.9);
  const challenge = evaluateChallenge(players, validation, state.rotation);
  const challengeSuccess = state.mode === 'challenge' && challenge.success;
  const status = computeStatus(state, validation, { challengeSuccess, learnMatched });

  const derived = { players, validation, vioZones, byZone, ans, learnMatched, challenge, challengeSuccess, status };
  return { state, derived, actions, courtRef };
}
