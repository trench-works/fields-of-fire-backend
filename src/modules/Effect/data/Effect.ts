import { Stats } from "../../Stat/data/Stats";

export enum EffectType {
    POSON = "POISON",
    APPLY = "APPLY",
}

export class Effect {
    id!: string;
    name!: string;
    type!: EffectType;
    duration!: number | null;
    modifier!: Partial<Stats>;
    instant!: Partial<Stats>;
    author?: string;
    description?: string;
}
