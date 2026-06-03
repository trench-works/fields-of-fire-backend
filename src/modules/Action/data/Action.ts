import { Effect } from "../../Effect/data/Effect";

export class Action {
    id!: string;
    name!: string;
    description?: string;
    damage?: { min: number; max: number };
    effectList?: Effect[];
    range?: number;
    zoneType?: string;
    zoneSize?: number;
    actionType?: ActionType;
    mooveToTarget?: { x: number; y: number };
    pushValue?: number;
    cost!: number;
    isWalkAction?: boolean;
}

export enum ActionType {
    RANGED = "ranged",
    MELEE = "melee",
}
