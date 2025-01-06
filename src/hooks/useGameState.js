import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateTerritories } from '../utils/gameLogic';

const GameStateContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [territories, setTerritories] = useState([]);
  const [troops, setTroops] = useState([]);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [gameStatus, setGameStatus] = useState('playing');

  const initializeGame = (difficulty) => {
    const initialTerritories = generateTerritories(difficulty);
    setTerritories(initialTerritories);
    setTroops([]);
    setSelectedTerritory(null);
    setGameStatus('playing');
  };

  const handleTerritoryClick = (territory, isAI = false) => {
    if (gameStatus !== 'playing') return;

    // First click - selecting territory
    if (!selectedTerritory) {
      // Only allow selecting player territories for player moves
      // And only allow selecting AI territories for AI moves
      if ((territory.owner === 'player' && !isAI) || 
          (territory.owner === 'ai' && isAI)) {
        setSelectedTerritory(territory);
      }
      return;
    }

    // Second click - attacking/moving
    if (selectedTerritory.id !== territory.id) {
      const movingTroops = Math.floor(selectedTerritory.troops * 0.5);
      
      if (selectedTerritory.troops <= 1) {
        setSelectedTerritory(null);
        return;
      }

      // Create troop movement
      setTroops(prev => [...prev, {
        id: Date.now(),
        startPos: selectedTerritory.position,
        endPos: territory.position,
        amount: movingTroops,
        owner: selectedTerritory.owner,
        targetId: territory.id,
        sourceId: selectedTerritory.id
      }]);

      // Update source territory troops
      setTerritories(prev => prev.map(t => {
        if (t.id === selectedTerritory.id) {
          return { ...t, troops: Math.max(1, t.troops - movingTroops) };
        }
        return t;
      }));

      setSelectedTerritory(null);
    }
  };

  const handleTroopArrival = (troop) => {
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
  };

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