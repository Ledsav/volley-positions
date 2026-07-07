# 🏐 Volleyball Rotation Rules — Interactive Visualizer

An interactive web application built with React and Vite that helps players and coaches **learn, visualize, and test volleyball rotation rules**. It renders a live volleyball court where you can cycle through all six standard rotations, watch them animate automatically, select individual players to inspect their abilities, and freely drag players into custom positions to trigger and study rule violations in real time.

---

## Features

### Standard Rotation Mode
- Cycles through all **6 official rotations** (clockwise rotation after winning the serve).
- Each rotation correctly positions all 6 players across the front row (positions 2, 3, 4) and back row (positions 1, 5, 6).
- The **serving player** (position 1) is highlighted with a pulsing animation and a ⭐ badge.
- Navigation: step forward/backward through rotations or enable **auto-play** (advances every 3 seconds).

### Custom / Exploration Mode
- Enter **Custom Mode** to freely drag any player anywhere on the court using HTML5 drag-and-drop.
- The rules engine validates the resulting layout in real time and displays all **active violations**.
- Designed for learning: move a back-row player in front of the attack line, swap left-right order, etc., and instantly see what rule was broken and why.

### Rules Validation Engine (`VolleyballRulesEngine`)
A pure static class that encapsulates all rotation logic:

| Method | Purpose |
|---|---|
| `getServingPlayer(positions, rotation)` | Identifies which player occupies position 1 (server) |
| `getRotationViolations(positions, isCustomMode, rotation, standardRotations)` | Returns a list of human-readable rule violation strings |
| `getPlayerAbilities(position)` | Returns what a player can and cannot do based on their front/back zone |

**Validated rules in custom mode:**
1. Must have exactly 6 players on court.
2. Must have exactly 3 players in the front row and 3 in the back row.
3. No back-row player may stand in front of any front-row player (depth rule).
4. Left-to-right order within each row must match the expected order for the current rotation (overlap rule).

### Player Inspector
- Click any player token to open a **detail panel** showing:
  - Their current named position (e.g., *Left Back*, *Middle Front*).
  - Their zone (FRONT ROW / BACK ROW).
  - A bullet list of what they **can** and **cannot** do (attack, block, serve, dig, etc.).

### Court Visualization
- A to-scale orange court with:
  - The **net** rendered at the center.
  - **Attack lines** (10-foot lines) shown in red on both halves.
  - Optional **position zone numbers** (1–6) overlaid at their canonical corners.
  - FRONT ROW / BACK ROW zone labels.
- Players are color-coded tokens (6 distinct colors) with smooth CSS transitions during rotation changes.

---

## Project Structure

```
src/
├── components/
│   ├── VolleyballRotations.jsx   # Root stateful component — orchestrates all state and logic
│   ├── VolleyballCourt.jsx       # SVG/div court with drag-and-drop drop zone
│   ├── Player.jsx                # Individual draggable/selectable player token
│   ├── StatusPanel.jsx           # Rotation status, violations list, player info, custom mode tips
│   ├── GameControls.jsx          # Navigation buttons (prev/next/play/pause/reset/mode toggle)
│   └── RulesSummary.jsx          # Static rules reference card at the bottom of the page
├── constants/
│   └── volleyball.js             # ROTATIONS map (6 rotations × 6 players), PLAYER_COLORS, COURT_DIMENSIONS
└── services/
    └── VolleyballRulesEngine.js  # Pure business logic — no React dependencies
```

### State managed in `VolleyballRotations`

| State variable | Type | Purpose |
|---|---|---|
| `currentRotation` | `1–6` | Which standard rotation is active |
| `isAnimating` | `boolean` | Whether auto-play is running |
| `showPositionNumbers` | `boolean` | Toggle court zone number overlay |
| `selectedPlayer` | `string \| null` | Which player token is selected for info panel |
| `customMode` | `boolean` | Whether drag-and-drop mode is active |
| `customPositions` | `object` | Player position map used in custom mode |
| `draggedPlayer` | `string \| null` | Which player is currently being dragged |

---

## Tech Stack

| Tool | Role |
|---|---|
| **React 19** | UI framework |
| **Vite 7** | Dev server and bundler |
| **Tailwind CSS 4** | Utility-first styling |
| **Lucide React** | Icon set (arrows, play/pause, alert, check) |
| **PostCSS + Autoprefixer** | CSS processing |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

---

## Volleyball Rotation Rules Reference

| Rule | Description |
|---|---|
| **Serving** | The player in position 1 (Right Back) serves. After winning the serve, the team rotates clockwise. |
| **Front/Back depth** | Each front-row player must be closer to the net than their corresponding back-row counterpart. |
| **Left-right overlap** | Within each row, players must maintain their relative left-to-right order compared to their adjacent column neighbours. |
| **Back-row attack** | Back-row players may only attack from behind the attack line (10-foot / 3-metre line). |
| **Blocking** | Back-row players cannot participate in a block at the net. |
