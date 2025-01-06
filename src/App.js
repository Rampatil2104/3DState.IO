import React, { useState } from 'react';
import Game from './components/Game';
import Menu from './components/UI/Menu';
import { GameProvider } from './hooks/useGameState';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleQuitToMenu = () => {
    setGameStarted(false);
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      <GameProvider>
        {!gameStarted ? (
          <Menu onStartGame={handleStartGame} />
        ) : (
          <Game onQuitToMenu={handleQuitToMenu} />
        )}
      </GameProvider>
    </div>
  );
};

export default App;