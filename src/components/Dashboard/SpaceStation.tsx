import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import AnimatedText from './AnimatedText';

interface SpaceStationProps {
    color?: string;
    onClick?: () => void;
    label?: string;
    memberCount?: number;
}

export default function SpaceStation({ color = "#4f46e5", onClick, label, memberCount }: SpaceStationProps) {
    const groupRef = useRef<THREE.Group>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    const ringRef2 = useRef<THREE.Mesh>(null);
    const textGroupRef = useRef<THREE.Group>(null);

    // Hover states
    const [hovered, setHovered] = useState(false);
    const [textHovered, setTextHovered] = useState(false);

    useFrame((state, delta) => {
        // Rotation animations
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.002;

            // Layout scale lerping
            const targetScale = hovered ? 2.5 : 1; // Increased visual feedback
            groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10);
        }
        if (ringRef.current) {
            ringRef.current.rotation.z += 0.01;
            ringRef.current.rotation.x += 0.005;
        }
        if (ringRef2.current) {
            ringRef2.current.rotation.z -= 0.015;
            ringRef2.current.rotation.y += 0.005;
        }

        // Text scale lerping
        if (textGroupRef.current) {
            textGroupRef.current.lookAt(state.camera.position);
            const targetTextScale = textHovered ? 2.5 : 1; // Increased text zoom
            textGroupRef.current.scale.lerp(new THREE.Vector3(targetTextScale, targetTextScale, targetTextScale), delta * 10);
        }
    });

    return (
        <group>
            <group
                ref={groupRef}
                onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
            >
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    {/* Central Core */}
                    <mesh>
                        <cylinderGeometry args={[0.5, 0.3, 2, 8]} />
                        <meshStandardMaterial color="#cbd5e0" metalness={0.8} roughness={0.2} />
                    </mesh>

                    {/* Glowing Engine/Power Core */}
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.6, 0.6, 0.5, 16]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
                    </mesh>

                    {/* Rotating Rings */}
                    <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
                        <torusGeometry args={[1.5, 0.05, 16, 64]} />
                        <meshStandardMaterial color="#a5b4fc" emissive="#a5b4fc" emissiveIntensity={0.5} />
                    </mesh>
                    <mesh ref={ringRef2} rotation={[-Math.PI / 3, 0, 0]}>
                        <torusGeometry args={[1.8, 0.03, 16, 64]} />
                        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.8} />
                    </mesh>

                    {/* Antennae */}
                    <mesh position={[0, 1.2, 0]}>
                        <cylinderGeometry args={[0.05, 0.05, 1.5]} />
                        <meshStandardMaterial color="#4a5568" />
                    </mesh>
                    <mesh position={[0, 1.8, 0]}>
                        <sphereGeometry args={[0.1]} />
                        <meshStandardMaterial color="red" emissive="red" emissiveIntensity={1} />
                    </mesh>
                </Float>
            </group>

            {/* Label - Separate scaling */}
            <group
                position={[0, 2.5, 0]}
                ref={textGroupRef}
                onPointerOver={(e) => { e.stopPropagation(); setTextHovered(true); document.body.style.cursor = 'text'; }}
                onPointerOut={(e) => { e.stopPropagation(); setTextHovered(false); document.body.style.cursor = 'auto'; }}
            >
                <AnimatedText
                    text={label || "Unknown"}
                    fontSize={0.4}
                    color="white"
                    hovered={textHovered || hovered} // Trigger on station hover too
                />
                <AnimatedText
                    text={`${memberCount || 0} Explorers`}
                    position={[0, -0.5, 0]}
                    fontSize={0.2}
                    color="#a5b4fc"
                    hovered={textHovered || hovered}
                />
            </group>
        </group>
    );
}
