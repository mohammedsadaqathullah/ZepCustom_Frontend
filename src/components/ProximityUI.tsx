import type { Player } from '../pages/SpaceRoom';

interface Props {
    nearbyPlayers: Player[];
    myPosition: { x: number; y: number };
    onWave: (playerId: string) => void;
    onCall: (playerId: string) => void;
}

export default function ProximityUI({ nearbyPlayers, myPosition, onWave, onCall }: Props) {
    if (nearbyPlayers.length === 0) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(0,0,0,0.9)',
            borderRadius: '12px',
            padding: '16px',
            minWidth: '250px',
            maxWidth: '300px',
            color: 'white',
            zIndex: 100,
        }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#667eea' }}>
                👥 Nearby Players ({nearbyPlayers.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {nearbyPlayers.map(player => {
                    const distance = Math.sqrt(
                        Math.pow(player.x - myPosition.x, 2) +
                        Math.pow(player.y - myPosition.y, 2)
                    );

                    return (
                        <div
                            key={player.id}
                            style={{
                                background: 'rgba(102, 126, 234, 0.2)',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(102, 126, 234, 0.3)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{player.userName}</div>
                                    <div style={{ fontSize: '11px', color: '#a0aec0' }}>
                                        {Math.round(distance)}px away
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    onClick={() => onWave(player.id)}
                                    style={{
                                        flex: 1,
                                        padding: '6px',
                                        background: '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                    }}
                                >
                                    👋 Wave
                                </button>
                                <button
                                    onClick={() => onCall(player.id)}
                                    style={{
                                        flex: 1,
                                        padding: '6px',
                                        background: '#48bb78',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                    }}
                                >
                                    📞 Call
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
