import { AlertTriangle, CheckCircle } from 'lucide-react';
import { PLAYER_COLORS } from '../constants/volleyball';
import { VolleyballRulesEngine } from '../services/VolleyballRulesEngine';

const StatusPanel = ({ 
  isLegalRotation, 
  violations, 
  customMode, 
  currentRotation, 
  servingPlayer, 
  selectedPlayer, 
  positions,
  showPositionNumbers,
  onTogglePositionNumbers 
}) => {
  return (
    <div className="space-y-3 sm:space-y-4">

      {/* Current Status */}
      <div className={`p-3 sm:p-4 rounded-lg border-2 ${isLegalRotation ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
        <div className="flex items-center gap-2 mb-2">
          {isLegalRotation ? <CheckCircle className="text-green-600" size={20} /> : <AlertTriangle className="text-red-600" size={20} />}
          <h3 className="font-bold text-base sm:text-lg">
            {customMode ? 'Custom Setup' : `Rotation ${currentRotation}`}: {isLegalRotation ? 'LEGAL ✅' : 'VIOLATION! ❌'}
          </h3>
        </div>
        <p className="text-xs sm:text-sm">
          {customMode ? 'Drag players to test different positions!' : `Player ${servingPlayer} serves from position 1`}
        </p>
      </div>

      {/* Violations Display - Always reserve space */}
      <div className={`transition-all duration-300 ${
        !isLegalRotation 
          ? 'bg-red-50 border border-red-300 p-4 rounded-lg opacity-100 max-h-96' 
          : 'p-4 opacity-0 max-h-0 overflow-hidden'
      }`}>
        <h4 className="font-bold text-red-800 mb-2">Rule Violations:</h4>
        <ul className="text-sm text-red-700 space-y-1">
          {violations.map((violation, index) => (
            <li key={index}>• {violation}</li>
          ))}
        </ul>
      </div>

      {/* Player Info */}
      {selectedPlayer && (
        <div className="bg-white border border-gray-300 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${PLAYER_COLORS[selectedPlayer]}`}></div>
            <h4 className="font-bold text-sm sm:text-base">Player {selectedPlayer}</h4>
          </div>
          <p className="text-xs sm:text-sm mb-1">
            <strong>Original Position:</strong> {positions[selectedPlayer].name}
          </p>
          <p className="text-xs sm:text-sm mb-1">
            <strong>Current Field Position:</strong> {VolleyballRulesEngine.getFieldPositionName(VolleyballRulesEngine.getFieldPosition(positions[selectedPlayer].x, positions[selectedPlayer].y))}
          </p>
          <p className="text-xs sm:text-sm mb-2">
            <strong>Zone:</strong> {positions[selectedPlayer].zone.toUpperCase()} ROW
          </p>
          <div className="text-xs text-gray-600">
            <p><strong>Can do:</strong></p>
            <ul className="ml-2">
              {VolleyballRulesEngine.getPlayerAbilities(positions[selectedPlayer]).map((ability, index) => (
                <li key={index}>{ability}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Custom Mode Instructions */}
      {customMode && (
        <div className="bg-purple-50 border border-purple-300 p-3 sm:p-4 rounded-lg">
          <h4 className="font-bold text-purple-800 mb-2 text-sm sm:text-base">🎮 Custom Mode Active</h4>
          <p className="text-xs sm:text-sm text-purple-700 mb-2">
            Drag players around to create position faults and see what violations occur!
          </p>
          <div className="text-xs text-purple-600">
            <p><strong>Try these position faults:</strong></p>
            <ul className="ml-2">
              <li>• Move front row player behind back row player</li>
              <li>• Move left player to the right of middle player</li>
              <li>• Move right player to the left of middle player</li>
              <li>• Create overlapping positions between adjacent players</li>
            </ul>
          </div>
        </div>
      )}

      {/* Toggle Options */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs sm:text-sm touch-manipulation">
          <input
            type="checkbox"
            checked={showPositionNumbers}
            onChange={(e) => onTogglePositionNumbers(e.target.checked)}
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
          Show court position numbers
        </label>
      </div>
    </div>
  );
};

export default StatusPanel;