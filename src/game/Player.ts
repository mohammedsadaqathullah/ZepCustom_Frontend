import Phaser from 'phaser';
import { PLAYER_SPEED, ANIMATION_FRAME_RATE } from './config';

export class Player extends Phaser.Physics.Arcade.Sprite {
    private userId: string;
    private userName: string;
    private nameLabel?: Phaser.GameObjects.Text;
    private isLocal: boolean;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        userId: string,
        userName: string,
        isLocal: boolean = false
    ) {
        // Create sprite with a colored circle for now (will use proper sprites later)
        super(scene, x, y, 'player');

        this.userId = userId;
        this.userName = userName;
        this.isLocal = isLocal;

        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Set up physics
        this.setCollideWorldBounds(true);
        this.setSize(24, 32); // Collision box
        this.setDisplaySize(32, 32);

        // Create username label
        this.createNameLabel();

        // Create animations if they don't exist
        this.createAnimations();
    }

    private createNameLabel() {
        this.nameLabel = this.scene.add.text(0, 0, this.userName, {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 4, y: 2 }
        });
        this.nameLabel.setOrigin(0.5, 1);
        this.nameLabel.setDepth(1000);
    }

    private createAnimations() {
        const anims = this.scene.anims;

        // Only create if they don't exist
        if (!anims.exists('walk-down')) {
            // For now, we'll use placeholder animations
            // These will be replaced with actual sprite sheet animations later
            anims.create({
                key: 'walk-down',
                frames: [{ key: 'player', frame: 0 }],
                frameRate: ANIMATION_FRAME_RATE,
                repeat: -1
            });

            anims.create({
                key: 'walk-up',
                frames: [{ key: 'player', frame: 0 }],
                frameRate: ANIMATION_FRAME_RATE,
                repeat: -1
            });

            anims.create({
                key: 'walk-left',
                frames: [{ key: 'player', frame: 0 }],
                frameRate: ANIMATION_FRAME_RATE,
                repeat: -1
            });

            anims.create({
                key: 'walk-right',
                frames: [{ key: 'player', frame: 0 }],
                frameRate: ANIMATION_FRAME_RATE,
                repeat: -1
            });

            anims.create({
                key: 'idle',
                frames: [{ key: 'player', frame: 0 }],
                frameRate: 1
            });
        }
    }

    update() {
        // Update name label position
        if (this.nameLabel) {
            this.nameLabel.setPosition(this.x, this.y - 20);
        }
    }

    moveToPosition(x: number, y: number, immediate: boolean = false) {
        if (immediate) {
            this.setPosition(x, y);
        } else {
            // Smooth movement using tweens
            this.scene.tweens.add({
                targets: this,
                x: x,
                y: y,
                duration: 100,
                ease: 'Linear'
            });
        }
    }

    setDirection(direction: string) {
        // Play appropriate animation based on direction
        switch (direction) {
            case 'up':
                this.play('walk-up', true);
                break;
            case 'down':
                this.play('walk-down', true);
                break;
            case 'left':
                this.play('walk-left', true);
                this.setFlipX(false);
                break;
            case 'right':
                this.play('walk-right', true);
                this.setFlipX(false);
                break;
            default:
                this.play('idle', true);
        }
    }

    getUserId(): string {
        return this.userId;
    }

    destroy(fromScene?: boolean) {
        if (this.nameLabel) {
            this.nameLabel.destroy();
        }
        super.destroy(fromScene);
    }
}
