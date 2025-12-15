
import { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export default function LoginSceneEnvironment({ gateOpen }: { gateOpen: boolean }) {
    const leftDoorRef = useRef<THREE.Group>(null);
    const rightDoorRef = useRef<THREE.Group>(null);

    useLayoutEffect(() => {
        if (!leftDoorRef.current || !rightDoorRef.current) return;

        if (gateOpen) {
            gsap.to(leftDoorRef.current.position, { x: -10, duration: 2, ease: 'power2.inOut' });
            gsap.to(rightDoorRef.current.position, { x: 10, duration: 2, ease: 'power2.inOut' });
        } else {
            gsap.to(leftDoorRef.current.position, { x: -5, duration: 2, ease: 'power2.inOut' });
            gsap.to(rightDoorRef.current.position, { x: 5, duration: 2, ease: 'power2.inOut' });
        }
    }, [gateOpen]);

    return (
        <group>
            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
            </mesh>

            {/* Massive Building */}
            <mesh position={[0, 20, -15]}>
                <boxGeometry args={[50, 60, 20]} />
                <meshStandardMaterial color="#2a1a10" roughness={0.9} />
            </mesh>

            {/* Windows Grid */}
            <group position={[0, 20, -4.9]}>
                {Array.from({ length: 8 }).map((_, i) =>
                    Array.from({ length: 12 }).map((_, j) => (
                        <mesh key={`${i}-${j}`} position={[-22 + j * 4, -15 + i * 5, 0]}>
                            <boxGeometry args={[3, 3, 0.5]} />
                            <meshStandardMaterial color="#87CEEB" emissive="#002244" emissiveIntensity={0.5} />
                        </mesh>
                    ))
                ).flat()}
            </group>

            {/* Gate Structure (The Checkpost) */}
            <group position={[0, 0, 4]}>
                {/* Frame Top */}
                <mesh position={[0, 5, 0]}>
                    <boxGeometry args={[22, 1, 1]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                {/* Frame Left */}
                <mesh position={[-11, 0, 0]}>
                    <boxGeometry args={[1, 11, 1]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                {/* Frame Right */}
                <mesh position={[11, 0, 0]}>
                    <boxGeometry args={[1, 11, 1]} />
                    <meshStandardMaterial color="#111" />
                </mesh>

                {/* Glass Sliding Doors */}
                {/* Left Door - Starts at x=-5, width 10 */}
                <mesh ref={leftDoorRef} position={[-5, 0, 0]}>
                    <boxGeometry args={[10, 9, 0.2]} />
                    <meshStandardMaterial
                        color="#88ccff"
                        transparent
                        opacity={0.3}
                        roughness={0.1}
                        metalness={0.8}
                    />
                </mesh>
                {/* Right Door - Starts at x=5, width 10 */}
                <mesh ref={rightDoorRef} position={[5, 0, 0]}>
                    <boxGeometry args={[10, 9, 0.2]} />
                    <meshStandardMaterial
                        color="#88ccff"
                        transparent
                        opacity={0.3}
                        roughness={0.1}
                        metalness={0.8}
                    />
                </mesh>
            </group>
        </group>
    );
}
