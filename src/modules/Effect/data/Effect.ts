import { Stats } from "../../Stat/data/Stats";

export enum EffectType {
    POSON = "POISON",
    APPLY = "APPLY",
    CONSUMABLE = "CONSUMABLE",
}

export enum EffectAction {
    VAMPIRISM = "VAMPIRISM",
    CRIT_DAMMAGE = "CRIT_DAMMAGE",
    CRIT_CHANCE = "CRIT_CHANCE",
    MASOCHISTIC = "MASOCHISTIC",
    WEAKNESS = "WEAKNESS",
    LUCKY_STRIKE = "LUCKY_STRIKE",
    NONE = "NONE",
}

export class Effect {
    id!: string;
    name!: string;
    type!: EffectType;
    action!: EffectAction;
    duration!: number | null;
    modifier!: Partial<Stats>;
    instant!: Partial<Stats>;
    author?: string;
    description?: string;
}
