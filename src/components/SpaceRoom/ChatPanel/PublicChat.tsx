import React from 'react';
import type { ChatMessage } from '../types';

interface PublicChatProps {
    chatMessages: ChatMessage[];
    newMessage: string;
    onMessageChange: (message: string) => void;
    onSendMessage: (e: React.FormEvent) => void;
    formatMessageTime: (timestamp: Date) => string;
}

export function PublicChat({
    chatMessages,
    newMessage,
    onMessageChange,
    onSendMessage,
    formatMessageTime
}: PublicChatProps) {
    return (
        <>
            {/* Public Messages */}
            <div style={{
                flex: 1,
                padding: '20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {chatMessages.length === 0 && (
                    <div style={{ color: '#718096', textAlign: 'center' }}>
                        No messages yet...
                    </div>
                )}
                {chatMessages.map(msg => (
                    <div key={msg.id} style={{ marginBottom: '8px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '4px'
                        }}>
                            <div style={{ color: '#667eea', fontSize: '12px', fontWeight: 'bold' }}>
                                {msg.userName}
                            </div>
                            <div style={{ color: '#718096', fontSize: '10px' }}>
                                {formatMessageTime(msg.timestamp)}
                            </div>
                        </div>
                        <div style={{
                            color: 'white',
                            fontSize: '14px',
                            wordWrap: 'break-word',
                            background: '#2d3748',
                            padding: '8px',
                            borderRadius: '8px'
                        }}>
                            {msg.message}
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
                        placeholder="Message everyone..."
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
