import React from 'react';
import Avatar from 'react-nice-avatar';
import type { AvatarConfig } from '../../../types/avatar';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

interface SelfVideoWidgetProps {
    isVideoOn: boolean;
    isAudioOn: boolean;
    localStream: MediaStream | null;
    avatarConfig: AvatarConfig;
    userName?: string;
    showChat: boolean;
}

export const SelfVideoWidget: React.FC<SelfVideoWidgetProps> = ({
    isVideoOn,
    isAudioOn,
    localStream,
    avatarConfig,
    userName = 'Me',
    showChat
}) => {
    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            right: showChat ? '340px' : '20px', // Dynamic positioning
            width: '240px',
            transition: 'right 0.3s ease', // Smooth transition
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 100,
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
            {/* Header - Simplified to just status dot and name, explicitly removed Close/X icons */}
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
                {/* No other buttons here as requested */}
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
                {isVideoOn && localStream ? (
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
                            transform: 'scaleX(-1)'
                        }}
                    />
                ) : (
                    <div style={{ width: '80px', height: '80px' }}>
                        <Avatar style={{ width: '100%', height: '100%' }} {...avatarConfig} />
                    </div>
                )}

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
