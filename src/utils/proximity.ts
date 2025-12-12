interface Player {
    id: string;
    x: number;
    y: number;
}

export function getPlayersInProximity(
    myPosition: { x: number; y: number },
    players: Map<string, Player>,
    radius: number = 150
): Player[] {
    const nearby: Player[] = [];

    players.forEach(player => {
        const distance = Math.sqrt(
            Math.pow(player.x - myPosition.x, 2) +
            Math.pow(player.y - myPosition.y, 2)
        );

        if (distance <= radius) {
            nearby.push(player);
        }
    });

    return nearby;
}

export function calculateDistance(
    pos1: { x: number; y: number },
    pos2: { x: number; y: number }
): number {
    return Math.sqrt(
        Math.pow(pos2.x - pos1.x, 2) +
        Math.pow(pos2.y - pos1.y, 2)
    );
}

export function getProximityVolume(distance: number, maxDistance: number = 150): number {
    if (distance >= maxDistance) return 0;
    return 1 - (distance / maxDistance);
}
