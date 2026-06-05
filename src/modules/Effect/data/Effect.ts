import { Stats } from "../../Stat/data/Stats";

export enum EffectType {
    POISON = "poison",
    APPLY = "apply",
}

export class Effect {
    name!: string;
    type!: EffectType;
    duration!: number;
    modifier!: Stats;
}
