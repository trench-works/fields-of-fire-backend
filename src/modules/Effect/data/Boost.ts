import { Stats } from "../../Stat/data/Stats";

export enum BoostType {
    AI = "AI",
    PLAYER = "PLAYER",
}

export class Boost {
    id!: string;
    name!: string;
    effects!: string[];
    boosts!: Partial<Stats>[];
    probability!: number;
    type?: BoostType;
}
