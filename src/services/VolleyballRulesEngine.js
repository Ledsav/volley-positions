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
   * Validate rotation and return violations
   */
  static getRotationViolations(positions, isCustomMode, currentRotation, standardRotations) {
    const violations = [];
    
    // Only check violations in custom mode - all standard rotations are legal
    if (!isCustomMode) {
      return []; // Standard rotations 1-6 are always legal
    }
    
    // Get all players with their positions
    const allPlayers = Object.entries(positions).map(([id, pos]) => ({
      id: parseInt(id),
      x: pos.x,
      y: pos.y,
      isBackRow: pos.y >= 50
    }));

    // Check correct number of players
    if (allPlayers.length !== 6) {
      violations.push("Must have exactly 6 players on court");
      return violations;
    }

    const frontRowPlayers = allPlayers.filter(p => !p.isBackRow).sort((a, b) => a.x - b.x);
    const backRowPlayers = allPlayers.filter(p => p.isBackRow).sort((a, b) => a.x - b.x);

    if (frontRowPlayers.length !== 3 || backRowPlayers.length !== 3) {
      violations.push("Must have exactly 3 players in front row and 3 in back row");
      return violations;
    }

    // Rule 1: Back row players cannot be in front of front row players
    for (const backPlayer of backRowPlayers) {
      for (const frontPlayer of frontRowPlayers) {
        if (backPlayer.y <= frontPlayer.y) {
          violations.push(`Back row player ${backPlayer.id} cannot be in front of front row player ${frontPlayer.id}`);
          break;
        }
      }
    }

    // Rule 2: Players in same row cannot exchange left-right positions
    // Get the expected positions for the current rotation
    if (standardRotations && currentRotation) {
      const expectedPositions = standardRotations[currentRotation];
      
      // Get expected front and back row orders for this rotation
      const expectedFrontRow = Object.entries(expectedPositions)
        .filter(([, pos]) => pos.zone === 'front')
        .sort((a, b) => a[1].x - b[1].x)
        .map(([id]) => parseInt(id));
        
      const expectedBackRow = Object.entries(expectedPositions)
        .filter(([, pos]) => pos.zone === 'back') 
        .sort((a, b) => a[1].x - b[1].x)
        .map(([id]) => parseInt(id));

      // Check front row order
      const frontIds = frontRowPlayers.map(p => p.id);
      if (JSON.stringify(frontIds) !== JSON.stringify(expectedFrontRow)) {
        violations.push(`Front row left-right order should be: ${expectedFrontRow.join('-')}, but found: ${frontIds.join('-')}`);
      }

      // Check back row order
      const backIds = backRowPlayers.map(p => p.id);
      if (JSON.stringify(backIds) !== JSON.stringify(expectedBackRow)) {
        violations.push(`Back row left-right order should be: ${expectedBackRow.join('-')}, but found: ${backIds.join('-')}`);
      }
    }

    return violations;
  }

  /**
   * Get player abilities based on their position
   */
  static getPlayerAbilities(position) {
    if (position.zone === 'front') {
      return [
        "• Attack from anywhere",
        "• Block at the net",
        "• Set and pass"
      ];
    } else {
      return [
        "• Serve (if in position 1)",
        "• Attack behind attack line",
        "• Pass and dig",
        "• Cannot block"
      ];
    }
  }
}