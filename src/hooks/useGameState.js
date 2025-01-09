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

  // AI logic - less aggressive
  useEffect(() => {
    let isActive = true;
    let lastMoveTime = 0;
    const MOVE_COOLDOWN = 1500; // Increased cooldown

    if (gameStatus !== 'playing') return;

    const makeAIMove = () => {
      if (!isActive) return;

      const now = Date.now();
      if (now - lastMoveTime < MOVE_COOLDOWN) return;

      // Increased minimum troops needed
      const aiTerritories = territories.filter(t => 
        t.owner === 'ai' && t.troops > 15
      );

      if (aiTerritories.length === 0) return;

      // Reduced chance to attack player vs neutral
      const playerTerritories = territories.filter(t => t.owner === 'player');
      const neutralTerritories = territories.filter(t => t.owner === 'neutral');
      
      const possibleTargets = Math.random() > 0.6 ? 
        playerTerritories : neutralTerritories;

      if (possibleTargets.length === 0) return;

      const strongestAI = aiTerritories.reduce((max, t) => 
        t.troops > max.troops ? t : max, aiTerritories[0]
      );

      const target = possibleTargets.reduce((min, t) => 
        t.troops < min.troops ? t : min, possibleTargets[0]
      );

      // Need bigger advantage to attack
      if (strongestAI.troops > target.troops * 1.5) {
        const movingTroops = Math.floor(strongestAI.troops * 0.5); // Reduced attack force

        setTroops(prev => [...prev, {
          id: `ai-${Date.now()}`,
          startPos: strongestAI.position,
          endPos: target.position,
          amount: movingTroops,
          owner: 'ai',
          targetId: target.id,
          sourceId: strongestAI.id
        }]);

        setTerritories(prev => prev.map(t => {
          if (t.id === strongestAI.id) {
            return { ...t, troops: Math.max(1, t.troops - movingTroops) };
          }
          return t;
        }));

        lastMoveTime = now;
      }
    };

    const interval = setInterval(makeAIMove, 1000); // Slower interval

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [territories, gameStatus]);

  // Fixed battle mechanics
  const handleTroopArrival = useCallback((troop) => {
    setTroops(prev => prev.filter(t => t.id !== troop.id));
    
    setTerritories(prev => prev.map(territory => {
      if (territory.id === troop.targetId) {
        // Same owner - just add troops
        if (territory.owner === troop.owner) {
          return {
            ...territory,
            troops: territory.troops + troop.amount
          };
        } 
        // Different owner - battle
        else {
          const attackingTroops = troop.amount;
          const defendingTroops = territory.troops;

          if (attackingTroops > defendingTroops) {
            // Attacker wins - remaining troops = attacking - defending
            return {
              ...territory,
              owner: troop.owner,
              troops: Math.max(1, attackingTroops - defendingTroops)
            };
          } else {
            // Defender wins - remaining troops = defending - attacking
            return {
              ...territory,
              troops: Math.max(1, defendingTroops - attackingTroops)
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