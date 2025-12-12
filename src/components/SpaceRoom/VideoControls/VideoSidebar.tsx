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

const RemoteVideoPlayer = ({ stream, userName, isAudioOn, onClick }: { stream: MediaStream, userName: string, isAudioOn: boolean, onClick: () => void }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        if (videoRef.current && stream) {
            console.log(`🎥 Rendering remote video for ${userName}:`, stream.id, stream.getTracks().map(t => t.kind));
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error('Error playing remote video:', e));
        }
    }, [stream, userName]);

    return (
        <div
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
            onClick={onClick}
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
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
                    {userName}
                </span>
            </div>

            {isAudioOn && (
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
};

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
    // Log for debugging visibility
    NearbyPlayersLog(nearbyPlayers, remoteStreams);

    // Verify video existence by checking tracks, not just signaling state
    const hasAnyVideo = isVideoOn || nearbyPlayers.some(p => {
        const stream = remoteStreams.get(p.userId);
        return stream && stream.getVideoTracks().length > 0;
    });

    if (!hasAnyVideo) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '230px',
            right: showChat ? '420px' : '20px',
            width: '240px',
            maxHeight: 'calc(100vh - 250px)',
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
            {/* Own Video is handled by SelfVideoWidget */}

            {/* Remote Videos */}
            {nearbyPlayers
                .filter(p => {
                    const stream = remoteStreams.get(p.userId);
                    // Show if we have a stream with video tracks, regardless of p.isVideoOn state
                    // This handles cases where signaling (p.isVideoOn) might be slightly delayed vs MediaStream
                    return stream && stream.getVideoTracks().length > 0 && fullscreenVideo !== p.userId;
                })
                .map(player => (
                    <RemoteVideoPlayer
                        key={player.userId}
                        stream={remoteStreams.get(player.userId)!}
                        userName={player.userName}
                        isAudioOn={!!player.isAudioOn}
                        onClick={() => onVideoClick(player.userId)}
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
