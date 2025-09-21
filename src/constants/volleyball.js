// Court position data and game logic
export const ROTATIONS = {
  1: {
    1: { x: 75, y: 75, name: "Right Back", zone: "back" }, // Server
    2: { x: 75, y: 25, name: "Right Front", zone: "front" },
    3: { x: 50, y: 25, name: "Middle Front", zone: "front" },
    4: { x: 25, y: 25, name: "Left Front", zone: "front" },
    5: { x: 25, y: 75, name: "Left Back", zone: "back" },
    6: { x: 50, y: 75, name: "Middle Back", zone: "back" }
  },
  2: {
    1: { x: 50, y: 75, name: "Middle Back", zone: "back" },
    2: { x: 75, y: 75, name: "Right Back", zone: "back" }, // Server
    3: { x: 75, y: 25, name: "Right Front", zone: "front" },
    4: { x: 50, y: 25, name: "Middle Front", zone: "front" },
    5: { x: 25, y: 25, name: "Left Front", zone: "front" },
    6: { x: 25, y: 75, name: "Left Back", zone: "back" }
  },
  3: {
    1: { x: 25, y: 75, name: "Left Back", zone: "back" },
    2: { x: 50, y: 75, name: "Middle Back", zone: "back" },
    3: { x: 75, y: 75, name: "Right Back", zone: "back" }, // Server
    4: { x: 75, y: 25, name: "Right Front", zone: "front" },
    5: { x: 50, y: 25, name: "Middle Front", zone: "front" },
    6: { x: 25, y: 25, name: "Left Front", zone: "front" }
  },
  4: {
    1: { x: 25, y: 25, name: "Left Front", zone: "front" },
    2: { x: 25, y: 75, name: "Left Back", zone: "back" },
    3: { x: 50, y: 75, name: "Middle Back", zone: "back" },
    4: { x: 75, y: 75, name: "Right Back", zone: "back" }, // Server
    5: { x: 75, y: 25, name: "Right Front", zone: "front" },
    6: { x: 50, y: 25, name: "Middle Front", zone: "front" }
  },
  5: {
    1: { x: 50, y: 25, name: "Middle Front", zone: "front" },
    2: { x: 25, y: 25, name: "Left Front", zone: "front" },
    3: { x: 25, y: 75, name: "Left Back", zone: "back" },
    4: { x: 50, y: 75, name: "Middle Back", zone: "back" },
    5: { x: 75, y: 75, name: "Right Back", zone: "back" }, // Server
    6: { x: 75, y: 25, name: "Right Front", zone: "front" }
  },
  6: {
    1: { x: 75, y: 25, name: "Right Front", zone: "front" },
    2: { x: 50, y: 25, name: "Middle Front", zone: "front" },
    3: { x: 25, y: 25, name: "Left Front", zone: "front" },
    4: { x: 25, y: 75, name: "Left Back", zone: "back" },
    5: { x: 50, y: 75, name: "Middle Back", zone: "back" },
    6: { x: 75, y: 75, name: "Right Back", zone: "back" } // Server
  }
};

// Premium sports color palette for players
export const PLAYER_COLORS = {
  1: "bg-red-600",      // Strong red for server visibility
  2: "bg-blue-700",     // Deep athletic blue
  3: "bg-emerald-600",  // Professional green
  4: "bg-amber-500",    // Energetic amber
  5: "bg-orange-600",   // Athletic orange
  6: "bg-slate-700"     // Premium neutral
};

export const COURT_DIMENSIONS = {
  width: 500,
  height: 400,
  // Responsive breakpoints
  mobile: {
    width: 320,
    height: 256
  },
  tablet: {
    width: 400,
    height: 320
  }
};