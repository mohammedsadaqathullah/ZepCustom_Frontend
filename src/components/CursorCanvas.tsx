import { Canvas } from '@react-three/fiber';
import Avatar from './Dashboard/Avatar';

export default function CursorCanvas() {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, pointerEvents: 'none' }}>
            <Canvas
                camera={{ position: [0, 0, 1] }}
                gl={{ alpha: true }}
                eventSource={document.body}
                eventPrefix="client"
                style={{ pointerEvents: 'none' }}
            >
                <ambientLight intensity={1} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Avatar />
            </Canvas>
        </div>
    );
}
