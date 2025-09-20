import { AlertTriangle, CheckCircle } from 'lucide-react';
import { PLAYER_COLORS } from '../constants/volleyball';
import { VolleyballRulesEngine } from '../services/VolleyballRulesEngine';

const StatusPanel = ({
  isLegalRotation = true,
  violations = [],
  customMode = false,
  currentRotation = 1,
  servingPlayer = '1',
  selectedPlayer = null,
  positions = {},
  showPositionNumbers = true,
  onTogglePositionNumbers = () => {}
}) => {
  return (
    <div className="space-y-3 sm:space-y-4">

      {/* Current Status - Streamlined */}
      <div className={`p-4 rounded-xl transition-all duration-300 ${
        isLegalRotation
          ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200'
          : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
      }`}>
        <div className="flex items-center gap-3">
          {isLegalRotation ? (
            <CheckCircle className="text-emerald-600 flex-shrink-0" size={24} />
          ) : (
            <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
          )}
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800">
              {customMode ? 'Position Exploration' : `Rotation ${currentRotation}`}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {customMode
                ? 'Drag players to test different positions!'
                : `Player ${servingPlayer} serves from position 1`
              }
            </p>
            {!isLegalRotation && (
              <div><p className="text-sm text-red-600 mt-2 font-medium">
              {violations.length} position fault{violations.length !== 1 ? 's' : ''} detected
            </p>
            <p>
              {violations.map((v, idx) => (
                <span key={idx} className="text-sm text-red-600">
                  • {v}
                  <br />
                </span>
              ))}
            </p>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Info - Enhanced */}
      {selectedPlayer && (
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-full ${PLAYER_COLORS[selectedPlayer]} shadow-lg flex items-center justify-center text-white font-bold text-sm`}>
              {selectedPlayer}
            </div>
            <div>
              <h4 className="font-bold text-base text-gray-800">Player {selectedPlayer}</h4>
              <p className="text-sm text-gray-600">{positions[selectedPlayer].name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700">Zone:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                  {positions[selectedPlayer].zone.toUpperCase()} ROW
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Field Position:</span>
                <p className="text-gray-600 mt-1">
                  {VolleyballRulesEngine.getFieldPositionName(
                    VolleyballRulesEngine.getFieldPosition(
                      positions[selectedPlayer].x,
                      positions[selectedPlayer].y
                    )
                  )}
                </p>
              </div>
            </div>

            <div>
              <span className="font-medium text-gray-700">Abilities:</span>
              <ul className="mt-1 space-y-1">
                {VolleyballRulesEngine.getPlayerAbilities(positions[selectedPlayer]).map((ability, index) => (
                  <li key={index} className="text-gray-600 text-xs flex items-center gap-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    {ability}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Custom Mode Instructions - Improved */}
      {customMode && (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🎮</span>
            <h4 className="font-bold text-violet-800 text-base">Exploration Mode Active</h4>
          </div>
          <p className="text-sm text-violet-700 mb-3">
            Drag players around to create position faults and see how the court responds!
          </p>
          <details className="text-sm">
            <summary className="font-medium text-violet-700 cursor-pointer hover:text-violet-800 transition-colors">
              💡 Try these position faults...
            </summary>
            <ul className="mt-2 space-y-1 text-violet-600 pl-4">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-violet-400 rounded-full"></span>
                Move front row player behind back row player
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-violet-400 rounded-full"></span>
                Move left player to the right of middle player
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-violet-400 rounded-full"></span>
                Create overlapping positions between adjacent players
              </li>
            </ul>
          </details>
        </div>
      )}

      {/* Toggle Options - Enhanced */}
      <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <label className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer touch-manipulation hover:text-gray-800 transition-colors">
          <input
            type="checkbox"
            checked={showPositionNumbers}
            onChange={(e) => onTogglePositionNumbers(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
          />
          Show court position numbers
        </label>
      </div>
    </div>
  );
};

export default StatusPanel;