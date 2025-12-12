import Phaser from 'phaser';

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    width: 1220,
    height: 680,
    backgroundColor: '#1a202c',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pixelArt: true, // For crisp sprite rendering
};

export const TILE_SIZE = 32;
export const PLAYER_SPEED = 160;
export const ANIMATION_FRAME_RATE = 8;
