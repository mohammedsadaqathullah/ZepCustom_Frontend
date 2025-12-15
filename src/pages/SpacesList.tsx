import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import GalaxyScene from '../components/Dashboard/GalaxyScene';
import CursorCanvas from '../components/CursorCanvas';

interface Space {
    id: string;
    name: string;
    slug: string;
    description?: string;
    visibility: string;
    maxCapacity: number;
    owner: {
        id: string;
        displayName: string;
        avatarUrl?: string;
    };
    _count: {
        members: number;
    };
}

export default function SpacesList() {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSpace, setNewSpace] = useState({ name: '', slug: '', description: '', visibility: 'PUBLIC' });

    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchSpaces();
    }, []);

    const fetchSpaces = async () => {
        try {
            const response = await api.get('/spaces');
            setSpaces(response.data);
        } catch (error) {
            console.error('Failed to fetch spaces:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSpace = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/spaces', newSpace);
            setShowCreateModal(false);
            setNewSpace({ name: '', slug: '', description: '', visibility: 'PUBLIC' });
            fetchSpaces();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create space');
        }
    };

    const handleJoinSpace = async (spaceId: string) => {
        try {
            await api.post(`/spaces/${spaceId}/join`);
            navigate(`/space/${spaceId}`);
        } catch (error: any) {
            // If already a member, just navigate
            if (error.response?.data?.message?.includes('Already a member')) {
                navigate(`/space/${spaceId}`);
            } else {
                alert(error.response?.data?.message || 'Failed to join space');
            }
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000', overflow: 'hidden', position: 'relative', cursor: 'none' }}>
            <CursorCanvas />
            {/* Minimalist Game-Like HUD */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'start', zIndex: 10, pointerEvents: 'none' }}>
                <div style={{ opacity: 0.8 }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', letterSpacing: '2px', textTransform: 'uppercase' }}>Zi Space Dashboard</h1>
                    <div style={{ width: '50px', height: '2px', background: '#00ffff', marginTop: '5px' }}></div>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '5px' }}>Welcome, {user?.displayName}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', pointerEvents: 'auto' }}>
                    {/* Holographic hex buttons */}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            padding: '1rem',
                            background: 'rgba(0,0,0,0.5)',
                            color: '#00ffff',
                            border: '1px solid #00ffff',
                            clipPath: 'polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            transition: 'all 0.2s',
                            boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.2)'; }}
                    >
                        + Create Space
                    </button>
                    <button
                        onClick={logout}
                        style={{
                            padding: '1rem',
                            background: 'rgba(0,0,0,0.5)',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            clipPath: 'polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.5)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ffff', fontSize: '1.5rem', letterSpacing: '5px' }}>
                    INITIALIZING SENSORS...
                </div>
            ) : (
                <GalaxyScene spaces={spaces} onJoin={handleJoinSpace} />
            )}

            {/* Create Space Modal */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'rgba(20, 20, 40, 0.95)',
                        border: '1px solid #4f46e5',
                        padding: '2rem',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        color: 'white',
                        boxShadow: '0 0 50px rgba(79, 70, 229, 0.3)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#fff' }}>Construct New Base</h2>
                        <form onSubmit={handleCreateSpace}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a5b4fc', fontWeight: '500' }}>
                                    Base Name
                                </label>
                                <input
                                    type="text"
                                    value={newSpace.name}
                                    onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
                                    required
                                    minLength={3}
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid #4f46e5', borderRadius: '8px', color: 'white' }}
                                    placeholder="Alpha Station"
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a5b4fc', fontWeight: '500' }}>
                                    Coordinates (Slug)
                                </label>
                                <input
                                    type="text"
                                    value={newSpace.slug}
                                    onChange={(e) => setNewSpace({ ...newSpace, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    required
                                    minLength={3}
                                    pattern="[a-z0-9-]+"
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid #4f46e5', borderRadius: '8px', color: 'white' }}
                                    placeholder="alpha-station"
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a5b4fc', fontWeight: '500' }}>
                                    Mission Brief
                                </label>
                                <textarea
                                    value={newSpace.description}
                                    onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid #4f46e5', borderRadius: '8px', minHeight: '80px', color: 'white' }}
                                    placeholder="Describe mission objectives..."
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a5b4fc', fontWeight: '500' }}>
                                    Security Level
                                </label>
                                <select
                                    value={newSpace.visibility}
                                    onChange={(e) => setNewSpace({ ...newSpace, visibility: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid #4f46e5', borderRadius: '8px', color: 'white' }}
                                >
                                    <option value="PUBLIC">Public Access</option>
                                    <option value="PRIVATE">Classified</option>
                                    <option value="INVITE_ONLY">Clearance Only</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    style={{ flex: 1, padding: '0.75rem', background: 'transparent', color: '#a5b4fc', border: '1px solid #a5b4fc', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Initialize
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
