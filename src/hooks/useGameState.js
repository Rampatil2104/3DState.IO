import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateTerritories } from '../utils/gameLogic';

const GameStateContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [territories, setTerritories] = useState([]);
  const [troops, setTroops] = useState([]);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [gameStatus, setGameStatus] = useState('playing');

  const initializeGame = useCallback((difficulty) => {
    const initialTerritories = generateTerritories(difficulty);
    setTerritories(initialTerritories);
    setTroops([]);
    setSelectedTerritory(null);
    setGameStatus('playing');
  }, []);

  // Player territory clicks
  const handleTerritoryClick = useCallback((territory) => {
    if (gameStatus !== 'playing') return;

    if (!selectedTerritory) {
      if (territory.owner === 'player') {
        setSelectedTerritory(territory);
      }
    } else {
      if (selectedTerritory.id !== territory.id) {
        const movingTroops = Math.floor(selectedTerritory.troops * 0.5);
        
        if (selectedTerritory.troops <= 1) {
          setSelectedTerritory(null);
          return;
        }

        setTroops(prev => [...prev, {
          id: `player-${Date.now()}`,
          startPos: selectedTerritory.position,
          endPos: territory.position,
          amount: movingTroops,
          owner: selectedTerritory.owner,
          targetId: territory.id,
          sourceId: selectedTerritory.id
        }]);

        setTerritories(prev => prev.map(t => {
          if (t.id === selectedTerritory.id) {
            return { ...t, troops: Math.max(1, t.troops - movingTroops) };
          }
          return t;
        }));

        setSelectedTerritory(null);
      }
    }
  }, [selectedTerritory, gameStatus]);

  // AI logic with faster moves
  useEffect(() => {
    let isActive = true;
    let lastMoveTime = 0;
    const MOVE_COOLDOWN = 300; // AI can move every 300ms

    if (gameStatus !== 'playing') return;

    const makeAIMove = () => {
      if (!isActive) return;

      const now = Date.now();
      if (now - lastMoveTime < MOVE_COOLDOWN) return;

      const aiTerritories = territories.filter(t => 
        t.owner === 'ai' && t.troops > 8  // Lowered troop requirement
      );

      if (aiTerritories.length === 0) return;

      const playerTerritories = territories.filter(t => t.owner === 'player');
      const neutralTerritories = territories.filter(t => t.owner === 'neutral');
      const possibleTargets = [...playerTerritories, ...neutralTerritories];

      if (possibleTargets.length === 0) return;

      // Find multiple strong AI territories
      const sortedAITerritories = aiTerritories.sort((a, b) => b.troops - a.troops);
      const strongAITerritories = sortedAITerritories.slice(0, 2); // Get top 2 strongest

      // Find all weak targets
      const sortedTargets = possibleTargets.sort((a, b) => a.troops - b.troops);
      
      // Try to make multiple moves
      strongAITerritories.forEach(aiTerritory => {
        const target = sortedTargets.find(t => aiTerritory.troops > t.troops);
        if (target) {
          const movingTroops = Math.floor(aiTerritory.troops * 0.8); // More aggressive

          setTroops(prev => [...prev, {
            id: `ai-${Date.now()}-${aiTerritory.id}`,
            startPos: aiTerritory.position,
            endPos: target.position,
            amount: movingTroops,
            owner: 'ai',
            targetId: target.id,
            sourceId: aiTerritory.id
          }]);

          setTerritories(prev => prev.map(t => {
            if (t.id === aiTerritory.id) {
              return { ...t, troops: Math.max(1, t.troops - movingTroops) };
            }
            return t;
          }));
        }
      });

      lastMoveTime = now;
    };

    const interval = setInterval(makeAIMove, 100); // Check much more frequently

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [territories, gameStatus]);

  const handleTroopArrival = useCallback((troop) => {
    setTroops(prev => prev.filter(t => t.id !== troop.id));
    
    setTerritories(prev => prev.map(territory => {
      if (territory.id === troop.targetId) {
        if (territory.owner === troop.owner) {
          return {
            ...territory,
            troops: territory.troops + troop.amount
          };
        } else {
          if (troop.amount > territory.troops) {
            return {
              ...territory,
              owner: troop.owner,
              troops: Math.max(1, troop.amount - territory.troops)
            };
          } else {
            return {
              ...territory,
              troops: Math.max(1, territory.troops - troop.amount)
            };
          }
        }
      }
      return territory;
    }));
  }, []);

  // Generate troops
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const interval = setInterval(() => {
      setTerritories(prev => prev.map(territory => {
        if (territory.owner !== 'neutral') {
          return {
            ...territory,
            troops: territory.troops + 1
          };
        }
        return territory;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStatus]);

  // Check win/lose
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const playerTerritories = territories.filter(t => t.owner === 'player').length;
    const aiTerritories = territories.filter(t => t.owner === 'ai').length;

    if (playerTerritories === 0) {
      setGameStatus('lost');
    } else if (aiTerritories === 0) {
      setGameStatus('won');
    }
  }, [territories, gameStatus]);

  const value = {
    territories,
    troops,
    selectedTerritory,
    gameStatus,
    initializeGame,
    handleTerritoryClick,
    handleTroopArrival
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
};

export default GameStateContext;