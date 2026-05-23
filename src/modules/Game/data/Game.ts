import { Player } from "../../Player/data/Player";
import { Entity } from "./Entity";
import { Mob } from "./Mob";

export type Cell = {
    entityId?: string;
    isWall: boolean;
    isHole: boolean;
};

export type Plateau = Cell[][];

export type Game = {
    id: string;
    creatorId: string;
    plateau: Plateau;
    players: Player[];
    npc: Mob[];
    entities: Entity[];
};
