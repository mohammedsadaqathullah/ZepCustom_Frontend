import { useEffect, useRef, useState, useCallback } from 'react';
import { socketService } from '../services/socket';

interface PeerConnection {
    pc: RTCPeerConnection;
    stream: MediaStream | null;
}

export function useWebRTC(myStream: MediaStream | null, spaceId: string | undefined, socketReady: boolean) {
    const peerConnections = useRef<Map<string, PeerConnection>>(new Map());
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

    const configuration: RTCConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    };

    // Create peer connection for a user
    const createPeerConnection = useCallback((userId: string): RTCPeerConnection => {
        console.log('🔧 Creating peer connection for:', userId);
        const pc = new RTCPeerConnection(configuration);

        // Add local stream tracks
        if (myStream) {
            console.log('🔧 Adding local stream tracks to peer connection');
            myStream.getTracks().forEach(track => {
                console.log('🔧 Adding track:', track.kind, track.id);
                pc.addTrack(track, myStream);
            });
        } else {
            console.log('🔧 No local stream, adding recvonly transceivers');
            // Add recvonly transceivers so we can receive video/audio even if we don't send any
            pc.addTransceiver('audio', { direction: 'recvonly' });
            pc.addTransceiver('video', { direction: 'recvonly' });
        }

        // Handle incoming stream
        pc.ontrack = (event) => {
            console.log('🟢 Received remote track from:', userId);
            console.log('🟢 Event streams:', event.streams);
            console.log('🟢 Track kind:', event.track.kind);

            const [remoteStream] = event.streams;
            if (remoteStream) {
                console.log('🟢 Setting remote stream for user:', userId);
                console.log('🟢 Stream tracks:', remoteStream.getTracks().map(t => `${t.kind}: ${t.id}`));

                setRemoteStreams(prev => {
                    const newMap = new Map(prev);
                    newMap.set(userId, remoteStream);
                    console.log('🟢 Updated remoteStreams map. Total streams:', newMap.size);
                    return newMap;
                });

                // Update peer connection stream
                const peerConn = peerConnections.current.get(userId);
                if (peerConn) {
                    peerConn.stream = remoteStream;
                }
            } else {
                console.warn('⚠️ No remote stream in track event');
            }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const socket = socketService.getSocket();
                if (socket && socket.connected) {
                    socket.emit('webrtc:ice-candidate', {
                        spaceId,
                        targetUserId: userId,
                        candidate: event.candidate,
                    });
                } else {
                    console.error('❌ Socket not connected, cannot send ICE candidate');
                }
            }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
            console.log(`Connection state with ${userId}:`, pc.connectionState);
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                closePeerConnection(userId);
            }
        };

        return pc;
    }, [myStream, setRemoteStreams, spaceId]);

    // Update all peer connections when local stream changes
    useEffect(() => {
        if (!myStream) return;

        console.log('🔄 Local stream changed, updating all peer connections...');
        console.log('🔄 Stream has tracks:', myStream.getTracks().map(t => `${t.kind}: ${t.id}`));

        // Update all existing peer connections with new tracks
        peerConnections.current.forEach((peerConn, userId) => {
            const pc = peerConn.pc;
            const senders = pc.getSenders();

            console.log(`🔄 Updating peer connection for ${userId}`);
            console.log(`🔄 Current senders:`, senders.length);

            // Remove all existing tracks
            senders.forEach(sender => {
                try {
                    pc.removeTrack(sender);
                    console.log(`🔄 Removed track:`, sender.track?.kind);
                } catch (err) {
                    console.warn('Could not remove track:', err);
                }
            });

            // Add new tracks from the updated stream
            myStream.getTracks().forEach(track => {
                try {
                    const sender = pc.addTrack(track, myStream);
                    console.log(`🔄 Added new track:`, track.kind, track.id);

                    // Force transceiver to sendrecv to ensure media is sent
                    const transceiver = pc.getTransceivers().find(t => t.sender === sender);
                    if (transceiver) {
                        transceiver.direction = 'sendrecv';
                        console.log(`🔄 Set transceiver direction to sendrecv for`, track.kind);
                    }
                } catch (err) {
                    console.warn('Could not add track:', err);
                }
            });

            // Create a new offer to update the connection
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    console.log(`✅ Sending updated offer to ${userId}`);
                    const socket = socketService.getSocket();
                    if (socket && socket.connected && socket.id) {
                        socket.emit('webrtc:offer', {
                            spaceId,
                            targetUserId: userId,
                            offer: pc.localDescription,
                        });
                    }
                })
                .catch(err => console.error('Error updating peer connection:', err));
        });
    }, [myStream, spaceId]);

    // Create offer to connect with a peer
    const createOffer = useCallback(async (userId: string) => {
        try {
            console.log('🔵 Creating WebRTC offer for user:', userId);
            console.log('🔵 Local stream available:', !!myStream);
            console.log('🔵 SpaceId:', spaceId);

            const socket = socketService.getSocket();

            // Comprehensive socket validation
            if (!socket) {
                console.error('❌ Socket is null, cannot create offer');
                return;
            }

            if (!socket.connected) {
                console.error('❌ Socket not connected, cannot create offer');
                console.error('❌ Socket state:', { id: socket.id, connected: socket.connected });
                return;
            }

            // CRITICAL: Wait for socket.id to be assigned
            if (!socket.id) {
                console.error('❌ Socket ID is undefined - socket not fully initialized yet');
                console.error('❌ This usually means the socket just connected. Waiting 100ms and retrying...');

                // Retry after a short delay
                setTimeout(() => {
                    console.log('🔄 Retrying createOffer after delay...');
                    createOffer(userId);
                }, 100);
                return;
            }

            console.log('✅ Socket fully connected with ID:', socket.id);
            console.log('📋 Socket details:', {
                connected: socket.connected,
                active: socket.active,
                id: socket.id
            });

            // Now safe to proceed with WebRTC
            let peerConn = peerConnections.current.get(userId);

            if (!peerConn) {
                console.log('🔵 Creating new peer connection for:', userId);
                const pc = createPeerConnection(userId);
                peerConn = { pc, stream: null };
                peerConnections.current.set(userId, peerConn);
            }

            const offer = await peerConn.pc.createOffer();
            await peerConn.pc.setLocalDescription(offer);

            console.log('🔵 Sending offer to:', userId, 'via socket', socket.id);
            console.log('🔵 Offer SDP:', offer.sdp?.substring(0, 100) + '...');

            socket.emit('webrtc:offer', {
                spaceId,
                targetUserId: userId,
                offer: offer,
            });

            console.log('📤 Offer emitted successfully to backend');
        } catch (error) {
            console.error('❌ Error creating offer:', error);
        }
    }, [myStream, spaceId, createPeerConnection]);

    // Handle incoming offer
    const handleOffer = useCallback(async (fromUserId: string, offer: RTCSessionDescriptionInit) => {
        try {
            console.log('🟡 Received offer from:', fromUserId);

            let peerConn = peerConnections.current.get(fromUserId);

            if (!peerConn) {
                console.log('🟡 Creating new peer connection for:', fromUserId);
                const pc = createPeerConnection(fromUserId);
                peerConn = { pc, stream: null };
                peerConnections.current.set(fromUserId, peerConn);
            }

            await peerConn.pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConn.pc.createAnswer();
            await peerConn.pc.setLocalDescription(answer);

            console.log('🟡 Sending answer to:', fromUserId);
            socketService.getSocket()?.emit('webrtc:answer', {
                spaceId,
                targetUserId: fromUserId,
                answer: answer,
            });
        } catch (error) {
            console.error('❌ Error handling offer:', error);
        }
    }, [spaceId, createPeerConnection]);

    // Handle incoming answer
    const handleAnswer = useCallback(async (fromUserId: string, answer: RTCSessionDescriptionInit) => {
        try {
            console.log('🟣 Received answer from:', fromUserId);
            const peerConn = peerConnections.current.get(fromUserId);
            if (peerConn && peerConn.pc.signalingState !== 'stable') {
                await peerConn.pc.setRemoteDescription(new RTCSessionDescription(answer));
                console.log('🟣 Answer processed successfully');
            } else {
                console.warn('⚠️ Cannot process answer - peer connection not found or already stable');
            }
        } catch (error) {
            console.error('❌ Error handling answer:', error);
        }
    }, []);

    // Handle incoming ICE candidate
    const handleIceCandidate = useCallback(async (fromUserId: string, candidate: RTCIceCandidateInit) => {
        try {
            const peerConn = peerConnections.current.get(fromUserId);
            if (peerConn) {
                await peerConn.pc.addIceCandidate(new RTCIceCandidate(candidate));
                console.log('🔶 Added ICE candidate from:', fromUserId);
            } else {
                console.warn('⚠️ Cannot add ICE candidate - peer connection not found for:', fromUserId);
            }
        } catch (error) {
            console.error('❌ Error handling ICE candidate:', error);
        }
    }, []);

    // Close peer connection
    const closePeerConnection = (userId: string) => {
        const peerConn = peerConnections.current.get(userId);
        if (peerConn) {
            peerConn.pc.close();
            peerConnections.current.delete(userId);
            setRemoteStreams(prev => {
                const newMap = new Map(prev);
                newMap.delete(userId);
                return newMap;
            });
        }
    };

    // Setup WebRTC signaling listeners - wait for socket to be connected
    useEffect(() => {
        console.log('🔌 WebRTC effect triggered - socketReady:', socketReady);

        const socket = socketService.getSocket();
        if (!socket) {
            console.warn('⚠️ Socket not available for WebRTC signaling');
            return;
        }

        // Check if socket is actually connected
        if (!socket.connected) {
            console.warn('⚠️ Socket exists but not connected yet, waiting...');

            // Wait for connection
            const onConnect = () => {
                console.log('📡 Socket connected, now setting up WebRTC signaling listeners');
                setupListeners();
            };

            socket.once('connect', onConnect);

            return () => {
                socket.off('connect', onConnect);
            };
        }

        // Socket is already connected, set up immediately
        console.log('📡 Setting up WebRTC signaling listeners (socket already connected)');
        return setupListeners();

        function setupListeners() {
            const socket = socketService.getSocket();
            if (!socket) return;

            const offerHandler = (data: { fromUserId: string; offer: RTCSessionDescriptionInit }) => {
                console.log('📥 WebRTC offer received:', data);
                handleOffer(data.fromUserId, data.offer);
            };

            const answerHandler = (data: { fromUserId: string; answer: RTCSessionDescriptionInit }) => {
                console.log('📥 WebRTC answer received:', data);
                handleAnswer(data.fromUserId, data.answer);
            };

            const candidateHandler = (data: { fromUserId: string; candidate: RTCIceCandidateInit }) => {
                console.log('📥 WebRTC ICE candidate received:', data);
                handleIceCandidate(data.fromUserId, data.candidate);
            };

            socket.on('webrtc:offer', offerHandler);
            socket.on('webrtc:answer', answerHandler);
            socket.on('webrtc:ice-candidate', candidateHandler);

            console.log('✅ WebRTC signaling listeners registered');

            return () => {
                console.log('📡 Cleaning up WebRTC signaling listeners');
                socket.off('webrtc:offer', offerHandler);
                socket.off('webrtc:answer', answerHandler);
                socket.off('webrtc:ice-candidate', candidateHandler);
            };
        }
    }, [handleOffer, handleAnswer, handleIceCandidate, socketReady]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            peerConnections.current.forEach((_, userId) => {
                closePeerConnection(userId);
            });
        };
    }, []);

    return {
        createOffer,
        closePeerConnection,
        remoteStreams,
    };
}
