export interface Player {
    id: string;
    userId: string;
    userName: string;
    x: number;
    y: number;
    direction: string;
    isWalking: boolean;
    avatarConfig?: any;
    avatarUrl?: string; // Added
    isVideoOn?: boolean;
    isAudioOn?: boolean;
    isDancing?: boolean;
    roomId?: string | null; // Current room ID if inside a private zone
}

export interface ChatMessage {
    id: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: Date;
}

export interface PrivateChatMessage {
    id: string;
    userName: string;
    message: string;
    isMine: boolean;
    timestamp: Date;
}

export interface Notification {
    userName: string;
    message: string;
}

export type ChatTab = 'all' | 'private';
