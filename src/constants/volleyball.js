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

export const PLAYER_COLORS = {
  1: "bg-red-500",
  2: "bg-blue-500", 
  3: "bg-green-500",
  4: "bg-yellow-500",
  5: "bg-purple-500",
  6: "bg-pink-500"
};

export const COURT_DIMENSIONS = {
  width: 500,
  height: 400
};