import { MAP_CONFIGURATIONS, INITIAL_TROOPS } from '../constants/gameConfig';

export const generateTerritories = (difficulty) => {
  const config = MAP_CONFIGURATIONS[difficulty];
  const territories = [];
  const gridSize = config.size;
  const spacing = 4;

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