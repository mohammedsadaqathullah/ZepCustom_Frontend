// import React from 'react';
import type { Player } from '../types';

interface ProximityInfoProps {
    nearbyPlayers: Player[];
}

export function ProximityInfo({ nearbyPlayers }: ProximityInfoProps) {
    if (nearbyPlayers.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '100px',
            left: '20px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            zIndex: 1000,
            maxWidth: '200px'
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#667eea' }}>
                🔊 Nearby ({nearbyPlayers.length})
            </div>
            {nearbyPlayers.map(p => (
                <div
                    key={p.id}
                    style={{
                        fontSize: '12px',
                        padding: '4px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    {p.userName}
                </div>
            ))}
        </div>
    );
}
