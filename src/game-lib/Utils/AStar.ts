import { Position, PositionUtils } from "./Position";

type Node<Cell> = {
    cell: Cell;
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

    findPathPositions(
        start: Position,
        end: Position,
        cellBoard: Cell[][]
    ): Position[] {
        const movements = this.findPath(start, end, cellBoard);
        let currentPosition = { ...start };

        return [
            { ...start },
            ...movements.map((move) => {
                currentPosition = PositionUtils.add(currentPosition, move);
                return { ...currentPosition };
            }),
        ];
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
        this.plateauMap.set(
            PositionUtils.getId(this.start),
            cellArray.find((cell) =>
                PositionUtils.equal(this.getPosition(cell), this.start)
            )!
        );
        this.plateauMap.set(
            PositionUtils.getId(this.end),
            cellArray.find((cell) =>
                PositionUtils.equal(this.getPosition(cell), this.end)
            )!
        );
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
                if (
                    !(x === position.x && y === position.y) &&
                    (x === position.x || y === position.y)
                ) {
                    const cellPosition = { x, y };
                    const cell = this.plateauMap.get(
                        PositionUtils.getId(cellPosition)
                    );
                    if (cell) {
                        successorsPositions.push({
                            cell,
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
                    this.getPosition(orderedNodes[i + 1].cell),
                    this.getPosition(orderedNodes[i].cell)
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
            cost: 0,
            heuristic: 0,
            sum: 0,
        });
        while (this.openList.size > 0) {
            const node = this.findLowestSumNode();
            const nodePosition = this.getPosition(node.cell);
            const nodeId = PositionUtils.getId(nodePosition);
            this.openList.delete(nodeId);

            const nodes = this.getSuccessors(nodePosition);
            if (!nodes) {
                return this;
            }
            for (const childNode of nodes) {
                childNode.parent = node;
                const childNodePosition = this.getPosition(childNode.cell);
                if (PositionUtils.equal(childNodePosition, this.end)) {
                    this.openList.set(
                        PositionUtils.getId(childNodePosition),
                        childNode
                    );
                    return this;
                }
                childNode.cost =
                    node.cost +
                    PositionUtils.distance(nodePosition, childNodePosition);
                childNode.heuristic = PositionUtils.distance(
                    childNodePosition,
                    this.end
                );
                childNode.sum = childNode.cost + childNode.heuristic;

                // add to open list
                const childNodeId = PositionUtils.getId(childNodePosition);
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
            this.closedList.set(nodeId, node);
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
