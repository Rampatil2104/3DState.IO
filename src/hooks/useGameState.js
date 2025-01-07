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

  // Handle player territory clicks
  const handleTerritoryClick = useCallback((territory) => {
    if (gameStatus !== 'playing') return;

    if (!selectedTerritory) {
      // Only allow player to select their own territories
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

  // AI logic
  useEffect(() => {
    let isActive = true;

    if (gameStatus !== 'playing') return;

    const makeAIMove = () => {
      if (!isActive) return;

      // Get AI territories with enough troops
      const aiTerritories = territories.filter(t => 
        t.owner === 'ai' && t.troops > 10
      );

      if (aiTerritories.length === 0) return;

      // Get potential targets (prioritize player territories)
      const playerTerritories = territories.filter(t => t.owner === 'player');
      const neutralTerritories = territories.filter(t => t.owner === 'neutral');
      const possibleTargets = [...playerTerritories, ...neutralTerritories];

      if (possibleTargets.length === 0) return;

      // Find strongest AI territory
      const strongestAI = aiTerritories.reduce((max, t) => 
        t.troops > max.troops ? t : max, aiTerritories[0]
      );

      // Find weakest target
      const weakestTarget = possibleTargets.reduce((min, t) => 
        t.troops < min.troops ? t : min, possibleTargets[0]
      );

      // Attack if we have enough troops
      if (strongestAI.troops > weakestTarget.troops) {
        console.log('AI attacking:', {
          from: strongestAI.id,
          fromTroops: strongestAI.troops,
          to: weakestTarget.id,
          toTroops: weakestTarget.troops
        });

        const movingTroops = Math.floor(strongestAI.troops * 0.7);

        setTroops(prev => [...prev, {
          id: `ai-${Date.now()}`,
          startPos: strongestAI.position,
          endPos: weakestTarget.position,
          amount: movingTroops,
          owner: 'ai',
          targetId: weakestTarget.id,
          sourceId: strongestAI.id
        }]);

        setTerritories(prev => prev.map(t => {
          if (t.id === strongestAI.id) {
            return { ...t, troops: Math.max(1, t.troops - movingTroops) };
          }
          return t;
        }));
      }
    };

    const interval = setInterval(makeAIMove, 1000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [territories, gameStatus]);

  // Handle troop arrival and battles
  const handleTroopArrival = useCallback((troop) => {
    setTroops(prev => prev.filter(t => t.id !== troop.id));
    
    setTerritories(prev => prev.map(territory => {
      if (territory.id === troop.targetId) {
        if (territory.owner === troop.owner) {
          // Reinforcement
          return {
            ...territory,
            troops: territory.troops + troop.amount
          };
        } else {
          // Battle
          if (troop.amount > territory.troops) {
            // Attacker wins
            return {
              ...territory,
              owner: troop.owner,
              troops: Math.max(1, troop.amount - territory.troops)
            };
          } else {
            // Defender wins
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

  // Generate troops over time
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

  // Check win/lose conditions
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