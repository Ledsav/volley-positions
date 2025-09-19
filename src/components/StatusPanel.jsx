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
    <div className="space-y-4">
      
      {/* Current Status */}
      <div className={`p-4 rounded-lg border-2 ${isLegalRotation ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
        <div className="flex items-center gap-2 mb-2">
          {isLegalRotation ? <CheckCircle className="text-green-600" size={24} /> : <AlertTriangle className="text-red-600" size={24} />}
          <h3 className="font-bold text-lg">
            {customMode ? 'Custom Setup' : `Rotation ${currentRotation}`}: {isLegalRotation ? 'LEGAL ✅' : 'VIOLATION! ❌'}
          </h3>
        </div>
        <p className="text-sm">
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
        <div className="bg-white border border-gray-300 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-6 h-6 rounded-full ${PLAYER_COLORS[selectedPlayer]}`}></div>
            <h4 className="font-bold">Player {selectedPlayer}</h4>
          </div>
          <p className="text-sm mb-1">
            <strong>Position:</strong> {positions[selectedPlayer].name}
          </p>
          <p className="text-sm mb-2">
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
        <div className="bg-purple-50 border border-purple-300 p-4 rounded-lg">
          <h4 className="font-bold text-purple-800 mb-2">🎮 Custom Mode Active</h4>
          <p className="text-sm text-purple-700 mb-2">
            Drag players around to create illegal rotations and see what violations occur!
          </p>
          <div className="text-xs text-purple-600">
            <p><strong>Try these violations:</strong></p>
            <ul className="ml-2">
              <li>• Move a back row player in front of a front row player</li>
              <li>• Switch the left-right order dramatically</li>
              <li>• Move players to completely wrong positions</li>
            </ul>
          </div>
        </div>
      )}

      {/* Toggle Options */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showPositionNumbers}
            onChange={(e) => onTogglePositionNumbers(e.target.checked)}
            className="w-4 h-4"
          />
          Show court position numbers
        </label>
      </div>
    </div>
  );
};

export default StatusPanel;