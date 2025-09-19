
const RulesSummary = () => {
  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow">
      <h3 className="font-bold text-gray-800 mb-4">🏐 Volleyball Rotation Rules</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-green-700 mb-2">✅ LEGAL Requirements:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Front row players (2,3,4) must be in front of back row (1,5,6)</li>
            <li>• Left to right order: Front (4-3-2), Back (5-6-1)</li>
            <li>• Player in position 1 serves</li>
            <li>• Rotate clockwise after winning serve</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-red-700 mb-2">❌ VIOLATIONS:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Back row player in front of front row player</li>
            <li>• Players out of left-right order</li>
            <li>• Wrong player serving</li>
            <li>• Back row attacking in front court</li>
          </ul>
        </div>
      </div>
      <div className="mt-4 p-3 bg-blue-50 rounded">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Click on players to see what they can and cannot do! The star (⭐) shows who serves.
        </p>
      </div>
    </div>
  );
};

export default RulesSummary;