// Professional map configuration with cohesive color scheme
// Layout adjusted to avoid overlaps and add spacing

export interface Room {
    id: string;
    name: string;
    type: 'reception' | 'staff' | 'meeting' | 'admin' | 'garden' | 'parking';
    x: number;
    y: number;
    width: number;
    height: number;
    entrances: Entrance[];
    furniture?: Furniture[];
    spawnPoints?: SpawnPoint[];
}

export interface Entrance {
    side: 'top' | 'bottom' | 'left' | 'right';
    offset: number;
    width: number;
}

export interface Furniture {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    hasCollision: boolean;
}

export interface SpawnPoint {
    x: number;
    y: number;
}

export interface Vehicle {
    id: string;
    type: 'car' | 'bike';
    x: number;
    y: number;
    width: number;
    height: number;
}

const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 1500;

export const MAP_ROOMS: Room[] = [
    // Reception - Center
    {
        id: 'reception',
        name: 'Reception',
        type: 'reception',
        x: 800,
        y: 600,
        width: 400,
        height: 300,
        entrances: [
            { side: 'top', offset: 160, width: 80 }, // Wider entrance (80px)
            { side: 'bottom', offset: 160, width: 80 }
        ],
        furniture: [
            { id: 'reception-desk', type: 'desk', x: 950, y: 700, width: 80, height: 50, hasCollision: true },
            { id: 'reception-sofa1', type: 'sofa', x: 820, y: 650, width: 80, height: 50, hasCollision: true },
            { id: 'reception-sofa2', type: 'sofa', x: 1100, y: 650, width: 80, height: 50, hasCollision: true },
            { id: 'reception-plant1', type: 'plant', x: 820, y: 800, width: 30, height: 30, hasCollision: true },
            { id: 'reception-plant2', type: 'plant', x: 1150, y: 800, width: 30, height: 30, hasCollision: true }
        ],
        spawnPoints: [{ x: 1000, y: 750 }]
    },

    // Parking - Bottom
    {
        id: 'parking',
        name: 'Parking Lot',
        type: 'parking',
        x: 700,
        y: 1000,
        width: 600,
        height: 300,
        entrances: [
            { side: 'top', offset: 260, width: 80 }
        ],
        spawnPoints: [{ x: 1000, y: 1150 }]
    },

    // Admin - Top Right
    {
        id: 'admin',
        name: 'Admin Office',
        type: 'admin',
        x: 1300,
        y: 100,
        width: 300,
        height: 250,
        entrances: [
            { side: 'bottom', offset: 110, width: 80 }
        ],
        furniture: [
            { id: 'admin-desk', type: 'executive-desk', x: 1400, y: 170, width: 120, height: 60, hasCollision: true },
            { id: 'admin-bookshelf', type: 'bookshelf', x: 1320, y: 120, width: 80, height: 30, hasCollision: true },
            { id: 'admin-plant', type: 'plant', x: 1550, y: 120, width: 30, height: 30, hasCollision: true },
            { id: 'admin-sofa', type: 'executive-sofa', x: 1320, y: 270, width: 100, height: 50, hasCollision: true }
        ],
        spawnPoints: [{ x: 1450, y: 250 }]
    },

    // Large Meeting Room - Top Center
    {
        id: 'meeting',
        name: 'Meeting Room',
        type: 'meeting',
        x: 750,
        y: 100,
        width: 450,
        height: 400,
        entrances: [
            { side: 'bottom', offset: 185, width: 80 }
        ],
        furniture: [
            // Large conference table in center
            { id: 'meeting-table', type: 'conference-table', x: 825, y: 200, width: 300, height: 200, hasCollision: true },

            // Chairs
            { id: 'meeting-chair-1', type: 'chair', x: 845, y: 170, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-2', type: 'chair', x: 905, y: 170, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-3', type: 'chair', x: 965, y: 170, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-4', type: 'chair', x: 1025, y: 170, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-5', type: 'chair', x: 1085, y: 170, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-6', type: 'chair', x: 845, y: 410, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-7', type: 'chair', x: 905, y: 410, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-8', type: 'chair', x: 965, y: 410, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-9', type: 'chair', x: 1025, y: 410, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-10', type: 'chair', x: 1085, y: 410, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-11', type: 'chair', x: 785, y: 220, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-12', type: 'chair', x: 785, y: 270, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-13', type: 'chair', x: 785, y: 320, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-14', type: 'chair', x: 785, y: 370, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-15', type: 'chair', x: 1135, y: 220, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-16', type: 'chair', x: 1135, y: 270, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-17', type: 'chair', x: 1135, y: 320, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-18', type: 'chair', x: 1135, y: 370, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-19', type: 'executive-chair', x: 965, y: 140, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-chair-20', type: 'executive-chair', x: 965, y: 440, width: 30, height: 30, hasCollision: true },

            // Whiteboard
            { id: 'meeting-whiteboard', type: 'whiteboard', x: 775, y: 120, width: 120, height: 50, hasCollision: true },

            // Plants
            { id: 'meeting-plant1', type: 'plant', x: 770, y: 460, width: 30, height: 30, hasCollision: true },
            { id: 'meeting-plant2', type: 'plant', x: 1150, y: 460, width: 30, height: 30, hasCollision: true }
        ],
        spawnPoints: [{ x: 975, y: 300 }]
    },

    // Garden - Right Side
    {
        id: 'garden',
        name: 'Garden',
        type: 'garden',
        x: 1300,
        y: 400,
        width: 450,
        height: 300,
        entrances: [
            { side: 'left', offset: 110, width: 80 }
        ],
        furniture: [
            { id: 'garden-bench1', type: 'bench', x: 1350, y: 450, width: 80, height: 40, hasCollision: true },
            { id: 'garden-bench2', type: 'bench', x: 1600, y: 500, width: 80, height: 40, hasCollision: true },
            { id: 'garden-tree1', type: 'tree', x: 1400, y: 570, width: 60, height: 60, hasCollision: true },
            { id: 'garden-tree2', type: 'tree', x: 1650, y: 600, width: 60, height: 60, hasCollision: true },
            { id: 'garden-fountain', type: 'fountain', x: 1520, y: 530, width: 80, height: 80, hasCollision: true },
            { id: 'garden-flowers', type: 'flowers', x: 1350, y: 630, width: 100, height: 40, hasCollision: false }
        ],
        spawnPoints: [{ x: 1500, y: 550 }]
    },

    // 12 Staff Rooms - Left side in 3x4 grid
    ...Array.from({ length: 12 }, (_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;

        const roomWidth = 160;
        const roomHeight = 140;
        const gapX = 40;
        const gapY = 60;

        const startX = 50;
        const startY = 50;

        const roomX = startX + (col * (roomWidth + gapX));
        const roomY = startY + (row * (roomHeight + gapY));

        const showTitle = i > 2;

        return {
            id: `staff-${i + 1}`,
            name: showTitle ? `Staff ${i + 1}` : '',
            type: 'staff' as const,
            x: roomX,
            y: roomY,
            width: roomWidth,
            height: roomHeight,
            entrances: [
                {
                    side: 'bottom' as const, // Changed to bottom
                    offset: 40, // Centered-ish
                    width: 80 // Wider entrance
                }
            ],
            furniture: [
                { id: `staff-${i + 1}-desk`, type: 'desk', x: roomX + 50, y: roomY + 30, width: 70, height: 45, hasCollision: true },
                { id: `staff-${i + 1}-chair`, type: 'chair', x: roomX + 60, y: roomY + 40, width: 25, height: 25, hasCollision: false },
                { id: `staff-${i + 1}-plant`, type: 'plant', x: roomX + 20, y: roomY + 20, width: 20, height: 20, hasCollision: true }
            ],
            spawnPoints: [{ x: roomX + 80, y: roomY + 90 }]
        };
    })
];

export const VEHICLES: Vehicle[] = [
    { id: 'car-1', type: 'car', x: 750, y: 1100, width: 80, height: 120 },
    { id: 'car-2', type: 'car', x: 900, y: 1100, width: 80, height: 120 },
    { id: 'car-3', type: 'car', x: 1050, y: 1100, width: 80, height: 120 },
    { id: 'bike-1', type: 'bike', x: 1200, y: 1150, width: 40, height: 60 },
    { id: 'bike-2', type: 'bike', x: 1250, y: 1150, width: 40, height: 60 }
];

export const MAP_CONFIG = {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    rooms: MAP_ROOMS,
    vehicles: VEHICLES
};
