import { AStar } from "../../../game-lib";
import { Player } from "../../Player/data/Player";
import { Entity } from "./Entity";
import { Mob } from "./Mob";

export type Cell = {
    entityId?: string;
    isWall: boolean;
    isHole: boolean;
    isPlayerStart: boolean;
    isMobStart: boolean;
    position: { x: number; y: number };
};

export type Game = {
    id: string;
    creatorId: string;
    plateau: Cell[][];
    players: Player[];
    npc: Mob[];
    entities: Entity[];
    playerTurns: string[];
};

export class CellAStar extends AStar<Cell> {
    isWalkable(cell: Cell): boolean {
        return !cell.isHole && !cell.isWall && !cell.entityId;
    }
    getPosition(cell: Cell): { x: number; y: number } {
        return cell.position;
    }
}
