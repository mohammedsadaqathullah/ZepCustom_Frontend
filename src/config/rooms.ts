export interface Room {
    id: string;
    name: string;
    type: 'meeting' | 'office' | 'staff_hall' | 'lounge';
    bounds: { x: number; y: number; width: number; height: number };
    furniture: Furniture[];
    spawnPoints: Position[];
}

export interface Furniture {
    id: string;
    type: 'table' | 'chair' | 'desk' | 'computer' | 'bookshelf' | 'plant' | 'couch' | 'whiteboard';
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    isCollidable?: boolean;
    label?: string;
}

export interface Position {
    x: number;
    y: number;
}

// Meeting Room Configuration - TOP LEFT
export const MEETING_ROOM: Room = {
    id: 'meeting-1',
    name: '🏛️ Conference Room',
    type: 'meeting',
    bounds: { x: 20, y: 20, width: 640, height: 560 },
    spawnPoints: [
        { x: 340, y: 500 },
        { x: 400, y: 500 },
    ],
    furniture: [
        // Large round table
        {
            id: 'table-1',
            type: 'table',
            x: 340,
            y: 280,
            width: 200,
            height: 200,
            color: '#8b7355',
            isCollidable: true,
        },
        // 20 chairs in circle
        ...generateCircleChairs(340, 280, 140, 20),
        // Whiteboard
        {
            id: 'whiteboard-1',
            type: 'whiteboard',
            x: 340,
            y: 70,
            width: 280,
            height: 15,
            color: '#ffffff',
            isCollidable: true,
        },
        // Plants
        {
            id: 'plant-1',
            type: 'plant',
            x: 60,
            y: 60,
            width: 40,
            height: 40,
            color: '#48bb78',
            isCollidable: true,
        },
        {
            id: 'plant-2',
            type: 'plant',
            x: 600,
            y: 60,
            width: 40,
            height: 40,
            color: '#48bb78',
            isCollidable: true,
        },
    ],
};

// Owner's Office - TOP RIGHT
export const OWNER_OFFICE: Room = {
    id: 'office-1',
    name: "👔 Owner's Office",
    type: 'office',
    bounds: { x: 680, y: 20, width: 520, height: 560 },
    spawnPoints: [
        { x: 940, y: 500 },
    ],
    furniture: [
        // Executive desk
        {
            id: 'desk-exec',
            type: 'desk',
            x: 940,
            y: 150,
            width: 180,
            height: 80,
            color: '#6b5340',
            isCollidable: true,
        },
        // Chair
        {
            id: 'chair-exec',
            type: 'chair',
            x: 940,
            y: 250,
            width: 50,
            height: 50,
            color: '#2d3748',
            isCollidable: false,
        },
        // Bookshelf
        {
            id: 'bookshelf-1',
            type: 'bookshelf',
            x: 760,
            y: 120,
            width: 100,
            height: 200,
            color: '#8b6f47',
            isCollidable: true,
        },
        // Couch
        {
            id: 'couch-1',
            type: 'couch',
            x: 1050,
            y: 400,
            width: 130,
            height: 100,
            color: '#4a5568',
            isCollidable: true,
        },
        // Coffee table
        {
            id: 'table-coffee',
            type: 'table',
            x: 980,
            y: 440,
            width: 80,
            height: 80,
            color: '#8b7355',
            isCollidable: false,
        },
        // Plants
        {
            id: 'plant-office-1',
            type: 'plant',
            x: 740,
            y: 500,
            width: 40,
            height: 40,
            color: '#48bb78',
            isCollidable: true,
        },
        {
            id: 'plant-office-2',
            type: 'plant',
            x: 1140,
            y: 80,
            width: 40,
            height: 40,
            color: '#48bb78',
            isCollidable: true,
        },
    ],
};

// Staff Hall - BOTTOM (FULL WIDTH)
export const STAFF_HALL: Room = {
    id: 'staff-hall-1',
    name: '💼 Staff Work Area',
    type: 'staff_hall',
    bounds: { x: 20, y: 600, width: 1180, height: 580 },
    spawnPoints: [
        { x: 610, y: 1100 },
        { x: 670, y: 1100 },
    ],
    furniture: [
        // 10 desk stations in 2 rows of 5
        ...generateDeskGrid(100, 680, 5, 2, 200, 180),
        // Central collaborative space
        {
            id: 'collab-table',
            type: 'table',
            x: 610,
            y: 980,
            width: 160,
            height: 100,
            color: '#8b7355',
            isCollidable: true,
            label: 'Collaboration',
        },
        // Coffee area
        {
            id: 'coffee-counter',
            type: 'table',
            x: 1050,
            y: 750,
            width: 100,
            height: 50,
            color: '#6b5340',
            isCollidable: true,
            label: '☕',
        },
        // Plants
        {
            id: 'plant-hall-1',
            type: 'plant',
            x: 70,
            y: 640,
            width: 40,
            height: 40,
            color: '#48bb78',
            isCollidable: true,
        },
        {
            id: 'plant-hall-2',
            type: 'plant',
            x: 1120,
            y: 640,
            width: 40,
            height: 40,
            color: '#48bb78',
            isCollidable: true,
        },
    ],
};

// Helper functions
function generateCircleChairs(centerX: number, centerY: number, radius: number, count: number): Furniture[] {
    const chairs: Furniture[] = [];
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        chairs.push({
            id: `chair-${i}`,
            type: 'chair',
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            width: 45,
            height: 45,
            color: '#4a5568',
            isCollidable: false,
        });
    }
    return chairs;
}

function generateDeskGrid(startX: number, startY: number, cols: number, rows: number, spacingX: number, spacingY: number): Furniture[] {
    const furniture: Furniture[] = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const deskId = row * cols + col;
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;

            // Desk
            furniture.push({
                id: `desk-${deskId}`,
                type: 'desk',
                x,
                y,
                width: 100,
                height: 60,
                color: '#8b7355',
                isCollidable: true,
            });

            // Computer
            furniture.push({
                id: `computer-${deskId}`,
                type: 'computer',
                x,
                y: y - 15,
                width: 40,
                height: 25,
                color: '#1a202c',
                isCollidable: false,
                label: '💻',
            });

            // Chair
            furniture.push({
                id: `chair-desk-${deskId}`,
                type: 'chair',
                x,
                y: y + 60,
                width: 45,
                height: 45,
                color: '#4a5568',
                isCollidable: false,
            });
        }
    }
    return furniture;
}

export const ALL_ROOMS = [MEETING_ROOM, OWNER_OFFICE, STAFF_HALL];
