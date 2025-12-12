import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

class SocketService {
    private socket: Socket | null = null;
    private spaceId: string | null = null;

    connect() {
        if (this.socket?.connected) return;

        console.log('🔌 Connecting to Socket.IO server:', SOCKET_URL);

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
            timeout: 20000,
        });

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinSpace(spaceId: string, userId: string, userName: string, x: number, y: number) {
        if (!this.socket) return;

        this.spaceId = spaceId;
        this.socket.emit('player:join', {
            spaceId,
            userId,
            userName,
            x,
            y,
        });
    }

    leaveSpace() {
        if (this.socket && this.spaceId) {
            this.socket.disconnect();
            this.spaceId = null;
        }
    }

    emitMove(x: number, y: number, direction: string, isWalking: boolean) {
        if (!this.socket || !this.spaceId) return;

        this.socket.emit('player:move', {
            spaceId: this.spaceId,
            x,
            y,
            direction,
            isWalking,
        });
    }

    emitVideoToggle(isVideoOn: boolean) {
        if (!this.socket || !this.spaceId) return;

        this.socket.emit('player:video-toggle', {
            spaceId: this.spaceId,
            isVideoOn,
        });
    }

    emitAudioToggle(isAudioOn: boolean) {
        if (!this.socket || !this.spaceId) return;

        this.socket.emit('player:audio-toggle', {
            spaceId: this.spaceId,
            isAudioOn,
        });
    }

    emitWave(targetPlayerId: string) {
        if (!this.socket || !this.spaceId) return;

        this.socket.emit('player:wave', {
            spaceId: this.spaceId,
            targetPlayerId,
        });
    }

    emitCall(targetPlayerId: string) {
        if (!this.socket || !this.spaceId) return;

        this.socket.emit('player:call', {
            spaceId: this.spaceId,
            targetPlayerId,
        });
    }

    emitDance(isDancing: boolean) {
        if (!this.socket || !this.spaceId) return;

        this.socket.emit('player:dance', {
            spaceId: this.spaceId,
            isDancing,
        });
    }

    on(event: string, callback: (data: any) => void) {
        if (!this.socket) return;
        this.socket.on(event, callback);
    }

    off(event: string, callback?: (data: any) => void) {
        if (!this.socket) return;
        if (callback) {
            this.socket.off(event, callback);
        } else {
            this.socket.off(event);
        }
    }

    getSocket() {
        return this.socket;
    }
}

export const socketService = new SocketService();
