import React from 'react';
import type { Player, PrivateChatMessage } from '../types';

interface PrivateChatProps {
    selectedPrivateUser: string | null;
    players: Map<string, Player>;
    privateChats: Map<string, PrivateChatMessage[]>;
    newMessage: string;
    onMessageChange: (message: string) => void;
    onSendMessage: (e: React.FormEvent) => void;
    onBack: () => void;
    onSelectUser: (userId: string) => void;
    formatMessageTime: (timestamp: Date) => string;
}

export function PrivateChat({
    selectedPrivateUser,
    players,
    privateChats,
    newMessage,
    onMessageChange,
    onSendMessage,
    onBack,
    onSelectUser,
    formatMessageTime
}: PrivateChatProps) {
    if (selectedPrivateUser) {
        const selectedUserName = Array.from(players.values())
            .find(p => p.userId === selectedPrivateUser)?.userName || 'User';
        const messages = privateChats.get(selectedPrivateUser) || [];

        return (
            <>
                {/* Header with back button */}
                <div style={{
                    padding: '12px 20px',
                    background: '#2d3748',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        ← Back
                    </button>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>
                        {selectedUserName}
                    </span>
                </div>

                {/* Private Messages */}
                <div style={{
                    flex: 1,
                    padding: '20px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {messages.length === 0 && (
                        <div style={{ color: '#718096', textAlign: 'center' }}>
                            Start a private conversation...
                        </div>
                    )}
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.isMine ? 'flex-end' : 'flex-start'
                            }}
                        >
                            <div style={{
                                color: 'white',
                                fontSize: '14px',
                                wordWrap: 'break-word',
                                background: msg.isMine ? '#667eea' : '#2d3748',
                                padding: '8px 12px',
                                borderRadius: '12px',
                                maxWidth: '80%',
                                position: 'relative'
                            }}>
                                {msg.message}
                            </div>
                            <div style={{ color: '#718096', fontSize: '9px', marginTop: '2px' }}>
                                {formatMessageTime(msg.timestamp)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div style={{ padding: '20px', borderTop: '1px solid #2d3748' }}>
                    <form onSubmit={onSendMessage} style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={e => onMessageChange(e.target.value)}
                            placeholder="Message privately..."
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#2d3748',
                                color: 'white'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: '12px 16px',
                                background: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Send
                        </button>
                    </form>
                </div>
            </>
        );
    }

    // User List
    return (
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            <div style={{
                color: '#718096',
                fontSize: '12px',
                marginBottom: '12px',
                fontWeight: 'bold'
            }}>
                Select a user to chat privately
            </div>
            {Array.from(players.values()).map(player => (
                <button
                    key={player.userId}
                    onClick={() => onSelectUser(player.userId)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        marginBottom: '8px',
                        background: '#2d3748',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#4a5568'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#2d3748'}
                >
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#48bb78'
                    }} />
                    <span>{player.userName}</span>
                </button>
            ))}
        </div>
    );
}
