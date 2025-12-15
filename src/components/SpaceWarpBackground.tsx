
import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function WarpStreaks({ count = 1000, active }: { count?: number; active: boolean }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const [dummy] = useState(() => new THREE.Object3D());

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

        const speedMultiplier = active ? 900 : 30;

        particles.forEach((particle, i) => {
            let { factor, speed, xFactor, yFactor, zFactor } = particle;

            particle.t += speed * speedMultiplier * factor * delta;

            let t = particle.t;
            if (t > 100) particle.t = 0;

            dummy.position.set(
                xFactor + (particle.mx / 10) * factor + Math.cos(t / 10) * 2,
                yFactor + (particle.my / 10) * factor + Math.sin(t / 10) * 2,
                zFactor + t
            );

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
            <meshBasicMaterial color="#ffffff" transparent opacity={active ? 0.6 : 0.4} />
        </instancedMesh>
    );
}

function MovingCamera({ active }: { active: boolean }) {
    useFrame((state, delta) => {
        if (active) {
            const cam = state.camera as THREE.PerspectiveCamera;
            cam.fov = THREE.MathUtils.lerp(cam.fov, 110, delta * 2);
            cam.updateProjectionMatrix();
        } else {
            state.camera.position.lerp(new THREE.Vector3(0, 0, 50), delta);
            // Gentle Reset
            const cam = state.camera as THREE.PerspectiveCamera;
            cam.fov = THREE.MathUtils.lerp(cam.fov, 75, delta * 2);
            cam.updateProjectionMatrix();
        }
    });
    return null;
}

export default function SpaceWarpBackground({ active = false }: { active?: boolean }) {
    return (
        <>
            <color attach="background" args={['#000']} />
            <ambientLight intensity={0.5} />
            <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <WarpStreaks active={active} count={2000} />
            <MovingCamera active={active} />
        </>
    );
}
