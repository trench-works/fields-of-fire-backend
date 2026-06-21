import { AStar } from "../../../game-lib";
import { Player } from "../../Player/data/Player";
import { Entity } from "./Entity";
import { NPC } from "./NPC";
import { Team } from "./Team";

export type Cell = {
    entityId?: string;
    position: { x: number; y: number };
    // Terrain properties
    isWall: boolean;
    isHole: boolean;
    // Start properties
    isStart: boolean;
};

export enum GameMode {
    INFINITY = "INFINITY",
    PVP = "PVP",
}

export type Game = {
    id: string;
    mode: GameMode;
    creatorId: string;
    plateau: Cell[][];

    // Entities related things
    players: Player[];
    npc: NPC[];
    entities: Entity[];
    teams: Team[];

    playerTurns: string[];

    //things relative to rounds
    readyPlayers: string[];
    round: number;
    isStopped: boolean;
};

export class CellAStar extends AStar<Cell> {
    isWalkable(cell: Cell): boolean {
        return !cell.isHole && !cell.isWall && !cell.entityId;
    }
    getPosition(cell: Cell): { x: number; y: number } {
        return cell.position;
    }
}
