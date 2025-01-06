import { useEffect } from 'react';
import { useGameState } from './useGameState';

export const useAI = () => {
  const { territories, gameStatus, handleTerritoryClick } = useGameState();

  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const aiMove = () => {
      // Simple logic: if AI has troops > 20, attack nearest player territory
      const aiTerritory = territories.find(t => t.owner === 'ai' && t.troops > 20);
      const playerTerritory = territories.find(t => t.owner === 'player');

      if (aiTerritory && playerTerritory) {
        console.log('AI attacking:', {
          from: aiTerritory.id,
          troops: aiTerritory.troops,
          to: playerTerritory.id
        });

        // Select AI territory
        handleTerritoryClick(aiTerritory);
        
        // Attack player territory after a short delay
        setTimeout(() => {
          handleTerritoryClick(playerTerritory);
        }, 100);
      }
    };

    // Check for possible moves every 2 seconds
    const interval = setInterval(aiMove, 2000);

    return () => clearInterval(interval);
  }, [territories, gameStatus, handleTerritoryClick]);
};