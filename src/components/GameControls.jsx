import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';

const GameControls = ({ 
  customMode, 
  isAnimating, 
  onToggleCustomMode, 
  onPrevRotation, 
  onAutoRotate, 
  onNextRotation, 
  onReset 
}) => {
  return (
    <div className="flex justify-center items-center gap-4 mb-4">
      <button
        onClick={onToggleCustomMode}
        className={`${customMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-500 hover:bg-purple-600'} 
                   text-white px-4 py-2 rounded-lg transition-colors font-semibold`}
      >
        {customMode ? '📍 exploration Mode' : '🎮 Move players'}
      </button>

      {!customMode && (
        <>
          <button
            onClick={onPrevRotation}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors"
            disabled={isAnimating}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={onAutoRotate}
            className={`${isAnimating ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} 
                       text-white p-3 rounded-full transition-colors`}
          >
            {isAnimating ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={onNextRotation}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors"
            disabled={isAnimating}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <button
        onClick={onReset}
        className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-full transition-colors"
      >
        <RotateCcw size={20} />
      </button>
    </div>
  );
};

export default GameControls;