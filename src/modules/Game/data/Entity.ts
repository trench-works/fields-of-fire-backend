import { Action } from "../../Action/data/Action";
import { Boost } from "../../Effect/data/Boost";
import { Effect } from "../../Effect/data/Effect";
import { MasterySelection } from "../../Mastery/data/Mastery";
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
    modifiedActionList?:Action[];

    stats!: Stats;
    effects!: Effect[];
    boosts!: Boost[];

    masteries?: MasterySelection;
    passives!: string[];

    lastDamagedBy?: string;
    dead!: boolean;
    isInvocation!: boolean;
    isPlaying!: boolean;

    actionUses!: Record<string, Record<string, number>>;
    actionUsesPerRound!: Record<string, Record<string, number>>;
}
