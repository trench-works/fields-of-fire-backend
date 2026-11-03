import { Action } from "../../Action/data/Action";
import { Effect } from "../../Effect/data/Effect";
import { Stats } from "../../Stat/data/Stats";

export class Mastery {
    id!: string;
    name!: string;
    description?: string;
    maxLevel!: number;
    rootMastery?: Mastery;
    statsPerLevel?: Partial<Stats>;
    masteryRequirements?: {masteryId:string, level:number}[];
    newActions?: Action[];
    actionNewEffect?: {actionId:string, effect:Effect}[]
    subMasteries?: Mastery[];
    passive?: Effect;
    masteringPointsRequired?: number;
}

export class MasteryEntity {
    id!: string;
    name!: string;
    description?: string;
    maxLevel!: number;
    rootMastery?: Mastery;
    statsPerLevel?: Partial<Stats>;
    masteryRequirements?: [{masteryId:string, level:number}];
    newActions?: string[];
    actionNewEffect?: [{actionId:string, effect:string}]
    subMasteries?: Mastery[];
    passive?: string;
    masteringPointsRequired?: number;
}


export class MasteryTree {
    id!: string;
    classId!: string;
    masteries!: Mastery[];
}