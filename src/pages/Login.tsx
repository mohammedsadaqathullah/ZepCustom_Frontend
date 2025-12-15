import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SpaceWarpBackground from '../components/SpaceWarpBackground';
import LoginJet from '../components/LoginJet';
import * as THREE from 'three';

// Cinematic Jet Controller
function JetIntroController({ onArrival }: { onArrival: () => void }) {
    const groupRef = useRef<THREE.Group>(null);
    const arrivalTriggered = useRef(false);

    useFrame((_state, delta) => {
        if (!groupRef.current) return;

        // Fly In Animation
        // Start: x=-100, z=50 (Left/Back)
        // End: x=0, z=0 (Center)

        // Simple easing approach
        const targetX = 0;
        const targetZ = 0;
        const speed = 2.5 * delta;

        // Lerp position
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, speed);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, speed);

        // Banking logic (Bank right as it swoops in)
        const distToTarget = Math.abs(groupRef.current.position.x - targetX);
        const bankAngle = (groupRef.current.position.x < -2) ? -0.5 : 0; // Bank left/right
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, bankAngle, delta * 2);

        // Arrival Check
        if (!arrivalTriggered.current && distToTarget < 2) {
            arrivalTriggered.current = true;
            onArrival(); // Trigger UI
        }
    });

    return (
        <group ref={groupRef} position={[-60, -2, 30]} rotation={[0, 0, 0]}>
            <LoginJet mode="flight" />
        </group>
    );
}

export default function Login() {
    const [view, setView] = useState<'menu' | 'login' | 'register'>('menu');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showUI, setShowUI] = useState(false); // Intro State

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Backend expects 'email', but we store the input in 'username' state variable for reuse
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email: username, password });
            const { accessToken, refreshToken } = response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Allow state propagation before navigation
            setTimeout(() => {
                navigate('/spaces');
                window.location.reload(); // Ensure auth store picks up the new token if it's not reactive
            }, 1000);
        } catch (err: any) {
            console.error(err.response?.data);
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg || 'ACCESS DENIED: Authorization Failed'));
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, { displayName: username, password, email });
            // Auto-login on registration
            const { accessToken, refreshToken } = response.data;
            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                setError('IDENTITY ESTABLISHED. ENTERING SPACE...');
                setTimeout(() => {
                    navigate('/spaces');
                    window.location.reload(); // Ensure auth store picks up the new token
                }, 1000);
            } else {
                setLoading(false);
                setView('login');
                setError('IDENTITY CREATED. PROCEED TO LOGIN.');
            }
        } catch (err: any) {
            console.error(err.response?.data);
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : 'TRANSMISSION FAILED: Signal Rejected');
            setLoading(false);
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', background: 'black', overflow: 'hidden', position: 'relative' }}>

            {/* --- 3D Scene --- */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={50} />
                    <color attach="background" args={['#050505']} />

                    {/* Lighting */}
                    <ambientLight intensity={0.4} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
                    <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ff0000" />

                    {/* Environment */}
                    <Stars radius={150} depth={50} count={6000} factor={4} saturation={0} fade speed={0.5} />
                    <SpaceWarpBackground active={!showUI} />  {/* Slow down warp when UI appears? Or keep it? keeping active for now */}

                    {/* Intro Jet */}
                    <JetIntroController onArrival={() => setShowUI(true)} />
                </Canvas>
            </div>

            {/* --- Glass Interface --- */}
            <div style={{
                position: 'absolute',
                zIndex: 10,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                maxWidth: '380px',
                perspective: '1000px',
                opacity: showUI ? 1 : 0,
                pointerEvents: showUI ? 'auto' : 'none',
                transition: 'opacity 1.5s ease-out',
            }}>
                <div style={{
                    background: 'rgba(10, 10, 15, 0.6)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    padding: '40px 30px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'all 0.5s ease',
                    transform: loading ? 'scale(0.98)' : 'scale(1)'
                }}>
                    {/* Header Logo/Icon Area */}
                    <div style={{
                        marginBottom: '30px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #white, #999)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ width: '20px', height: '20px', background: '#fff', borderRadius: '2px', transform: 'rotate(45deg)' }} />
                    </div>

                    {/* Title */}
                    <h1 style={{
                        color: 'white',
                        fontSize: '20px',
                        letterSpacing: '6px',
                        marginBottom: '40px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 300,
                        textTransform: 'uppercase',
                        opacity: 0.9
                    }}>
                        {view === 'menu' ? 'Zi Space' : view === 'login' ? 'Pilot Access' : 'New Signal'}
                    </h1>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            color: '#ff4444',
                            fontSize: '11px',
                            marginBottom: '20px',
                            letterSpacing: '1px',
                            fontFamily: 'monospace'
                        }}>
                            [{error}]
                        </div>
                    )}

                    {/* --- MENU VIEW --- */}
                    {view === 'menu' && (
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <Button onClick={() => setView('login')} primary>
                                IDENTIFY_PILOT
                            </Button>
                            <Button onClick={() => setView('register')}>
                                ESTABLISH_SIGNAL
                            </Button>
                        </div>
                    )}

                    {/* --- LOGIN VIEW --- */}
                    {view === 'login' && (
                        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <Input
                                type="text"
                                placeholder="EMAIL ADDRESS"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                            <Input
                                type="password"
                                placeholder="ACCESS KEY"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />

                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Button type="submit" primary disabled={loading}>
                                    {loading ? 'VERIFYING...' : 'ENTER SPACE'}
                                </Button>
                                <Button type="button" onClick={() => { setView('menu'); setError(''); }}>
                                    ABORT
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* --- REGISTER VIEW --- */}
                    {view === 'register' && (
                        <form onSubmit={handleRegister} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <Input
                                type="text"
                                placeholder="CALLSIGN (USER)"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                            <Input
                                type="email"
                                placeholder="FREQUENCY (EMAIL)"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                            <Input
                                type="password"
                                placeholder="CIPHER (KEY)"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />

                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Button type="submit" primary disabled={loading}>
                                    {loading ? 'CREATING...' : 'TRANSMIT'}
                                </Button>
                                <Button type="button" onClick={() => { setView('menu'); setError(''); }}>
                                    ABORT
                                </Button>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}

// Minimal Components
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        style={{
            width: '100%',
            background: 'rgba(255,255,255,0.03)',
            border: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            padding: '12px 0',
            color: 'white',
            fontSize: '14px',
            fontFamily: 'monospace',
            outline: 'none',
            textAlign: 'center',
            letterSpacing: '2px',
            transition: 'all 0.3s'
        }}
        onFocus={e => {
            e.currentTarget.style.borderBottom = '1px solid white';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        }}
        onBlur={e => {
            e.currentTarget.style.borderBottom = '1px solid rgba(255,255,255,0.2)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        }}
    />
);

const Button = ({ children, primary, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) => (
    <button
        {...props}
        style={{
            width: '100%',
            padding: '16px',
            background: primary ? 'white' : 'transparent',
            color: primary ? 'black' : 'rgba(255,255,255,0.6)',
            border: primary ? 'none' : '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            fontSize: '12px',
            letterSpacing: '3px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            textTransform: 'uppercase'
        }}
        onMouseEnter={e => {
            if (primary) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(255,255,255,0.2)';
            } else {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'white';
            }
        }}
        onMouseLeave={e => {
            if (primary) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            } else {
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            }
        }}
    >
        {children}
    </button>
);
