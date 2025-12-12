import React from 'react';
import { MAP_CONFIG } from '../../../game/data/mapData';

interface SpaceHeaderProps {
    spaceName?: string;
    playerCount: number;
    onExit: () => void;
}

export function SpaceHeader({ spaceName, playerCount, onExit }: SpaceHeaderProps) {
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
            <button
                onClick={onExit}
                style={{
                    padding: '8px 16px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)'
                }}
            >
                ⬅ Exit
            </button>
        </div>
    );
}
