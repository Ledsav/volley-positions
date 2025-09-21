
const RulesSummary = () => {
  return (
    <div className="bg-white/95 backdrop-blur-sm p-5 sm:p-7 rounded-xl shadow-xl border border-slate-200">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🏐</span>
        <h3 className="font-bold text-slate-800 text-xl sm:text-2xl">Position Fault Rules</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-5 rounded-xl border-2 border-emerald-200 shadow-sm">
          <h4 className="flex items-center gap-3 font-bold text-emerald-800 mb-4 text-base sm:text-lg">
            <span className="text-xl">✅</span>
            Legal Positioning
          </h4>
          <ul className="text-sm text-slate-700 space-y-3 font-medium">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-emerald-600 rounded-full mt-1.5 flex-shrink-0"></span>
              Front row players must be closer to net than back row
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-emerald-600 rounded-full mt-1.5 flex-shrink-0"></span>
              Players must maintain left-right order in their row
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-emerald-600 rounded-full mt-1.5 flex-shrink-0"></span>
              No overlapping between adjacent players
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-emerald-600 rounded-full mt-1.5 flex-shrink-0"></span>
              Rules checked only at serve contact
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 p-5 rounded-xl border-2 border-red-200 shadow-sm">
          <h4 className="flex items-center gap-3 font-bold text-red-800 mb-4 text-base sm:text-lg">
            <span className="text-xl">❌</span>
            Position Faults
          </h4>
          <ul className="text-sm text-slate-700 space-y-3 font-medium">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-red-600 rounded-full mt-1.5 flex-shrink-0"></span>
              Front row player behind a back row player
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-red-600 rounded-full mt-1.5 flex-shrink-0"></span>
              Players overlapping side-to-side in same row
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-red-600 rounded-full mt-1.5 flex-shrink-0"></span>
              Adjacent players too close together
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-red-600 rounded-full mt-1.5 flex-shrink-0"></span>
              Any position overlap at serve contact
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">💡</span>
            <div>
              <p className="font-bold text-blue-800 text-base mb-2">Key Point</p>
              <p className="text-sm text-blue-700 font-medium leading-relaxed">
                Position faults are only checked when the server contacts the ball. After the serve, players can move anywhere on the court!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-xl border-2 border-amber-200 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">🎮</span>
            <div>
              <p className="font-bold text-amber-800 text-base mb-2">Try Custom Mode</p>
              <p className="text-sm text-amber-700 font-medium leading-relaxed">
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