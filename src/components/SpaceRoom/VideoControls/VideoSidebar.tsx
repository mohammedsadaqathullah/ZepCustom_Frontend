import React from 'react';
import type { Player } from '../types';
import Avatar from 'react-nice-avatar';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { SelfVideoWidget } from '../UI/SelfVideoWidget';
import type { AvatarConfig } from '../../../types/avatar';

interface VideoSidebarProps {
    isVideoOn: boolean;
    localStream: MediaStream | null;
    isScreenSharing: boolean;
    isAudioOn: boolean;
    fullscreenVideo: string | null;
    nearbyPlayers: Player[];
    remoteStreams: Map<string, MediaStream>;
    showChat: boolean;
    onVideoClick: (userId: string | 'me') => void;
    myAvatarConfig: AvatarConfig;
    myAvatarUrl?: string;
    myUserName?: string;
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
    const [videoTrackCount, setVideoTrackCount] = React.useState(stream ? stream.getVideoTracks().length : 0);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    // Monitor stream track changes
    React.useEffect(() => {
        if (!stream) {
            setVideoTrackCount(0);
            return;
        }

        setVideoTrackCount(stream.getVideoTracks().length);

        const handleTrackChange = () => {
            setVideoTrackCount(stream.getVideoTracks().length);
        };

        stream.addEventListener('addtrack', handleTrackChange);
        stream.addEventListener('removetrack', handleTrackChange);

        return () => {
            stream.removeEventListener('addtrack', handleTrackChange);
            stream.removeEventListener('removetrack', handleTrackChange);
        };
    }, [stream]);

    // Handle video element source
    React.useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error('Error playing remote video:', e));
        }
    }, [stream, videoTrackCount]); // Re-run if stream changes or tracks change

    // Stable fallback avatar config
    const effectiveAvatarConfig = React.useMemo(() => {
        return avatarConfig || genConfig({ isGradient: true });
    }, [avatarConfig]);

    const hasVideo = videoTrackCount > 0;

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
                {/* Always render video for audio playback, hide if no video track */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: hasVideo ? 'block' : 'none'
                    }}
                />

                {!hasVideo && (
                    <div style={{ width: '80px', height: '80px', position: 'absolute' }}>
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
    localStream,
    isScreenSharing,
    isAudioOn,
    fullscreenVideo,
    nearbyPlayers,
    remoteStreams,
    showChat,
    onVideoClick,
    myAvatarConfig,
    myAvatarUrl,
    myUserName
}: VideoSidebarProps) {
    // Show sidebar if there are nearby players OR if local video is on/available
    // Actually always show it if we are in the room, to show Self View? 
    // User requested consistency. Let's show it always, or at least when there's *something* to show.
    // Ideally always show Self View.

    return (
        <>
            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>
            <div className="no-scrollbar" style={{
                position: 'absolute',
                top: '20px', // Started from top
                right: showChat ? '340px' : '20px',
                width: '200px', // Reduced size
                maxHeight: 'calc(100vh - 140px)', // Adjust for bottom bar
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                overflowY: 'auto',
                overflowX: 'hidden',
                zIndex: 100,
                transition: 'right 0.3s ease'
            }}>
                {/* Self Video Widget */}
                <SelfVideoWidget
                    isVideoOn={isVideoOn}
                    isAudioOn={isAudioOn}
                    localStream={localStream}
                    avatarConfig={myAvatarConfig}
                    avatarUrl={myAvatarUrl}
                    userName={myUserName}
                    showChat={showChat} // Passed but unused in style now
                />

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
                            avatarUrl={player.avatarUrl}
                        />
                    ))}
            </div>
        </>
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
