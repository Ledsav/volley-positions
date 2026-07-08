import { describe, expect, it } from 'vitest';
import { derivePlayers } from '../domain/rotation.js';
import { validate } from '../domain/rules.js';
import { releaseTargets } from '../domain/formations.js';
import { initialState, reducer } from './trainerReducer.js';

describe('trainerReducer', () => {
  it('starts in learn mode, rotation 1, receiving, web + ghosts on', () => {
    const s = initialState();
    expect(s).toMatchObject({ rotation: 1, mode: 'learn', serving: false, webOn: true, ghostsOn: true, served: false });
    expect(Object.keys(s.positions).sort()).toEqual(['MB1', 'MB2', 'OH1', 'OH2', 'OPP', 'S']);
  });

  it('APPLY_ROTATION swaps positions and clears served/selection', () => {
    const s0 = { ...initialState(), served: true, selected: 'S', preServe: {} };
    const s1 = reducer(s0, { type: 'APPLY_ROTATION', n: 4 });
    expect(s1.rotation).toBe(4);
    expect(s1.served).toBe(false);
    expect(s1.selected).toBe(null);
    expect(s1.preServe).toBe(null);
  });

  it('SET_MODE turns the web off for challenge and resets to receiving', () => {
    const s1 = reducer(initialState(), { type: 'SET_MODE', mode: 'challenge' });
    expect(s1.mode).toBe('challenge');
    expect(s1.webOn).toBe(false);
    expect(s1.serving).toBe(false);
  });

  it('NUDGE moves a role and clamps within court bounds', () => {
    const s0 = initialState();
    const s1 = reducer(s0, { type: 'NUDGE', role: 'S', dx: -100, dy: 100 });
    expect(s1.positions.S.x).toBeCloseTo(0.2, 6); // clamped low
    expect(s1.positions.S.y).toBeCloseTo(9.55, 6); // clamped high
    expect(s1.selected).toBe('S');
  });

  it('SERVE_LEGAL (receiving) spawns an incoming ball and does NOT move players', () => {
    const s0 = initialState(); // serving: false
    const s1 = reducer(s0, { type: 'SERVE_LEGAL' });
    expect(s1.served).toBe(true);
    expect(s1.ball).toEqual({ kind: 'incoming' });
    expect(s1.releasing).toBe(false);
    expect(s1.positions).toEqual(s0.positions); // frozen at legal-at-contact spots
    expect(s1.preServe).toEqual(s0.positions);
  });

  it('RELEASE swaps in the release targets and starts the sprint', () => {
    const s0 = initialState();
    const served = reducer(s0, { type: 'SERVE_LEGAL' });
    const s1 = reducer(served, { type: 'RELEASE' });
    expect(s1.releasing).toBe(true);
    expect(s1.positions).toEqual(releaseTargets(served));
    expect(s1.positions.S).toEqual({ x: 6.8, y: 1.0 });
  });

  it('SERVE_LEGAL (serving) spawns an outgoing ball and holds positions', () => {
    const serving = reducer(initialState(), { type: 'SET_SERVING', serving: true });
    const s1 = reducer(serving, { type: 'SERVE_LEGAL' });
    expect(s1.served).toBe(true);
    expect(s1.ball).toEqual({ kind: 'outgoing' });
    expect(s1.releasing).toBe(false);
    expect(s1.positions).toEqual(serving.positions); // no release when we serve
  });

  it('RELEASE_END clears the ball and ends the sprint', () => {
    const served = reducer(initialState(), { type: 'SERVE_LEGAL' });
    const ended = reducer(reducer(served, { type: 'RELEASE' }), { type: 'RELEASE_END' });
    expect(ended.releasing).toBe(false);
    expect(ended.ball).toBe(null);
  });

  it('UNSERVE restores the pre-serve snapshot and clears the ball', () => {
    const s0 = initialState();
    const served = reducer(s0, { type: 'SERVE_LEGAL' });
    const back = reducer(served, { type: 'UNSERVE' });
    expect(back.served).toBe(false);
    expect(back.preServe).toBe(null);
    expect(back.ball).toBe(null);
    expect(back.positions).toEqual(s0.positions);
  });

  it('RELEASE after UNSERVE (stale timer) is a no-op', () => {
    const s0 = initialState();
    const served = reducer(s0, { type: 'SERVE_LEGAL' });
    const back = reducer(served, { type: 'UNSERVE' });
    const stale = reducer(back, { type: 'RELEASE' });
    expect(stale.positions).toEqual(s0.positions);
    expect(stale.releasing).toBe(false);
  });

  it('RELEASE while serving:true (serve-case dispatch) is a no-op on positions', () => {
    const serving = reducer(initialState(), { type: 'SET_SERVING', serving: true });
    const s1 = reducer(serving, { type: 'RELEASE' });
    expect(s1.positions).toEqual(serving.positions);
    expect(s1.releasing).toBe(false);
  });

  it('keeps the base receiving formation legal after INIT to a rotation', () => {
    const s = reducer(initialState(), { type: 'INIT', rotation: 4, mode: 'sandbox' });
    expect(s.rotation).toBe(4);
    const players = derivePlayers({ rotation: s.rotation, positions: s.positions, serving: s.serving });
    expect(validate(players, s.serving).legal).toBe(true);
  });
});
