import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

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
        <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
            {/* Header */}
            <header style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1rem 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a202c' }}>🏢 Virtual Spaces</h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ color: '#718096' }}>Welcome, {user?.displayName}</span>
                        <button
                            onClick={logout}
                            style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1a202c' }}>Available Spaces</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        + Create Space
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#718096' }}>Loading spaces...</div>
                ) : spaces.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <p style={{ fontSize: '1.25rem', color: '#718096', marginBottom: '1rem' }}>No spaces available yet</p>
                        <p style={{ color: '#a0aec0' }}>Create your first space to get started!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {spaces.map((space) => (
                            <div
                                key={space.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                }}
                            >
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1a202c' }}>
                                    {space.name}
                                </h3>
                                <p style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                    {space.description || 'No description'}
                                </p>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#a0aec0', marginBottom: '1rem' }}>
                                    <span>👥 {space._count.members} members</span>
                                    <span>👤 {space.owner.displayName}</span>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        background: space.visibility === 'PUBLIC' ? '#c6f6d5' : '#fed7d7',
                                        color: space.visibility === 'PUBLIC' ? '#22543d' : '#742a2a',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem'
                                    }}>
                                        {space.visibility}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleJoinSpace(space.id)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Join Space
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Space Modal */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1a202c' }}>Create New Space</h2>
                        <form onSubmit={handleCreateSpace}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568', fontWeight: '500' }}>
                                    Space Name
                                </label>
                                <input
                                    type="text"
                                    value={newSpace.name}
                                    onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
                                    required
                                    minLength={3}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    placeholder="My Awesome Space"
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568', fontWeight: '500' }}>
                                    Slug (URL-friendly)
                                </label>
                                <input
                                    type="text"
                                    value={newSpace.slug}
                                    onChange={(e) => setNewSpace({ ...newSpace, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    required
                                    minLength={3}
                                    pattern="[a-z0-9-]+"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    placeholder="my-awesome-space"
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568', fontWeight: '500' }}>
                                    Description
                                </label>
                                <textarea
                                    value={newSpace.description}
                                    onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '80px' }}
                                    placeholder="Describe your space..."
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568', fontWeight: '500' }}>
                                    Visibility
                                </label>
                                <select
                                    value={newSpace.visibility}
                                    onChange={(e) => setNewSpace({ ...newSpace, visibility: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                >
                                    <option value="PUBLIC">Public</option>
                                    <option value="PRIVATE">Private</option>
                                    <option value="INVITE_ONLY">Invite Only</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    style={{ flex: 1, padding: '0.75rem', background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
