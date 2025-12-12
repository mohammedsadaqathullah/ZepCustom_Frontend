// import React from 'react';
// import type { AvatarConfig } from 'react-nice-avatar';

interface MediaControlsProps {
    isVideoOn: boolean;
    isAudioOn: boolean;
    isScreenSharing: boolean;
    onToggleVideo: () => void;
    onToggleAudio: () => void;
    onToggleScreenShare: () => void;
    onCustomizeAvatar: () => void;
}

export function MediaControls({
    isVideoOn,
    isAudioOn,
    isScreenSharing,
    onToggleVideo,
    onToggleAudio,
    onToggleScreenShare,
    onCustomizeAvatar
}: MediaControlsProps) {
    const buttonStyle = (isActive: boolean, isSpecial?: boolean) => ({
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        background: isSpecial
            ? (isActive ? '#48bb78' : '#667eea')
            : (isActive ? '#48bb78' : '#e53e3e'),
        color: 'white',
        fontWeight: 'bold' as const,
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    });

    return (
        <div style={{
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '12px',
            zIndex: 1000
        }}>
            <button onClick={onToggleVideo} style={buttonStyle(isVideoOn && !isScreenSharing)}>
                {(isVideoOn && !isScreenSharing) ? '📹 Video On' : '📹 Video Off'}
            </button>
            <button onClick={onToggleAudio} style={buttonStyle(isAudioOn)}>
                {isAudioOn ? '🎤 Mic On' : '🎤 Mic Off'}
            </button>
            <button onClick={onToggleScreenShare} style={buttonStyle(isScreenSharing, true)}>
                {isScreenSharing ? '🖥️ Sharing...' : '🖥️ Share Screen'}
            </button>
            <button onClick={onCustomizeAvatar} style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#667eea',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
                👕 Customize Avatar
            </button>
        </div>
    );
}
