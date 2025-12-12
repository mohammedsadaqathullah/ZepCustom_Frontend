import Phaser from 'phaser';
import { Player } from './Player';
import { TILE_SIZE, PLAYER_SPEED } from './config';
import type { Socket } from 'socket.io-client';

interface PlayerData {
    id: string;
    userId: string;
    userName: string;
    x: number;
    y: number;
    direction: string;
}

export class GameScene extends Phaser.Scene {
    private socket?: Socket;
    private localPlayer?: Player;
    private remotePlayers: Map<string, Player> = new Map();
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd?: {
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
    };
    private localUserId?: string;
    private localUserName?: string;
    private spaceId?: string;

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data: { socket?: Socket; userId?: string; userName?: string; spaceId?: string }) {
        this.socket = data.socket;
        this.localUserId = data.userId;
        this.localUserName = data.userName;
        this.spaceId = data.spaceId;
    }

    preload() {
        // Create a simple colored circle for player sprites (placeholder)
        const graphics = this.add.graphics();
        graphics.fillStyle(0x667eea, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('player', 32, 32);
        graphics.destroy();

        // In the future, we'll load actual sprite sheets here:
        // this.load.spritesheet('player', 'assets/characters/player.png', {
        //     frameWidth: 32,
        //     frameHeight: 32
        // });
    }

    create() {
        // Set world bounds
        this.physics.world.setBounds(0, 0, 1220, 680);

        // Create background (simple grid for now)
        this.createBackground();

        // Setup keyboard controls
        this.cursors = this.input.keyboard?.createCursorKeys();
        if (this.input.keyboard) {
            this.wasd = {
                up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            };
        }

        // Create local player
        if (this.localUserId && this.localUserName) {
            this.localPlayer = new Player(
                this,
                610, // Center X
                340, // Center Y
                this.localUserId,
                this.localUserName,
                true
            );

            // Camera follows local player
            this.cameras.main.startFollow(this.localPlayer, true, 0.1, 0.1);
        }

        // Setup socket listeners
        this.setupSocketListeners();
    }

    private createBackground() {
        // Create a simple tiled background
        const graphics = this.add.graphics();

        // Draw floor tiles
        graphics.fillStyle(0x2d3748, 1);
        graphics.fillRect(0, 0, 1220, 680);

        // Draw grid
        graphics.lineStyle(1, 0x1a202c, 0.3);
        for (let x = 0; x < 1220; x += TILE_SIZE) {
            graphics.lineBetween(x, 0, x, 680);
        }
        for (let y = 0; y < 680; y += TILE_SIZE) {
            graphics.lineBetween(0, y, 1220, y);
        }

        // In future, load actual tilemaps:
        // const map = this.make.tilemap({ key: 'office-map' });
        // const tileset = map.addTilesetImage('office-tiles');
        // map.createLayer('floor', tileset, 0, 0);
    }

    private setupSocketListeners() {
        if (!this.socket) return;

        // Listen for other players joining
        this.socket.on('player:joined', (data: PlayerData) => {
            if (data.userId !== this.localUserId && !this.remotePlayers.has(data.userId)) {
                const player = new Player(
                    this,
                    data.x,
                    data.y,
                    data.userId,
                    data.userName,
                    false
                );
                this.remotePlayers.set(data.userId, player);
            }
        });

        // Listen for player movements
        this.socket.on('player:moved', (data: PlayerData) => {
            if (data.userId !== this.localUserId) {
                const player = this.remotePlayers.get(data.userId);
                if (player) {
                    player.moveToPosition(data.x, data.y);
                    player.setDirection(data.direction);
                }
            }
        });

        // Listen for players leaving
        this.socket.on('player:left', (data: { userId: string }) => {
            const player = this.remotePlayers.get(data.userId);
            if (player) {
                player.destroy();
                this.remotePlayers.delete(data.userId);
            }
        });

        // Listen for existing players in space
        this.socket.on('space:players', (players: PlayerData[]) => {
            players.forEach(playerData => {
                if (playerData.userId !== this.localUserId && !this.remotePlayers.has(playerData.userId)) {
                    const player = new Player(
                        this,
                        playerData.x,
                        playerData.y,
                        playerData.userId,
                        playerData.userName,
                        false
                    );
                    this.remotePlayers.set(playerData.userId, player);
                }
            });
        });
    }

    update() {
        if (!this.localPlayer) return;

        // Update all players (for name label positioning)
        this.localPlayer.update();
        this.remotePlayers.forEach(player => player.update());

        // Handle local player movement
        this.handlePlayerMovement();
    }

    private handlePlayerMovement() {
        if (!this.localPlayer || !this.cursors || !this.wasd) return;

        let velocityX = 0;
        let velocityY = 0;
        let direction = '';

        // Check keyboard input
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            velocityX = -PLAYER_SPEED;
            direction = 'left';
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            velocityX = PLAYER_SPEED;
            direction = 'right';
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            velocityY = -PLAYER_SPEED;
            direction = 'up';
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            velocityY = PLAYER_SPEED;
            direction = 'down';
        }

        // Set velocity
        this.localPlayer.setVelocity(velocityX, velocityY);

        // Normalize diagonal movement
        if (velocityX !== 0 && velocityY !== 0) {
            this.localPlayer.body?.velocity.normalize().scale(PLAYER_SPEED);
        }

        // Update direction animation
        if (velocityX !== 0 || velocityY !== 0) {
            this.localPlayer.setDirection(direction);

            // Emit movement to server
            if (this.socket && this.spaceId) {
                this.socket.emit('player:move', {
                    spaceId: this.spaceId,
                    x: Math.round(this.localPlayer.x),
                    y: Math.round(this.localPlayer.y),
                    direction: direction
                });
            }
        } else {
            this.localPlayer.setDirection('idle');
        }
    }

    // Public method to add a remote player (called from React)
    addRemotePlayer(userId: string, userName: string, x: number, y: number) {
        if (!this.remotePlayers.has(userId)) {
            const player = new Player(this, x, y, userId, userName, false);
            this.remotePlayers.set(userId, player);
        }
    }

    // Public method to remove a remote player
    removeRemotePlayer(userId: string) {
        const player = this.remotePlayers.get(userId);
        if (player) {
            player.destroy();
            this.remotePlayers.delete(userId);
        }
    }

    // Get all player positions for proximity detection
    getAllPlayerPositions() {
        const positions: Array<{ userId: string; x: number; y: number }> = [];

        if (this.localPlayer && this.localUserId) {
            positions.push({
                userId: this.localUserId,
                x: this.localPlayer.x,
                y: this.localPlayer.y
            });
        }

        this.remotePlayers.forEach((player, userId) => {
            positions.push({
                userId: userId,
                x: player.x,
                y: player.y
            });
        });

        return positions;
    }
}
