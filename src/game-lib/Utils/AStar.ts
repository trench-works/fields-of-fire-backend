import { Position, PositionUtils } from "./Position";

type Node<Cell> = {
    cell: Cell;
    position: Position;
    cost: number;
    heuristic: number;
    sum: number;
    parent?: Node<Cell>;
};

export abstract class AStar<Cell> {
    plateauMap: Map<string, Cell>;

    openList: Map<string, Node<Cell>>;
    closedList: Map<string, Node<Cell>>;

    start!: Position;
    end!: Position;

    constructor() {
        this.plateauMap = new Map();
        this.openList = new Map();
        this.closedList = new Map();
    }

    findPath(start: Position, end: Position, cellBoard: Cell[][]): Position[] {
        this.withStart(start);
        this.withEnd(end);
        this.withBoard(cellBoard);
        this.search();
        return this.resolve();
    }

    withStart(start: Position): this {
        this.start = start;
        return this;
    }

    withEnd(end: Position): this {
        this.end = end;
        return this;
    }

    withCellArray(cellArray: Cell[]) {
        this.plateauMap = new Map();
        this.openList = new Map();
        this.closedList = new Map();
        for (const cell of cellArray.filter((cell) => this.isWalkable(cell))) {
            const position = this.getPosition(cell);
            this.plateauMap.set(PositionUtils.getId(position), cell);
        }
    }

    withBoard(cellBoard: Cell[][]) {
        this.withCellArray(cellBoard.flat());
    }

    private getSuccessors(position: Position): Node<Cell>[] {
        const successorsPositions: Node<Cell>[] = [];
        for (let x = position.x - 1; x <= position.x + 1; x++) {
            for (let y = position.y - 1; y <= position.y + 1; y++) {
                if (x !== position.x && y !== position.y) {
                    const cellPosition = { x, y };
                    const cell = this.plateauMap.get(
                        PositionUtils.getId(cellPosition)
                    );
                    if (cell) {
                        successorsPositions.push({
                            cell,
                            position,
                            cost: 0,
                            heuristic: 0,
                            sum: 0,
                        });
                    }
                }
            }
        }
        return successorsPositions;
    }

    resolve(): Position[] {
        const pathNodes: Node<Cell>[] = [];
        let node = this.openList.get(PositionUtils.getId(this.end));
        if (node) {
            pathNodes.push(node);
            while (node.parent) {
                pathNodes.push(node.parent);
                node = node.parent;
            }
        }
        const orderedNodes = pathNodes.reverse();

        const movements: Position[] = [];
        for (let i = 0; i < orderedNodes.length - 1; i++) {
            movements.push(
                PositionUtils.subtract(
                    orderedNodes[i + 1].position,
                    orderedNodes[i].position
                )
            );
        }
        return movements;
    }

    search(): this {
        const startId = PositionUtils.getId(this.start);
        const firstCell = this.plateauMap.get(startId);
        if (!firstCell) {
            throw new Error(
                "Cannot start from this cell ! it isnt in the cells array"
            );
        }
        this.openList.set(startId, {
            cell: firstCell,
            position: this.getPosition(firstCell),
            cost: 0,
            heuristic: 0,
            sum: 0,
        });
        while (this.openList.size > 0) {
            const node = this.findLowestSumNode();
            this.openList.delete(PositionUtils.getId(node.position));

            const nodes = this.getSuccessors(node.position);
            for (const childNode of nodes) {
                childNode.parent = node;
                if (PositionUtils.equal(childNode.position, this.end)) {
                    return this;
                }
                childNode.cost =
                    node.cost +
                    PositionUtils.distance(node.position, childNode.position);
                childNode.heuristic = PositionUtils.distance(
                    childNode.position,
                    this.end
                );
                childNode.sum = childNode.cost + childNode.heuristic;

                // add to open list
                const childNodeId = PositionUtils.getId(childNode.position);
                const currentOpenListNode = this.openList.get(childNodeId);
                if (
                    currentOpenListNode &&
                    currentOpenListNode.sum < childNode.sum
                ) {
                    continue;
                }
                const currentClosedListNode = this.closedList.get(childNodeId);
                if (
                    currentClosedListNode &&
                    currentClosedListNode.sum < childNode.sum
                ) {
                    continue;
                }
                this.openList.set(childNodeId, childNode);
            }
        }
        return this;
    }

    private findLowestSumNode(): Node<Cell> {
        return Array.from(this.openList.values()).sort((nodeA, nodeB) =>
            nodeA.sum < nodeB.sum ? -1 : 1
        )[0];
    }

    abstract isWalkable(cell: Cell): boolean;
    abstract getPosition(cell: Cell): Position;
}
