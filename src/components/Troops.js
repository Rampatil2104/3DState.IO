import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { TERRITORY_COLORS } from '../constants/gameConfig';

const Troops = ({
  startPos,
  endPos,
  amount,
  owner,
  onComplete,
  id,
}) => {
  const groupRef = useRef();
  const progressRef = useRef(0);
  const startVector = new THREE.Vector3(...startPos);
  const endVector = new THREE.Vector3(...endPos);
  const color = TERRITORY_COLORS[owner];

  // Calculate the arc height based on distance
  const distance = startVector.distanceTo(endVector);
  const arcHeight = distance * 0.3;

  useEffect(() => {
    progressRef.current = 0;
  }, [id]);

  useFrame((state, delta) => {
    if (progressRef.current < 1) {
      // Update progress
      progressRef.current += delta * 0.5; // Adjust speed here

      // Calculate current position with arc
      const progress = progressRef.current;
      const x = THREE.MathUtils.lerp(startVector.x, endVector.x, progress);
      const z = THREE.MathUtils.lerp(startVector.z, endVector.z, progress);
      
      // Add vertical arc using sine wave
      const y = Math.sin(progress * Math.PI) * arcHeight;

      groupRef.current.position.set(x, y, z);

      // Rotate troops along movement direction
      const angle = Math.atan2(
        endVector.z - startVector.z,
        endVector.x - startVector.x
      );
      groupRef.current.rotation.y = angle;

      // Complete movement
      if (progress >= 1 && onComplete) {
        onComplete();
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Trail
        width={0.2}
        length={8}
        color={new THREE.Color(color)}
        attenuation={(t) => t * t}
      >
        <Sphere args={[0.2, 16, 16]}>
          <meshPhongMaterial color={color} />
        </Sphere>
      </Trail>

      <Text
        position={[0, 0.4, 0]}
        color="white"
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
        backgroundColor="rgba(0,0,0,0.5)"
        padding={0.1}
      >
        {amount}
      </Text>
    </group>
  );
};

export default Troops;