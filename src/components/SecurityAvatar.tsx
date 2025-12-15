
import { useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

export default function SecurityAvatar({ state }: { state: 'idle' | 'checking' | 'approved' | 'speaking' }) {
    const groupRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);

    // Initial Pose & Animation Logic
    useLayoutEffect(() => {
        if (!groupRef.current || !headRef.current || !rightArmRef.current) return;

        const tl = gsap.timeline();

        // Reset
        gsap.to(groupRef.current.rotation, { y: 0, x: 0, duration: 0.5 });
        gsap.to(headRef.current.rotation, { x: 0, y: 0, z: 0, duration: 0.5 });
        gsap.to(rightArmRef.current.rotation, { z: 0, x: 0, duration: 0.5 });


        if (state === 'checking') {
            // Touch Temple (Comm Link)
            tl.to(rightArmRef.current.rotation, {
                z: Math.PI / 1.5,
                x: 0.5,
                duration: 0.5,
                ease: 'back.out(1.5)'
            });
            tl.to(headRef.current.rotation, { z: -0.2, duration: 0.3 }, "<");

        } else if (state === 'approved') {
            // Nod
            tl.to(headRef.current.rotation, { x: 0.3, duration: 0.2, yoyo: true, repeat: 3 });

        } else if (state === 'speaking') {
            // Face the user directly & Lean
            gsap.to(groupRef.current.rotation, { y: 0, duration: 0.5 });
            gsap.to(groupRef.current.rotation, { x: 0.1, duration: 0.5 });
        } else {
            gsap.to(rightArmRef.current.rotation, { z: 0, x: 0, duration: 0.5 });
            gsap.to(headRef.current.rotation, { x: 0, y: 0, z: 0, duration: 0.5 });
        }

    }, [state]);

    useFrame((stateThree) => {
        if (groupRef.current) {
            // Idle Hover/Breathing
            groupRef.current.position.y = -2 + Math.sin(stateThree.clock.elapsedTime * 2) * 0.05;
        }
        if (state === 'speaking' && headRef.current) {
            // Speaking Tick (Visor Flash or Head Bob)
            headRef.current.rotation.x = 0.1 + Math.sin(stateThree.clock.elapsedTime * 15) * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Self-Illumination for Visor glow effect on body */}
            <pointLight position={[0, 2.5, 0.5]} distance={2} intensity={1} color="#00ffff" />

            {/* --- BODY (Tactical Armor) --- */}

            {/* Torso Armor */}
            <mesh position={[0, 1.5, 0]}>
                <boxGeometry args={[1.2, 1.5, 0.6]} />
                <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.6} />
            </mesh>

            {/* Chest Plate */}
            <mesh position={[0, 1.8, 0.35]}>
                <boxGeometry args={[0.8, 0.6, 0.1]} />
                <meshStandardMaterial color="#333" roughness={0.5} metalness={0.8} />
            </mesh>

            {/* Badge */}
            <mesh position={[-0.2, 1.9, 0.41]}>
                <boxGeometry args={[0.15, 0.2, 0.02]} />
                <meshStandardMaterial color="gold" metalness={1} roughness={0.2} />
            </mesh>

            {/* Shoulder Pads */}
            <mesh position={[0.7, 2.3, 0]} rotation={[0, 0, -0.2]}>
                <boxGeometry args={[0.5, 0.2, 0.6]} />
                <meshStandardMaterial color="#333" metalness={0.7} />
            </mesh>
            <mesh position={[-0.7, 2.3, 0]} rotation={[0, 0, 0.2]}>
                <boxGeometry args={[0.5, 0.2, 0.6]} />
                <meshStandardMaterial color="#333" metalness={0.7} />
            </mesh>

            {/* Neck */}
            <mesh position={[0, 2.3, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.5]} /> {/* Neck Guard */}
                <meshStandardMaterial color="#111" />
            </mesh>

            {/* --- HEAD GROUP --- */}
            <group ref={headRef} position={[0, 2.6, 0]}>
                {/* Helmet Base (Back/Top) */}
                <mesh position={[0, 0.4, 0]}>
                    <sphereGeometry args={[0.48, 16, 16]} />
                    <meshStandardMaterial color="#111" metalness={0.5} roughness={0.4} />
                </mesh>

                {/* Cyber Visor (Glowing) */}
                <mesh position={[0, 0.45, 0.35]}>
                    <boxGeometry args={[0.6, 0.2, 0.3]} />
                    <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
                </mesh>

                {/* Chin Guard */}
                <mesh position={[0, 0.15, 0.3]}>
                    <boxGeometry args={[0.4, 0.3, 0.3]} />
                    <meshStandardMaterial color="#222" metalness={0.6} />
                </mesh>

                {/* Headset/Antenna */}
                <mesh position={[0.5, 0.4, 0]}>
                    <boxGeometry args={[0.1, 0.4, 0.2]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                <mesh position={[-0.5, 0.4, 0]}>
                    <boxGeometry args={[0.1, 0.4, 0.2]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                <mesh position={[0.55, 0.6, 0]}>
                    <cylinderGeometry args={[0.01, 0.01, 0.5]} />
                    <meshStandardMaterial color="#888" />
                </mesh>
            </group>

            {/* --- ARMS (Armored) --- */}
            {/* Left Arm */}
            <group position={[0.7, 2, 0]}>
                <mesh position={[0, -0.6, 0]}>
                    <cylinderGeometry args={[0.18, 0.15, 1.3]} />
                    <meshStandardMaterial color="#1a1a2e" />
                </mesh>
                <mesh position={[0, -1.3, 0]}>
                    <boxGeometry args={[0.2, 0.25, 0.2]} /> {/* Glove */}
                    <meshStandardMaterial color="#111" />
                </mesh>
            </group>

            {/* Right Arm */}
            <group ref={rightArmRef} position={[-0.7, 2, 0]}>
                <mesh position={[0, -0.6, 0]}>
                    <cylinderGeometry args={[0.18, 0.15, 1.3]} />
                    <meshStandardMaterial color="#1a1a2e" />
                </mesh>
                <mesh position={[0, -1.3, 0]}>
                    <boxGeometry args={[0.2, 0.25, 0.2]} /> {/* Glove */}
                    <meshStandardMaterial color="#111" />
                </mesh>
            </group>

            {/* --- LEGS --- */}
            <mesh position={[-0.35, 0, 0]}>
                <cylinderGeometry args={[0.22, 0.18, 1.6]} />
                <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[0.35, 0, 0]}>
                <cylinderGeometry args={[0.22, 0.18, 1.6]} />
                <meshStandardMaterial color="#111" />
            </mesh>

        </group>
    );
}
