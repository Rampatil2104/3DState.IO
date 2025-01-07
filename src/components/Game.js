import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Territory from './Territory';
import Troops from './Troops';
import HUD from './UI/HUD';
import { useGameState } from '../hooks/useGameState';

const Game = ({ onQuitToMenu }) => {
  const {
    territories,
    troops,
    selectedTerritory,
    handleTerritoryClick,
    handleTroopArrival,
    gameStatus,
  } = useGameState();

  return (
    <>
      <div className="absolute inset-0 w-full h-screen">
        <Canvas
          shadows
          camera={{
            position: [30, 30, 30],
            fov: 50,
            near: 0.1,
            far: 1000
          }}
        >
          <ambientLight intensity={1} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.5}
            castShadow
          />
          
          <group>
            {/* Territories */}
            {territories.map((territory) => (
              <Territory
                key={`territory-${territory.id}`}  // Updated key
                {...territory}
                size={4}
                selected={selectedTerritory?.id === territory.id}
                onClick={() => handleTerritoryClick(territory)}
              />
            ))}

            {/* Troops */}
            {troops.map((troop) => (
              <Troops
                key={`troop-${troop.id}`}  // Updated key
                {...troop}
                onComplete={() => handleTroopArrival(troop)}
              />
            ))}

            {/* Ground */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -2, 0]}
              receiveShadow
            >
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>

            {/* Grid */}
            <gridHelper 
              args={[100, 50, '#404040', '#202020']} 
              position={[0, -1.99, 0]} 
            />
          </group>

          <OrbitControls
            enablePan={true}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={15}
            maxDistance={50}
          />
        </Canvas>
      </div>

      <HUD gameStatus={gameStatus} onQuitToMenu={onQuitToMenu} />
    </>
  );
};

export default Game;