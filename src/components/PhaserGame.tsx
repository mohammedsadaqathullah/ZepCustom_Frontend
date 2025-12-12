import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MapScene } from '../game/scenes/MapScene';
import { MAP_CONFIG } from '../game/data/mapData';
import type { Socket } from 'socket.io-client';

interface PhaserGameProps {
    socket?: Socket | null;
    userId?: string;
    userName?: string;
    spaceId?: string;
    players?: Map<string, any>;
    onPositionUpdate?: (position: { x: number, y: number, direction: string, isWalking: boolean }) => void;
    isVideoOn?: boolean;
    isAudioOn?: boolean;
}

const PhaserGame: React.FC<PhaserGameProps> = ({ socket, userId, userName, spaceId, players, onPositionUpdate, isVideoOn, isAudioOn }) => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const sceneRef = useRef<MapScene | null>(null);

    useEffect(() => {
        if (!gameRef.current) {
            // Create Phaser game instance with larger canvas for map
            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                parent: 'phaser-game',
                backgroundColor: '#1a1a1a', // Dark void background
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { x: 0, y: 0 },
                        debug: false
                    }
                },
                scene: [MapScene],
                scale: {
                    mode: Phaser.Scale.RESIZE, // Resize to fill container
                    width: '100%',
                    height: '100%',
                    autoCenter: Phaser.Scale.CENTER_BOTH
                }
            };

            gameRef.current = new Phaser.Game(config);
            console.log('Phaser Game created:', gameRef.current);
            console.log('Phaser canvas element:', gameRef.current.canvas);

            // Get reference to the scene and initialize with map data
            gameRef.current.events.once('ready', () => {
                console.log('Phaser game ready event fired');
                const scene = gameRef.current?.scene.getScene('MapScene') as MapScene;
                if (scene) {
                    sceneRef.current = scene;
                    console.log('MapScene instance retrieved, restarting with data...');
                    // Initialize scene with map data
                    scene.scene.restart({
                        rooms: MAP_CONFIG.rooms,
                        vehicles: MAP_CONFIG.vehicles,
                        socket,
                        userId,
                        userName,
                        spaceId
                    });
                } else {
                    console.error('MapScene not found!');
                }
            });

            // Listen to position updates from Phaser
            if (onPositionUpdate) {
                gameRef.current.events.on('player-position-update', onPositionUpdate);
            }
        }

        // Cleanup on unmount
        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
                sceneRef.current = null;
            }
        };
    }, []);

    // Update players when map changes
    useEffect(() => {
        if (sceneRef.current && players) {
            sceneRef.current.updatePlayers(players);
        }
    }, [players]);

    // Update local player's media icons when video/audio state changes
    useEffect(() => {
        if (sceneRef.current) {
            sceneRef.current.updateLocalPlayerMedia(!!isVideoOn, !!isAudioOn);
        }
    }, [isVideoOn, isAudioOn]);

    // Update scene when props change
    useEffect(() => {
        if (sceneRef.current && socket && userId && userName && spaceId) {
            console.log('🔧 PhaserGame: Updating scene with socket:', !!socket, 'socketId:', socket?.id);

            // Update the scene's socket reference without restarting the whole scene
            if (sceneRef.current.scene.isActive()) {
                // Directly update the socket on the scene
                (sceneRef.current as any).socket = socket;
                (sceneRef.current as any).spaceId = spaceId;
                (sceneRef.current as any).userId = userId;
                (sceneRef.current as any).userName = userName;

                console.log('✅ MapScene socket updated:', socket.id);
            } else {
                // Scene isn't active, restart it
                sceneRef.current.scene.restart({
                    rooms: MAP_CONFIG.rooms,
                    vehicles: MAP_CONFIG.vehicles,
                    socket,
                    userId,
                    userName,
                    spaceId
                });
            }
        }
    }, [socket, userId, userName, spaceId]);

    return (
        <div
            id="phaser-game"
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
            }}
        />
    );
};

export default PhaserGame;

