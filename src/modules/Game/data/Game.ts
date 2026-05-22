import { Player } from "../../Player/data/Player";
import { Entity } from "./Entity";
import { Mob } from "./Mob";

type PlateauCell = { entityId?: string; isWall: boolean; isHole: boolean };

type Plateau = PlateauCell[][];

export type Game = {
  id: string;
  creatorId: string;
  plateau: Plateau;
  players: Player[];
  npc: Mob[];
  entities: Entity[];
};
