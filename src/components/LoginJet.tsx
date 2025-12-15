
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

function JetFire({ active }: { active: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);

    useFrame(() => {
        if (!groupRef.current || !meshRef.current || !materialRef.current) return;

        if (active) {
            // Aggressive Flicker
            const flicker = Math.random();
            const scaleY = 1 + flicker * 2.0;
            const scaleX = 1 - flicker * 0.2;

            groupRef.current.scale.set(scaleX, scaleY, scaleX);

            // Color Pulse
            materialRef.current.opacity = 0.6 + flicker * 0.4;
            const colorC = new THREE.Color('#ff2200').lerp(new THREE.Color('#ffff00'), flicker * 0.7);
            materialRef.current.color = colorC;
            meshRef.current.visible = true;
        } else {
            meshRef.current.visible = false;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh ref={meshRef} position={[0, 1.5, 0]}>
                <coneGeometry args={[0.45, 3, 8, 1, true]} />
                <meshBasicMaterial ref={materialRef} color="#ff4400" transparent opacity={0.8} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
        </group>
    );
}

function SuperJetExhaust({ count = 60, active }: { count?: number; active: boolean }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const [dummy] = useState(() => new THREE.Object3D());

    const particles = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            z: Math.random() * 10,
            speed: 15 + Math.random() * 10,
            xOff: (Math.random() - 0.5) * 0.4,
            yOff: (Math.random() - 0.5) * 0.4,
            scaleMult: Math.random() * 1.5 + 0.5
        }));
    }, [count]);

    useFrame((_state, delta) => {
        if (!meshRef.current) return;

        if (!active) {
            meshRef.current.visible = false;
            return;
        }
        meshRef.current.visible = true;

        particles.forEach((p, i) => {
            p.z += p.speed * delta;

            if (p.z > 10) {
                p.z = 0;
                p.xOff = (Math.random() - 0.5) * 0.4;
                p.yOff = (Math.random() - 0.5) * 0.4;
            }

            const progress = p.z / 10;
            let s = 1 - progress;
            s *= p.scaleMult;
            if (s < 0) s = 0;

            dummy.position.set(p.xOff, p.yOff, p.z);
            dummy.scale.set(s, s, s);
            dummy.rotation.set(0, 0, p.z * 10);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1.2]}>
            <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
                <dodecahedronGeometry args={[0.25, 0]} />
                <meshBasicMaterial color="#ff6600" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
            </instancedMesh>
        </group>
    );
}

import { useState } from 'react';

// Simplified Jet for Login Screen (No Assembly Logic)
export default function LoginJet({ mode }: { mode: 'flight' | 'hover' }) {
    const groupRef = useRef<THREE.Group>(null);

    // Materials - Multi-Color Palette (Same as WelcomeScreen)
    const materials = useMemo(() => ({
        hull: new THREE.MeshStandardMaterial({
            color: '#ffffff',
            metalness: 0,
            roughness: 0.2,
            emissive: '#444444',
            emissiveIntensity: 0.2
        }),
        hullDark: new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.5, roughness: 0.5 }),
        accent: new THREE.MeshStandardMaterial({ color: '#ff3300', metalness: 0.2, roughness: 0.2, emissive: '#aa0000', emissiveIntensity: 0.2 }),
        highlight: new THREE.MeshStandardMaterial({ color: '#00ffff', emissive: '#00ffff', emissiveIntensity: 0.5 }),
        glow: new THREE.MeshBasicMaterial({ color: '#00ffff', transparent: true, opacity: 0.8 }),
        glass: new THREE.MeshStandardMaterial({ color: '#88ccff', metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.7 })
    }), []);

    useFrame((state, delta) => {
        if (groupRef.current) {
            const hoverY = Math.sin(state.clock.elapsedTime) * 0.5;

            if (mode === 'flight') {
                // Fly state handled by parent controller mostly, but add local vibration
                groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.05;
                groupRef.current.rotation.x = -0.1;
            } else {
                // Hover
                groupRef.current.position.y = -2 + hoverY;
                groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
                groupRef.current.rotation.x = 0;
            }
        }
    });

    return (
        <group ref={groupRef} scale={[1, 1, 1]}>
            {/* 1. Fuselage Group */}
            <group>
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.hull}>
                    <cylinderGeometry args={[0.5, 0.8, 4, 8]} />
                </mesh>
                <mesh position={[0, 0, -2.5]} rotation={[Math.PI / 2, 0, 0]} material={materials.hullDark}>
                    <coneGeometry args={[0.5, 1.5, 8]} />
                </mesh>
                <mesh position={[0, 0.6, -1]} rotation={[Math.PI / 3, 0, 0]} material={materials.glass}>
                    <boxGeometry args={[0.7, 0.2, 1.5]} />
                </mesh>

                {/* BRAND FLAG/LABEL */}
                <group position={[0, 1.2, 0]}>
                    <Text
                        color="#00ffff"
                        fontSize={0.6}
                        anchorX="center"
                        anchorY="middle"
                        rotation={[0, Math.PI / 2, 0]}
                        fillOpacity={0.9}
                    >
                        Zi Space
                    </Text>
                    <Text
                        color="#00ffff"
                        fontSize={0.6}
                        anchorX="center"
                        anchorY="middle"
                        rotation={[0, -Math.PI / 2, 0]}
                        fillOpacity={0.9}
                    >
                        Zi Space
                    </Text>
                </group>
            </group>

            {/* 2. Wings */}
            <group position={[0, 0, 0.5]}>
                <group position={[0.5, 0, 0]}>
                    <mesh position={[1, -0.2, 0]} rotation={[0, -Math.PI / 4, 0]} material={materials.hull}>
                        <boxGeometry args={[3, 0.1, 1.5]} />
                    </mesh>
                    <mesh position={[2.5, -0.2, 0.5]} rotation={[0, -Math.PI / 4, 0]} material={materials.accent}>
                        <boxGeometry args={[0.5, 0.12, 1.5]} />
                    </mesh>
                    <mesh position={[1, -0.19, 0.5]} rotation={[0, -Math.PI / 4, 0]} material={materials.highlight}>
                        <boxGeometry args={[3, 0.01, 0.1]} />
                    </mesh>
                </group>

                <group position={[-0.5, 0, 0]}>
                    <mesh position={[-1, -0.2, 0]} rotation={[0, Math.PI / 4, 0]} material={materials.hull}>
                        <boxGeometry args={[3, 0.1, 1.5]} />
                    </mesh>
                    <mesh position={[-2.5, -0.2, 0.5]} rotation={[0, Math.PI / 4, 0]} material={materials.accent}>
                        <boxGeometry args={[0.5, 0.12, 1.5]} />
                    </mesh>
                    <mesh position={[-1, -0.19, 0.5]} rotation={[0, Math.PI / 4, 0]} material={materials.highlight}>
                        <boxGeometry args={[3, 0.01, 0.1]} />
                    </mesh>
                </group>
            </group>

            {/* Rear Stabilizers */}
            <group position={[0, 0, 1.8]}>
                <mesh position={[0.8, 0.5, 0]} rotation={[0, 0, Math.PI / 3]} material={materials.accent}>
                    <boxGeometry args={[1, 0.1, 1]} />
                </mesh>
                <mesh position={[-0.8, 0.5, 0]} rotation={[0, 0, -Math.PI / 3]} material={materials.accent}>
                    <boxGeometry args={[1, 0.1, 1]} />
                </mesh>
            </group>

            {/* 3. Engines */}
            <group position={[0, 0, 2]}>
                <group position={[1, 0, 0]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.hullDark}>
                        <cylinderGeometry args={[0.3, 0.4, 1.5, 8]} />
                    </mesh>
                    <mesh position={[0, 0, 0.76]} material={materials.glow}>
                        <circleGeometry args={[0.35, 16]} />
                    </mesh>
                    <JetFire active={true} />
                    <SuperJetExhaust active={true} />
                </group>

                <group position={[-1, 0, 0]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.hullDark}>
                        <cylinderGeometry args={[0.3, 0.4, 1.5, 8]} />
                    </mesh>
                    <mesh position={[0, 0, 0.76]} material={materials.glow}>
                        <circleGeometry args={[0.35, 16]} />
                    </mesh>
                    <JetFire active={true} />
                    <SuperJetExhaust active={true} />
                </group>
            </group>

        </group>
    );
}
