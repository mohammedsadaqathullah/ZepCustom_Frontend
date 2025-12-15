import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import WavyText from '../components/WavyText';
import CursorCanvas from '../components/CursorCanvas';

function WarpStars() {
    const starRef = useRef<any>(null);

    useFrame((_state, delta) => {
        if (starRef.current) {
            // Rotate stars to simulate movement
            starRef.current.rotation.y += delta * 0.1;
            starRef.current.rotation.x += delta * 0.05;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Stars
                ref={starRef}
                radius={300}
                depth={50}
                count={10000}
                factor={6}
                saturation={0}
                fade
                speed={5} // High speed for warp effect
            />
        </group>
    );
}

function MovingCamera({ startWarp }: { startWarp: boolean }) {
    useFrame((state, delta) => {
        // Gentle drift initially
        if (!startWarp) {
            state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 20, delta * 0.5);
        } else {
            // Warp jump: Rapidly move camera forward
            const cam = state.camera as THREE.PerspectiveCamera;
            cam.position.z = THREE.MathUtils.lerp(cam.position.z, -1000, delta * 2);
            cam.fov = THREE.MathUtils.lerp(cam.fov, 120, delta * 2);
            cam.updateProjectionMatrix();
        }
    });
    return null;
}

interface WelcomeScreenProps {
    onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
    const [startWarp, setStartWarp] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        // Intro Animation Sequence
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Explicitly select chars to ensure we have them
            const chars = textRef.current?.querySelectorAll('.wavy-char');

            // 1. Text Animation: "Writing" style
            if (chars && chars.length > 0) {
                tl.fromTo(chars, {
                    opacity: 0,
                    y: 20,
                    filter: 'blur(10px)'
                }, {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 0.8,
                    stagger: 0.05,
                    ease: 'power3.out'
                });
            } else {
                // Fallback
                tl.fromTo(textRef.current, { opacity: 0 }, { opacity: 1, duration: 1 });
            }

            // 2. Button Reveal
            if (buttonRef.current) {
                tl.fromTo(buttonRef.current, {
                    opacity: 0,
                    y: 30,
                    scale: 0.9,
                }, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1,
                    ease: 'back.out(1.7)'
                }, '-=0.2');
            }
        }, textRef);

        return () => ctx.revert();
    }, []);

    const handleEnter = () => {
        setStartWarp(true);

        // Animate UI out
        gsap.to(textRef.current, {
            opacity: 0,
            scale: 5,
            duration: 1.5,
            ease: 'power2.in',
            onComplete: () => {
                setTimeout(onComplete, 500);
            }
        });
    };

    return (
        <div ref={containerRef} style={{ width: '100vw', height: '100vh', background: 'black', position: 'fixed', top: 0, left: 0, zIndex: 10000 }}>
            <CursorCanvas />

            <Canvas camera={{ position: [0, 0, 50], fov: 75 }}>
                <color attach="background" args={['#000']} />
                <ambientLight intensity={0.5} />
                <WarpStars />
                <MovingCamera startWarp={startWarp} />
            </Canvas>

            <div
                ref={textRef}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: startWarp ? 'none' : 'auto'
                }}
            >
                <h1 style={{ marginBottom: '2rem', fontSize: '4rem', fontWeight: 'bold', color: 'white' }}>
                    <WavyText text="Zi Space" className="wavy-text-container" />
                </h1>

                {!startWarp && (
                    <button
                        ref={buttonRef}
                        onClick={handleEnter}
                        style={{
                            padding: '1rem 3rem',
                            fontSize: '1.2rem',
                            background: 'transparent',
                            color: '#00ffff',
                            border: '2px solid #00ffff',
                            borderRadius: '30px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
                            transition: 'all 0.3s',
                            opacity: 1
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
                )}
            </div>
        </div>
    );
}
