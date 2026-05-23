import { Player } from "../../Player/data/Player";
import { Entity } from "./Entity";
import { Mob } from "./Mob";

export type Cell = {
    entityId?: string;
    isWall: boolean;
    isHole: boolean;
    isPlayerStart: boolean;
    isMobStart: boolean;
};

export type Game = {
    id: string;
    creatorId: string;
    plateau: Cell[][];
    players: Player[];
    npc: Mob[];
    entities: Entity[];
};
