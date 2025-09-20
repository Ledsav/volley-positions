import { useEffect, useState } from 'react';
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
  onDragEnd,
  isLegalRotation = true,
  violations = []
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

  // Court styling based on violations
  const getCourtStyle = () => {
    if (!isLegalRotation) {
      return {
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        borderColor: '#dc2626',
        boxShadow: '0 0 20px rgba(220, 38, 38, 0.3), inset 0 0 20px rgba(220, 38, 38, 0.1)'
      };
    }
    return {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      borderColor: '#059669',
      boxShadow: '0 0 20px rgba(5, 150, 105, 0.2), inset 0 0 20px rgba(5, 150, 105, 0.05)'
    };
  };

  return (
    <div className="lg:col-span-2">
      <div
        id="volleyball-court"
        className="relative border-4 rounded-xl mx-auto mb-4 touch-none select-none transition-all duration-500 ease-in-out"
        style={{
          width: `${courtDimensions.width}px`,
          height: `${courtDimensions.height}px`,
          ...getCourtStyle()
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Net */}
        <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-800 transform -translate-y-1 shadow-lg"></div>
        <div className="absolute top-1/2 left-1/2 w-2 h-6 bg-gray-800 transform -translate-x-1.5 -translate-y-3 shadow-lg"></div>

        {/* Attack line (10-foot line) */}
        <div className="absolute bottom-1/4 left-0 w-full h-0.5 bg-gray-600 opacity-80"></div>
        <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gray-600 opacity-80"></div>

        {/* Court boundary - enhanced visibility */}
        <div className="absolute top-0 left-0 w-full h-full border-2 border-gray-700 opacity-60 rounded-lg"></div>
        
        {/* Position numbers on court - improved styling */}
        {showPositionNumbers && (
          <>
            <div className="absolute text-sm sm:text-lg font-bold text-gray-700 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm border border-gray-200"
                 style={{bottom: '8px', right: '8px'}}>1</div>
            <div className="absolute text-sm sm:text-lg font-bold text-gray-700 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm border border-gray-200"
                 style={{top: '8px', right: '8px'}}>2</div>
            <div className="absolute text-sm sm:text-lg font-bold text-gray-700 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm border border-gray-200"
                 style={{top: '8px', left: '50%', transform: 'translateX(-50%)'}}>3</div>
            <div className="absolute text-sm sm:text-lg font-bold text-gray-700 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm border border-gray-200"
                 style={{top: '8px', left: '8px'}}>4</div>
            <div className="absolute text-sm sm:text-lg font-bold text-gray-700 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm border border-gray-200"
                 style={{bottom: '8px', left: '8px'}}>5</div>
            <div className="absolute text-sm sm:text-lg font-bold text-gray-700 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm border border-gray-200"
                 style={{bottom: '8px', left: '50%', transform: 'translateX(-50%)'}}>6</div>
          </>
        )}

        {/* Zone labels - improved styling */}
        <div className="absolute top-13 left-0 text-xs sm:text-sm font-semibold text-gray-700  px-2 py-1 rounded-md  ">
          FRONT
        </div>
        <div className="absolute bottom-13 left-0 text-xs sm:text-sm font-semibold text-gray-700  px-2 py-1 rounded-md ">
          BACK
        </div>

        {/* Warning indicator outside court for violations */}
        {!isLegalRotation && violations && violations.length > 0 && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-red-100 border border-red-300 px-3 py-1 rounded-full text-xs font-medium text-red-700 shadow-lg animate-pulse">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            Position Fault Detected
          </div>
        )}

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