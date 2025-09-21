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
      {/* Primary toggle button - Premium Sports Design */}
      <button
        onClick={onToggleCustomMode}
        className={`${customMode ? 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 border-2 border-orange-500' : 'bg-blue-700 hover:bg-blue-800 active:bg-blue-900 border-2 border-blue-600'}
                   text-white px-6 py-4 rounded-xl transition-all duration-200 font-bold text-sm sm:text-base
                   w-full min-h-[56px] touch-manipulation active:scale-[0.98] shadow-lg ring-2 ring-white/20`}
      >
        {customMode ? '📍 Exploration Mode - Tap to Exit' : '🎮 Tap to Move Players'}
      </button>

      {/* Navigation and control buttons - Premium Athletic Design */}
      {!customMode && (
        <div className="flex justify-center items-center gap-3 sm:gap-4">
          <button
            onClick={onPrevRotation}
            className="bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white p-4 rounded-full transition-all duration-200
                       min-w-[56px] min-h-[56px] touch-manipulation active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-2 border-slate-600 ring-2 ring-white/10"
            disabled={isAnimating}
            aria-label="Previous rotation"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={onAutoRotate}
            className={`${isAnimating ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 border-2 border-red-500' : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 border-2 border-emerald-500'}
                       text-white p-4 rounded-full transition-all duration-200 min-w-[56px] min-h-[56px] touch-manipulation active:scale-95 shadow-lg ring-2 ring-white/20`}
            aria-label={isAnimating ? "Pause auto-rotation" : "Start auto-rotation"}
          >
            {isAnimating ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            onClick={onNextRotation}
            className="bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white p-4 rounded-full transition-all duration-200
                       min-w-[56px] min-h-[56px] touch-manipulation active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-2 border-slate-600 ring-2 ring-white/10"
            disabled={isAnimating}
            aria-label="Next rotation"
          >
            <ChevronRight size={24} />
          </button>

          <button
            onClick={onReset}
            className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white p-4 rounded-full transition-all duration-200
                       min-w-[56px] min-h-[56px] touch-manipulation active:scale-95 shadow-lg border-2 border-amber-500 ring-2 ring-white/20"
            aria-label="Reset to start"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      )}

      {/* Custom mode reset button - Premium styling */}
      {customMode && (
        <div className="flex justify-center">
          <button
            onClick={onReset}
            className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white px-8 py-3 rounded-xl transition-all duration-200
                       touch-manipulation active:scale-95 shadow-lg text-sm font-bold border-2 border-amber-500 ring-2 ring-white/20"
            aria-label="Reset to start"
          >
            <RotateCcw size={20} className="inline mr-2" />
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default GameControls;