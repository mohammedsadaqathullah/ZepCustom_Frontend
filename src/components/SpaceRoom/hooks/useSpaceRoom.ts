import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { genConfig, type AvatarConfig } from 'react-nice-avatar';
import { useAuthStore } from '../../../stores/authStore';
import api from '../../../services/api';
import { socketService } from '../../../services/socket';
import { useWebRTC } from '../../../hooks/useWebRTC';
import type { Player, ChatMessage, PrivateChatMessage, Notification, ChatTab } from '../types';

const PROXIMITY_RADIUS = 150; // pixels

export function useSpaceRoom() {
    const { spaceId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const previousNearbyUsers = useRef<Set<string>>(new Set());

    // State
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [space, setSpace] = useState<any>(null);
    const [players, setPlayers] = useState<Map<string, Player>>(new Map());
    const [myPosition, setMyPosition] = useState({ x: 340, y: 500, direction: 'down', isWalking: false, roomId: null as string | null });
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isAudioOn, setIsAudioOn] = useState(false);
    const [isDancing, _setIsDancing] = useState(false);
    const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
    const [myAvatarConfig, setMyAvatarConfig] = useState<AvatarConfig>(genConfig({ isGradient: true }));
    const [myAvatarUrl, setMyAvatarUrl] = useState<string | undefined>(undefined); // Added state
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [joinNotification, setJoinNotification] = useState<string | null>(null);
    const [waveNotification, _setWaveNotification] = useState<string | null>(null);
    const [showChat, setShowChat] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [socketReady, setSocketReady] = useState(false);
    const [fullscreenVideo, setFullscreenVideo] = useState<string | null>(null);
    const [chatTab, setChatTab] = useState<ChatTab>('all');
    const [selectedPrivateUser, setSelectedPrivateUser] = useState<string | null>(null);
    const [privateChats, setPrivateChats] = useState<Map<string, PrivateChatMessage[]>>(new Map());
    const [notification, setNotification] = useState<Notification | null>(null);

    const { createOffer, closePeerConnection, remoteStreams, hasPeer } = useWebRTC(
        localStream,
        spaceId,
        socketReady
    );

    // Calculate nearby players for proximity chat
    const nearbyPlayers = Array.from(players.values()).filter(player => {
        // STRICT PRIVACY LOGIC:
        if (myPosition.roomId) {
            // If I am in a room, I only see/hear others in the SAME room.
            // Distance is irrelevant (assuming room size allows visibility).
            return player.roomId === myPosition.roomId;
        } else {
            // If I am OUTSIDE (corridor/open space):
            // 1. I do NOT see people inside rooms (!player.roomId).
            // 2. I checks distance for standard proximity.
            if (player.roomId) return false; // They are in a room, I am not.

            const dx = player.x - myPosition.x;
            const dy = player.y - myPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= PROXIMITY_RADIUS;
        }
    });



    // Toggle functions - State only
    const toggleVideo = () => {
        setIsVideoOn(prev => !prev);
        if (isScreenSharing) setIsScreenSharing(false);
        socketService.emitVideoToggle(!isVideoOn);
    };

    const toggleAudio = () => {
        setIsAudioOn(prev => !prev);
        socketService.emitAudioToggle(!isAudioOn);
    };

    const toggleScreenShare = () => {
        setIsScreenSharing(prev => !prev);
        if (!isScreenSharing) {
            // Turning ON screen share -> Video also ON
            setIsVideoOn(true);
            socketService.emitVideoToggle(true);
        } else {
            // Turning OFF screen share -> Video OFF
            setIsVideoOn(false);
            socketService.emitVideoToggle(false);
        }
    };

    // Avatar customization
    const handleAvatarSave = async (data: { config?: AvatarConfig; avatarUrl?: string | null }) => {
        const { config, avatarUrl } = data;

        if (config) setMyAvatarConfig(config);
        if (avatarUrl !== undefined) setMyAvatarUrl(avatarUrl || undefined);
        if (avatarUrl === null) setMyAvatarUrl(undefined);

        const socket = socketService.getSocket();
        if (socket) {
            socket.emit('player:avatar-update', { spaceId, config, avatarUrl });
        }

        try {
            await api.patch('/users/profile', {
                avatarConfig: config,
                avatarUrl: avatarUrl
            });
            console.log('💾 Avatar saved to DB');
        } catch (error) {
            console.error('Failed to save avatar to DB:', error);
        }

        setShowAvatarCustomizer(false);
    };

    // Format message timestamp
    const formatMessageTime = (timestamp: Date) => {
        const now = new Date();
        const msgDate = new Date(timestamp);
        const isToday = now.toDateString() === msgDate.toDateString();

        if (isToday) {
            return msgDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else {
            return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
                msgDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
    };

    // Play notification sound
    const playNotificationSound = () => {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS56+adTBAKUKfj8LZiGwU7k9r0yXUqBSJzxe/glEILE2Cx5+qoVBIJSKDg87hgGQU=');
        audio.volume = 0.3;
        audio.play().catch(err => console.log('Sound play failed:', err));
    };

    // Send message
    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !spaceId) return;

        const socket = socketService.getSocket();

        if (socket && socket.connected) {
            if (chatTab === 'private' && selectedPrivateUser) {
                // Send private message
                socket.emit('chat:private', {
                    spaceId,
                    targetUserId: selectedPrivateUser,
                    message: newMessage.trim()
                });

                // Add to own private chat history
                setPrivateChats(prev => {
                    const newChats = new Map(prev);
                    const messages = newChats.get(selectedPrivateUser) || [];
                    messages.push({
                        id: `${Date.now()}-${user.id}-${Math.random()}`,
                        userName: user.displayName,
                        message: newMessage.trim(),
                        isMine: true,
                        timestamp: new Date()
                    });
                    newChats.set(selectedPrivateUser, messages);
                    return newChats;
                });
            } else {
                // Send public message
                socket.emit('chat:message', {
                    spaceId,
                    message: newMessage.trim()
                });
            }
        }
        setNewMessage('');
    };

    // Initialize space
    useEffect(() => {
        if (!user || !spaceId) return;

        const initSpace = async () => {
            try {
                const response = await api.get(`/spaces/${spaceId}`);
                setSpace(response.data);

                try {
                    const profileRes = await api.get('/users/profile');
                    if (profileRes.data) {
                        const { avatarConfig, avatarUrl } = profileRes.data;
                        if (avatarConfig) setMyAvatarConfig(avatarConfig);
                        if (avatarUrl) setMyAvatarUrl(avatarUrl);
                    }
                } catch (e) {
                    console.error('Failed to fetch profile', e);
                }

                socketService.connect();

                socketService.on('connect', () => {
                    console.log('🔌 Socket connected in SpaceRoom');
                    setSocketReady(true);
                    socketService.joinSpace(spaceId, user.id, user.displayName, myPosition.x, myPosition.y);
                });

                socketService.on('players:list', (existingPlayers: Player[]) => {
                    console.log('📋 Received players list:', existingPlayers.length);
                    setPlayers(new Map(existingPlayers.map(p => [p.id, p])));
                });

                socketService.on('player:joined', (player: Player) => {
                    console.log('👋 Player joined:', player.userName);
                    setPlayers(prev => {
                        const newMap = new Map(prev);
                        // Remove ghosts
                        for (const [key, val] of newMap.entries()) {
                            if (val.userId === player.userId) newMap.delete(key);
                        }
                        newMap.set(player.id, player);
                        return newMap;
                    });
                    setJoinNotification(`${player.userName} joined`);
                    setTimeout(() => setJoinNotification(null), 3000);
                });

                socketService.on('player:left', (playerId: string) => {
                    setPlayers(prev => {
                        const newMap = new Map(prev);
                        const player = newMap.get(playerId);
                        if (player) {
                            setJoinNotification(`${player.userName} left`);
                            setTimeout(() => setJoinNotification(null), 3000);
                        }
                        newMap.delete(playerId);
                        return newMap;
                    });
                });

                socketService.on('player:moved', ({ playerId, userId, x, y, direction, isWalking, roomId, vehicleId }) => {
                    if (userId === user.id) return;
                    setPlayers(prev => {
                        const newMap = new Map(prev);
                        const player = newMap.get(playerId);
                        if (player) {
                            newMap.set(playerId, { ...player, x, y, direction, isWalking, roomId, vehicleId });
                        }
                        return newMap;
                    });
                });

                socketService.on('player:dance', ({ playerId, isDancing }) => {
                    setPlayers(prev => {
                        const newMap = new Map(prev);
                        const player = newMap.get(playerId);
                        if (player) newMap.set(playerId, { ...player, isDancing });
                        return newMap;
                    });
                });

                socketService.on('player:video-changed', ({ playerId, isVideoOn }) => {
                    setPlayers(prev => {
                        const newMap = new Map(prev);
                        const player = newMap.get(playerId);
                        if (player) newMap.set(playerId, { ...player, isVideoOn });
                        return newMap;
                    });
                });

                socketService.on('player:audio-changed', ({ playerId, isAudioOn }) => {
                    setPlayers(prev => {
                        const newMap = new Map(prev);
                        const player = newMap.get(playerId);
                        if (player) newMap.set(playerId, { ...player, isAudioOn });
                        return newMap;
                    });
                });

                socketService.on('player:avatar-update', ({ playerId, config, avatarUrl }) => {
                    setPlayers(prev => {
                        const newMap = new Map(prev);
                        const player = newMap.get(playerId);
                        if (player) {
                            const updates: any = {};
                            if (config) updates.avatarConfig = config;
                            if (avatarUrl === null) updates.avatarUrl = undefined;
                            else if (typeof avatarUrl === 'string') updates.avatarUrl = avatarUrl;
                            newMap.set(playerId, { ...player, ...updates });
                        }
                        return newMap;
                    });
                });

            } catch (err) {
                console.error('Error initializing space:', err);
            }
        };

        initSpace();

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            socketService.disconnect();
        };
    }, [user, spaceId]);

    // Chat listeners
    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket) return;

        const handleChatMessage = (data: { userId: string; userName: string; message: string; timestamp: string }) => {
            if (data.userId !== user?.id) {
                setNotification({ userName: data.userName, message: data.message });
                playNotificationSound();
                setTimeout(() => setNotification(null), 5000);
            }
            setChatMessages(prev => [...prev, {
                id: `${Date.now()}-${data.userId}-${Math.random()}`,
                userId: data.userId,
                userName: data.userName,
                message: data.message,
                timestamp: new Date(data.timestamp)
            }]);
        };

        const handlePrivateMessage = (data: { fromUserId: string; fromUserName: string; message: string; timestamp: string }) => {
            setNotification({ userName: data.fromUserName, message: data.message });
            playNotificationSound();
            setTimeout(() => setNotification(null), 5000);

            setPrivateChats(prev => {
                const newChats = new Map(prev);
                const messages = newChats.get(data.fromUserId) || [];
                messages.push({
                    id: `${Date.now()}-${data.fromUserId}-${Math.random()}`,
                    userName: data.fromUserName,
                    message: data.message,
                    isMine: false,
                    timestamp: new Date(data.timestamp)
                });
                newChats.set(data.fromUserId, messages);
                return newChats;
            });
        };

        socket.on('chat:message', handleChatMessage);
        socket.on('chat:private', handlePrivateMessage);

        return () => {
            socket.off('chat:message', handleChatMessage);
            socket.off('chat:private', handlePrivateMessage);
        };
    }, [user, socketReady]);

    // Helper: Stop all tracks in a stream
    const stopStream = (stream: MediaStream | null) => {
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
            });
        }
    };

    // Effect 1: Handle Audio Enable/Disable (Lightweight)
    useEffect(() => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = isAudioOn;
            });
            // If we are MUTED, we might still want the track enabled but "soft muted" if using privacy? 
            // Standard WebRTC is track.enabled = false stops sending data but keeps connection alive.
        }
    }, [isAudioOn, localStream]);

    // Determine the current media mode
    // This prevents re-running the acquisition effect when only creating minor state changes (like muting audio while video is on)
    const streamMode = useMemo(() => {
        if (isScreenSharing) return 'screen';
        if (isVideoOn) return 'video';
        if (isAudioOn) return 'audio'; // Video is Off, Screen is Off, but Audio is On
        return 'none';
    }, [isScreenSharing, isVideoOn, isAudioOn]);

    // Effect 2: Media Stream Acquisition (Heavy)
    useEffect(() => {
        let isMounted = true;
        let currentStream: MediaStream | null = null;

        const acquireStream = async () => {
            // Stop existing stream is handled by cleanup of previous effect run?
            // Actually, since we depend on streamMode, if mode changes, cleanup runs.

            if (streamMode === 'video') {
                try {
                    console.log('🎥 Requesting User Media (Video+Audio)');
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                            frameRate: { ideal: 30 }
                        },
                        audio: true
                    });

                    if (!isMounted) { stopStream(stream); return; }

                    stream.getAudioTracks().forEach(t => t.enabled = isAudioOn);

                    currentStream = stream;
                    setLocalStream(stream);
                    if (videoRef.current) videoRef.current.srcObject = stream;

                } catch (err) {
                    console.warn('First attempt failed (Video+Audio). Trying Video only...', err);
                    try {
                        const videoStream = await navigator.mediaDevices.getUserMedia({
                            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                            audio: false
                        });
                        if (!isMounted) { stopStream(videoStream); return; }
                        currentStream = videoStream;
                        setLocalStream(videoStream);
                        if (videoRef.current) videoRef.current.srcObject = videoStream;
                    } catch (videoErr) {
                        console.error('Error accessing camera:', videoErr);
                        if (isMounted) setIsVideoOn(false);
                    }
                }
            } else if (streamMode === 'screen') {
                try {
                    console.log('🖥️ Requesting Screen Share');
                    const screenStream = await navigator.mediaDevices.getDisplayMedia({
                        video: true,
                        audio: false
                    });

                    if (!isMounted) { stopStream(screenStream); return; }

                    try {
                        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        const tracks = [...screenStream.getVideoTracks(), ...audioStream.getAudioTracks()];
                        const combinedStream = new MediaStream(tracks);

                        screenStream.getVideoTracks()[0].onended = () => toggleScreenShare();
                        combinedStream.getAudioTracks().forEach(t => t.enabled = isAudioOn);

                        currentStream = combinedStream;
                        setLocalStream(combinedStream);
                        if (videoRef.current) videoRef.current.srcObject = combinedStream;

                    } catch (audioErr) {
                        console.warn('No mic for screen share:', audioErr);
                        currentStream = screenStream;
                        setLocalStream(screenStream);
                        if (videoRef.current) videoRef.current.srcObject = screenStream;
                        screenStream.getVideoTracks()[0].onended = () => toggleScreenShare();
                    }
                } catch (err) {
                    console.error('Error accessing screen:', err);
                    if (isMounted) setIsScreenSharing(false);
                }
            } else if (streamMode === 'audio') {
                try {
                    console.log('🎤 Requesting Audio Only');
                    const audioStream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: false
                    });

                    if (!isMounted) { stopStream(audioStream); return; }

                    currentStream = audioStream;
                    setLocalStream(audioStream);
                    if (videoRef.current) videoRef.current.srcObject = null;
                } catch (err) {
                    console.error('Error accessing microphone:', err);
                }
            } else {
                // Mode 'none'
                setLocalStream(null);
                if (videoRef.current) videoRef.current.srcObject = null;
            }
        };

        acquireStream();

        return () => {
            isMounted = false;
            if (currentStream) {
                console.log('🛑 Cleanup: stopping stream tracks for mode', streamMode);
                stopStream(currentStream);
            }
        };
    }, [streamMode]);

    // Manage WebRTC connections based on proximity
    useEffect(() => {
        // We now allow connections even if no local stream (receive-only)

        const currentNearbyUserIds = new Set(nearbyPlayers.map(p => p.userId));
        const previousUserIds = previousNearbyUsers.current;

        console.log('📍 Proximity update:', {
            nearbyCount: currentNearbyUserIds.size,
            previousCount: previousUserIds.size,
            nearbyIds: [...currentNearbyUserIds],
            myPosition: { x: Math.round(myPosition.x), y: Math.round(myPosition.y) }
        });

        const newUsers = [...currentNearbyUserIds].filter(id => !previousUserIds.has(id));
        const leftUsers = [...previousUserIds].filter(id => !currentNearbyUserIds.has(id));

        // 1. Connect to NEW nearby users
        newUsers.forEach(userId => {
            // PREVENTION OF GLARE (Collision):
            // Only the user with the lexicographically "lower" ID initiates the connection.
            // The other user waits to receive the offer.
            if (user && user.id < userId) {
                console.log(`🔷 I am the caller for ${userId} (myId < theirId)`);
                createOffer(userId);
            } else {
                console.log(`🔶 Waiting for offer from ${userId} (myId > theirId)`);
            }
        });

        // 2. Disconnect from users who moved away
        leftUsers.forEach(userId => {
            console.log('Closing connection for user who moved away:', userId);
            closePeerConnection(userId);
        });

        // 3. RETRY connection for nearby users if we don't have a peer (Healing)
        currentNearbyUserIds.forEach(userId => {
            const hasConnection = hasPeer(userId);
            const myId = user?.id;

            // Log for debugging loop execution
            if (!hasConnection) {
                console.log(`🚑 Healing check for ${userId}: MyID=${myId}, ConnectionExists=${hasConnection}`);

                if (myId && myId < userId) {
                    console.log('✅ Healing: Initiating retry offer due to lower ID');
                    createOffer(userId);
                } else {
                    console.log('⏳ Healing: Waiting for other user (higher ID) to offer');
                }
            }
        });

        previousNearbyUsers.current = currentNearbyUserIds;
    }, [nearbyPlayers, createOffer, closePeerConnection, hasPeer, localStream, user]);

    return {
        // Refs
        canvasRef,
        videoRef,

        // State
        space,
        players,
        myPosition,
        isVideoOn,
        isAudioOn,
        isDancing,
        showAvatarCustomizer,
        myAvatarConfig,
        chatMessages,
        newMessage,
        joinNotification,
        waveNotification,
        showChat,
        isScreenSharing,
        fullscreenVideo,
        chatTab,
        selectedPrivateUser,
        privateChats,
        notification,
        localStream,
        nearbyPlayers,
        remoteStreams,
        myAvatarUrl, // Added return

        // Setters
        setShowChat,
        setFullscreenVideo,
        setChatTab,
        setSelectedPrivateUser,
        setNewMessage,
        setShowAvatarCustomizer,

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
        socket: socketService.getSocket(),
        setMyPosition
    };
}
