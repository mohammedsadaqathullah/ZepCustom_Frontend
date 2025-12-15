import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import HoloCard from './HoloCard';

interface Space {
    id: string;
    name: string;
    description?: string;
    _count: { members: number };
}

interface UniverseSceneProps {
    spaces: Space[];
    onJoin: (id: string) => void;
}

function HoloNode({ space, position, rotation, onClick }: { space: Space; position: [number, number, number]; rotation: [number, number, number]; onClick: () => void }) {
    // No rotation logic needed per frame as they are fixed on the curved plane

    return (
        <group position={position} rotation={rotation}>
            <HoloCard
                label={space.name}
                memberCount={space._count?.members || 0}
                description={space.description || "Secure Sector"}
                onClick={onClick}
                color="#e2e8f0" // Slate-200 (Silver/White) for a clean professional look
                accentColor="#38bdf8" // Sky-400 (Cyan) for subtle tech accents
            />
        </group>
    );
}

export default function UniverseScene({ spaces, onJoin }: UniverseSceneProps) {
    // Cylindrical Layout: Places cards in a semi-circle
    const layout = useMemo(() => {
        const radius = 8;
        const totalAngle = Math.PI * 0.8; // 144 degrees spread
        const startAngle = -totalAngle / 2;

        return spaces.map((_, i) => {
            // Calculate angle for this item
            // If only 1 item, place in center. Else spread.
            const angle = spaces.length > 1
                ? startAngle + (i / (spaces.length - 1)) * totalAngle
                : 0;

            const x = radius * Math.sin(angle);
            const z = radius * Math.cos(angle) - radius; // Shift z so center is at z=0 (or slightly behind)
            // Stagger Y slightly for visual interest if many items
            const y = (i % 2 === 0 ? 0.5 : -0.5) * (spaces.length > 3 ? 1 : 0);

            // Rotation: Look at center (0,0,0) so they face the user
            const rotY = angle + Math.PI; // Face inward

            return {
                position: [x, y, z - 2] as [number, number, number],
                rotation: [0, rotY, 0] as [number, number, number]
            };
        });
    }, [spaces.length]);

    return (
        <Canvas
            camera={{ position: [0, 0, 8], fov: 50 }}
            style={{ cursor: 'none' }} // Hide system cursor
        >
            <color attach="background" args={['#020205']} /> {/* Darker Void */}
            <ambientLight intensity={0.4} />

            {/* Cool Sci-Fi Lighting */}
            <pointLight position={[10, 5, 5]} intensity={0.8} color="#00ffff" />
            <pointLight position={[-10, 5, 5]} intensity={0.8} color="#a5b4fc" />
            <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={1} color="#6366f1" />

            <Stars
                radius={100}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={0.5} // Slow orbit for "Command Center" feel
            />

            <group position={[0, -0.5, 0]}>
                {spaces.map((space, i) => (
                    <HoloNode
                        key={space.id}
                        space={space}
                        position={layout[i].position}
                        rotation={layout[i].rotation}
                        onClick={() => onJoin(space.id)}
                    />
                ))}
            </group>

            <EffectComposer>
                <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.2} radius={0.6} />
            </EffectComposer>
        </Canvas>
    );
}
