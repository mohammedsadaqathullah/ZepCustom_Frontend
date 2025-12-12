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
    onExit: () => void;
}

import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaDesktop, FaTshirt, FaSignOutAlt } from 'react-icons/fa';

// ... (props interface unchanged) ...

export function MediaControls({
    isVideoOn,
    isAudioOn,
    isScreenSharing,
    onToggleVideo,
    onToggleAudio,
    onToggleScreenShare,
    onCustomizeAvatar,
    onExit
}: MediaControlsProps) {
    const buttonStyle = (isActive: boolean, isRed: boolean = false) => ({
        padding: '12px',
        borderRadius: '50%', // Circle buttons
        border: 'none',
        background: isActive
            ? (isRed ? '#e53e3e' : '#48bb78') // Active state colors
            : 'rgba(255, 255, 255, 0.1)', // Inactive glass style
        color: 'white',
        fontSize: '20px',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease'
    });

    return (
        <div style={{
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '16px',
            zIndex: 1000,
            padding: '10px 20px',
            // background: 'rgba(0, 0, 0, 0.3)', // Removed background as requested
            borderRadius: '24px',
            // backdropFilter: 'blur(8px)' // Removed blur as well to be fully transparent if that's the goal, or keep blur? User said "remove full width bg". This component is not full width.
            // Let's assume they want NO background on the bar itself, just floating buttons.
        }}>
            <button onClick={onToggleVideo} style={buttonStyle(!isVideoOn, true)} title={isVideoOn ? "Turn Video Off" : "Turn Video On"}>
                {isVideoOn ? <FaVideo /> : <FaVideoSlash />}
            </button>
            <button onClick={onToggleAudio} style={buttonStyle(!isAudioOn, true)} title={isAudioOn ? "Mute Mic" : "Unmute Mic"}>
                {isAudioOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
            </button>
            <button onClick={onToggleScreenShare} style={buttonStyle(isScreenSharing)} title="Share Screen">
                <FaDesktop />
            </button>
            <button onClick={onCustomizeAvatar} style={buttonStyle(false)} title="Customize Avatar">
                <FaTshirt />
            </button>
            <button onClick={onExit} style={buttonStyle(true, true)} title="Exit Space" >
                <FaSignOutAlt />
            </button>
        </div>
    );
}
