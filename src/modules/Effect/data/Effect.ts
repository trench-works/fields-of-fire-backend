import { Stats } from "../../Stat/data/Stats";

export enum EffectType {
    DEBUFF = "DEBUFF",
    APPLY = "apply",
}

export class Effect {
    id!: string;
    name!: string;
    type!: EffectType;
    duration!: number | null;
    modifier!: Stats;
    author?: string;
}
