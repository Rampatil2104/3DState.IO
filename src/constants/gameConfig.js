export const TERRITORY_COLORS = {
  player: '#22c55e',  // Bright Green
  ai: '#ef4444',      // Bright Red
  neutral: '#94a3b8'  // Light Gray
};

export const INITIAL_TROOPS = {
  easy: {
    player: 30,
    ai: 20,
    neutral: 10
  },
  medium: {
    player: 25,
    ai: 25,
    neutral: 15
  },
  hard: {
    player: 20,
    ai: 30,
    neutral: 20
  }
};

export const MAP_CONFIGURATIONS = {
  easy: {
    size: 5,
    territories: 6
  },
  medium: {
    size: 7,
    territories: 9
  },
  hard: {
    size: 9,
    territories: 12
  }
};

// 1 troop generated per second
export const TERRITORY_GENERATION_RATE = {
  easy: 1,
  medium: 1,
  hard: 1
};