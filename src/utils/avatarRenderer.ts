import type { AvatarConfig } from '../types/avatar';
import { SKIN_COLORS, HAIR_COLORS, CLOTHING_COLORS } from '../types/avatar';


export function drawCustomAvatar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    config: AvatarConfig,
    scale: number = 1,
    direction: string = 'down'
) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 28, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body/Clothing
    const clothingColor = CLOTHING_COLORS[config.clothingColor];
    ctx.fillStyle = clothingColor;
    ctx.fillRect(-12, 0, 24, 32);

    // Clothing details based on type
    if (config.clothing % 3 === 0) {
        // Button-up shirt
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(-2, 2, 4, 28);
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, 6 + i * 8, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (config.clothing % 3 === 1) {
        // T-shirt
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(-10, 2, 20, 4);
    }

    // Head
    const skinColor = SKIN_COLORS[config.skin];
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -10, 12, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    const hairColor = HAIR_COLORS[config.hairColor];
    ctx.fillStyle = hairColor;

    // Different hairstyles
    const hairStyle = config.hair % 6;
    switch (hairStyle) {
        case 0: // Short
            ctx.beginPath();
            ctx.arc(0, -14, 12, Math.PI, 0, true);
            ctx.fill();
            break;
        case 1: // Spiky
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.moveTo(i * 5, -14);
                ctx.lineTo(i * 5 - 3, -18);
                ctx.lineTo(i * 5 + 3, -18);
                ctx.fill();
            }
            break;
        case 2: // Long
            ctx.fillRect(-12, -14, 24, 8);
            ctx.fillRect(-14, -10, 28, 6);
            break;
        case 3: // Bun
            ctx.beginPath();
            ctx.arc(0, -18, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(-10, -14, 20, 4);
            break;
        case 4: // Mohawk
            ctx.fillRect(-3, -22, 6, 12);
            break;
        case 5: // Bald
            ctx.beginPath();
            ctx.arc(0, -14, 11, Math.PI, 0, true);
            ctx.fill();
            break;
    }

    // Face features based on direction
    if (direction === 'down' || direction === 'left' || direction === 'right') {
        // Eyes
        ctx.fillStyle = '#000';
        const eyeOffset = direction === 'left' ? -2 : direction === 'right' ? 2 : 0;
        ctx.fillRect(-6 + eyeOffset, -10, 3, 3);
        ctx.fillRect(3 + eyeOffset, -10, 3, 3);

        // Nose
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(-1, -6, 2, 3);

        // Mouth based on face type
        ctx.fillStyle = '#000';
        const faceType = config.face % 4;
        ctx.beginPath();
        switch (faceType) {
            case 0: // Smile
                ctx.arc(0, -4, 4, 0, Math.PI);
                break;
            case 1: // Neutral
                ctx.moveTo(-4, -2);
                ctx.lineTo(4, -2);
                break;
            case 2: // Grin
                ctx.arc(0, -6, 6, 0, Math.PI);
                break;
            case 3: // Small smile
                ctx.arc(0, -3, 3, 0, Math.PI);
                break;
        }
        ctx.stroke();
    }

    // Accessories
    if (config.accessories && config.accessories.includes(0)) {
        // Glasses
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-5, -10, 4, 0, Math.PI * 2);
        ctx.arc(5, -10, 4, 0, Math.PI * 2);
        ctx.moveTo(-1, -10);
        ctx.lineTo(1, -10);
        ctx.stroke();
    }

    ctx.restore();
}

export function drawAvatarWithAnimation(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    config: AvatarConfig,
    isWalking: boolean,
    isDancing: boolean,
    direction: string,
    animationFrame: number
) {
    const scale = 1;
    const bobOffset = isWalking ? Math.sin(animationFrame * 0.3) * 2 : 0;
    const danceOffset = isDancing ? Math.sin(animationFrame * 0.5) * 5 : 0;

    drawCustomAvatar(ctx, x, y + bobOffset + danceOffset, config, scale, direction);
}
