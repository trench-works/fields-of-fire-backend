export type Position = {
    x: number;
    y: number;
};

export class PositionUtils {
    static equal(a: Position, b: Position): boolean {
        return a.x === b.x && a.y === b.y;
    }

    static distance(a: Position, b: Position): number {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    static getId(pos: Position): string {
        return `${pos.x},${pos.y}`;
    }

    static subtract(a: Position, b: Position): Position {
        return { x: a.x - b.x, y: a.y - b.y };
    }
}
