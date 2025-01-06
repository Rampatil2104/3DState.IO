import React, { useState } from 'react';
import { useGameState } from '../../hooks/useGameState';

const Menu = ({ onStartGame }) => {
  const [difficulty, setDifficulty] = useState('medium');
  const { initializeGame } = useGameState();

  const handleStartGame = () => {
    initializeGame(difficulty);
    onStartGame();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 text-white">
      <div className="max-w-md w-full mx-4 p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
            State.io 3D
          </h1>
          <p className="text-gray-400">Conquer territories in a 3D world</p>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">Select Difficulty</h2>
          <div className="grid grid-cols-3 gap-3">
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`
                  py-2 px-4 rounded-lg transition-all duration-200
                  ${difficulty === level 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                  }
                `}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* How to Play */}
        <div className="mb-8 bg-gray-700 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">How to Play</h2>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Select your territories (green)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              Attack enemy territories
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-400"></span>
              Capture neutral territories
            </li>
          </ul>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartGame}
          className="w-full py-4 px-8 rounded-lg bg-green-600 hover:bg-green-700 transition-colors duration-200 text-lg font-bold"
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default Menu;