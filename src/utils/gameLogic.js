import { MAP_CONFIGURATIONS, INITIAL_TROOPS } from '../constants/gameConfig';

// Generate territories based on difficulty
export const generateTerritories = (difficulty) => {
  const config = MAP_CONFIGURATIONS[difficulty];
  const territories = [];
  const gridSize = config.size;
  const spacing = 4; // Space between territories

  // Create a grid to track occupied positions
  const occupiedPositions = new Set();

  // Helper to check if a position is too close to existing territories
  const isTooClose = (x, z) => {
    for (const pos of occupiedPositions) {
      const [px, pz] = pos.split(',');
      const dx = x - parseFloat(px);
      const dz = z - parseFloat(pz);
      const distance = Math.sqrt(dx * dx + dz * dz);
      if (distance < spacing) {
        return true;
      }
    }
    return false;
  };

  // Helper to get random position within grid
  const getRandomPosition = () => {
    const halfGrid = (gridSize * spacing) / 2;
    let x, z;
    do {
      x = Math.random() * gridSize * spacing - halfGrid;
      z = Math.random() * gridSize * spacing - halfGrid;
    } while (isTooClose(x, z));
    
    occupiedPositions.add(`${x},${z}`);
    return [x, 0, z];
  };

  // Generate player's starting territory
  territories.push({
    id: 1,
    position: getRandomPosition(),
    owner: 'player',
    troops: INITIAL_TROOPS[difficulty].player
  });

  // Generate AI's starting territory
  territories.push({
    id: 2,
    position: getRandomPosition(),
    owner: 'ai',
    troops: INITIAL_TROOPS[difficulty].ai
  });

  // Generate neutral territories
  for (let i = 3; i <= config.territories; i++) {
    territories.push({
      id: i,
      position: getRandomPosition(),
      owner: 'neutral',
      troops: INITIAL_TROOPS[difficulty].neutral
    });
  }

  return territories;
};

// Calculate battle outcome between attacker and defender
export const calculateBattleOutcome = (attackerTroops, defenderTroops) => {
  // Add some randomness to make battles more interesting
  const attackerStrength = attackerTroops * (0.9 + Math.random() * 0.2);
  const defenderStrength = defenderTroops * (1.1 + Math.random() * 0.2);

  return {
    attackerWins: attackerStrength > defenderStrength,
    remainingTroops: Math.floor(Math.abs(attackerStrength - defenderStrength))
  };
};

// Calculate movement time based on distance
export const calculateMovementTime = (startPos, endPos) => {
  const dx = startPos[0] - endPos[0];
  const dz = startPos[2] - endPos[2];
  const distance = Math.sqrt(dx * dx + dz * dz);
  
  // Base movement speed (adjust as needed)
  const baseSpeed = 2; // units per second
  return distance / baseSpeed;
};

// Check if game is over
export const checkGameStatus = (territories) => {
  const owners = new Set(territories.map(t => t.owner));
  
  if (!owners.has('player')) {
    return 'lost';
  } else if (!owners.has('ai')) {
    return 'won';
  } else {
    return 'playing';
  }
};

// Calculate territory control percentages
export const calculateTerritoryControl = (territories) => {
  const total = territories.length;
  const control = territories.reduce((acc, territory) => {
    acc[territory.owner] = (acc[territory.owner] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(control).map(([owner, count]) => ({
    owner,
    percentage: Math.round((count / total) * 100)
  }));
};

// Find nearest enemy territory
export const findNearestEnemy = (territory, territories) => {
  let nearest = null;
  let minDistance = Infinity;

  territories.forEach(other => {
    if (other.owner !== territory.owner) {
      const distance = calculateDistance(territory.position, other.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = other;
      }
    }
  });

  return nearest;
};

// Calculate distance between two positions
export const calculateDistance = (pos1, pos2) => {
  const dx = pos1[0] - pos2[0];
  const dz = pos1[2] - pos2[2];
  return Math.sqrt(dx * dx + dz * dz);
};

// Check if a territory is vulnerable to attack
export const isVulnerable = (territory, territories) => {
  const nearbyEnemies = territories.filter(other => 
    other.owner !== territory.owner &&
    calculateDistance(territory.position, other.position) < 6
  );

  const totalEnemyTroops = nearbyEnemies.reduce((sum, enemy) => sum + enemy.troops, 0);
  return totalEnemyTroops > territory.troops * 1.5;
};

// Find best territory to reinforce
export const findBestReinforcement = (territories, owner) => {
  return territories
    .filter(t => t.owner === owner)
    .map(territory => ({
      territory,
      score: calculateReinforcementScore(territory, territories)
    }))
    .sort((a, b) => b.score - a.score)[0]?.territory;
};

// Calculate reinforcement priority score
const calculateReinforcementScore = (territory, territories) => {
  let score = 0;
  
  // Consider troop count
  score -= territory.troops;
  
  // Consider nearby threats
  territories.forEach(other => {
    if (other.owner !== territory.owner) {
      const distance = calculateDistance(territory.position, other.position);
      if (distance < 6) {
        score -= (other.troops / distance);
      }
    }
  });
  
  return score;
};