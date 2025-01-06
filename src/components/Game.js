import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Stars } from '@react-three/drei';
import Territory from './Territory';
import Troops from './Troops';
import HUD from './UI/HUD';
import { useGameState } from '../hooks/useGameState';
import { useAI } from '../hooks/useAI';

const Game = ({ onQuitToMenu }) => {  // Added onQuitToMenu prop here
  const {
    territories,
    troops,
    selectedTerritory,
    handleTerritoryClick,
    handleTroopArrival,
    gameStatus,
  } = useGameState();

  // Initialize AI
  useAI();

  return (
    <>
      <div className="absolute inset-0 w-full h-screen overflow-hidden">
        <Canvas
          shadows
          camera={{
            position: [0, 20, 20],
            fov: 60,
            near: 0.1,
            far: 1000
          }}
        >
          {/* Environment */}
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* Camera Controls */}
          <OrbitControls
            enablePan={true}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={10}
            maxDistance={50}
            target={[0, 0, 0]}
          />

          {/* Game Elements */}
          <group position={[0, 0, 0]}>
            {/* Territories */}
            {territories.map((territory) => (
              <Territory
                key={territory.id}
                {...territory}
                size={3}
                selected={selectedTerritory?.id === territory.id}
                onClick={() => handleTerritoryClick(territory)}
              />
            ))}

            {/* Moving Troops */}
            {troops.map((troop) => (
              <Troops
                key={troop.id}
                {...troop}
                onComplete={() => handleTroopArrival(troop)}
              />
            ))}

            {/* Ground plane with grid */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.5, 0]}
              receiveShadow
            >
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial
                color="#2c2c2c"
                metalness={0.3}
                roughness={0.8}
              />
            </mesh>

            {/* Add grid helper for better spatial awareness */}
            <gridHelper args={[100, 100, '#404040', '#202020']} position={[0, -0.49, 0]} />
          </group>

          {/* Improved lighting */}
          <Sky 
            distance={450000} 
            sunPosition={[0, 1, 0]} 
            inclination={0.5}
            azimuth={0.25}
          />
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
          />
        </Canvas>
      </div>

      {/* HUD */}
      <HUD gameStatus={gameStatus} onQuitToMenu={onQuitToMenu} />
    </>
  );
};

export default Game;