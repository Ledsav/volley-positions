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

  // Handle player drag
  const handlePlayerDrag = (playerId, newX, newY) => {
    if (!customMode) return;
    
    // Convert pixel coordinates to percentages
    const xPercent = Math.max(5, Math.min(95, (newX / COURT_DIMENSIONS.width) * 100));
    const yPercent = Math.max(5, Math.min(95, (newY / COURT_DIMENSIONS.height) * 100));
    
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
  const violations = VolleyballRulesEngine.getRotationViolations(positions, customMode, currentRotation, ROTATIONS);
  const isLegalRotation = violations.length === 0;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-orange-100 to-blue-100 rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🏐 Volleyball Rotation Rules</h1>
        <p className="text-lg text-gray-600">Learn what's LEGAL and what's NOT in rotations!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Court Visualization */}
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
        />

        {/* Rules and Status Panel */}
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

      {/* Controls */}
      <GameControls
        customMode={customMode}
        isAnimating={isAnimating}
        onToggleCustomMode={toggleCustomMode}
        onPrevRotation={prevRotation}
        onAutoRotate={autoRotate}
        onNextRotation={nextRotation}
        onReset={resetToStart}
      />

      {/* Rules Summary */}
      <RulesSummary />
    </div>
  );
};

export default VolleyballRotations;