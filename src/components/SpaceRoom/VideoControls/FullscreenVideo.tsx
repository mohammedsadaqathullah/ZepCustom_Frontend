import React from 'react';
import type { Player } from '../types';

interface FullscreenVideoProps {
    fullscreenVideo: string | null;
    localStream: MediaStream | null;
    isScreenSharing: boolean;
    nearbyPlayers: Player[];
    remoteStreams: Map<string, MediaStream>;
    onClose: () => void;
}

export function FullscreenVideo({
    fullscreenVideo,
    localStream,
    isScreenSharing,
    nearbyPlayers,
    remoteStreams,
    onClose
}: FullscreenVideoProps) {
    if (!fullscreenVideo) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: '360px',
            bottom: '80px',
            background: 'rgba(0,0,0,0.95)',
            zIndex: 1500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px 20px 20px'
        }}>
            {fullscreenVideo === 'me' ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <video
                        autoPlay
                        muted
                        playsInline
                        ref={(videoElement) => {
                            if (videoElement && localStream) {
                                videoElement.srcObject = localStream;
                            }
                        }}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: 'scaleX(-1)',
                            borderRadius: '8px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        top: '-50px',
                        left: '0',
                        right: '0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                            You {isScreenSharing && '(Screen)'}
                        </span>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(0,0,0,0.8)',
                                border: '2px solid white',
                                borderRadius: '8px',
                                color: 'white',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>
            ) : (
                (() => {
                    const player = nearbyPlayers.find(p => p.userId === fullscreenVideo);
                    const stream = player ? remoteStreams.get(player.userId) : null;
                    if (!player || !stream) return null;

                    return (
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <video
                                autoPlay
                                playsInline
                                ref={(videoElement) => {
                                    if (videoElement && stream) {
                                        videoElement.srcObject = stream;
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '-50px',
                                left: '0',
                                right: '0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                    {player.userName}
                                </span>
                                <button
                                    onClick={onClose}
                                    style={{
                                        background: 'rgba(0,0,0,0.8)',
                                        border: '2px solid white',
                                        borderRadius: '8px',
                                        color: 'white',
                                        padding: '8px 16px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ✕ Close
                                </button>
                            </div>
                        </div>
                    );
                })()
            )}
        </div>
    );
}
