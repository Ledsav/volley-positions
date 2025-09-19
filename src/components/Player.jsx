import { PLAYER_COLORS } from '../constants/volleyball';

const Player = ({ 
  playerId, 
  position, 
  isServer, 
  isSelected, 
  customMode, 
  onSelect, 
  onDragStart, 
  onDragEnd 
}) => {
  return (
    <div
      className={`absolute w-14 h-14 rounded-full ${PLAYER_COLORS[playerId]} 
                 border-4 ${isServer ? 'border-yellow-300' : 'border-white'} shadow-lg 
                 transform -translate-x-7 -translate-y-7
                 transition-all duration-1000 ease-in-out
                 flex items-center justify-center font-bold text-white text-xl
                 cursor-pointer hover:scale-110
                 ${isSelected ? 'ring-4 ring-yellow-400' : ''}
                 ${isServer ? 'animate-pulse' : ''}
                 ${customMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      onClick={() => onSelect(playerId)}
      draggable={customMode}
      onDragStart={(e) => {
        onDragStart(playerId);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={onDragEnd}
    >
      {playerId}
      {isServer && <div className="absolute -top-2 -right-2 text-xs">⭐</div>}
    </div>
  );
};

export default Player;