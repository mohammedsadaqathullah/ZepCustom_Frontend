import { useRef, useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import WavyText from '../components/WavyText';
import CursorCanvas from '../components/CursorCanvas';

function WarpStreaks({ count = 1000, active }: { count?: number; active: boolean }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const [dummy] = useState(() => new THREE.Object3D());

    // Generate random initial positions
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    useFrame((_state, delta) => {
        if (!meshRef.current) return;

        // Accelerate simulation if active - Multiplier adjusted for delta time (approx 60x previous)
        const speedMultiplier = active ? 900 : 30;

        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;

            // Move particle towards camera (Z+)
            // Use delta to make it framerate independent
            t = particle.t += speed * speedMultiplier * factor * delta;

            // Loop particles
            if (t > 100) particle.t = 0;

            dummy.position.set(
                xFactor + (particle.mx / 10) * factor + Math.cos(t / 10) * 2,
                yFactor + (particle.my / 10) * factor + Math.sin(t / 10) * 2,
                zFactor + t
            );

            // Stretch heavily when active - reduced stretch factor
            const scaleZ = active ? 5 + (speed * 300) : 1;
            dummy.scale.set(1, 1, scaleZ);

            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();

            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <boxGeometry args={[0.04, 0.04, 1]} />
            {/* Pure white, lower opacity for elegance */}
            <meshBasicMaterial color="#ffffff" transparent />
        </instancedMesh>
    );
}

function MovingCamera({ startWarp }: { startWarp: boolean }) {
    useFrame((state, delta) => {
        // Removed Shake - now just smooth movement
        if (startWarp) {
            // Warp FOV effect - slightly less aggressive
            const cam = state.camera as THREE.PerspectiveCamera;
            cam.fov = THREE.MathUtils.lerp(cam.fov, 110, delta * 2);
            cam.updateProjectionMatrix();
        } else {
            // Gentle drift reset
            state.camera.position.lerp(new THREE.Vector3(0, 0, 50), delta);
        }
    });
    return null;
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

function JetFire({ active }: { active: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);

    useFrame(() => {
        if (!groupRef.current || !meshRef.current || !materialRef.current) return;

        if (active) {
            // Aggressive Flicker
            const flicker = Math.random();
            const scaleY = 1 + flicker * 2.0; // 1.0 to 3.0 length
            const scaleX = 1 - flicker * 0.2; // Thinner when long

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
        // Group rotates X 90 so Y+ points backward (Z+)
        <group ref={groupRef} position={[0, 0, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
            {/* Offset Y by 1 (half height) so pivot is at base */}
            <mesh ref={meshRef} position={[0, 1.5, 0]}>
                <coneGeometry args={[0.45, 3, 8, 1, true]} />
                <meshBasicMaterial ref={materialRef} color="#ff4400" transparent opacity={0.8} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
        </group>
    );
}

function CyberJet({ assembling, flying }: { assembling: boolean; flying: boolean }) {
    const groupRef = useRef<THREE.Group>(null);

    // Independent Parts Refs for "Transformer" animation
    const fuselageRef = useRef<THREE.Group>(null);
    const leftWingRef = useRef<THREE.Group>(null);
    const rightWingRef = useRef<THREE.Group>(null);
    const engineLeftRef = useRef<THREE.Group>(null);
    const engineRightRef = useRef<THREE.Group>(null);

    // Materials - Multi-Color Palette
    const materials = useMemo(() => ({
        hull: new THREE.MeshStandardMaterial({
            color: '#ffffff',
            metalness: 0,
            roughness: 0.2,
            emissive: '#444444',
            emissiveIntensity: 0.2
        }), // Pure White Plastic/Ceramic
        hullDark: new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.5, roughness: 0.5 }), // Metallic White
        accent: new THREE.MeshStandardMaterial({ color: '#ff3300', metalness: 0.2, roughness: 0.2, emissive: '#aa0000', emissiveIntensity: 0.2 }), // Red/Orange Accent
        highlight: new THREE.MeshStandardMaterial({ color: '#00ffff', emissive: '#00ffff', emissiveIntensity: 0.5 }),
        glow: new THREE.MeshBasicMaterial({ color: '#00ffff', transparent: true, opacity: 0.8 }),
        glass: new THREE.MeshStandardMaterial({ color: '#88ccff', metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.7 })
    }), []);

    useLayoutEffect(() => {
        if (assembling && fuselageRef.current && groupRef.current) {
            console.log("Starting Animation Sequence");
            const tl = gsap.timeline();

            // Initial State: Hidden/Exploded
            // Note: We animate the 'scale' property of the Object3D directly to ensure ThreeJS updates
            if (fuselageRef.current) {
                fuselageRef.current.scale.set(0, 0, 0);
            }
            if (leftWingRef.current) leftWingRef.current.rotation.z = -Math.PI / 2; // Folded Down
            if (rightWingRef.current) rightWingRef.current.rotation.z = Math.PI / 2; // Folded Down
            if (engineLeftRef.current) engineLeftRef.current.position.x = 5; // Split out
            if (engineRightRef.current) engineRightRef.current.position.x = -5; // Split out

            // Spin Animation for the Whole Group (Showcase) - Prolonged to 4.5s
            gsap.fromTo(groupRef.current.rotation,
                { y: Math.PI * 4, x: 0.5 },
                { y: 0, x: 0, duration: 4.5, ease: "power2.out" }
            );

            // 1. Fuselage Materializes (Scale Up Elastical) - Slower
            tl.to(fuselageRef.current!.scale, {
                x: 1, y: 1, z: 1,
                duration: 1.5,
                ease: "elastic.out(1, 0.5)"
            });

            // 2. Wings Unfold (Mechanical) - Delayed and Slower
            tl.to([leftWingRef.current!.rotation, rightWingRef.current!.rotation], {
                z: 0,
                duration: 1.0,
                ease: "back.out(1.2)"
            }, "-=0.5");

            // 3. Engines Lock In (Snap) - Delayed
            tl.to(engineLeftRef.current!.position, { x: 1, duration: 0.8, ease: "power2.inOut" }, "-=0.2");
            tl.to(engineRightRef.current!.position, { x: -1, duration: 0.8, ease: "power2.inOut" }, "<"); // Sync with left
        }
    }, [assembling]);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Hover idle (always active slightly)
            const hoverY = Math.sin(state.clock.elapsedTime) * 0.5;

            if (flying) {
                // Fly Forward!
                groupRef.current.position.z -= delta * 150;
                groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.05; // High speed vibration
                // Add forward tilt for speed
                groupRef.current.rotation.x = -0.1;
            } else {
                // Assembly/Idle hover
                groupRef.current.position.y = -2 + hoverY;
                groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05; // Gentle float
                groupRef.current.rotation.x = 0;
            }
        }
    });

    return (
        <group ref={groupRef} position={[0, -2, 40]} scale={assembling || flying ? [1, 1, 1] : [0.0001, 0.0001, 0.0001]}>

            {/* 1. Fuselage Group */}
            <group ref={fuselageRef}>
                {/* Main Body - Silver */}
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.hull}>
                    <cylinderGeometry args={[0.5, 0.8, 4, 8]} />
                </mesh>
                {/* Nose Cone - Dark Grey */}
                <mesh position={[0, 0, -2.5]} rotation={[Math.PI / 2, 0, 0]} material={materials.hullDark}>
                    <coneGeometry args={[0.5, 1.5, 8]} />
                </mesh>
                {/* Cockpit - Glass */}
                <mesh position={[0, 0.6, -1]} rotation={[Math.PI / 3, 0, 0]} material={materials.glass}>
                    <boxGeometry args={[0.7, 0.2, 1.5]} />
                </mesh>


            </group>

            {/* 2. Wings (Pivoted for animation) - Silver with Orange Accents */}
            <group position={[0, 0, 0.5]}>
                <group ref={leftWingRef} position={[0.5, 0, 0]}> {/* Pivot Point */}
                    <mesh position={[1, -0.2, 0]} rotation={[0, -Math.PI / 4, 0]} material={materials.hull}>
                        <boxGeometry args={[3, 0.1, 1.5]} />
                    </mesh>
                    {/* Wing Accent */}
                    <mesh position={[2.5, -0.2, 0.5]} rotation={[0, -Math.PI / 4, 0]} material={materials.accent}>
                        <boxGeometry args={[0.5, 0.12, 1.5]} />
                    </mesh>
                    {/* Wing Highlight */}
                    <mesh position={[1, -0.19, 0.5]} rotation={[0, -Math.PI / 4, 0]} material={materials.highlight}>
                        <boxGeometry args={[3, 0.01, 0.1]} />
                    </mesh>
                </group>

                <group ref={rightWingRef} position={[-0.5, 0, 0]}> {/* Pivot Point */}
                    <mesh position={[-1, -0.2, 0]} rotation={[0, Math.PI / 4, 0]} material={materials.hull}>
                        <boxGeometry args={[3, 0.1, 1.5]} />
                    </mesh>
                    {/* Wing Accent */}
                    <mesh position={[-2.5, -0.2, 0.5]} rotation={[0, Math.PI / 4, 0]} material={materials.accent}>
                        <boxGeometry args={[0.5, 0.12, 1.5]} />
                    </mesh>
                    {/* Wing Highlight */}
                    <mesh position={[-1, -0.19, 0.5]} rotation={[0, Math.PI / 4, 0]} material={materials.highlight}>
                        <boxGeometry args={[3, 0.01, 0.1]} />
                    </mesh>
                </group>
            </group>

            {/* Rear Stabilizers - Orange Accent */}
            <group position={[0, 0, 1.8]}>
                <mesh position={[0.8, 0.5, 0]} rotation={[0, 0, Math.PI / 3]} material={materials.accent}>
                    <boxGeometry args={[1, 0.1, 1]} />
                </mesh>
                <mesh position={[-0.8, 0.5, 0]} rotation={[0, 0, -Math.PI / 3]} material={materials.accent}>
                    <boxGeometry args={[1, 0.1, 1]} />
                </mesh>
            </group>

            {/* 3. Engines (Slide in) - Dark Grey */}
            <group position={[0, 0, 2]}>
                <group ref={engineLeftRef} position={[1, 0, 0]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.hullDark}>
                        <cylinderGeometry args={[0.3, 0.4, 1.5, 8]} />
                    </mesh>
                    {/* Corrected Glow Orientation - Remove rotation to face Z */}
                    <mesh position={[0, 0, 0.76]} material={materials.glow}>
                        <circleGeometry args={[0.35, 16]} />
                    </mesh>
                    <JetFire active={assembling || flying} />
                    <SuperJetExhaust active={assembling || flying} />
                </group>

                <group ref={engineRightRef} position={[-1, 0, 0]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.hullDark}>
                        <cylinderGeometry args={[0.3, 0.4, 1.5, 8]} />
                    </mesh>
                    {/* Corrected Glow Orientation - Remove rotation to face Z */}
                    <mesh position={[0, 0, 0.76]} material={materials.glow}>
                        <circleGeometry args={[0.35, 16]} />
                    </mesh>
                    <JetFire active={assembling || flying} />
                    <SuperJetExhaust active={assembling || flying} />
                </group>
            </group>

        </group >
    );
}

interface WelcomeScreenProps {
    onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
    const [assembling, setAssembling] = useState(false);
    const [flying, setFlying] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Intro Animation Sequence
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();
            const chars = textRef.current?.querySelectorAll('.wavy-char');

            if (chars && chars.length > 0) {
                tl.fromTo(chars, {
                    opacity: 0, y: 20, filter: 'blur(10px)'
                }, {
                    opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.05, ease: 'power3.out'
                });
            } else {
                tl.fromTo(textRef.current, { opacity: 0 }, { opacity: 1, duration: 1 });
            }

            if (buttonRef.current) {
                tl.fromTo(buttonRef.current, { opacity: 0, y: 30, scale: 0.9 },
                    { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'back.out(1.7)' }, '-=0.2');
            }
        }, textRef);

        return () => ctx.revert();
    }, []);

    const handleEnter = () => {
        // 1. Button + Title Out (Sync)
        if (buttonRef.current) {
            gsap.to(buttonRef.current, {
                scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(1.7)'
            });
        }

        // Hide Text Immediately
        if (textRef.current) {
            gsap.to(textRef.current, {
                opacity: 0, scale: 2, filter: 'blur(20px)', duration: 0.8, ease: 'power2.in'
            });
        }

        // 2. Start Assembly
        setAssembling(true);

        // 3. Launch after Assembly (5.0s delay for longer spin)
        setTimeout(() => {
            setFlying(true); // Triggers camera warp and jet fly-off

            // Blackout
            gsap.to(overlayRef.current, {
                opacity: 1, duration: 0.8, delay: 0.5, ease: 'power1.inOut',
                onComplete: () => onComplete()
            });

        }, 5000);
    };

    return (
        <div ref={containerRef} style={{ width: '100vw', height: '100vh', background: 'black', position: 'fixed', top: 0, left: 0, zIndex: 10000 }}>
            <CursorCanvas />

            <div ref={overlayRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'black', opacity: 0, zIndex: 20, pointerEvents: 'none' }} />

            <Canvas camera={{ position: [0, 0, 50], fov: 75 }}>
                <color attach="background" args={['#000']} />

                {/* Improved Lighting */}
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, 5, 20]} intensity={0.8} color="#ffffff" /> {/* Front Fill */}
                <pointLight position={[0, -10, 5]} intensity={0.5} color="#00ffff" /> {/* Underglow */}
                <pointLight position={[10, 10, 60]} intensity={1} color="#ffffff" />  {/* Rear Fill */}

                <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <WarpStreaks active={flying} count={2000} />

                {/* TRANSFORMER JET */}
                <CyberJet assembling={assembling} flying={flying} />

                <MovingCamera startWarp={flying} />
            </Canvas>

            <div
                ref={textRef}
                style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)', textAlign: 'center',
                    zIndex: 10, pointerEvents: assembling ? 'none' : 'auto'
                }}
            >
                <h1 style={{ marginBottom: '2rem', fontSize: '4rem', fontWeight: 'bold', color: 'white' }}>
                    <WavyText text="Zi Space" className="wavy-text-container" />
                </h1>

                <button
                    ref={buttonRef}
                    onClick={handleEnter}
                    style={{
                        padding: '1rem 3rem', fontSize: '1.2rem',
                        background: 'transparent', color: '#00ffff',
                        border: '2px solid #00ffff', borderRadius: '30px',
                        cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2px',
                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)', transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
                        e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.6)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    Enter Universe
                </button>
            </div>
        </div>
    );
}
