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
    <div className="flex flex-col gap-3 mb-4">
      {/* Primary toggle button - full width */}
      <button
        onClick={onToggleCustomMode}
        className={`${customMode ? 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700' : 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700'}
                   text-white px-4 py-3 rounded-lg transition-all duration-200 font-semibold text-sm sm:text-base
                   w-full min-h-[52px] touch-manipulation active:scale-98 shadow-lg`}
      >
        {customMode ? '📍 Exploration Mode - Tap to Exit' : '🎮 Tap to Move Players'}
      </button>

      {/* Navigation and control buttons - centered row */}
      {!customMode && (
        <div className="flex justify-center items-center gap-3 sm:gap-4">
          <button
            onClick={onPrevRotation}
            className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white p-3 rounded-full transition-all duration-200
                       min-w-[52px] min-h-[52px] touch-manipulation active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isAnimating}
            aria-label="Previous rotation"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={onAutoRotate}
            className={`${isAnimating ? 'bg-red-500 hover:bg-red-600 active:bg-red-700' : 'bg-green-500 hover:bg-green-600 active:bg-green-700'}
                       text-white p-3 rounded-full transition-all duration-200 min-w-[52px] min-h-[52px] touch-manipulation active:scale-95 shadow-lg`}
            aria-label={isAnimating ? "Pause auto-rotation" : "Start auto-rotation"}
          >
            {isAnimating ? <Pause size={22} /> : <Play size={22} />}
          </button>

          <button
            onClick={onNextRotation}
            className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white p-3 rounded-full transition-all duration-200
                       min-w-[52px] min-h-[52px] touch-manipulation active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isAnimating}
            aria-label="Next rotation"
          >
            <ChevronRight size={22} />
          </button>

          <button
            onClick={onReset}
            className="bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white p-3 rounded-full transition-all duration-200
                       min-w-[52px] min-h-[52px] touch-manipulation active:scale-95 shadow-lg"
            aria-label="Reset to start"
          >
            <RotateCcw size={22} />
          </button>
        </div>
      )}

      {/* Custom mode reset button */}
      {customMode && (
        <div className="flex justify-center">
          <button
            onClick={onReset}
            className="bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white px-6 py-2 rounded-lg transition-all duration-200
                       touch-manipulation active:scale-95 shadow-lg text-sm font-medium"
            aria-label="Reset to start"
          >
            <RotateCcw size={18} className="inline mr-2" />
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default GameControls;