import type { Furniture } from '../config/rooms';

export function drawFurniture(ctx: CanvasRenderingContext2D, furniture: Furniture) {
    const { type, x, y, width, height, color, label } = furniture;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x - width / 2 + 2, y - height / 2 + 2, width, height);

    // Main object
    ctx.fillStyle = color;
    ctx.fillRect(x - width / 2, y - height / 2, width, height);

    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);

    // Type-specific details
    switch (type) {
        case 'table':
            // Table surface detail
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(x - width / 2 + 5, y - height / 2 + 5, width - 10, height - 10);
            break;

        case 'desk':
            // Desk drawer
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(x - width / 2 + 5, y - height / 2 + height - 15, width - 10, 10);
            break;

        case 'chair':
            // Chair back
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(x - width / 2 + 5, y - height / 2, width - 10, 10);
            break;

        case 'computer':
            // Monitor screen
            ctx.fillStyle = '#4299e1';
            ctx.fillRect(x - width / 2 + 5, y - height / 2 + 3, width - 10, height - 6);
            break;

        case 'bookshelf':
            // Shelves
            for (let i = 0; i < 4; i++) {
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.fillRect(x - width / 2, y - height / 2 + i * (height / 4), width, 2);
            }
            break;

        case 'plant':
            // Plant emoji/icon
            ctx.font = 'bold 24px Arial';
            ctx.fillText('🌿', x - 12, y + 8);
            break;

        case 'couch':
            // Couch cushions
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            const cushionWidth = width / 3;
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(x - width / 2 + i * cushionWidth + 2, y - height / 2 + 5, cushionWidth - 4, height - 10);
            }
            break;

        case 'whiteboard':
            // Whiteboard frame
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.strokeRect(x - width / 2, y - height / 2, width, height);
            break;
    }

    // Label
    if (label) {
        ctx.font = 'bold 11px Arial';
        ctx.fillStyle = '#1a202c';
        const textWidth = ctx.measureText(label).width;
        ctx.fillText(label, x - textWidth / 2, y + height / 2 + 15);
    }
}

export function drawAllFurniture(ctx: CanvasRenderingContext2D, furniture: Furniture[]) {
    furniture.forEach(item => drawFurniture(ctx, item));
}

export function checkCollision(x: number, y: number, furniture: Furniture[], playerRadius: number = 20): boolean {
    return furniture.some(item => {
        if (!item.isCollidable) return false;

        const left = item.x - item.width / 2;
        const right = item.x + item.width / 2;
        const top = item.y - item.height / 2;
        const bottom = item.y + item.height / 2;

        return (
            x + playerRadius > left &&
            x - playerRadius < right &&
            y + playerRadius > top &&
            y - playerRadius < bottom
        );
    });
}
