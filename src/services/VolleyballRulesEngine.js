// Business logic for volleyball rules and validation
export class VolleyballRulesEngine {
  /**
   * Get the serving player for a given rotation or custom positions
   */
  static getServingPlayer(positions, currentRotation) {
    // Find the player in position 1 (serving position)

    const serverEntry = Object.entries(positions).find(([, pos]) => 
      pos.name.includes("Right Back") || pos.name.includes("Server") || 
      (currentRotation === 6 && pos.name.includes("Right Front"))
    );
    return serverEntry ? serverEntry[0] : '1';
  }

  /**
   * Validate position faults (overlaps) based on official volleyball rules
   * Position faults are checked only at the moment the server contacts the ball
   */
  static getRotationViolations(positions, isCustomMode) {
    const violations = [];
  
    // Only check violations in custom mode - all standard rotations are legal
    if (!isCustomMode) {
      return []; // Standard rotations 1-6 are always legal
    }
  
    // Check if we have exactly 6 players
    if (Object.keys(positions).length !== 6) {
      violations.push("Must have exactly 6 players on court");
      return violations;
    }
  
    // Separate front and back row players as objects with player ID as key
    const frontPlayers = {};
    const backPlayers = {};
  
    Object.entries(positions).forEach(([playerId, playerData]) => {
      if (playerData.zone === 'front') {
        frontPlayers[playerId] = playerData;
      } else if (playerData.zone === 'back') {
        backPlayers[playerId] = playerData;
      }
    });
  
    // Rule 1: Check for any player in the front row if it has a smaller y than any in the back
    Object.entries(frontPlayers).forEach(([frontId, frontPlayer]) => {
      Object.entries(backPlayers).forEach(([backId, backPlayer]) => {
        if (frontPlayer.y >= backPlayer.y) {
          violations.push(`Position fault: Front row player ${frontId} cannot be behind back row player ${backId}`);
        }
      });
    });
  
    // Rule 2: Check back row relative positions by name
    const leftBack = Object.entries(backPlayers).find(([, data]) => data.name.includes('Left Back'));
    const middleBack = Object.entries(backPlayers).find(([, data]) => data.name.includes('Middle Back'));
    const rightBack = Object.entries(backPlayers).find(([, data]) => data.name.includes('Right Back'));

    if (leftBack && middleBack && rightBack) {
      // Check if middle back is actually between left and right back
      if (!(leftBack[1].x < middleBack[1].x && middleBack[1].x < rightBack[1].x)) {
        violations.push(`Position fault: Middle Back must be between Left Back and Right Back`);
      }
    }
  
    // Rule 3: Check front row relative positions by name
    const leftFront = Object.entries(frontPlayers).find(([, data]) => data.name.includes('Left Front'));
    const middleFront = Object.entries(frontPlayers).find(([, data]) => data.name.includes('Middle Front'));
    const rightFront = Object.entries(frontPlayers).find(([, data]) => data.name.includes('Right Front'));
  
    if (leftFront && middleFront && rightFront) {
      // Check if middle front is actually between left and right front
      if (!(leftFront[1].x < middleFront[1].x && middleFront[1].x < rightFront[1].x)) {
        violations.push(`Position fault: Middle Front must be between Left Front and Right Front`);
      }
    }
  
    return violations;
  }

  /**
   * Get the field position (1-6) for a given x,y coordinate
   */
  static getFieldPosition(x, y) {
    const isBackRow = y >= 50;

    if (isBackRow) {
      // Back row positions: 5 (left), 6 (middle), 1 (right)
      if (x < 33) return 5;      // Left back
      else if (x > 67) return 1; // Right back
      else return 6;             // Middle back
    } else {
      // Front row positions: 4 (left), 3 (middle), 2 (right)
      if (x < 33) return 4;      // Left front
      else if (x > 67) return 2; // Right front
      else return 3;             // Middle front
    }
  }

  /**
   * Get field position name
   */
  static getFieldPositionName(fieldPos) {
    const names = {
      1: "Position 1 (Right Back)",
      2: "Position 2 (Right Front)",
      3: "Position 3 (Middle Front)",
      4: "Position 4 (Left Front)",
      5: "Position 5 (Left Back)",
      6: "Position 6 (Middle Back)"
    };
    return names[fieldPos] || "Unknown Position";
  }

  /**
   * Get player abilities based on their field position
   */
  static getPlayerAbilities(position) {
    const fieldPos = this.getFieldPosition(position.x, position.y);
    const isBackRow = fieldPos === 1 || fieldPos === 5 || fieldPos === 6;

    if (!isBackRow) {
      return [
        "• Attack from anywhere",
        "• Block at the net",
        "• Set and pass"
      ];
    } else {
      const abilities = [
        "• Attack behind attack line",
        "• Pass and dig",
        "• Cannot block"
      ];

      if (fieldPos === 1) {
        abilities.unshift("• Serve from this position");
      }

      return abilities;
    }
  }
}