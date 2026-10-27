# 🏐 Spike & Learn — 5-1 Rotation Trainer

An interactive web app built with React and Vite that teaches volleyball's **overlap/positioning rules** at serve contact for a 5-1 rotation. It renders a to-scale court where you can step through all six rotations, drag players to test legality live, and practice building a legal, well-seamed serve-receive formation.

---

## Modes

The app has three modes, switchable at any time from the rail:

- **Learn** — Ghost markers show the coach's suggested answer for the current rotation. Drag players toward them; ghosts are guidance, not snap targets. A coach's note explains the reasoning for that rotation.
- **Challenge** — No ghosts. Build a legal serve-receive formation that also satisfies: three passers behind the 3 m line, seams covered (left/middle/right), and the setter positioned to release to target. A checklist and success state confirm when you've nailed it.
- **Sandbox** — Free play. Toggle whether your team is serving or receiving and watch the constraint web react live, with no target to match.

## Features

- **Rotation picker** — Jump to any of the 6 standard rotations for a 5-1 lineup (Setter, 2 Outside Hitters, 2 Middle Blockers, Opposite).
- **Drag-and-drop players** — Move any player (pointer drag or arrow-key nudge) and get instant legality feedback.
- **Constraint web overlay** — Visualizes the 7 real left-right/front-back constraints between neighboring zones; only the broken pair highlights when a rule is violated.
- **Serve simulation** — "Serve" freezes the formation at contact: if it's illegal, a whistle/fault indicator fires; if legal, players release to their playing positions after a short delay.
- **Selection card** — Click a player to see their zone constraints (who they must stay left of / in front of, etc.).
- **Rule reference modal** — Quick-access summary of the overlap and depth rules.
- **Mobile-friendly rail** — A dedicated compact layout for small screens.
- **URL state** — Current rotation and mode are kept in the URL query string so a view can be shared/reloaded.

## Rules engine

The rules live in `src/domain/rules.js` as pure functions, independent of React:

- `validate(players, serving)` — Checks the 7 lateral/depth constraint pairs between neighboring zones and returns any violations. Skipped entirely while your team is serving (no overlap rule applies).
- `constraintsForZone(zone, byZone)` — Human-readable list of what a given zone's neighbors require (used by the selection card).
- `setterNeighbors(sZone, byZone)` — The two zones adjacent to the setter, used for challenge-mode insight text.

Constraint pairs and zone geometry are defined in `src/domain/constants.js` (`PAIRS`, `ZONE_BASE`, `ROLES`).

---

## Project Structure

```
src/
├── App.jsx                       # Root component: renders Court + Rail + rule modal
├── main.jsx                      # Vite/React entry point
├── theme.js                      # Shared colors and fonts
├── components/
│   ├── RuleReferenceModal.jsx    # Rule summary popup
│   ├── court/
│   │   ├── Court.jsx             # SVG court, net, attack lines, zone labels
│   │   ├── ConstraintOverlay.jsx # Draws the constraint web between players
│   │   └── PlayerToken.jsx       # Draggable/selectable player token
│   └── rail/
│       ├── Rail.jsx              # Desktop sidebar layout
│       ├── MobileRail.jsx        # Compact layout for small screens
│       ├── ModePanel.jsx         # Learn/Challenge/Sandbox switcher + toggles
│       ├── RotationPicker.jsx    # 1-6 rotation selector
│       ├── ChallengePanel.jsx    # Challenge-mode checklist and success state
│       ├── SelectionCard.jsx     # Per-player zone constraint details
│       ├── StatusPanel.jsx       # Current status/violations summary
│       └── ActionBar.jsx         # Serve / reset / other actions
├── domain/                       # Pure business logic (no React), unit-tested
│   ├── constants.js              # ROLES, zone bases, constraint PAIRS
│   ├── rotation.js               # Derives player positions for a given rotation
│   ├── rules.js                  # Legality validation and constraint helpers
│   ├── challenge.js              # Challenge-mode success criteria
│   ├── formations.js             # Coach "answer" formations and notes
│   ├── geometry.js               # Coordinate/pixel <-> meters helpers
│   └── status.js                 # Derives rail/court status text and color
└── hooks/
    ├── useTrainer.js              # Wires domain logic + reducer into app state/actions
    ├── trainerReducer.js          # useReducer state machine (rotation, mode, drag, serve)
    └── useIsMobile.js             # Responsive breakpoint hook
```

## Tech Stack

| Tool | Role |
|---|---|
| **React 19** | UI framework |
| **Vite 7** | Dev server and bundler |
| **Tailwind CSS 4** | Wired into PostCSS but not used yet (styles are inline, from `theme.js` + `index.css`) |
| **Lucide React** | Icon set |
| **Vitest** | Unit tests (domain logic + reducer + render smoke test) |
| **ESLint** | Linting |
| **PostCSS + Autoprefixer** | CSS processing |
| **GitHub Actions + Pages** | Static deployment (see [Deploying](#deploying)) |

---

## Getting Started

Prerequisites: Node.js 22 (what CI uses; Vite 7 needs at least 20.19).

```bash
git clone https://github.com/Ledsav/volley-positions.git
cd volley-positions

# Install dependencies
npm ci

# Start the development server (http://localhost:5173/volley-positions/)
npm run dev

# Run the test suite
npm run test
# or in watch mode
npm run test:watch

# Lint
npm run lint

# Build for production
npm run build

# Preview the production build
npm run preview
```

In VS Code, **Terminal → Run Task… → Setup (fresh clone)** runs `npm ci`, then the tests, lint and build. **Dev**
starts the dev server.

## Deploying

The live app is at https://www.albertovaldesrey.com/volley-positions/. `.github/workflows/deploy.yml` runs
`npm ci`, `npm run lint` and `npm run build` on every push to `main`, then publishes `dist/` to GitHub Pages.
`vite.config.js` sets `base: '/volley-positions/'`, so asset paths only work under that sub-path.

One-time setup: repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**. There is no local
deploy script (the `gh-pages` devDependency is unused).

---

## Volleyball Rotation Rules Reference

| Rule | Description |
|---|---|
| **Serving** | The player in zone 1 (Right Back) serves. After winning the serve, the team rotates clockwise. |
| **Front/Back depth** | Each front-row player must be closer to the net than their corresponding back-row counterpart. |
| **Left-right overlap** | Within each row, players must maintain their relative left-to-right order compared to their adjacent neighbors. |
| **No checks on serve** | While your team is serving, the overlap/depth rules don't apply — only the receiving team must be positioned legally. |
