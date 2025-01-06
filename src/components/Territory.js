import React, { useRef, useState } from 'react';
import { Box, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TERRITORY_COLORS } from '../constants/gameConfig';

const Territory = ({ 
  position, 
  owner, 
  troops, 
  size = 3, // Increased base size
  selected, 
  onClick, 
  id 
}) => {
  const baseRef = useRef();
  const [hovered, setHovered] = useState(false);
  const color = TERRITORY_COLORS[owner];

  // Hover and pulse animation
  useFrame((state) => {
    if (baseRef.current) {
      if (selected || hovered) {
        baseRef.current.scale.y = THREE.MathUtils.lerp(
          baseRef.current.scale.y,
          1.3,
          0.1
        );
      } else {
        baseRef.current.scale.y = THREE.MathUtils.lerp(
          baseRef.current.scale.y,
          1,
          0.1
        );
      }
    }
  });

  return (
    <group
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Base */}
      <group ref={baseRef}>
        {/* Main territory base */}
        <Box
          args={[size, size * 0.5, size]} // Taller base
          position={[0, size * 0.25, 0]} // Raised position
          castShadow
          receiveShadow
        >
          <meshPhongMaterial
            color={color}
            transparent
            opacity={0.9}
            shininess={100}
            emissive={color}
            emissiveIntensity={0.2} // Add glow effect
          />
        </Box>

        {/* Selection/hover indicator */}
        {(selected || hovered) && (
          <Box
            args={[size + 0.2, size * 0.55, size + 0.2]}
            position={[0, size * 0.25, 0]}
          >
            <meshPhongMaterial
              color={color}
              wireframe
              transparent
              opacity={0.5}
              emissive={color}
              emissiveIntensity={0.5}
            />
          </Box>
        )}

        {/* Base platform */}
        <Box
          args={[size * 1.2, size * 0.1, size * 1.2]}
          position={[0, 0, 0]}
          castShadow
          receiveShadow
        >
          <meshPhongMaterial
            color={color}
            transparent
            opacity={0.7}
          />
        </Box>
      </group>

      {/* Troop count */}
      <Text
        position={[0, size * 1.2, 0]} // Higher text position
        color="white"
        fontSize={size * 0.3}
        anchorX="center"
        anchorY="middle"
        backgroundColor="rgba(0,0,0,0.5)"
        padding={0.4}
        scale={[1, 1, 1]}
        renderOrder={1}
      >
        {troops}
      </Text>

      {/* Owner label */}
      <Text
        position={[0, 0, size * 0.6]}
        color="white"
        fontSize={size * 0.2}
        anchorX="center"
        anchorY="middle"
        backgroundColor="rgba(0,0,0,0.3)"
        padding={0.2}
        scale={[1, 1, 1]}
      >
        {owner.charAt(0).toUpperCase() + owner.slice(1)}
      </Text>
    </group>
  );
};

export default Territory;