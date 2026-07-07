export const ROLES = ['S', 'OH1', 'MB1', 'OPP', 'OH2', 'MB2'];
export const Z0 = { S: 1, OH1: 2, MB1: 3, OPP: 4, OH2: 5, MB2: 6 };
export const ROLE_NAMES = { S: 'Setter', OH1: 'Outside hitter 1', MB1: 'Middle blocker 1', OPP: 'Opposite', OH2: 'Outside hitter 2', MB2: 'Middle blocker 2' };
export const ZONE_BASE = { 1: [7.5, 6.6], 2: [7.5, 1.6], 3: [4.5, 1.6], 4: [1.5, 1.6], 5: [1.5, 6.6], 6: [4.5, 6.6] };
// [zoneA, zoneB, axis],  lateral: A must be left of B; depth: A (front) must be in front of B (back)
export const PAIRS = [[4, 3, 'lat'], [3, 2, 'lat'], [5, 6, 'lat'], [6, 1, 'lat'], [4, 5, 'dep'], [3, 6, 'dep'], [2, 1, 'dep']];
