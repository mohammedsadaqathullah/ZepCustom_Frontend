import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float } from '@react-three/drei';
// @ts-ignore
import * as random from 'maath/random/dist/maath-random.esm';

function Stars(props: any) {
    const ref = useRef<any>(null);
    // Generate 5000 random points in a sphere
    const sphere = random.inSphere(new Float32Array(5000), { radius: 1.5 });

    useFrame((_state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#ffa0e0"
                    size={0.005}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
}

function FloatingShapes() {
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <mesh position={[1, -0.5, 1]}>
                <dodecahedronGeometry args={[0.5]} />
                <meshStandardMaterial color="#667eea" wireframe />
            </mesh>
            <mesh position={[-1, 0.5, -1]}>
                <icosahedronGeometry args={[0.5]} />
                <meshStandardMaterial color="#764ba2" wireframe />
            </mesh>
        </Float>
    )
}

export default function ThreeBackground() {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: 'black' }}>
            <Canvas camera={{ position: [0, 0, 1] }}>
                <ambientLight intensity={0.5} />
                <Stars />
                <FloatingShapes />
            </Canvas>
        </div>
    );
}
