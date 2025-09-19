
const RulesSummary = () => {
  return (
    <div className="mt-6 bg-white p-3 sm:p-6 rounded-lg shadow">
      <h3 className="font-bold text-gray-800 mb-4 text-base sm:text-lg">🏐 Position Fault Rules</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-green-700 mb-2 text-sm sm:text-base">✅ Legal Positioning:</h4>
          <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
            <li>• Front row players must be closer to net than back row</li>
            <li>• Players must maintain left-right order in their row</li>
            <li>• No overlapping between adjacent players</li>
            <li>• Rules checked only at serve contact</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-red-700 mb-2 text-sm sm:text-base">❌ Position Faults:</h4>
          <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
            <li>• Front row player behind a back row player</li>
            <li>• Players overlapping side-to-side in same row</li>
            <li>• Adjacent players too close together</li>
            <li>• Any position overlap at serve contact</li>
          </ul>
        </div>
      </div>
      <div className="mt-4 p-3 bg-blue-50 rounded">
        <p className="text-xs sm:text-sm text-blue-800">
          <strong>Key Point:</strong> Position faults are only checked when the server contacts the ball. After the serve, players can move anywhere on the court!
        </p>
      </div>
      <div className="mt-3 p-3 bg-yellow-50 rounded">
        <p className="text-xs sm:text-sm text-yellow-800">
          <strong>Try Custom Mode:</strong> Drag players around to test different positions and see what creates position faults!
        </p>
      </div>
    </div>
  );
};

export default RulesSummary;