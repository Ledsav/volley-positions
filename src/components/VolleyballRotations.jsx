import { useEffect, useState } from 'react';
import { COURT_DIMENSIONS, ROTATIONS } from '../constants/volleyball';
import { VolleyballRulesEngine } from '../services/VolleyballRulesEngine';
import GameControls from './GameControls';
import RulesSummary from './RulesSummary';
import StatusPanel from './StatusPanel';
import VolleyballCourt from './VolleyballCourt';

const VolleyballRotations = () => {
  const [currentRotation, setCurrentRotation] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPositionNumbers, setShowPositionNumbers] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [customMode, setCustomMode] = useState(false);
  const [customPositions, setCustomPositions] = useState({});
  const [draggedPlayer, setDraggedPlayer] = useState(null);

  // Get current positions based on mode
  const getCurrentPositions = () => {
    if (customMode) {
      return customPositions;
    }
    return ROTATIONS[currentRotation];
  };

  // Handle player drag with dynamic court dimensions
  const handlePlayerDrag = (playerId, newX, newY, courtWidth, courtHeight) => {
    if (!customMode) return;

    // Use provided court dimensions or fallback to default
    const currentWidth = courtWidth || COURT_DIMENSIONS.width;
    const currentHeight = courtHeight || COURT_DIMENSIONS.height;

    // Convert pixel coordinates to percentages
    const xPercent = Math.max(5, Math.min(95, (newX / currentWidth) * 100));
    const yPercent = Math.max(5, Math.min(95, (newY / currentHeight) * 100));

    setCustomPositions(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        x: xPercent,
        y: yPercent
      }
    }));
  };

  // Toggle custom mode
  const toggleCustomMode = () => {
    if (!customMode) {
      // Entering custom mode - copy current rotation
      setCustomPositions({...ROTATIONS[currentRotation]});
    }
    setCustomMode(!customMode);
    setIsAnimating(false);
  };

  // Navigation functions
  const nextRotation = () => {
    setCurrentRotation(prev => prev === 6 ? 1 : prev + 1);
  };

  const prevRotation = () => {
    setCurrentRotation(prev => prev === 1 ? 6 : prev - 1);
  };

  const autoRotate = () => {
    setIsAnimating(!isAnimating);
  };

  const resetToStart = () => {
    setCurrentRotation(1);
    setIsAnimating(false);
    setCustomMode(false);
  };

  const handlePlayerSelect = (playerId) => {
    setSelectedPlayer(selectedPlayer === playerId ? null : playerId);
  };

  const handleDragStart = (playerId) => {
    setDraggedPlayer(playerId);
  };

  const handleDragEnd = () => {
    setDraggedPlayer(null);
  };

  // Auto rotation effect
  useEffect(() => {
    let interval;
    if (isAnimating) {
      interval = setInterval(() => {
        nextRotation();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Get current game state
  const positions = getCurrentPositions();
  const servingPlayer = VolleyballRulesEngine.getServingPlayer(positions, currentRotation);
  const violations = VolleyballRulesEngine.getRotationViolations(positions, customMode, currentRotation);
  const isLegalRotation = violations.length === 0;

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">
      {/* Header - Mobile-first design */}
      <div className="text-center mb-4 sm:mb-6 lg:mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="text-2xl sm:text-3xl">🏐</span>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
            Spike & Learn
          </h1>
        </div>
        <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Master volleyball position rules by exploring what creates faults at serve contact
        </p>
      </div>

      <div className="">

        {/* Mobile-optimized layout */}
        <div className="space-y-5 sm:space-y-7">

          {/* Court Section */}
          <div className="flex flex-col items-center">
            <VolleyballCourt
              positions={positions}
              servingPlayer={servingPlayer}
              selectedPlayer={selectedPlayer}
              customMode={customMode}
              showPositionNumbers={showPositionNumbers}
              onPlayerSelect={handlePlayerSelect}
              onPlayerDrag={handlePlayerDrag}
              draggedPlayer={draggedPlayer}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              isLegalRotation={isLegalRotation}
              violations={violations}
            />

            {/* Controls directly under court - always visible */}
            <div className="w-full max-w-lg mt-4 sm:mt-6">
              <GameControls
                customMode={customMode}
                isAnimating={isAnimating}
                onToggleCustomMode={toggleCustomMode}
                onPrevRotation={prevRotation}
                onAutoRotate={autoRotate}
                onNextRotation={nextRotation}
                onReset={resetToStart}
              />
            </div>
          </div>

          {/* Content sections side-by-side on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">

            {/* Status Panel */}
            <div className="order-1">
              <StatusPanel
                isLegalRotation={isLegalRotation}
                violations={violations}
                customMode={customMode}
                currentRotation={currentRotation}
                servingPlayer={servingPlayer}
                selectedPlayer={selectedPlayer}
                positions={positions}
                showPositionNumbers={showPositionNumbers}
                onTogglePositionNumbers={setShowPositionNumbers}
              />
            </div>

            {/* Rules Summary */}
            <div className="order-2">
              <RulesSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolleyballRotations;