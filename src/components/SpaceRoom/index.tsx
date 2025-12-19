import React, { useEffect, useRef, useState } from 'react';
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
import { EditControlPanel } from './UI/EditControlPanel';
// import { SelfVideoWidget } from './UI/SelfVideoWidget'; // Removed

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
        myAvatarUrl, // Added

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

    // Edit Mode State
    const [isEditing, setIsEditing] = React.useState(false);

    const handleAddRoom = () => {
        // Implement logic to add room
        console.log('Add Room Clicked');
        const game = (window as any).phaserGame;
        if (game) {
            const scene = game.scene.getScene('MapScene');
            if (scene) scene.addRoomMode();
        }
    };

    const handleAddObject = (type: string) => {
        // Implement logic to add object
        console.log('Add Object Clicked:', type);
        const game = (window as any).phaserGame;
        if (game) {
            const scene = game.scene.getScene('MapScene');
            if (scene) scene.addObjectMode(type);
        }
    };

    const [hasSelection, setHasSelection] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const game = (window as any).phaserGame;
            if (game) {
                game.events.off('selection-change'); // Clear old to be safe
                game.events.on('selection-change', (data: { hasSelection: boolean }) => setHasSelection(data.hasSelection));
                clearInterval(interval);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleRotate = () => {
        // Implement logic to rotate selection
        console.log('Rotate Clicked');
        const game = (window as any).phaserGame;
        if (game) {
            const scene = game.scene.getScene('MapScene');
            if (scene) scene.rotateSelected();
        }
    };

    const handleDelete = () => {
        console.log('Delete Clicked');
        const game = (window as any).phaserGame;
        if (game) {
            const scene = game.scene.getScene('MapScene');
            if (scene) scene.deleteSelected();
        }
    };

    const handleSaveString = () => {
        // Implement logic to save map
        console.log('Save Clicked');
        const game = (window as any).phaserGame;
        if (game) {
            const scene = game.scene.getScene('MapScene');
            if (scene) scene.saveMap();
        }
        setIsEditing(false);
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* Main Game Area */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#2d3748' }}>
                {/* Header */}
                <SpaceHeader
                    spaceName={space?.name}
                    playerCount={players.size + 1}
                />

                {/* Phaser Game Canvas */}
                <div style={{
                    position: 'absolute',
                    top: '80px',
                    left: 0,
                    right: 0,
                    bottom: 0,
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
                        isEditing={isEditing}
                    />
                </div>

                {/* Edit Control Panel */}
                <EditControlPanel
                    isEditing={isEditing}
                    onToggleEdit={() => setIsEditing(!isEditing)}
                    onAddRoom={handleAddRoom}
                    onAddObject={handleAddObject}
                    onRotate={handleRotate}
                    onSave={handleSaveString}
                    onDelete={handleDelete}
                    hasSelection={hasSelection}
                />

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
                    onExit={() => navigate('/spaces')}
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
                    initialAvatarUrl={myAvatarUrl} // Added prop
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

            {/* Video Sidebar (Includes Self Video) */}
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
                myAvatarConfig={myAvatarConfig}
                myAvatarUrl={myAvatarUrl}
                myUserName={user?.displayName}
            />

            {/* Message Notification */}
            <ChatNotification notification={notification} />
        </div>
    );
}
