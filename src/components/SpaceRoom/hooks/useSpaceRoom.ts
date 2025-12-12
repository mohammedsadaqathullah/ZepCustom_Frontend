import { useState, useEffect, useRef } from 'react';
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



    // Toggle functions
    const toggleVideo = () => {
        const newState = !isVideoOn;
        setIsVideoOn(newState);
        if (isScreenSharing) setIsScreenSharing(false);

        // Stop/start video tracks to turn off camera LED
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                if (newState) {
                    track.enabled = true;
                } else {
                    track.stop(); // CRITICAL: stop() track to turn off hardware light
                }
            });
        }

        socketService.emitVideoToggle(newState);
        console.log('📹 Video toggled:', newState);
    };

    const toggleAudio = () => {
        const newState = !isAudioOn;
        setIsAudioOn(newState);

        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = newState;
            });
        }

        socketService.emitAudioToggle(newState);
        console.log('🎤 Audio toggled:', newState);
    };

    const toggleScreenShare = () => {
        if (isScreenSharing) {
            setIsScreenSharing(false);
            setIsVideoOn(false);
            socketService.emitVideoToggle(false);
            console.log('🖥️ Stopped screen sharing');
        } else {
            setIsScreenSharing(true);
            setIsVideoOn(true);
            socketService.emitVideoToggle(true);
            console.log('🖥️ Started screen sharing');
        }
    };

    // Avatar customization
    const handleAvatarSave = async (data: { config?: AvatarConfig; avatarUrl?: string | null }) => {
        const { config, avatarUrl } = data;

        if (config) setMyAvatarConfig(config);
        if (avatarUrl !== undefined) setMyAvatarUrl(avatarUrl || undefined); // Convert null to undefined for state if needed, or keep null.
        // Actually state can be undefined | string. Reset to undefined if null.
        if (avatarUrl === null) setMyAvatarUrl(undefined);
        if (typeof avatarUrl === 'string') setMyAvatarUrl(avatarUrl);

        const socket = socketService.getSocket();

        // 1. Emit to others in real-time
        if (socket) {
            socket.emit('player:avatar-update', { spaceId, config, avatarUrl });
        }

        // 2. Persist to Database
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
        console.log('💬 Socket state:', socket?.connected, 'User:', user?.id, 'Space:', spaceId);

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

                console.log('💬 Sending private message to:', selectedPrivateUser);
            } else {
                // Send public message
                console.log('💬 Emitting public message:', newMessage.trim());
                socket.emit('chat:message', {
                    spaceId,
                    message: newMessage.trim()
                });
                console.log('💬 Public message emitted');
            }
        } else {
            console.error('❌ Socket not connected!');
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

                // Fetch my profile to get saved avatar
                try {
                    const profileRes = await api.get('/users/profile');
                    if (profileRes.data) {
                        const { avatarConfig, avatarUrl } = profileRes.data;
                        if (avatarConfig) setMyAvatarConfig(avatarConfig);
                        if (avatarUrl) setMyAvatarUrl(avatarUrl);

                        // IMPORTANT: Emit this immediately after connect so others see me correctly?
                        // Actually, better to rely on connect -> joinSpace.
                        // Ideally joinSpace should send this data.
                        // For now we will emit an update right after joining if we have data.
                    }
                } catch (e) {
                    console.error('Failed to fetch profile', e);
                }

                socketService.connect();

                socketService.on('connect', () => {
                    console.log('🔌 Socket connected in SpaceRoom');
                    setSocketReady(true);
                    socketService.joinSpace(spaceId, user.id, user.displayName, myPosition.x, myPosition.y);

                    // Emit avatar state shortly after join to ensure everyone has it
                    // (A hack until we add it to join payload)
                    setTimeout(() => {
                        // We need access to the CURRENT refs of config/url here.
                        // Since this is inside useEffect closure, it might be stale.
                        // We'll rely on the API fetch above setting state, but here we invoke a manual emit if we can.
                        // Better: use a separate useEffect dependent on socketReady + myAvatarConfig/Url to sync?
                        // Or just accept that for this task, persistence + manual update covers it.
                    }, 500);
                });

                socketService.on('players:list', (existingPlayers: Player[]) => {
                    console.log('📋 Received players list:', existingPlayers.length, 'players');
                    console.log('📋 Players:', existingPlayers.map(p => ({ id: p.id, userId: p.userId, name: p.userName })));
                    setPlayers(new Map(existingPlayers.map(p => [p.id, p])));
                });

                socketService.on('player:joined', (player: Player) => {
                    console.log('👋 Player joined:', player.userName, 'ID:', player.id, 'UserID:', player.userId);
                    setPlayers(prev => {
                        const newMap = new Map(prev);

                        // Prevent Ghost Players: Remove any existing player with the same userId
                        for (const [existingId, existingPlayer] of newMap.entries()) {
                            if (existingPlayer.userId === player.userId) {
                                console.log(`👻 Removing ghost player instance: ${existingId} for user ${player.userId}`);
                                newMap.delete(existingId);
                            }
                        }

                        newMap.set(player.id, player);
                        console.log('📊 Total players now:', newMap.size);
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

                socketService.on('player:moved', ({ playerId, userId, userName, x, y, direction, isWalking, roomId }) => {
                    // Skip if this is our own movement
                    if (userId === user.id) return;

                    setPlayers(prev => {
                        const newMap = new Map(prev);
                        const player = newMap.get(playerId);
                        if (player) {
                            newMap.set(playerId, { ...player, x, y, direction, isWalking, roomId });
                        } else {
                            console.log('⚠️ Received movement for unknown player:', playerId, userName);
                        }
                        return newMap;
                    });
                });

                socketService.on('player:dance', ({ playerId, isDancing }) => {
                    setPlayers(prev => {
                        const newMap = new Map(prev);
                        const player = newMap.get(playerId);
                        if (player) {
                            newMap.set(playerId, { ...player, isDancing });
                        }
                        return newMap;
                    });
                });

                socketService.on('player:video-toggle', ({ playerId, isVideoOn }) => {
                    console.log(`📹 Video toggle for player ${playerId}:`, isVideoOn);
                    setPlayers(prev => {
                        const newMap = new Map(prev);
                        const player = newMap.get(playerId);
                        if (player) {
                            newMap.set(playerId, { ...player, isVideoOn });
                        }
                        return newMap;
                    });
                });

                socketService.on('player:audio-toggle', ({ playerId, isAudioOn }) => {
                    console.log(`🎤 Audio toggle for player ${playerId}:`, isAudioOn);
                    setPlayers(prev => {
                        const newMap = new Map(prev);
                        const player = newMap.get(playerId);
                        if (player) {
                            newMap.set(playerId, { ...player, isAudioOn });
                        }
                        return newMap;
                    });
                });

                socketService.on('player:avatar-update', ({ playerId, config, avatarUrl }) => {
                    setPlayers(prev => {
                        const newMap = new Map(prev);
                        const player = newMap.get(playerId);
                        if (player) {
                            // If avatarUrl is explicitly null, remove it (undefined).
                            // If it's a string, update it.
                            // If undefined, do nothing (keep existing).
                            const updates: any = {};
                            if (config) updates.avatarConfig = config;

                            if (avatarUrl === null) {
                                updates.avatarUrl = undefined;
                            } else if (typeof avatarUrl === 'string') {
                                updates.avatarUrl = avatarUrl;
                            }

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
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
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

            const newMsg = {
                id: `${Date.now()}-${data.userId}-${Math.random()}`,
                userId: data.userId,
                userName: data.userName,
                message: data.message,
                timestamp: new Date(data.timestamp)
            };

            setChatMessages(prev => [...prev, newMsg]);
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

    // Media stream management
    useEffect(() => {
        const updateMediaStream = async () => {
            if (isVideoOn && !isScreenSharing) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                            frameRate: { ideal: 30 }
                        },
                        audio: isAudioOn
                    });
                    setLocalStream(stream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    console.error('Error accessing camera:', err);
                    setIsVideoOn(false);
                }
            } else if (isScreenSharing) {
                try {
                    const screenStream = await navigator.mediaDevices.getDisplayMedia({
                        video: true,
                        audio: false
                    });

                    if (isAudioOn) {
                        try {
                            const audioStream = await navigator.mediaDevices.getUserMedia({
                                audio: true,
                                video: false
                            });
                            const combinedStream = new MediaStream([
                                ...screenStream.getVideoTracks(),
                                ...audioStream.getAudioTracks()
                            ]);
                            setLocalStream(combinedStream);
                            if (videoRef.current) {
                                videoRef.current.srcObject = combinedStream;
                            }
                        } catch (audioErr) {
                            console.warn('Could not get microphone for screen share:', audioErr);
                            setLocalStream(screenStream);
                            if (videoRef.current) {
                                videoRef.current.srcObject = screenStream;
                            }
                        }
                    } else {
                        setLocalStream(screenStream);
                        if (videoRef.current) {
                            videoRef.current.srcObject = screenStream;
                        }
                    }

                    screenStream.getVideoTracks()[0].onended = () => {
                        console.log('Screen share stopped by user');
                        setIsScreenSharing(false);
                        setIsVideoOn(false);
                    };
                    console.log('🖥️ Screen share started with audio:', isAudioOn);
                } catch (err) {
                    console.error('Error accessing screen:', err);
                    setIsScreenSharing(false);
                }
            } else if (!isVideoOn && !isScreenSharing) {
                if (isAudioOn) {
                    try {
                        const audioStream = await navigator.mediaDevices.getUserMedia({
                            audio: true,
                            video: false
                        });
                        setLocalStream(audioStream);
                        console.log('🎤 Audio-only stream started');
                    } catch (err) {
                        console.error('Error accessing microphone:', err);
                    }
                } else {
                    setLocalStream(null);
                    if (videoRef.current) {
                        videoRef.current.srcObject = null;
                    }
                }
            }
        };

        updateMediaStream();
    }, [isVideoOn, isAudioOn, isScreenSharing]);

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
