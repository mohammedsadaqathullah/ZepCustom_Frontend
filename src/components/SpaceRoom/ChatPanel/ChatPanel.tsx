import React from 'react';
import { PublicChat } from './PublicChat';
import { PrivateChat } from './PrivateChat';
import type { ChatTab, ChatMessage, Player, PrivateChatMessage } from '../types';

interface ChatPanelProps {
    chatTab: ChatTab;
    chatMessages: ChatMessage[];
    newMessage: string;
    players: Map<string, Player>;
    privateChats: Map<string, PrivateChatMessage[]>;
    selectedPrivateUser: string | null;
    onChatTabChange: (tab: ChatTab) => void;
    onMessageChange: (message: string) => void;
    onSendMessage: (e: React.FormEvent) => void;
    onClose: () => void;
    onSelectPrivateUser: (userId: string | null) => void;
    formatMessageTime: (timestamp: Date) => string;
}

export function ChatPanel({
    chatTab,
    chatMessages,
    newMessage,
    players,
    privateChats,
    selectedPrivateUser,
    onChatTabChange,
    onMessageChange,
    onSendMessage,
    onClose,
    onSelectPrivateUser,
    formatMessageTime
}: ChatPanelProps) {
    return (
        <div style={{
            width: '300px',
            background: '#1a202c',
            borderLeft: '1px solid #2d3748',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Chat Header with Close */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #2d3748',
                color: 'white',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <span>💬 Chat</span>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#718096',
                        cursor: 'pointer',
                        fontSize: '18px'
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #2d3748' }}>
                <button
                    onClick={() => onChatTabChange('all')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        background: chatTab === 'all' ? '#667eea' : 'transparent',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: chatTab === 'all' ? 'bold' : 'normal',
                        transition: 'all 0.2s'
                    }}
                >
                    All
                </button>
                <button
                    onClick={() => onChatTabChange('private')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        background: chatTab === 'private' ? '#667eea' : 'transparent',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: chatTab === 'private' ? 'bold' : 'normal',
                        transition: 'all 0.2s'
                    }}
                >
                    Private
                </button>
            </div>

            {/* Content */}
            {chatTab === 'all' ? (
                <PublicChat
                    chatMessages={chatMessages}
                    newMessage={newMessage}
                    onMessageChange={onMessageChange}
                    onSendMessage={onSendMessage}
                    formatMessageTime={formatMessageTime}
                />
            ) : (
                <PrivateChat
                    selectedPrivateUser={selectedPrivateUser}
                    players={players}
                    privateChats={privateChats}
                    newMessage={newMessage}
                    onMessageChange={onMessageChange}
                    onSendMessage={onSendMessage}
                    onBack={() => onSelectPrivateUser(null)}
                    onSelectUser={onSelectPrivateUser}
                    formatMessageTime={formatMessageTime}
                />
            )}
        </div>
    );
}
