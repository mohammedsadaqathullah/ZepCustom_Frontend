import React from 'react';
import type { Player } from '../types';
import Avatar from 'react-nice-avatar';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

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

import { genConfig } from 'react-nice-avatar'; // Added genConfig import

// Reusable Avatar component for remote players
const RemoteVideoPlayer = ({
    stream,
    userName,
    isAudioOn,
    isVideoOn,
    avatarConfig,
    avatarUrl, // Added
    onClick
}: {
    stream: MediaStream | undefined,
    userName: string,
    isAudioOn: boolean,
    isVideoOn: boolean,
    avatarConfig?: any,
    avatarUrl?: string, // Added
    onClick: () => void
}) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error('Error playing remote video:', e));
        }
    }, [stream, isVideoOn]);

    // Stable fallback avatar config to prevent "strobe" effect on re-renders
    const effectiveAvatarConfig = React.useMemo(() => {
        return avatarConfig || genConfig({ isGradient: true });
    }, [avatarConfig]);

    const hasVideo = isVideoOn && stream && stream.getVideoTracks().length > 0;

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            cursor: hasVideo ? 'pointer' : 'default'
        }} onClick={hasVideo ? onClick : undefined}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 4px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#48bb78',
                        boxShadow: '0 0 0 2px rgba(72, 187, 120, 0.2)'
                    }} />
                    <span style={{
                        fontWeight: '600',
                        fontSize: '14px',
                        color: '#1a202c'
                    }}>{userName}</span>
                </div>
            </div>

            {/* Video / Avatar Container */}
            <div style={{
                width: '100%',
                aspectRatio: '16/9',
                background: '#f7fafc',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e2e8f0'
            }}>
                {hasVideo ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover' // Changed from contain to cover
                        }}
                    />
                ) : (
                    <div style={{ width: '80px', height: '80px' }}>
                        {/* Fallback avatar if no video */}
                        <div style={{ width: '100%', height: '100%' }}>
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Remote Avatar"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2px solid white',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                />
                            ) : (
                                <Avatar style={{ width: '100%', height: '100%' }} {...effectiveAvatarConfig} />
                            )}
                        </div>
                    </div>
                )}

                {/* Mic Status */}
                <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: isAudioOn ? '#48bb78' : '#e53e3e',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                    {isAudioOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                </div>
            </div>
        </div>
    );
};

export function VideoSidebar({
    isVideoOn,
    fullscreenVideo,
    nearbyPlayers,
    remoteStreams,
    showChat,
    onVideoClick
}: VideoSidebarProps) {
    if (nearbyPlayers.length === 0) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '230px',
            right: showChat ? '340px' : '20px',
            width: '240px',
            maxHeight: 'calc(100vh - 250px)',
            // Remove transparent background since items are now cards
            padding: '0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 100,
            transition: 'right 0.3s ease',
            paddingRight: '4px', // Space for scrollbar
            scrollbarWidth: 'thin',
            scrollbarColor: '#48bb78 rgba(0,0,0,0.3)'
        }}>
            {/* Remote Videos */}
            {nearbyPlayers
                .filter(p => fullscreenVideo !== p.userId)
                .map(player => (
                    <RemoteVideoPlayer
                        key={player.userId}
                        stream={remoteStreams.get(player.userId)}
                        userName={player.userName}
                        isAudioOn={!!player.isAudioOn}
                        isVideoOn={!!player.isVideoOn}
                        onClick={() => onVideoClick(player.userId)}
                        avatarConfig={player.avatarConfig}
                        avatarUrl={player.avatarUrl} // Added
                    />
                ))}
        </div>
    );
}

// Debug helper
const NearbyPlayersLog = (nearbyPlayers: Player[], remoteStreams: Map<string, MediaStream>) => {
    React.useEffect(() => {
        console.log('🔄 VideoSidebar Render:', {
            nearbyCount: nearbyPlayers.length,
            streamCount: remoteStreams.size,
            playersWithVideoFlag: nearbyPlayers.filter(p => p.isVideoOn).map(p => p.userName),
            playersWithActiveStream: nearbyPlayers.filter(p => {
                const s = remoteStreams.get(p.userId);
                return s && s.getVideoTracks().length > 0;
            }).map(p => p.userName)
        });
    }, [nearbyPlayers, remoteStreams]);
};
