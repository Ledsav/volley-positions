import { COURT_DIMENSIONS } from '../constants/volleyball';
import Player from './Player';

const VolleyballCourt = ({ 
  positions, 
  servingPlayer, 
  selectedPlayer, 
  customMode, 
  showPositionNumbers,
  onPlayerSelect,
  onPlayerDrag,
  draggedPlayer,
  onDragStart,
  onDragEnd
}) => {
  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedPlayer && customMode) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onPlayerDrag(draggedPlayer, x, y);
    }
  };

  return (
    <div className="lg:col-span-2">
      <div 
        className="relative bg-orange-200 border-4 border-orange-600 rounded-lg mx-auto mb-4" 
        style={{ width: `${COURT_DIMENSIONS.width}px`, height: `${COURT_DIMENSIONS.height}px` }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        
        {/* Net */}
        <div className="absolute top-1/2 left-0 w-full h-2 bg-white transform -translate-y-1"></div>
        <div className="absolute top-1/2 left-1/2 w-2 h-6 bg-white transform -translate-x-1.5 -translate-y-3"></div>
        
        {/* Attack line (10-foot line) */}
        <div className="absolute bottom-1/4 left-0 w-full h-0.5 bg-red-400"></div>
        <div className="absolute top-1/4 left-0 w-full h-0.5 bg-red-400"></div>
        
        {/* Court boundary */}
        <div className="absolute top-0 left-0 w-full h-full border-2 border-white opacity-70"></div>
        
        {/* Position numbers on court */}
        {showPositionNumbers && (
          <>
            <div className="absolute text-lg font-bold text-gray-700 bg-white rounded px-2" 
                 style={{bottom: '15px', right: '15px'}}>1</div>
            <div className="absolute text-lg font-bold text-gray-700 bg-white rounded px-2" 
                 style={{top: '15px', right: '15px'}}>2</div>
            <div className="absolute text-lg font-bold text-gray-700 bg-white rounded px-2" 
                 style={{top: '15px', right: '200px'}}>3</div>
            <div className="absolute text-lg font-bold text-gray-700 bg-white rounded px-2" 
                 style={{top: '15px', left: '15px'}}>4</div>
            <div className="absolute text-lg font-bold text-gray-700 bg-white rounded px-2" 
                 style={{bottom: '15px', left: '15px'}}>5</div>
            <div className="absolute text-lg font-bold text-gray-700 bg-white rounded px-2" 
                 style={{bottom: '15px', left: '200px'}}>6</div>
          </>
        )}

        {/* Zone labels */}
          <div className="absolute top-21 left-1/20 transform -translate-x-1/2 text-sm font-bold text-black bg-white px-2 py-1 rounded">
            FRONT ROW
          </div>
          <div className="absolute bottom-21 left-1/20 transform -translate-x-1/2 text-sm font-bold text-black bg-white px-2 py-1 rounded">
            BACK ROW
          </div>

          {/* Players */}
        {Object.entries(positions).map(([playerId, position]) => (
          <Player
            key={playerId}
            playerId={playerId}
            position={position}
            isServer={playerId === servingPlayer}
            isSelected={selectedPlayer === playerId}
            customMode={customMode}
            onSelect={onPlayerSelect}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
};

export default VolleyballCourt;