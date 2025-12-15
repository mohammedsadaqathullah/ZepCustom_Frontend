import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Ring, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import AnimatedText from './AnimatedText';

interface ProceduralPlanetProps {
    label: string;
    description?: string;
    memberCount?: number;
    onClick?: () => void;
    color?: string; // Main planet color
    scale?: number;
    hasRings?: boolean;
}

export default function ProceduralPlanet({
    label,
    description = "Uncharted",
    memberCount = 0,
    onClick,
    color = "#3b82f6",
    scale = 1,
    hasRings = false
}: ProceduralPlanetProps) {
    const groupRef = useRef<THREE.Group>(null);
    const planetRef = useRef<THREE.Mesh>(null);
    const atmosphereRef = useRef<THREE.Mesh>(null);
    const scanGridRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Randomize planet texture properties slightly for variety
    const planetDetail = useMemo(() => ({
        roughness: 0.6 + Math.random() * 0.3,
        metalness: 0.1 + Math.random() * 0.2,
        wobbleSpeed: 0.2 + Math.random() * 0.5
    }), []);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Hover scale effect
            const targetScale = hovered ? 1.2 : 1;
            groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);

            // Orbital rotation (self)
            groupRef.current.rotation.y += 0.002 * planetDetail.wobbleSpeed;
        }

        if (atmosphereRef.current) {
            // Atmosphere pulse
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
            atmosphereRef.current.scale.set(pulse, pulse, pulse);
        }

        if (scanGridRef.current) {
            // Scanning grid rotation (counter-rotate)
            scanGridRef.current.rotation.y -= 0.01;

            // Fade in grid on hover
            const targetOpacity = hovered ? 0.4 : 0;
            (scanGridRef.current.material as THREE.MeshStandardMaterial).opacity = THREE.MathUtils.lerp(
                (scanGridRef.current.material as THREE.MeshStandardMaterial).opacity,
                targetOpacity,
                delta * 10
            );
            // Expand grid slightly on hover
            const targetGridScale = hovered ? 1.05 : 1.01;
            scanGridRef.current.scale.lerp(new THREE.Vector3(targetGridScale, targetGridScale, targetGridScale), delta * 10);
        }
    });

    return (
        <group
            ref={groupRef}
            scale={scale}
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
        >
            {/* Main Planet Sphere */}
            <Sphere ref={planetRef} args={[1, 64, 64]}>
                <meshStandardMaterial
                    color={color}
                    roughness={planetDetail.roughness}
                    metalness={planetDetail.metalness}
                    flatShading={false}
                />
            </Sphere>

            {/* Atmosphere / Glow */}
            <Sphere ref={atmosphereRef} args={[1.2, 32, 32]}>
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.1}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </Sphere>

            {/* Scanning Grid Overlay (Visible on Hover) */}
            <Sphere ref={scanGridRef} args={[1.01, 32, 32]}>
                <meshBasicMaterial
                    color="#00ffff"
                    wireframe
                    transparent
                    opacity={0}
                    blending={THREE.AdditiveBlending}
                />
            </Sphere>

            {/* Optional Planetary Rings */}
            {hasRings && (
                <Ring args={[1.4, 2.2, 64]} rotation={[Math.PI / 2.5, 0, 0]}>
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.2}
                        side={THREE.DoubleSide}
                        transparent
                        opacity={0.6}
                    />
                </Ring>
            )}

            {/* Holographic Info Projection (Always Visible) */}
            <group position={[0, 1.8, 0]}>
                <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                    {/* Connection Line */}
                    <mesh position={[0, -0.6, 0]} visible={hovered}>
                        <cylinderGeometry args={[0.01, 0.01, 1.2]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
                    </mesh>

                    {/* Label Container */}
                    <group position={[0, 0, 0]}>
                        <AnimatedText
                            text={label}
                            fontSize={0.4}
                            color="#ffffff"
                        />

                        {/* Details only on hover */}
                        <group visible={hovered}>
                            <Text
                                position={[0, -0.35, 0]}
                                fontSize={0.15}
                                color="#94a3b8"
                            >
                                {memberCount} Active Signatures
                            </Text>
                            <Text
                                position={[0, -0.6, 0]}
                                fontSize={0.12}
                                color="#64748b"
                                maxWidth={2}
                                textAlign="center"
                                lineHeight={1.4}
                            >
                                {description.substring(0, 50)}
                            </Text>
                        </group>
                    </group>
                </Billboard>
            </group>
        </group>
    );
}
