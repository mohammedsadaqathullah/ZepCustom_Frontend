import Phaser from 'phaser';

interface Room {
    id: string;
    name: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    entrances: Entrance[];
    furniture?: any[];
}

interface Entrance {
    side: 'top' | 'bottom' | 'left' | 'right';
    offset: number;
    width: number;
}

interface Vehicle {
    id: string;
    type: 'car' | 'bike';
    x: number;
    y: number;
    width: number;
    height: number;
}


export class MapScene extends Phaser.Scene {
    private rooms: Room[] = [];
    private vehicles: Vehicle[] = [];
    private player: Phaser.GameObjects.Container | null = null;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    private wasd: any = null;
    private currentVehicle: string | null = null;
    private playerSpeed = 160;
    private vehicleSpeed = 320;
    private walls: Phaser.Physics.Arcade.StaticGroup | null = null;
    private playerLegs: Phaser.GameObjects.Graphics | null = null;
    private playerFront: Phaser.GameObjects.Graphics | null = null;
    private playerBack: Phaser.GameObjects.Graphics | null = null;
    private playerSide: Phaser.GameObjects.Graphics | null = null;
    private socket: any = null;
    private lastRoomId: string | null = null;
    private lastX: number = 0;
    private lastY: number = 0;
    private vehicleMap: Map<string, Phaser.GameObjects.Container> = new Map();



    constructor() {
        super({ key: 'MapScene' });
    }

    init(data: {
        rooms: Room[];
        vehicles: Vehicle[];
        socket?: any;
        userId?: string;
        userName?: string;
        spaceId?: string;
    }) {
        this.rooms = data.rooms || [];
        this.vehicles = data.vehicles || [];
        this.socket = data.socket;
        // Store user/space data for future use (e.g., multiplayer)
        console.log('MapScene initialized:', {
            roomCount: this.rooms.length,
            vehicleCount: this.vehicles.length,
            userId: data.userId,
            userName: data.userName,
            spaceId: data.spaceId
        });
    }

    create() {
        console.log('MapScene create() called');
        // Fullscreen map bounds (slightly larger than content to avoid edge clipping)
        this.physics.world.setBounds(0, 0, 2000, 1500);

        // Create static group for walls
        this.walls = this.physics.add.staticGroup();

        // Create layers
        console.log('Creating background...');
        this.createBackground();
        console.log('Drawing rooms...');
        this.drawAllRooms();
        console.log('Drawing furniture...');
        this.drawAllFurniture();
        console.log('Drawing vehicles...');
        this.drawVehicles();
        console.log('Creating player...');
        this.createPlayer();

        // Fog of War Layer (High depth to cover everything except UI)
        // Handled by fogTexture in updateFogOfWar

        this.setupCamera();
        this.setupControls();
        this.addRoomLabels();
        this.addInstructions();

        // Add collision between player and walls
        if (this.player && this.walls) {
            this.physics.add.collider(this.player, this.walls);
        }
        console.log('MapScene create() complete');
    }

    createBackground() {
        console.log('createBackground: Starting...');
        const graphics = this.add.graphics();

        // Royal Marble Floor (Single Building Look)
        // Main base color (Cream/Marble)
        graphics.fillStyle(0xf5f5f5, 1);
        graphics.fillRect(0, 0, 2000, 1500);
        console.log('createBackground: Drew marble floor');

        // Marble texture effect (subtle veins)
        graphics.lineStyle(2, 0xe0e0e0, 0.5);
        for (let i = 0; i < 50; i++) {
            const x1 = Phaser.Math.Between(0, 2000);
            const y1 = Phaser.Math.Between(0, 1500);
            const x2 = x1 + Phaser.Math.Between(-200, 200);
            const y2 = y1 + Phaser.Math.Between(-200, 200);

            // Simple lines for marble veins to avoid bezierCurveTo issues
            graphics.beginPath();
            graphics.moveTo(x1, y1);
            graphics.lineTo(x2, y2);
            graphics.strokePath();
        }

        // Large grid for premium tile look (100x100)
        graphics.lineStyle(1, 0xdcdcdc, 0.3);
        for (let x = 0; x < 2000; x += 100) {
            graphics.lineBetween(x, 0, x, 1500);
        }
        for (let y = 0; y < 1500; y += 100) {
            graphics.lineBetween(0, y, 2000, y);
        }
    }

    update(time: number) {
        if (!this.player) return;

        const speed = this.currentVehicle ? this.vehicleSpeed : this.playerSpeed;
        const body = this.player.body as Phaser.Physics.Arcade.Body;

        body.setVelocity(0);

        let moving = false;
        let dx = 0;

        // Movement logic
        if (this.cursors?.left.isDown || this.wasd?.A.isDown) {
            body.setVelocityX(-speed);
            moving = true;
            dx = -1;
        } else if (this.cursors?.right.isDown || this.wasd?.D.isDown) {
            body.setVelocityX(speed);
            moving = true;
            dx = 1;
        }

        if (this.cursors?.up.isDown || this.wasd?.W.isDown) {
            body.setVelocityY(-speed);
            moving = true;
        } else if (this.cursors?.down.isDown || this.wasd?.S.isDown) {
            body.setVelocityY(speed);
            moving = true;
        }

        // Animation Logic
        if (moving) {
            this.drawLegs(time / 100, dx !== 0); // Animate legs

            // Directional Visibility Logic (RPG Style)
            if (this.playerFront && this.playerBack && this.playerSide) {
                if (dx === 1) {
                    // Right
                    this.playerFront.setVisible(false);
                    this.playerBack.setVisible(false);
                    this.playerSide.setVisible(true);
                    this.playerSide.setScale(1, 1); // Normal
                } else if (dx === -1) {
                    // Left
                    this.playerFront.setVisible(false);
                    this.playerBack.setVisible(false);
                    this.playerSide.setVisible(true);
                    this.playerSide.setScale(-1, 1); // Flipped
                } else if (body.velocity.y > 0) {
                    // Down (Front)
                    this.playerFront.setVisible(true);
                    this.playerBack.setVisible(false);
                    this.playerSide.setVisible(false);
                } else if (body.velocity.y < 0) {
                    // Up (Back)
                    this.playerFront.setVisible(false);
                    this.playerBack.setVisible(true);
                    this.playerSide.setVisible(false);
                }
            }

            // Reset rotation (we don't rotate the container anymore)
            this.player.setRotation(0);

            // Fix text orientation (always upright)
            const nameLabel = this.player.list.find(c => c instanceof Phaser.GameObjects.Text) as Phaser.GameObjects.Text;
            if (nameLabel) {
                nameLabel.setRotation(0);
                nameLabel.setOrigin(0.5, 0.5);
                // Flip text back if container is flipped (but we don't flip container anymore)
                // We only flip playerSide graphics.
            }
        } else {
            this.drawLegs(0); // Reset legs
        }

        // Vehicle interaction
        if (this.currentVehicle) {
            const vehicleContainer = this.vehicleMap.get(this.currentVehicle);
            if (vehicleContainer) {
                // Move vehicle with player
                vehicleContainer.setPosition(this.player.x, this.player.y);

                // Calculate rotation based on movement (Car sprite faces UP)
                // To face Right (0): Angle PI/2
                // To face Left (PI): Angle -PI/2
                // To face Down (PI/2): Angle PI
                // To face Up (-PI/2): Angle 0
                if (moving) {
                    if (dx === 1) vehicleContainer.setRotation(Math.PI / 2);
                    else if (dx === -1) vehicleContainer.setRotation(-Math.PI / 2);
                    else if (body.velocity.y > 0) vehicleContainer.setRotation(Math.PI);
                    else if (body.velocity.y < 0) vehicleContainer.setRotation(0);
                }

                // Ensure vehicle is below player
                vehicleContainer.setDepth(this.player.depth - 1);
            }
        }

        this.checkProximity();
        this.updateFogOfWar();
    }

    updateFogOfWar() {
        // Fog of War removed as per user request
    }

    drawAllRooms() {
        this.rooms.forEach(room => {
            this.drawRoomFloor(room);
            this.drawRoomWalls(room);
            this.drawDoors(room);
        });
    }

    drawRoomFloor(room: Room) {
        const graphics = this.add.graphics();

        // Premium Room Colors (Subtle overlays on marble)
        const floorColors: Record<string, number> = {
            reception: 0xffffff, // Pure marble
            staff: 0xe3f2fd, // Very light blue tint
            meeting: 0xeefebe, // Very light beige/gold tint
            admin: 0xf3e5f5, // Very light purple tint
            garden: 0xe8f5e9, // Very light green tint
            parking: 0xe0e0e0 // Light gray
        };

        const color = floorColors[room.type] || 0xffffff;

        // Draw room floor with low opacity to blend with marble
        graphics.fillStyle(color, 0.4);
        graphics.fillRect(room.x, room.y, room.width, room.height);

        // Decorative border for rooms
        if (room.type !== 'parking' && room.type !== 'garden') {
            graphics.lineStyle(2, 0xc0c0c0, 0.5);
            graphics.strokeRect(room.x + 4, room.y + 4, room.width - 8, room.height - 8);
        }
    }

    drawRoomWalls(room: Room) {
        const graphics = this.add.graphics();
        graphics.setDepth(10);
        const wallThickness = 12;
        const wallColor = 0x424242;

        // Draw walls with gaps for entrances
        // Top Wall
        this.drawWallSegment(graphics, room.x, room.y - wallThickness, room.width, wallThickness, 'top', room.entrances);
        // Bottom Wall
        this.drawWallSegment(graphics, room.x, room.y + room.height, room.width, wallThickness, 'bottom', room.entrances);
        // Left Wall
        this.drawWallSegment(graphics, room.x - wallThickness, room.y, wallThickness, room.height, 'left', room.entrances);
        // Right Wall
        this.drawWallSegment(graphics, room.x + room.width, room.y, wallThickness, room.height, 'right', room.entrances);

        // Draw corners to fill gaps
        graphics.fillStyle(wallColor, 1);
        // Top-Left
        graphics.fillRect(room.x - wallThickness, room.y - wallThickness, wallThickness, wallThickness);
        // Top-Right
        graphics.fillRect(room.x + room.width, room.y - wallThickness, wallThickness, wallThickness);
        // Bottom-Left
        graphics.fillRect(room.x - wallThickness, room.y + room.height, wallThickness, wallThickness);
        // Bottom-Right
        graphics.fillRect(room.x + room.width, room.y + room.height, wallThickness, wallThickness);

        // Create physics bodies for walls (excluding entrances)
        this.createWallColliders(room, wallThickness);
    }

    drawWallSegment(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, side: string, entrances: Entrance[]) {
        const wallColor = 0x424242;
        const wallShadow = 0x212121;

        // Find entrances on this side
        const sideEntrances = entrances.filter(e => e.side === side);

        if (sideEntrances.length === 0) {
            // No entrances, draw full wall
            g.fillStyle(wallColor, 1);
            g.fillRect(x, y, w, h);
            // Shadow
            if (side === 'top' || side === 'left') {
                g.fillStyle(wallShadow, 0.5);
                if (w > h) g.fillRect(x, y + h - 4, w, 4); // Horizontal shadow
                else g.fillRect(x + w - 4, y, 4, h); // Vertical shadow
            }
        } else {
            // Draw wall segments around entrances
            let currentPos = 0;
            const totalLength = (side === 'top' || side === 'bottom') ? w : h;

            // Sort entrances by offset
            sideEntrances.sort((a, b) => a.offset - b.offset);

            sideEntrances.forEach(entrance => {
                // Draw segment before entrance
                const segmentLength = entrance.offset - currentPos;
                if (segmentLength > 0) {
                    if (side === 'top' || side === 'bottom') {
                        g.fillStyle(wallColor, 1);
                        g.fillRect(x + currentPos, y, segmentLength, h);
                        if (side === 'top') {
                            g.fillStyle(wallShadow, 0.5);
                            g.fillRect(x + currentPos, y + h - 4, segmentLength, 4);
                        }
                    } else {
                        g.fillStyle(wallColor, 1);
                        g.fillRect(x, y + currentPos, w, segmentLength);
                        if (side === 'left') {
                            g.fillStyle(wallShadow, 0.5);
                            g.fillRect(x + w - 4, y + currentPos, 4, segmentLength);
                        }
                    }
                }
                currentPos = entrance.offset + entrance.width;
            });

            // Draw remaining segment
            if (currentPos < totalLength) {
                const segmentLength = totalLength - currentPos;
                if (side === 'top' || side === 'bottom') {
                    g.fillStyle(wallColor, 1);
                    g.fillRect(x + currentPos, y, segmentLength, h);
                    if (side === 'top') {
                        g.fillStyle(wallShadow, 0.5);
                        g.fillRect(x + currentPos, y + h - 4, segmentLength, 4);
                    }
                } else {
                    g.fillStyle(wallColor, 1);
                    g.fillRect(x, y + currentPos, w, segmentLength);
                    if (side === 'left') {
                        g.fillStyle(wallShadow, 0.5);
                        g.fillRect(x + w - 4, y + currentPos, 4, segmentLength);
                    }
                }
            }
        }
    }

    createWallColliders(room: Room, thickness: number) {
        // Helper to add physics body
        const addCollider = (x: number, y: number, w: number, h: number) => {
            const wall = this.add.rectangle(x + w / 2, y + h / 2, w, h);
            this.walls?.add(wall);
            wall.setVisible(false);
        };

        // Top Wall
        this.createSideColliders(room.x, room.y - thickness, room.width, thickness, 'top', room.entrances, addCollider);
        // Bottom Wall
        this.createSideColliders(room.x, room.y + room.height, room.width, thickness, 'bottom', room.entrances, addCollider);
        // Left Wall
        this.createSideColliders(room.x - thickness, room.y, thickness, room.height, 'left', room.entrances, addCollider);
        // Right Wall
        this.createSideColliders(room.x + room.width, room.y, thickness, room.height, 'right', room.entrances, addCollider);
    }

    createSideColliders(x: number, y: number, w: number, h: number, side: string, entrances: Entrance[], addFn: (x: number, y: number, w: number, h: number) => void) {
        const sideEntrances = entrances.filter(e => e.side === side);
        const totalLength = (side === 'top' || side === 'bottom') ? w : h;

        if (sideEntrances.length === 0) {
            addFn(x, y, w, h);
        } else {
            let currentPos = 0;
            sideEntrances.sort((a, b) => a.offset - b.offset);

            sideEntrances.forEach(entrance => {
                const segmentLength = entrance.offset - currentPos;
                if (segmentLength > 0) {
                    if (side === 'top' || side === 'bottom') {
                        addFn(x + currentPos, y, segmentLength, h);
                    } else {
                        addFn(x, y + currentPos, w, segmentLength);
                    }
                }
                currentPos = entrance.offset + entrance.width;
            });

            if (currentPos < totalLength) {
                const segmentLength = totalLength - currentPos;
                if (side === 'top' || side === 'bottom') {
                    addFn(x + currentPos, y, segmentLength, h);
                } else {
                    addFn(x, y + currentPos, w, segmentLength);
                }
            }
        }
    }

    drawDoors(room: Room) {
        const g = this.add.graphics();
        const doorFrameColor = 0x5d4037; // Dark wood
        const doorColor = 0x8d6e63; // Light wood

        room.entrances.forEach(entrance => {
            let x = room.x;
            let y = room.y;
            let w = 0;
            let h = 0;

            // Calculate position based on side
            if (entrance.side === 'top') {
                x += entrance.offset;
                y -= 4; // Slightly outside
                w = entrance.width;
                h = 8;
            } else if (entrance.side === 'bottom') {
                x += entrance.offset;
                y += room.height - 4;
                w = entrance.width;
                h = 8;
            } else if (entrance.side === 'left') {
                x -= 4;
                y += entrance.offset;
                w = 8;
                h = entrance.width;
            } else if (entrance.side === 'right') {
                x += room.width - 4;
                y += entrance.offset;
                w = 8;
                h = entrance.width;
            }

            // Draw Door Frame (Floor threshold)
            g.fillStyle(doorFrameColor, 1);
            g.fillRect(x, y, w, h);

            // Draw open door visual (optional, maybe just the threshold is enough for now)
            // For now, just a threshold to mark the entrance clearly
            g.fillStyle(doorColor, 0.8);
            if (entrance.side === 'top' || entrance.side === 'bottom') {
                g.fillRect(x + 2, y + 2, w - 4, h - 4);
            } else {
                g.fillRect(x + 2, y + 2, w - 4, h - 4);
            }
        });
    }

    drawAllFurniture() {
        this.rooms.forEach(room => {
            room.furniture?.forEach(furniture => {
                this.drawFurnitureSprite(furniture);
            });
        });
    }

    drawFurnitureSprite(item: any) {
        const container = this.add.container(item.x, item.y);
        const graphics = this.add.graphics();

        switch (item.type) {
            case 'desk':
            case 'executive-desk':
                this.drawDesk(graphics, item.width, item.height, item.type === 'executive-desk');
                break;
            case 'chair':
            case 'executive-chair':
                this.drawChair(graphics, item.width, item.height);
                break;
            case 'sofa':
            case 'executive-sofa':
                this.drawSofa(graphics, item.width, item.height);
                break;
            case 'plant':
                this.drawPlant(graphics, item.width, item.height);
                break;
            case 'bookshelf':
                this.drawBookshelf(graphics, item.width, item.height);
                break;
            case 'cabinet':
                this.drawCabinet(graphics, item.width, item.height);
                break;
            case 'conference-table':
            case 'meeting-table':
                this.drawTable(graphics, item.width, item.height, true);
                break;
            case 'whiteboard':
                this.drawWhiteboard(graphics, item.width, item.height);
                break;
            case 'projector':
                this.drawProjector(graphics, item.width, item.height);
                break;
            case 'bench':
                this.drawBench(graphics, item.width, item.height);
                break;
            case 'tree':
                this.drawTree(graphics, item.width, item.height);
                break;
            case 'fountain':
                this.drawFountain(graphics, item.width, item.height);
                break;
            case 'flowers':
                this.drawFlowers(graphics, item.width, item.height);
                break;
        }

        container.add(graphics);
    }

    // ... (Keep existing furniture drawing methods: drawDesk, drawChair, drawSofa, etc.)
    // I will copy them from the previous file content to ensure they are preserved.

    drawDesk(g: Phaser.GameObjects.Graphics, w: number, h: number, isExecutive: boolean) {
        const color = isExecutive ? 0x5d4037 : 0x795548;
        const topColor = isExecutive ? 0x6d4c41 : 0x8d6e63;

        // Desk body
        g.fillStyle(color, 1);
        g.fillRoundedRect(0, 0, w, h, 4);

        // Desk top (lighter)
        g.fillStyle(topColor, 1);
        g.fillRoundedRect(0, 0, w, h * 0.8, 4);

        // Drawers
        g.lineStyle(2, 0x4e342e, 1);
        g.strokeRect(w * 0.1, h * 0.4, w * 0.35, h * 0.2);
        g.strokeRect(w * 0.1, h * 0.7, w * 0.35, h * 0.2);

        // Handles
        g.fillStyle(0xffd700, 1);
        g.fillCircle(w * 0.4, h * 0.5, 2);
        g.fillCircle(w * 0.4, h * 0.8, 2);

        // Premium Details: Monitor
        g.fillStyle(0x212121, 1); // Stand
        g.fillRect(w * 0.45, h * 0.1, w * 0.1, h * 0.1);
        g.fillStyle(0x000000, 1); // Screen Bezel
        g.fillRoundedRect(w * 0.3, h * 0.05, w * 0.4, h * 0.25, 2);
        g.fillStyle(0x42a5f5, 1); // Screen (Blue glow)
        g.fillRect(w * 0.32, h * 0.07, w * 0.36, h * 0.21);

        // Keyboard
        g.fillStyle(0x424242, 1);
        g.fillRoundedRect(w * 0.35, h * 0.4, w * 0.3, h * 0.1, 2);

        // Mouse
        g.fillStyle(0x212121, 1);
        g.fillEllipse(w * 0.7, h * 0.45, 6, 8);

        // Coffee Mug
        g.fillStyle(0xffffff, 1);
        g.fillCircle(w * 0.85, h * 0.2, 5);
        g.fillStyle(0x795548, 1); // Coffee
        g.fillCircle(w * 0.85, h * 0.2, 3);
    }

    drawChair(g: Phaser.GameObjects.Graphics, w: number, h: number) {
        // Wheels/Base
        g.fillStyle(0x212121, 1);
        g.fillCircle(w * 0.5, h * 0.85, 4);
        g.lineStyle(2, 0x212121, 1);
        g.lineBetween(w * 0.3, h * 0.9, w * 0.7, h * 0.9);
        g.lineBetween(w * 0.5, h * 0.8, w * 0.5, h * 0.95);

        // Seat
        g.fillStyle(0x37474f, 1);
        g.fillRoundedRect(w * 0.2, h * 0.4, w * 0.6, h * 0.4, 4);

        // Backrest
        g.fillStyle(0x455a64, 1);
        g.fillRoundedRect(w * 0.25, h * 0.05, w * 0.5, h * 0.4, 4);

        // Armrests
        g.fillStyle(0x263238, 1);
        g.fillRoundedRect(w * 0.15, h * 0.45, 4, h * 0.2, 2);
        g.fillRoundedRect(w * 0.85 - 4, h * 0.45, 4, h * 0.2, 2);
    }

    drawSofa(g: Phaser.GameObjects.Graphics, w: number, h: number) {
        // Base
        g.fillStyle(0x5c6bc0, 1);
        g.fillRoundedRect(0, h * 0.3, w, h * 0.6, 8);

        // Backrest
        g.fillStyle(0x3f51b5, 1);
        g.fillRoundedRect(0, 0, w, h * 0.4, 8);

        // Cushions
        g.fillStyle(0x7986cb, 1);
        g.fillRoundedRect(w * 0.1, h * 0.35, w * 0.35, h * 0.3, 4);
        g.fillRoundedRect(w * 0.55, h * 0.35, w * 0.35, h * 0.3, 4);
    }

    drawPlant(g: Phaser.GameObjects.Graphics, w: number, h: number) {
        // Pot
        g.fillStyle(0x5d4037, 1);
        g.fillRoundedRect(w * 0.25, h * 0.6, w * 0.5, h * 0.4, 4);
        g.fillStyle(0x3e2723, 1); // Soil
        g.fillEllipse(w * 0.5, h * 0.6, w * 0.5, h * 0.1);

        // Leaves (More detailed)
        g.fillStyle(0x2e7d32, 1);
        g.fillEllipse(w * 0.5, h * 0.3, w * 0.4, h * 0.6);
        g.fillEllipse(w * 0.3, h * 0.4, w * 0.3, h * 0.5);
        g.fillEllipse(w * 0.7, h * 0.4, w * 0.3, h * 0.5);

        // Highlights
        g.fillStyle(0x66bb6a, 0.6);
        g.fillEllipse(w * 0.45, h * 0.25, w * 0.15, h * 0.3);
    }

    drawBookshelf(g: Phaser.GameObjects.Graphics, w: number, h: number) {
        g.fillStyle(0x4e342e, 1);
        g.fillRoundedRect(0, 0, w, h, 2);
        g.fillStyle(0x3e2723, 1);
        for (let i = 0; i < 3; i++) {
            const y = (h / 3) * i;
            g.fillRect(0, y, w, 4);
        }
        const bookColors = [0xe53935, 0x1e88e5, 0x43a047, 0xfb8c00, 0x8e24aa];
        for (let shelf = 0; shelf < 3; shelf++) {
            for (let i = 0; i < 5; i++) {
                g.fillStyle(bookColors[i], 1);
                g.fillRoundedRect(i * (w / 5) + 2, shelf * (h / 3) + 6, w / 5 - 4, h / 3 - 10, 2);
            }
        }
    }

    drawCabinet(g: Phaser.GameObjects.Graphics, w: number, h: number) {
        g.fillStyle(0x616161, 1);
        g.fillRoundedRect(0, 0, w, h, 2);
        g.lineStyle(2, 0x424242, 1);
        g.strokeRect(w * 0.1, h * 0.2, w * 0.8, h * 0.3);
        g.strokeRect(w * 0.1, h * 0.6, w * 0.8, h * 0.3);
        g.fillStyle(0xbdbdbd, 1);
        g.fillRoundedRect(w * 0.45, h * 0.3, w * 0.1, 4, 1);
        g.fillRoundedRect(w * 0.45, h * 0.7, w * 0.1, 4, 1);
    }

    drawTable(g: Phaser.GameObjects.Graphics, w: number, h: number, isConference: boolean) {
        const color = isConference ? 0x5d4037 : 0x8d6e63;
        g.fillStyle(color, 1);
        g.fillRoundedRect(0, 0, w, h, 8);
        g.fillStyle(color + 0x202020, 1);
        g.fillRoundedRect(w * 0.05, h * 0.05, w * 0.9, h * 0.9, 4);

        // Papers/Documents on table
        g.fillStyle(0xffffff, 0.9);
        g.fillRect(w * 0.2, h * 0.3, 20, 25);
        g.fillRect(w * 0.5, h * 0.6, 20, 25);
        g.fillStyle(0xeeeeee, 1);
        g.fillRect(w * 0.2 + 2, h * 0.3 + 2, 16, 21);
    }

    drawWhiteboard(g: Phaser.GameObjects.Graphics, w: number, h: number) {
        g.fillStyle(0xffffff, 1);
        g.fillRoundedRect(0, 0, w, h, 2);
        g.lineStyle(4, 0x424242, 1);
        g.strokeRoundedRect(0, 0, w, h, 2);
        g.lineStyle(2, 0x2196f3, 0.5);
        g.beginPath();
        g.moveTo(w * 0.2, h * 0.3);
        g.lineTo(w * 0.4, h * 0.25);
        g.lineTo(w * 0.6, h * 0.35);
        g.lineTo(w * 0.8, h * 0.3);
        g.strokePath();

        // Marker tray
        g.fillStyle(0x9e9e9e, 1);
        g.fillRect(w * 0.2, h - 4, w * 0.6, 4);
    }

    drawProjector(g: Phaser.GameObjects.Graphics, w: number, h: number) {
        g.fillStyle(0x424242, 1);
        g.fillRoundedRect(0, h * 0.4, w, h * 0.6, 4);
        g.fillStyle(0x212121, 1);
        g.fillCircle(w * 0.5, h * 0.5, w * 0.3);
        g.fillStyle(0x90caf9, 0.5);
        g.fillCircle(w * 0.5, h * 0.5, w * 0.2);
    }

    drawBench(g: Phaser.GameObjects.Graphics, w: number, h: number) {
        g.fillStyle(0x795548, 1);
        g.fillRoundedRect(0, h * 0.4, w, h * 0.3, 4);
        g.fillStyle(0x6d4c41, 1);
        g.fillRoundedRect(0, 0, w, h * 0.4, 4);
        g.fillStyle(0x5d4037, 1);
        g.fillRect(w * 0.1, h * 0.7, 6, h * 0.3);
        g.fillRect(w * 0.9 - 6, h * 0.7, 6, h * 0.3);
    }

    drawTree(g: Phaser.GameObjects.Graphics, w: number, h: number) {
        g.fillStyle(0x5d4037, 1);
        g.fillRect(w * 0.4, h * 0.5, w * 0.2, h * 0.5);
        g.fillStyle(0x2e7d32, 1);
        g.fillCircle(w * 0.5, h * 0.3, w * 0.4);
        g.fillCircle(w * 0.3, h * 0.4, w * 0.3);
        g.fillCircle(w * 0.7, h * 0.4, w * 0.3);
        g.fillStyle(0x43a047, 0.5);
        g.fillCircle(w * 0.45, h * 0.25, w * 0.2);
    }

    drawFountain(g: Phaser.GameObjects.Graphics, w: number, h: number) {
        g.fillStyle(0x90a4ae, 1);
        g.fillCircle(w * 0.5, h * 0.5, w * 0.5);
        g.fillStyle(0x4fc3f7, 0.7);
        g.fillCircle(w * 0.5, h * 0.5, w * 0.4);
        g.fillStyle(0x78909c, 1);
        g.fillCircle(w * 0.5, h * 0.5, w * 0.15);
        g.fillStyle(0x81d4fa, 0.6);
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i;
            const x = w * 0.5 + Math.cos(angle) * w * 0.25;
            const y = h * 0.5 + Math.sin(angle) * h * 0.25;
            g.fillCircle(x, y, 3);
        }
    }

    drawFlowers(g: Phaser.GameObjects.Graphics, w: number, h: number) {
        g.fillStyle(0x795548, 0.5);
        g.fillRoundedRect(0, h * 0.7, w, h * 0.3, 4);
        const flowerColors = [0xe91e63, 0x9c27b0, 0xff5722, 0xffeb3b];
        for (let i = 0; i < 6; i++) {
            const x = (w / 6) * i + (w / 12);
            const color = flowerColors[i % flowerColors.length];
            g.fillStyle(0x2e7d32, 1);
            g.fillRect(x - 2, h * 0.4, 4, h * 0.3);
            g.fillStyle(color, 1);
            g.fillCircle(x, h * 0.4, 8);
        }
    }

    drawVehicles() {
        this.vehicles.forEach(vehicle => this.drawVehicleSprite(vehicle));
    }

    drawVehicleSprite(vehicle: Vehicle) {
        // Center the container on the vehicle's center point
        const container = this.add.container(vehicle.x + vehicle.width / 2, vehicle.y + vehicle.height / 2);
        container.setDepth(50);
        this.vehicleMap.set(vehicle.id, container);
        const g = this.add.graphics();
        // Offset graphics so (0,0) is the center of the vehicle
        g.x = -vehicle.width / 2;
        g.y = -vehicle.height / 2;

        if (vehicle.type === 'car') {
            // Enhanced Car Design
            g.fillStyle(0x000000, 0.2);
            g.fillEllipse(vehicle.width / 2, vehicle.height - 5, vehicle.width * 0.7, 15);
            g.fillStyle(0x2196f3, 1);
            g.fillRoundedRect(8, 25, vehicle.width - 16, vehicle.height - 50, 10);
            g.fillStyle(0x1976d2, 1);
            g.fillRoundedRect(12, 29, vehicle.width - 24, vehicle.height - 58, 8);
            g.fillStyle(0x1976d2, 1);
            g.fillRoundedRect(16, 45, vehicle.width - 32, vehicle.height * 0.35, 8);
            g.fillStyle(0x64b5f6, 0.7);
            g.fillRoundedRect(20, 50, vehicle.width - 40, 25, 4);
            g.fillStyle(0x64b5f6, 0.7);
            g.fillRoundedRect(20, 82, vehicle.width - 40, 20, 4);
            g.lineStyle(2, 0x0d47a1, 0.5);
            g.lineBetween(vehicle.width / 2, 30, vehicle.width / 2, vehicle.height - 30);
            g.fillStyle(0x181818, 1);
            g.fillCircle(18, 35, 14);
            g.fillCircle(vehicle.width - 18, 35, 14);
            g.fillCircle(18, vehicle.height - 35, 14);
            g.fillCircle(vehicle.width - 18, vehicle.height - 35, 14);
            g.fillStyle(0xbdbdbd, 1);
            g.fillCircle(18, 35, 8);
            g.fillCircle(vehicle.width - 18, 35, 8);
            g.fillCircle(18, vehicle.height - 35, 8);
            g.fillCircle(vehicle.width - 18, vehicle.height - 35, 8);
            g.lineStyle(2, 0x757575, 1);
            [18, vehicle.width - 18].forEach(x => {
                [35, vehicle.height - 35].forEach(y => {
                    for (let i = 0; i < 4; i++) {
                        const angle = (Math.PI / 4) + (Math.PI / 2) * i;
                        g.lineBetween(x, y, x + Math.cos(angle) * 6, y + Math.sin(angle) * 6);
                    }
                });
            });
            g.fillStyle(0xfff176, 1);
            g.fillCircle(12, 18, 5);
            g.fillCircle(vehicle.width - 12, 18, 5);
            g.fillStyle(0xffeb3b, 0.3);
            g.fillCircle(12, 18, 8);
            g.fillCircle(vehicle.width - 12, 18, 8);
            g.fillStyle(0xe53935, 1);
            g.fillCircle(12, vehicle.height - 18, 4);
            g.fillCircle(vehicle.width - 12, vehicle.height - 18, 4);
            g.lineStyle(2, 0x0d47a1, 0.8);
            g.strokeRoundedRect(8, 25, vehicle.width - 16, vehicle.height - 50, 10);
        } else {
            // Enhanced Bike Design
            g.fillStyle(0x000000, 0.15);
            g.fillEllipse(vehicle.width / 2, vehicle.height - 3, vehicle.width * 0.5, 10);
            g.fillStyle(0xf44336, 1);
            g.fillRoundedRect(vehicle.width * 0.3, 22, vehicle.width * 0.4, vehicle.height - 46, 4);
            g.fillStyle(0xd32f2f, 1);
            g.fillRect(vehicle.width * 0.33, 25, vehicle.width * 0.34, vehicle.height - 52);
            g.fillStyle(0x212121, 1);
            g.fillEllipse(vehicle.width * 0.5, 28, vehicle.width * 0.45, 12);
            g.fillStyle(0x424242, 0.8);
            g.fillEllipse(vehicle.width * 0.5, 26, vehicle.width * 0.35, 8);
            g.lineStyle(5, 0x616161, 1);
            g.lineBetween(vehicle.width * 0.25, 24, vehicle.width * 0.75, 24);
            g.fillStyle(0x212121, 1);
            g.fillCircle(vehicle.width * 0.25, 24, 4);
            g.fillCircle(vehicle.width * 0.75, 24, 4);
            g.fillStyle(0xf44336, 1);
            g.fillRect(vehicle.width * 0.35, 10, vehicle.width * 0.3, 8);
            g.fillStyle(0xf44336, 1);
            g.fillRect(vehicle.width * 0.35, vehicle.height - 18, vehicle.width * 0.3, 8);
            g.fillStyle(0x181818, 1);
            g.fillCircle(vehicle.width * 0.5, 16, 12);
            g.fillCircle(vehicle.width * 0.5, vehicle.height - 16, 12);
            g.fillStyle(0x757575, 1);
            g.fillCircle(vehicle.width * 0.5, 16, 6);
            g.fillCircle(vehicle.width * 0.5, vehicle.height - 16, 6);
            g.lineStyle(1.5, 0x9e9e9e, 1);
            [16, vehicle.height - 16].forEach(y => {
                for (let i = 0; i < 12; i++) {
                    const angle = (Math.PI * 2 / 12) * i;
                    g.lineBetween(
                        vehicle.width * 0.5,
                        y,
                        vehicle.width * 0.5 + Math.cos(angle) * 10,
                        y + Math.sin(angle) * 10
                    );
                }
            });
            g.fillStyle(0xfff176, 1);
            g.fillCircle(vehicle.width * 0.5, 12, 3);
            g.fillStyle(0xe53935, 1);
            g.fillCircle(vehicle.width * 0.5, vehicle.height - 12, 3);
        }

        container.add(g);
        (container as any).vehicleId = vehicle.id;
        (container as any).vehicleBounds = new Phaser.Geom.Rectangle(
            vehicle.x,
            vehicle.y,
            vehicle.width,
            vehicle.height
        );
    }

    createPlayer() {
        const container = this.add.container(1000, 750); // Start in reception

        // Legs (Animated)
        this.playerLegs = this.add.graphics();
        container.add(this.playerLegs);
        this.drawLegs(0); // Initial draw

        const g = this.add.graphics();

        // Premium Player Character
        // Shadow
        g.fillStyle(0x000000, 0.2);
        g.fillEllipse(0, 24, 20, 8); // Adjusted relative to center

        // Front View (Down)
        this.playerFront = this.add.graphics();
        // Neck
        this.playerFront.fillStyle(0xffcc80, 1);
        this.playerFront.fillRect(-3, -14, 6, 4);
        // Torso (Shirt)
        this.playerFront.fillStyle(0x1565c0, 1);
        this.playerFront.fillRoundedRect(-9, -12, 18, 20, 4);
        // Arms (Sleeves)
        this.playerFront.fillStyle(0x1565c0, 1);
        this.playerFront.fillRoundedRect(-13, -10, 4, 12, 2);
        this.playerFront.fillRoundedRect(9, -10, 4, 12, 2);
        // Hands
        this.playerFront.fillStyle(0xffcc80, 1);
        this.playerFront.fillCircle(-11, 4, 3);
        this.playerFront.fillCircle(11, 4, 3);
        // Head
        this.playerFront.fillStyle(0xffcc80, 1);
        this.playerFront.fillCircle(0, -22, 11);
        // Hair
        this.playerFront.fillStyle(0x3e2723, 1);
        this.playerFront.fillCircle(0, -24, 11); // Top
        this.playerFront.fillCircle(0, -22, 11); // Base
        this.playerFront.fillStyle(0xffcc80, 1); // Face cutout
        this.playerFront.fillCircle(0, -20, 9);
        // Eyes
        this.playerFront.fillStyle(0x212121, 1);
        this.playerFront.fillCircle(-3, -20, 2);
        this.playerFront.fillCircle(3, -20, 2);
        // Mouth
        this.playerFront.lineStyle(1, 0x212121, 1);
        this.playerFront.beginPath();
        this.playerFront.arc(0, -16, 3, 0.2, Math.PI - 0.2, false);
        this.playerFront.strokePath();

        container.add(this.playerFront);

        // Back View (Up)
        this.playerBack = this.add.graphics();
        // Torso
        this.playerBack.fillStyle(0x1565c0, 1);
        this.playerBack.fillRoundedRect(-9, -12, 18, 20, 4);
        // Arms
        this.playerBack.fillStyle(0x1565c0, 1);
        this.playerBack.fillRoundedRect(-13, -10, 4, 12, 2);
        this.playerBack.fillRoundedRect(9, -10, 4, 12, 2);
        // Hands
        this.playerBack.fillStyle(0xffcc80, 1);
        this.playerBack.fillCircle(-11, 4, 3);
        this.playerBack.fillCircle(11, 4, 3);
        // Head (Full Hair)
        this.playerBack.fillStyle(0x3e2723, 1);
        this.playerBack.fillCircle(0, -22, 11);
        this.playerBack.fillCircle(0, -24, 10);
        this.playerBack.setVisible(false);
        container.add(this.playerBack);

        // Side View (Right)
        this.playerSide = this.add.graphics();
        // Torso
        this.playerSide.fillStyle(0x1565c0, 1);
        this.playerSide.fillRoundedRect(-5, -12, 10, 20, 4);
        // Arm (One visible)
        this.playerSide.fillStyle(0x1565c0, 1);
        this.playerSide.fillRoundedRect(-1, -10, 4, 12, 2);
        // Hand
        this.playerSide.fillStyle(0xffcc80, 1);
        this.playerSide.fillCircle(1, 4, 3);
        // Head
        this.playerSide.fillStyle(0xffcc80, 1);
        this.playerSide.fillCircle(0, -22, 11);
        // Hair
        this.playerSide.fillStyle(0x3e2723, 1);
        this.playerSide.fillCircle(-2, -22, 11); // Back
        this.playerSide.fillCircle(0, -26, 9); // Top
        // Eye
        this.playerSide.fillStyle(0x212121, 1);
        this.playerSide.fillCircle(5, -22, 2);
        // Nose
        this.playerSide.fillStyle(0xffcc80, 1);
        this.playerSide.fillCircle(9, -20, 3);
        // Mouth
        this.playerSide.lineStyle(1, 0x212121, 1);
        this.playerSide.beginPath();
        this.playerSide.moveTo(6, -16);
        this.playerSide.lineTo(9, -16);
        this.playerSide.strokePath();

        this.playerSide.setVisible(false);
        container.add(this.playerSide);

        // Name label
        const nameBg = this.add.graphics();
        nameBg.fillStyle(0x000000, 0.6);
        nameBg.fillRoundedRect(-20, -55, 40, 20, 10);
        container.add(nameBg);

        const nameLabel = this.add.text(0, -45, 'You', {
            fontSize: '12px',
            color: '#ffffff',
            padding: { x: 4, y: 2 },
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        nameLabel.setOrigin(0.5, 0.5);
        container.add(nameLabel);

        this.player = container;
        this.player.setDepth(100);
        this.physics.add.existing(this.player);
        (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        (this.player.body as Phaser.Physics.Arcade.Body).setSize(24, 24);
        (this.player.body as Phaser.Physics.Arcade.Body).setOffset(-12, 0); // Offset physics to feet area
    }

    drawLegs(offset: number, isSideView: boolean = false) {
        if (!this.playerLegs) return;
        this.playerLegs.clear();

        // Legs start at y=8 (bottom of torso)
        if (isSideView) {
            // Side View (Walking profile)
            // Leg 1 (Back) - Slightly offset X
            this.playerLegs.fillStyle(0x1565c0, 1); // Blue Pants
            this.playerLegs.fillRoundedRect(-5, 8 + Math.sin(offset) * 6, 6, 14, 2);
            this.playerLegs.fillStyle(0x212121, 1); // Shoe
            this.playerLegs.fillRoundedRect(-5, 20 + Math.sin(offset) * 6, 6, 4, 2);

            // Leg 2 (Front) - Slightly offset X
            this.playerLegs.fillStyle(0x1565c0, 1); // Blue Pants
            this.playerLegs.fillRoundedRect(-1, 8 + Math.sin(offset + Math.PI) * 6, 6, 14, 2);
            this.playerLegs.fillStyle(0x212121, 1); // Shoe
            this.playerLegs.fillRoundedRect(-1, 20 + Math.sin(offset + Math.PI) * 6, 6, 4, 2);
        } else {
            // Front/Back View (Side-by-side)
            // Left Leg
            this.playerLegs.fillStyle(0x1565c0, 1); // Blue Pants
            this.playerLegs.fillRoundedRect(-7, 8 + Math.sin(offset) * 4, 6, 14, 2);
            // Left Shoe
            this.playerLegs.fillStyle(0x212121, 1);
            this.playerLegs.fillRoundedRect(-7, 20 + Math.sin(offset) * 4, 6, 4, 2);

            // Right Leg
            this.playerLegs.fillStyle(0x1565c0, 1); // Blue Pants
            this.playerLegs.fillRoundedRect(1, 8 + Math.sin(offset + Math.PI) * 4, 6, 14, 2);
            // Right Shoe
            this.playerLegs.fillStyle(0x212121, 1);
            this.playerLegs.fillRoundedRect(1, 20 + Math.sin(offset + Math.PI) * 4, 6, 4, 2);
        }
    }

    setupCamera() {
        console.log('setupCamera: player exists?', !!this.player);
        if (!this.player) {
            console.warn('setupCamera: No player yet, setting default camera bounds');
            this.cameras.main.setBounds(0, 0, 2000, 1500);
            this.cameras.main.setZoom(1);
            // Center camera on map center
            this.cameras.main.centerOn(1000, 750);
            return;
        }
        this.cameras.main.setBounds(0, 0, 2000, 1500);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(1);
        console.log('setupCamera: Camera following player at', this.player.x, this.player.y);
    }

    setupControls() {
        this.cursors = this.input.keyboard?.createCursorKeys() || null;
        this.wasd = this.input.keyboard?.addKeys('W,A,S,D') || null;

        this.input.keyboard?.on('keydown-E', () => {
            this.toggleVehicle();
        });
    }

    addRoomLabels() {
        this.rooms.forEach(room => {
            if (!room.name) return; // Skip empty names

            const label = this.add.text(
                room.x + room.width / 2,
                room.y + 10,
                room.name,
                {
                    fontSize: '14px',
                    color: '#ffffff',
                    backgroundColor: '#000000aa',
                    padding: { x: 8, y: 4 },
                    fontStyle: 'bold'
                }
            );
            label.setOrigin(0.5, 0);
        });
    }

    addInstructions() {
        const instructions = this.add.text(
            20,
            20,
            'Arrow Keys: Move | E: Enter/Exit Vehicle',
            {
                fontSize: '14px',
                color: '#ffffff',
                backgroundColor: '#000000dd',
                padding: { x: 10, y: 6 }
            }
        );
        instructions.setScrollFactor(0);
        instructions.setDepth(1000);
    }

    checkProximity() {
        if (!this.player || !this.socket) return;

        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        const playerCenter = playerBody.center;

        // 1. Check if inside any room
        let currentRoomId: string | null = null;

        // Check room bounds
        this.rooms.forEach(room => {
            const bounds = new Phaser.Geom.Rectangle(room.x, room.y, room.width, room.height);
            if (Phaser.Geom.Rectangle.Contains(bounds, playerCenter.x, playerCenter.y)) {
                currentRoomId = (room as any).roomId;
            }
        });

        // 2. If not in a room, check for nearby rooms (within 100px)
        if (!currentRoomId) {
            let closestDist = Infinity;
            let closestRoomId: string | null = null;

            this.rooms.forEach(room => {
                const bounds = new Phaser.Geom.Rectangle(room.x, room.y, room.width, room.height);

                // Calculate distance from player center to room rectangle
                // This is a simplified check: distance to closest point on rect
                const closestX = Phaser.Math.Clamp(playerCenter.x, bounds.x, bounds.right);
                const closestY = Phaser.Math.Clamp(playerCenter.y, bounds.y, bounds.bottom);

                const dist = Phaser.Math.Distance.Between(playerCenter.x, playerCenter.y, closestX, closestY);

                if (dist < 100 && dist < closestDist) {
                    closestDist = dist;
                    closestRoomId = (room as any).roomId;
                }
            });

            if (closestRoomId) {
                // Optional: You could treat "nearby" as being in the room, 
                // or just use it for UI hints. For now, let's treat it as being "in" the room context
                // but maybe with a different flag if needed. 
                // The user asked for "proximity level", implying we should know they are NEAR.
                // For this implementation, we'll set the currentRoomId to the nearby room
                // so they can hear/see people in that room.
                currentRoomId = closestRoomId;
            }
        }

        // Emit movement update
        if (currentRoomId !== this.lastRoomId ||
            Math.abs(playerCenter.x - this.lastX) > 10 ||
            Math.abs(playerCenter.y - this.lastY) > 10) {

            this.socket.emit('playerMove', {
                x: playerCenter.x,
                y: playerCenter.y,
                roomId: currentRoomId
            });

            this.lastRoomId = currentRoomId;
            this.lastX = playerCenter.x;
            this.lastY = playerCenter.y;
        }
    }

    toggleVehicle() {
        if (!this.player) return;

        const playerBounds = this.player.getBounds();

        for (const vehicle of this.vehicles) {
            const vehicleBounds = new Phaser.Geom.Rectangle(
                vehicle.x,
                vehicle.y,
                vehicle.width,
                vehicle.height
            );

            const distance = Phaser.Math.Distance.Between(
                playerBounds.centerX,
                playerBounds.centerY,
                vehicleBounds.centerX,
                vehicleBounds.centerY
            );

            if (distance < 80) {
                if (this.currentVehicle === vehicle.id) {
                    this.currentVehicle = null;
                    this.showMessage('Exited vehicle');
                } else {
                    this.currentVehicle = vehicle.id;
                    this.showMessage(`Entered ${vehicle.type}!`);
                }
                return;
            }
        }
    }

    showMessage(text: string) {
        const msg = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 200,
            text,
            {
                fontSize: '18px',
                color: '#ffffff',
                backgroundColor: '#667eeadd',
                padding: { x: 16, y: 8 }
            }
        );
        msg.setScrollFactor(0);
        msg.setOrigin(0.5);
        msg.setDepth(2000);

        this.tweens.add({
            targets: msg,
            alpha: 0,
            y: msg.y - 50,
            duration: 2000,
            onComplete: () => msg.destroy()
        });
    }


}
