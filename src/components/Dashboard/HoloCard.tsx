import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import AnimatedText from './AnimatedText';

interface HoloCardProps {
    label: string;
    memberCount?: number;
    description?: string;
    onClick?: () => void;
    color?: string; // Main border/text color
    accentColor?: string; // Secondary accent
}

export default function HoloCard({ label, memberCount = 0, description = "Classified", onClick, color = "#e2e8f0", accentColor = "#38bdf8" }: HoloCardProps) {
    const groupRef = useRef<THREE.Group>(null);
    const borderRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Hover animation: Scale up and float slightly
            const targetScale = hovered ? 1.05 : 1; // Subtle scale
            groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10);

            // Subtle breathing/float animation
            groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 1.5) * 0.0005;
        }

        if (borderRef.current) {
            // Border glow pulse - More subtle range
            const targetIntensity = hovered ? 1.5 : 0.8;
            (borderRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = THREE.MathUtils.lerp(
                (borderRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity,
                targetIntensity,
                delta * 5
            );
        }
    });

    return (
        <group
            ref={groupRef}
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
        >
            {/* High-End Glass Panel Body */}
            <RoundedBox args={[3.5, 2.2, 0.05]} radius={0.05} smoothness={4}>
                <meshPhysicalMaterial
                    color="#0f172a" // Dark Slate background hint
                    roughness={0.15} // Smoother
                    metalness={0.9} // More metallic/premium
                    transmission={0.9} // Higher clarity
                    thickness={0.5}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    attenuationColor="#ffffff"
                    attenuationDistance={5}
                />
            </RoundedBox>

            {/* Ultra-Thin Precision Border */}
            <RoundedBox ref={borderRef} args={[3.52, 2.22, 0.06]} radius={0.05} smoothness={4}>
                <meshStandardMaterial
                    color={color}
                    emissive={accentColor}
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.8}
                    wireframe={false}
                />
            </RoundedBox>

            {/* Content Container */}
            <group position={[-1.4, 0.5, 0.1]}>
                {/* Title */}
                <AnimatedText
                    text={label}
                    fontSize={0.35}
                    color="white"
                    position={[0, 0, 0]}
                />

                {/* Description / Mission Brief */}
                <Text
                    position={[0, -0.4, 0]}
                    fontSize={0.12}
                    color="#a5b4fc"
                    maxWidth={2.8}
                    anchorX="left"
                    anchorY="top"
                    lineHeight={1.4}
                >
                    {description.length > 80 ? description.substring(0, 80) + '...' : description}
                </Text>

                {/* Footer / Stats */}
                <group position={[0, -1.2, 0]}>
                    <mesh position={[0, 0, 0]}>
                        <circleGeometry args={[0.05]} />
                        <meshBasicMaterial color={memberCount > 0 ? "#4ade80" : "#94a3b8"} />
                    </mesh>
                    <Text
                        position={[0.15, 0, 0]}
                        fontSize={0.12}
                        color="#cbd5e1"
                        anchorX="left"
                        anchorY="middle"
                    >
                        {memberCount} Active Units
                    </Text>
                </group>
            </group>
        </group>
    );
}
