import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import ProceduralPlanet from './ProceduralPlanet';
import * as THREE from 'three';

interface Space {
    id: string;
    name: string;
    description?: string;
    _count: { members: number };
}

interface GalaxySceneProps {
    spaces: Space[];
    onJoin: (id: string) => void;
}

export default function GalaxyScene({ spaces, onJoin }: GalaxySceneProps) {
    // Generate orbital positions for mapped spaces
    const planets = useMemo(() => {
        return spaces.map((space, i) => {
            // Golden Angle distribution for natural spiral look, or simple rings
            // Let's go with "randomized orbits" for a more game-like map feel
            const distance = 8 + i * 2.5; // Staggered distances
            const angle = Math.random() * Math.PI * 2;
            const x = Math.sin(angle) * distance;
            const z = Math.cos(angle) * distance;

            // Random planet properties
            const radius = 0.8 + Math.random() * 0.5;
            const hasRings = Math.random() > 0.7; // 30% chance of rings
            const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.5).getStyle(); // Varied vibrant colors

            return {
                ...space,
                position: [x, (Math.random() - 0.5) * 2, z] as [number, number, number], // Slight vertical scatter
                props: {
                    scale: radius,
                    hasRings,
                    color
                }
            };
        });
    }, [spaces.length]);

    return (
        <Canvas
            camera={{ position: [0, 15, 25], fov: 45 }}
            style={{ cursor: 'none' }}
        >
            <color attach="background" args={['#000000']} />

            {/* Cinematic Lighting */}
            <ambientLight intensity={0.1} /> {/* Dark space ambience */}
            {/* The Sun / Core Light */}
            <pointLight position={[0, 0, 0]} intensity={2} color="#ffaa00" distance={50} decay={2} />

            {/* Rim Lighting from nebula clouds */}
            <directionalLight position={[10, 5, -10]} intensity={0.5} color="#4f46e5" />

            {/* Background */}
            <Stars radius={100} depth={50} count={10000} factor={4} saturation={1} fade speed={0.5} />

            {/* Central Star / Galaxy Core */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[4, 64, 64]} />
                <meshStandardMaterial
                    color="#ff6600"
                    emissive="#ff4400"
                    emissiveIntensity={3}
                    toneMapped={false}
                />
            </mesh>
            {/* Core Glow */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[4.2, 32, 32]} />
                <meshBasicMaterial color="#ffaa00" transparent opacity={0.3} side={THREE.BackSide} />
            </mesh>

            {/* Orbital Rings (Visual Aid) */}
            {planets.map((_, i) => (
                <mesh key={`orbit-${i}`} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[8 + i * 2.5 - 0.02, 8 + i * 2.5 + 0.02, 128]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} />
                </mesh>
            ))}

            {/* Objects */}
            <group>
                {planets.map((planet) => (
                    <group key={planet.id} position={planet.position}>
                        <ProceduralPlanet
                            label={planet.name}
                            description={planet.description}
                            memberCount={planet._count?.members || 0}
                            onClick={() => onJoin(planet.id)}
                            {...planet.props}
                        />
                    </group>
                ))}
            </group>

            {/* Controls */}
            <OrbitControls
                enablePan={false}
                maxPolarAngle={Math.PI / 2}
                minDistance={10}
                maxDistance={50}
                autoRotate
                autoRotateSpeed={0.5}
            />

            {/* Game Post-Processing */}
            <EffectComposer>
                <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} radius={0.4} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
        </Canvas>
    );
}
