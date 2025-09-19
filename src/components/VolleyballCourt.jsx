import { useState, useEffect } from 'react';
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
  const [courtDimensions, setCourtDimensions] = useState(COURT_DIMENSIONS);
  const [touchStart, setTouchStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Update court dimensions based on screen size
  useEffect(() => {
    const updateDimensions = () => {
      const screenWidth = window.innerWidth;
      const maxWidth = Math.min(screenWidth - 40, 500); // 20px padding on each side

      if (screenWidth < 640) { // Mobile
        const ratio = COURT_DIMENSIONS.height / COURT_DIMENSIONS.width;
        setCourtDimensions({
          width: maxWidth,
          height: maxWidth * ratio
        });
      } else if (screenWidth < 1024) { // Tablet
        setCourtDimensions({
          width: Math.min(400, maxWidth),
          height: Math.min(320, maxWidth * 0.8)
        });
      } else { // Desktop
        setCourtDimensions(COURT_DIMENSIONS);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedPlayer && customMode) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onPlayerDrag(draggedPlayer, x, y, courtDimensions.width, courtDimensions.height);
    }
  };

  // Use useEffect to add non-passive touch listeners
  useEffect(() => {
    const courtElement = document.getElementById('volleyball-court');
    if (!courtElement) return;

    const handleTouchMoveNonPassive = (e) => {
      if (!customMode || !touchStart || !draggedPlayer) return;

      e.preventDefault(); // This works with non-passive listeners
      setIsDragging(true);

      const touch = e.touches[0];
      const rect = courtElement.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // Update player position in real-time during drag
      onPlayerDrag(draggedPlayer, x, y, courtDimensions.width, courtDimensions.height);
    };

    // Add non-passive touch move listener
    courtElement.addEventListener('touchmove', handleTouchMoveNonPassive, { passive: false });

    return () => {
      courtElement.removeEventListener('touchmove', handleTouchMoveNonPassive);
    };
  }, [customMode, touchStart, draggedPlayer, onPlayerDrag, courtDimensions]);

  // Touch event handlers for mobile drag support
  const handleTouchStart = (e) => {
    if (!customMode) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    setTouchStart({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      startTime: Date.now()
    });
  };

  const handleTouchEnd = (e) => {
    if (!customMode) return;

    // If it was a quick tap (not a drag), treat as selection
    if (touchStart && Date.now() - touchStart.startTime < 200 && !isDragging) {
      // Find which player was tapped
      const touch = e.changedTouches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // Check if tap is near any player
      Object.entries(positions).forEach(([playerId, position]) => {
        const playerX = (position.x / 100) * courtDimensions.width;
        const playerY = (position.y / 100) * courtDimensions.height;
        const distance = Math.sqrt(Math.pow(x - playerX, 2) + Math.pow(y - playerY, 2));

        if (distance < 40) { // Touch target area
          onPlayerSelect(playerId);
        }
      });
    }

    setTouchStart(null);
    setIsDragging(false);
    if (draggedPlayer) {
      onDragEnd();
    }
  };

  return (
    <div className="lg:col-span-2">
      <div
        id="volleyball-court"
        className="relative bg-orange-200 border-4 border-orange-600 rounded-lg mx-auto mb-4 touch-none select-none"
        style={{ width: `${courtDimensions.width}px`, height: `${courtDimensions.height}px` }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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
            <div className="absolute text-sm sm:text-lg font-bold text-gray-700 bg-white rounded px-1 sm:px-2"
                 style={{bottom: '8px', right: '8px'}}>1</div>
            <div className="absolute text-sm sm:text-lg font-bold text-gray-700 bg-white rounded px-1 sm:px-2"
                 style={{top: '8px', right: '8px'}}>2</div>
            <div className="absolute text-sm sm:text-lg font-bold text-gray-700 bg-white rounded px-1 sm:px-2"
                 style={{top: '8px', right: `${Math.max(courtDimensions.width * 0.4, 120)}px`}}>3</div>
            <div className="absolute text-sm sm:text-lg font-bold text-gray-700 bg-white rounded px-1 sm:px-2"
                 style={{top: '8px', left: '8px'}}>4</div>
            <div className="absolute text-sm sm:text-lg font-bold text-gray-700 bg-white rounded px-1 sm:px-2"
                 style={{bottom: '8px', left: '8px'}}>5</div>
            <div className="absolute text-sm sm:text-lg font-bold text-gray-700 bg-white rounded px-1 sm:px-2"
                 style={{bottom: '8px', left: `${Math.max(courtDimensions.width * 0.4, 120)}px`}}>6</div>
          </>
        )}

        {/* Zone labels */}
        <div className="absolute top-4 left-4 text-xs sm:text-sm font-bold text-black bg-white px-1 sm:px-2 py-1 rounded opacity-75">
          FRONT ROW
        </div>
        <div className="absolute bottom-4 left-4 text-xs sm:text-sm font-bold text-black bg-white px-1 sm:px-2 py-1 rounded opacity-75">
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
            courtDimensions={courtDimensions}
            onSelect={onPlayerSelect}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onTouchStart={(e) => {
              e.stopPropagation();
              if (customMode) {
                onDragStart(playerId);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default VolleyballCourt;