import React from 'react';
import type { Player } from '../types';

interface VideoSidebarProps {
    isVideoOn: boolean;
    localStream: MediaStream | null; // Unused but kept for interface compatibility if needed, else comment out
    isScreenSharing: boolean; // Unused
    isAudioOn: boolean; // Unused
    fullscreenVideo: string | null;
    nearbyPlayers: Player[];
    remoteStreams: Map<string, MediaStream>;
    showChat: boolean;
    onVideoClick: (userId: string | 'me') => void;
}

export function VideoSidebar({
    isVideoOn,
    // localStream,
    // isScreenSharing,
    // isAudioOn,
    fullscreenVideo,
    nearbyPlayers,
    remoteStreams,
    showChat,
    onVideoClick
}: VideoSidebarProps) {
    const hasAnyVideo = isVideoOn || nearbyPlayers.some(p => remoteStreams.has(p.userId) && p.isVideoOn);

    if (!hasAnyVideo) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '80px',
            right: showChat ? '420px' : '20px',
            width: '320px',
            maxHeight: 'calc(100vh - 100px)',
            background: 'rgba(0,0,0,0.7)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 100,
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            transition: 'right 0.3s ease',
            scrollbarWidth: 'thin',
            scrollbarColor: '#48bb78 rgba(0,0,0,0.3)'
        } as React.CSSProperties}>
            {/* Own Video Removed - Handled by SelfVideoWidget */}

            {/* Remote Videos */}
            {nearbyPlayers
                .filter(p => remoteStreams.has(p.userId) && p.isVideoOn && fullscreenVideo !== p.userId)
                .map(player => {
                    const stream = remoteStreams.get(player.userId);

                    return (
                        <div
                            key={player.userId}
                            style={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '16/9',
                                background: 'black',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '2px solid #48bb78',
                                boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
                                cursor: 'pointer'
                            }}
                            onClick={() => onVideoClick(player.userId)}
                        >
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
                                    objectFit: 'contain'
                                }}
                            />

                            <div style={{
                                position: 'absolute',
                                top: '8px',
                                left: '8px',
                                right: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'rgba(0,0,0,0.6)',
                                padding: '6px 10px',
                                borderRadius: '6px'
                            }}>
                                <span style={{
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {player.userName}
                                </span>
                            </div>

                            {player.isAudioOn && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '8px',
                                    right: '8px',
                                    background: '#48bb78',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px'
                                }}>
                                    🎤
                                </div>
                            )}
                        </div>
                    );
                })}
        </div>
    );
}
