
const RulesSummary = () => {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🏐</span>
        <h3 className="font-bold text-gray-800 text-lg sm:text-xl">Position Fault Rules</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
          <h4 className="flex items-center gap-2 font-semibold text-emerald-700 mb-3 text-sm sm:text-base">
            <span className="text-lg">✅</span>
            Legal Positioning
          </h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
              Front row players must be closer to net than back row
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
              Players must maintain left-right order in their row
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
              No overlapping between adjacent players
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
              Rules checked only at serve contact
            </li>
          </ul>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="flex items-center gap-2 font-semibold text-red-700 mb-3 text-sm sm:text-base">
            <span className="text-lg">❌</span>
            Position Faults
          </h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
              Front row player behind a back row player
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
              Players overlapping side-to-side in same row
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
              Adjacent players too close together
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
              Any position overlap at serve contact
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <span className="text-lg flex-shrink-0">💡</span>
            <div>
              <p className="font-medium text-blue-800 text-sm mb-1">Key Point</p>
              <p className="text-sm text-blue-700">
                Position faults are only checked when the server contacts the ball. After the serve, players can move anywhere on the court!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <div className="flex items-start gap-2">
            <span className="text-lg flex-shrink-0">🎮</span>
            <div>
              <p className="font-medium text-amber-800 text-sm mb-1">Try Custom Mode</p>
              <p className="text-sm text-amber-700">
                Drag players around to test different positions and see what creates position faults!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesSummary;