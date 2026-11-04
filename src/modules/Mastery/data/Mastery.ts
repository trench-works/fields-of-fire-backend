import { Action } from "../../Action/data/Action";
import { Effect } from "../../Effect/data/Effect";
import { Stats } from "../../Stat/data/Stats";

export class Mastery {
    id!: string;
    name!: string;
    description?: string;
    maxLevel!: number;
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
    statsPerLevel?: Partial<Stats>;
    masteryRequirements?: { masteryId: string; level: number }[];
    newActions?: string[];
    actionNewEffect?: { actionId: string; effectId: string }[];
    subMasteries?: MasteryEntity[];
    passive?: string;
    masteringPointsRequired?: number;
}


export class MasteryTree {
    id!: string;
    classId!: string;
    rootMastery?: Mastery;
    masteries!: Mastery[];
}

export class MasteryTreeEntity {
    id!: string;
    classId!: string;
    rootMastery?: MasteryEntity;
    masteries!: MasteryEntity[];
}

export type MasterySelection = Record<string, number>;