// import React from 'react';
import AvatarCustomizer from '../AvatarCustomizer';
import PhaserGame from '../PhaserGame';
import { useSpaceRoom } from './hooks/useSpaceRoom';
import { SpaceHeader } from './UI/SpaceHeader';
import { ProximityInfo } from './UI/ProximityInfo';
import { ChatNotification } from './UI/ChatNotification';
import { ChatButton } from './UI/ChatButton';
import { MediaControls } from './VideoControls/MediaControls';
import { VideoSidebar } from './VideoControls/VideoSidebar';
import { FullscreenVideo } from './VideoControls/FullscreenVideo';
import { ChatPanel } from './ChatPanel/ChatPanel';
import { SelfVideoWidget } from './UI/SelfVideoWidget';

export default function SpaceRoom() {
    const {
        // State
        space,
        players,
        isVideoOn,
        isAudioOn,
        isScreenSharing,
        showAvatarCustomizer,
        myAvatarConfig,
        chatMessages,
        newMessage,
        joinNotification,
        showChat,
        fullscreenVideo,
        chatTab,
        selectedPrivateUser,
        privateChats,
        notification,
        localStream,
        nearbyPlayers,
        remoteStreams,
        videoRef,

        // Setters
        setShowChat,
        setFullscreenVideo,
        setChatTab,
        setSelectedPrivateUser,
        setNewMessage,
        setShowAvatarCustomizer,
        setMyPosition,

        // Functions
        toggleVideo,
        toggleAudio,
        toggleScreenShare,
        handleAvatarSave,
        formatMessageTime,
        sendMessage,
        navigate,
        spaceId,
        user,
        socket
    } = useSpaceRoom();

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* Main Game Area */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#2d3748' }}>
                {/* Header */}
                <SpaceHeader
                    spaceName={space?.name}
                    playerCount={players.size + 1}
                    onExit={() => navigate('/dashboard')}
                />

                {/* Phaser Game Canvas */}
                <div style={{
                    position: 'absolute',
                    top: '80px',
                    left: 0,
                    right: 0,
                    bottom: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <PhaserGame
                        socket={socket}
                        userId={user?.id}
                        userName={user?.displayName}
                        spaceId={spaceId}
                        players={players}
                        onPositionUpdate={setMyPosition}
                        isVideoOn={isVideoOn}
                        isAudioOn={isAudioOn}
                    />
                </div>

                {/* Join Notification */}
                {joinNotification && (
                    <div style={{
                        position: 'absolute',
                        top: '80px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#667eea',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        zIndex: 1000
                    }}>
                        {joinNotification}
                    </div>
                )}

                {/* Media Controls */}
                <MediaControls
                    isVideoOn={isVideoOn}
                    isAudioOn={isAudioOn}
                    isScreenSharing={isScreenSharing}
                    onToggleVideo={toggleVideo}
                    onToggleAudio={toggleAudio}
                    onToggleScreenShare={toggleScreenShare}
                    onCustomizeAvatar={() => setShowAvatarCustomizer(true)}
                />

                {/* Proximity Info */}
                <ProximityInfo nearbyPlayers={nearbyPlayers} />
            </div>

            {/* Hidden video element for local stream */}
            <video ref={videoRef} autoPlay muted playsInline style={{ display: 'none' }} />

            {/* Avatar Customizer Modal */}
            {showAvatarCustomizer && (
                <AvatarCustomizer
                    initialConfig={myAvatarConfig}
                    onSave={handleAvatarSave}
                    onClose={() => setShowAvatarCustomizer(false)}
                />
            )}

            {/* Chat Panel */}
            {showChat && (
                <ChatPanel
                    chatTab={chatTab}
                    chatMessages={chatMessages}
                    newMessage={newMessage}
                    players={players}
                    privateChats={privateChats}
                    selectedPrivateUser={selectedPrivateUser}
                    onChatTabChange={setChatTab}
                    onMessageChange={setNewMessage}
                    onSendMessage={sendMessage}
                    onClose={() => setShowChat(false)}
                    onSelectPrivateUser={setSelectedPrivateUser}
                    formatMessageTime={formatMessageTime}
                />
            )}

            {/* Chat Toggle Button */}
            {!showChat && (
                <ChatButton onClick={() => setShowChat(true)} />
            )}

            {/* Fullscreen Video Overlay */}
            <FullscreenVideo
                fullscreenVideo={fullscreenVideo}
                localStream={localStream}
                isScreenSharing={isScreenSharing}
                nearbyPlayers={nearbyPlayers}
                remoteStreams={remoteStreams}
                onClose={() => setFullscreenVideo(null)}
            />

            {/* Video Sidebar */}
            <VideoSidebar
                isVideoOn={isVideoOn}
                localStream={localStream}
                isScreenSharing={isScreenSharing}
                isAudioOn={isAudioOn}
                fullscreenVideo={fullscreenVideo}
                nearbyPlayers={nearbyPlayers}
                remoteStreams={remoteStreams}
                showChat={showChat}
                onVideoClick={setFullscreenVideo}
            />

            {/* Self Video Widget (Persistent Right Side) */}
            <SelfVideoWidget
                isVideoOn={isVideoOn}
                isAudioOn={isAudioOn}
                localStream={localStream}
                avatarConfig={myAvatarConfig}
                userName={user?.displayName}
                showChat={showChat}
            />

            {/* Message Notification */}
            <ChatNotification notification={notification} />
        </div>
    );
}
