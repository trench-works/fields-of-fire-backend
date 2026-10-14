import { Cell } from "../../modules/Game/data/Game";
import { Position } from "./Position";

const ACCEPTANCE = 0.5;

export function computeFov(
    origin: Position,
    isBlocking: (position: Position) => boolean,
    markVisible: (position: Position) => void,
    range: number,
): void {
    markVisible(origin);

    for (let dx = -range; dx <= range; dx++) {
        const remaining = range - Math.abs(dx);
        for (let dy = -remaining; dy <= remaining; dy++) {
            if (dx === 0 && dy === 0) continue;
            const target = { x: origin.x + dx, y: origin.y + dy };
            if (hasLineOfSight(origin, target, isBlocking)) markVisible(target);
        }
    }
}

function hasLineOfSight(
    a: Position,
    b: Position,
    isBlocking: (p: Position) => boolean,
): boolean {
    const nx = Math.abs(b.x - a.x);
    const ny = Math.abs(b.y - a.y);
    const sx = Math.sign(b.x - a.x);
    const sy = Math.sign(b.y - a.y);

    let x = a.x, y = a.y;
    let ix = 0, iy = 0;

    while (ix < nx || iy < ny) {
        const d = (1 + 2 * ix) * ny - (1 + 2 * iy) * nx;

        if (d === 0) {
            // le segment passe pile par un coin : on ne bloque que si les deux côtés bloquent
            if (isBlocking({ x: x + sx, y }) && isBlocking({ x, y: y + sy })) {
                return false;
            }
            x += sx; y += sy; ix++; iy++;
        } else if (d < 0) {
            x += sx; ix++;
        } else {
            y += sy; iy++;
        }

        const isTarget = x === b.x && y === b.y;
        if (!isTarget && isBlocking({ x, y })) return false;
    }
    return true;
}

function applyFovToRange(
    origin: Position,
    inRange: Cell[],
    isBlocking: (position: Position) => boolean,
    range : number
): Cell[] {
    const inFovCells: Cell[] = [];
    computeFov(origin, isBlocking, ({ x, y }) => {
        const cell = inRange.find(
            ({ position }) => position.x === x && position.y === y
        );
        const inFovCell = inFovCells.find(
            ({ position }) => position.x === x && position.y === y
        );
        if (cell && !inFovCell) {
            inFovCells.push(cell);
        }
    }, range);
    return inFovCells;
} 

export function applyFovToGroundAttack(
    origin: Position,
    inRange: Cell[],
    board: Cell[][],
    range: number
): Cell[] {
    return applyFovToRange(origin, inRange, ({ x, y }) => {
        const checkCell = board[x]?.[y];
        if (!checkCell) {
            return true;
        }
        return Boolean(checkCell.isWall || checkCell.entityId);
    }, range);
}

export function applyFovToUndergroundAttack(
    origin: Position,
    inRange: Cell[],
    board: Cell[][],
    range: number
): Cell[] {
    return applyFovToRange(origin, inRange, ({ x, y }) => {
        const checkCell = board[x]?.[y];
        if (!checkCell) {
            return true;
        }
        const blocked = Boolean(checkCell.isHole);
        if (blocked) {
            return true;
        }
        const notInRange = !inRange.some(
            ({ position }) => position.x === x && position.y === y
        );
        return notInRange;
    }, range);
}
