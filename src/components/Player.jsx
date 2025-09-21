import { useState } from 'react';
import { PLAYER_COLORS } from '../constants/volleyball';

const Player = ({
  playerId,
  playerRole,
  position,
  isServer,
  isSelected,
  customMode,
  courtDimensions,
  onSelect,
  onDragStart,
  onDragEnd
}) => {
  const [isBeingDragged, setIsBeingDragged] = useState(false);

  // Calculate responsive player size based on court dimensions
  const getPlayerSize = () => {
    const baseSize = Math.max(courtDimensions.width * 0.08, 40); // Minimum 40px for touch targets
    return Math.min(baseSize, 64); // Maximum 64px
  };

  const playerSize = getPlayerSize();
  const fontSize = Math.max(playerSize * 0.3, 14);

  const handleTouchStart = (e) => {
    e.stopPropagation();
    if (!customMode) {
      onSelect(playerId);
      return;
    }
    setIsBeingDragged(true);
    onDragStart(playerId);
  };

  const handleTouchEnd = () => {
    setIsBeingDragged(false);
    if (customMode) {
      onDragEnd();
    }
  };

  return (
    <div
      className={`absolute rounded-full ${PLAYER_COLORS[playerId]}
                 border-4 ${isServer ? 'border-yellow-300' : 'border-white'} shadow-lg
                 transition-all duration-300 ease-in-out
                 flex items-center justify-center font-bold text-white
                 cursor-pointer active:scale-95
                 ${isSelected ? 'ring-4 ring-yellow-400 scale-110' : 'hover:scale-110'}
                 ${isServer ? 'animate-pulse' : ''}
                 ${customMode ? 'cursor-grab active:cursor-grabbing' : ''}
                 ${isBeingDragged ? 'player-dragging' : ''}
                 touch-manipulation`}
      style={{
        width: `${playerSize}px`,
        height: `${playerSize}px`,
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%)`,
        fontSize: `${fontSize}px`,
        minWidth: '40px',
        minHeight: '40px'
      }}
      onClick={() => onSelect(playerId)}
      draggable={customMode}
      onDragStart={(e) => {
        onDragStart(playerId);
        e.dataTransfer.effectAllowed = 'move';
        setIsBeingDragged(true);
      }}
      onDragEnd={() => {
        onDragEnd();
        setIsBeingDragged(false);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {playerRole || playerId}
      {isServer && (
        <div
          className="absolute -top-1 -right-1 text-yellow-300"
          style={{ fontSize: `${Math.max(fontSize * 0.7, 10)}px` }}
        >
          ⭐
        </div>
      )}
    </div>
  );
};

export default Player;