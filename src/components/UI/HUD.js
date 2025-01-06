import React from 'react';
import { useGameState } from '../../hooks/useGameState';

const HUD = ({ onQuitToMenu }) => {
  const { gameStatus, territories } = useGameState();

  const calculateControl = () => {
    const total = territories.length;
    const counts = territories.reduce((acc, territory) => {
      acc[territory.owner] = (acc[territory.owner] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([owner, count]) => ({
      owner,
      percentage: Math.round((count / total) * 100),
    }));
  };

  const territoryControl = calculateControl();

  return (
    <>
      {/* Game Stats */}
      <div className="fixed top-4 right-4 flex gap-2 z-10">
        {territoryControl.map(({ owner, percentage }) => (
          <div
            key={owner}
            className="bg-gray-900 bg-opacity-75 backdrop-blur-sm rounded-lg px-4 py-2 text-white shadow-lg flex items-center gap-2"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  owner === 'player'
                    ? '#00ff00'
                    : owner === 'ai'
                    ? '#ff0000'
                    : '#808080',
              }}
            />
            <span className="text-sm font-medium">
              {percentage}%
            </span>
          </div>
        ))}
      </div>

      {/* Tutorial Toast */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-75 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm shadow-lg z-10">
        Click your territories (green) to select them, then click enemy territories to attack!
      </div>

      {/* Victory/Defeat Modal */}
      {gameStatus !== 'playing' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all shadow-2xl">
            <div className="text-center">
              <h2 className="text-5xl font-bold mb-2 text-white animate-pulse">
                {gameStatus === 'won' ? '🎉 Victory!' : '😔 Defeat'}
              </h2>
              <p className="text-gray-400 mb-8">
                {gameStatus === 'won'
                  ? 'You have conquered all territories!'
                  : 'Better luck next time!'}
              </p>
              
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                >
                  Play Again
                </button>
                <button
                  onClick={onQuitToMenu}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HUD;