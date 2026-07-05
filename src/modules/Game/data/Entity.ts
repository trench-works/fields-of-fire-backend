import { Effect } from "../../Effect/data/Effect";
import { Stats } from "../../Stat/data/Stats";

export enum EntityType {
    PLAYER = "PLAYER",
    NPC = "NPC",
}

export class Entity {
    id!: string;
    classId!: string;
    teamId!: string;
    controllerId!: string;

    type!: EntityType;

    name?: string;

    position!: { x: number; y: number };
    actionList?: string[];

    stats!: Stats;
    effects!: Effect[];

    dead!: boolean;
    isInvocation!: boolean;
    isPlaying!: boolean;
}
