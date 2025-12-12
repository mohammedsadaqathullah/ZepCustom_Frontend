// import { FaSignOutAlt } from 'react-icons/fa';
import { MAP_CONFIG } from '../../../game/data/mapData';

interface SpaceHeaderProps {
    spaceName?: string;
    playerCount: number;
    // onExit prop removed
}

export function SpaceHeader({ spaceName, playerCount }: SpaceHeaderProps) {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '16px 24px',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 100
        }}>
            <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                    {spaceName || 'Loading...'}
                </h1>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                    👤 {playerCount} online • 🗺️ {MAP_CONFIG.rooms.length} rooms • Arrow Keys to move • E to enter/exit vehicle
                </div>
            </div>
            {/* Exit button moved to MediaControls */}
        </div>
    );
}
