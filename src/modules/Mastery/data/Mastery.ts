import { Action, ActionEntity, ActionLevel, ActionType, ActionZoneType } from "../../Action/data/Action";
import { Effect } from "../../Effect/data/Effect";
import { Stats } from "../../Stat/data/Stats";
import { ActionModification, ActionModificationEntity } from "../../Action/data/ActionModifier";

export class Mastery {
    id!: string;
    name!: string;
    description?: string;
    maxLevel!: number;
    statsPerLevel?: Partial<Stats>;
    masteryRequirements?: MasteryRequirement[];
    exclusiveWith?: string[];
    newActions?: Action[];
    actionModified?: ActionModification[]
    subMasteries?: Mastery[];
    //ici le type Effect sert uniquement à remonter la description, le nom etc
    passive?: string;
    masteringPointsRequired?: number;
}

export class MasteryEntity {
    id!: string;
    name!: string;
    description?: string;
    maxLevel!: number;
    statsPerLevel?: Partial<Stats>;
    masteryRequirements?: MasteryRequirement[];
    exclusiveWith?: string[];
    newActions?: string[];
    actionModified?: ActionModificationEntity[];
    subMasteries?: MasteryEntity[];
    passive?: string;
    masteringPointsRequired?: number;
}

export type SimpleRequirement = { masteryId: string; level: number };
export type AnyOfRequirement = { anyOf: SimpleRequirement[] };
export type MasteryRequirement  = SimpleRequirement | AnyOfRequirement;
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