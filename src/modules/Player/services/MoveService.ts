import { Position } from "../../../game-lib";
import { Cell } from "../../Game/data/Game";

export class MoveService {
    private getCellsAround(
        pos: Position,
        explorationI: number,
        maxRange: number,
        board: Cell[][]
    ): Position[] {
        if (explorationI > maxRange) {
            return [];
        }
        const cells: Position[] = [];
        for (let x = pos.x - 1; x <= pos.x + 1; x++) {
            for (let y = pos.y - 1; y <= pos.y + 1; y++) {
                if (x === pos.x || y === pos.y) {
                    const cell = board[x]?.[y];
                    if (
                        cell &&
                        !cell.isHole &&
                        !cell.isWall &&
                        !cell.entityId
                    ) {
                        const cellPos = { x, y };
                        cells.push(
                            cellPos,
                            ...this.getCellsAround(
                                cellPos,
                                explorationI + 1,
                                maxRange,
                                board
                            )
                        );
                    }
                }
            }
        }
        return cells;
    }

    getPossibleMove(
        start: Position,
        board: Cell[][],
        range: number
    ): Position[] {
        const inRangeCells: Map<string, Position> = new Map();

        const cellsAround = this.getCellsAround(start, 1, range, board);
        for (const cellInRange of cellsAround) {
            inRangeCells.set(`${cellInRange.x},${cellInRange.y}`, cellInRange);
        }
        return Array.from(inRangeCells.values());
    }
}
