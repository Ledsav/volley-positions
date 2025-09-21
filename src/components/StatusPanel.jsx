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

      {/* Current Status - Premium Sports Styling */}
      <div className={`p-5 rounded-xl transition-all duration-300 shadow-md ${
        isLegalRotation
          ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300'
          : 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300'
      }`}>
        <div className="flex items-center gap-3">
          {isLegalRotation ? (
            <CheckCircle className="text-emerald-700 flex-shrink-0" size={26} />
          ) : (
            <AlertTriangle className="text-red-700 flex-shrink-0" size={26} />
          )}
          <div className="flex-1">
            <h3 className="font-bold text-xl text-slate-800">
              {customMode ? 'Position Exploration' : `Rotation ${currentRotation}`}
            </h3>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              {customMode
                ? 'Drag players to test different positions!'
                : `Player ${servingPlayer} serves from position 1`
              }
            </p>
            {!isLegalRotation && (
              <div className="mt-3 p-3 bg-red-100/80 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 font-semibold mb-2">
                  {violations.length} position fault{violations.length !== 1 ? 's' : ''} detected
                </p>
                <div className="space-y-1">
                  {violations.map((v, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-red-600">
                      <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Info - Premium Sports Design */}
      {selectedPlayer && (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 p-5 rounded-xl shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-10 h-10 rounded-full ${PLAYER_COLORS[selectedPlayer]} shadow-lg flex items-center justify-center text-white font-bold text-base ring-2 ring-white`}>
              {selectedPlayer}
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-800">Player {selectedPlayer}</h4>
              <p className="text-sm text-slate-600 font-medium">{positions[selectedPlayer].name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-slate-700">Zone:</span>
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold tracking-wide">
                  {positions[selectedPlayer].zone.toUpperCase()} ROW
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Field Position:</span>
                <p className="text-slate-600 mt-1 font-medium">
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
              <span className="font-semibold text-slate-700">Abilities:</span>
              <ul className="mt-2 space-y-1.5">
                {VolleyballRulesEngine.getPlayerAbilities(positions[selectedPlayer]).map((ability, index) => (
                  <li key={index} className="text-slate-600 text-xs flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {ability}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Custom Mode Instructions - Premium Sports Design */}
      {customMode && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-5 rounded-xl shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🎮</span>
            <h4 className="font-bold text-blue-800 text-lg">Exploration Mode Active</h4>
          </div>
          <p className="text-sm text-blue-700 mb-4 font-medium">
            Drag players around to create position faults and see how the court responds!
          </p>
          <details className="text-sm">
            <summary className="font-semibold text-blue-700 cursor-pointer hover:text-blue-800 transition-colors">
              💡 Try these position faults...
            </summary>
            <ul className="mt-3 space-y-2 text-blue-600 pl-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></span>
                Move front row player behind back row player
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></span>
                Move left player to the right of middle player
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></span>
                Create overlapping positions between adjacent players
              </li>
            </ul>
          </details>
        </div>
      )}

      {/* Toggle Options - Premium Sports Design */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer touch-manipulation hover:text-slate-800 transition-colors">
          <input
            type="checkbox"
            checked={showPositionNumbers}
            onChange={(e) => onTogglePositionNumbers(e.target.checked)}
            className="w-5 h-5 text-blue-700 rounded border-slate-300 focus:ring-blue-600 focus:ring-2"
          />
          Show court position numbers
        </label>
      </div>
    </div>
  );
};

export default StatusPanel;