import { basePositions, releaseTargets } from '../domain/formations.js';
import { clamp } from '../domain/geometry.js';

export function initialState() {
  return {
    rotation: 1, mode: 'learn', serving: false, webOn: true, ghostsOn: true,
    positions: basePositions(1, false),
    selected: null, draggingRole: null, served: false, preServe: null,
    whistle: false, showRef: false, reduced: false, releasing: false,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case 'INIT': {
      const patch = {};
      if (action.rotation) { patch.rotation = action.rotation; patch.positions = basePositions(action.rotation, false); }
      if (action.mode) { patch.mode = action.mode; patch.webOn = action.mode !== 'challenge'; }
      return Object.keys(patch).length ? { ...state, ...patch } : state;
    }
    case 'APPLY_ROTATION':
      return { ...state, rotation: action.n, positions: basePositions(action.n, state.serving), served: false, preServe: null, selected: null };
    case 'SET_MODE':
      return { ...state, mode: action.mode, serving: false, webOn: action.mode !== 'challenge', ghostsOn: true, served: false, preServe: null, selected: null, positions: basePositions(state.rotation, false) };
    case 'SET_SERVING':
      return { ...state, serving: action.serving, served: false, preServe: null, positions: basePositions(state.rotation, action.serving) };
    case 'TOGGLE_WEB':
      return { ...state, webOn: !state.webOn };
    case 'TOGGLE_GHOSTS':
      return { ...state, ghostsOn: !state.ghostsOn };
    case 'TOGGLE_REF':
      return { ...state, showRef: !state.showRef };
    case 'SELECT':
      return { ...state, selected: action.role };
    case 'DRAG_START':
      return { ...state, draggingRole: action.role, selected: action.role };
    case 'DRAG_MOVE':
      return { ...state, positions: { ...state.positions, [action.role]: { x: action.x, y: action.y } } };
    case 'DRAG_END':
      return { ...state, draggingRole: null };
    case 'NUDGE': {
      const p = state.positions[action.role];
      return { ...state, selected: action.role, positions: { ...state.positions, [action.role]: { x: clamp(p.x + action.dx, 0.2, 8.8), y: clamp(p.y + action.dy, 0.2, 9.55) } } };
    }
    case 'RESET':
      return { ...state, positions: basePositions(state.rotation, state.serving), served: false, preServe: null };
    case 'SET_REDUCED':
      return { ...state, reduced: action.reduced };
    case 'SERVE_ILLEGAL':
      return { ...state, whistle: true };
    case 'WHISTLE_OFF':
      return { ...state, whistle: false };
    case 'SERVE_LEGAL':
      return { ...state, preServe: { ...state.positions }, served: true, positions: releaseTargets(state), releasing: true };
    case 'RELEASE_END':
      return { ...state, releasing: false };
    case 'UNSERVE':
      return { ...state, positions: state.preServe || basePositions(state.rotation, state.serving), served: false, preServe: null };
    default:
      return state;
  }
}
