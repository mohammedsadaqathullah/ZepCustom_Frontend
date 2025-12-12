// import React from 'react';
import type { Notification } from '../types';

interface ChatNotificationProps {
    notification: Notification | null;
}

export function ChatNotification({ notification }: ChatNotificationProps) {
    if (!notification) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'rgba(0,0,0,0.9)',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            maxWidth: '300px',
            zIndex: 10000
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#667eea' }}>
                💬 New message from {notification.userName}
            </div>
            <div style={{ fontSize: '14px', wordWrap: 'break-word' }}>
                {notification.message.length > 100
                    ? notification.message.substring(0, 100) + '...'
                    : notification.message}
            </div>
        </div>
    );
}
