import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';

export default function Avatar() {
    const ref = useRef<any>(null);

    useFrame((state) => {
        if (ref.current) {
            // Use precise viewport dimensions for perfect mapping
            const x = (state.pointer.x * state.viewport.width) / 2;
            const y = (state.pointer.y * state.viewport.height) / 2;

            ref.current.position.set(x, y, 0);

            // Fast rotation for energy feel
            ref.current.rotation.x += 0.02;
            ref.current.rotation.y += 0.02;
        }
    });

    return (
        <group ref={ref}>
            <Trail width={1.5} length={4} color="#F8F8F8" attenuation={(t) => t * t}>
                {/* Main Crystal Cursor - Reduced size */}
                <mesh renderOrder={999}>
                    <octahedronGeometry args={[0.08, 0]} />
                    <meshStandardMaterial
                        color="cyan"
                        emissive="#00ffff"
                        emissiveIntensity={2}
                        toneMapped={false}
                        wireframe
                        depthTest={false}
                        depthWrite={false}
                    />
                </mesh>
                <mesh renderOrder={999} scale={[0.5, 0.5, 0.5]}>
                    <dodecahedronGeometry args={[0.08, 0]} />
                    <meshBasicMaterial
                        color="white"
                        depthTest={false}
                        depthWrite={false}
                    />
                </mesh>
            </Trail>

            {/* Outer Orbiting Rings - Reduced size */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                <mesh renderOrder={999}>
                    <torusGeometry args={[0.2, 0.005, 16, 32]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.3} depthTest={false} />
                </mesh>
            </group>
        </group>
    );
}
