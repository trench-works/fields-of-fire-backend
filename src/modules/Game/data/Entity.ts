import { Effect } from "../../Effect/data/Effect";
import { Stats } from "../../Stat/data/Stats";

export enum EntityType {
    ALLY = "ALLY",
    ENEMY = "ENEMY",
    NEUTRAL = "NEUTRAL",
}

export class Entity {
    classId!: string;
    entityId!: string;

    entityType!: EntityType;

    name?: string;

    position!: { x: number; y: number };
    actionList?: string[];

    stats!: Stats;
    effects!: Effect[];
    permanentBoosts?: Partial<Stats>;

    side!: "player" | "mob";
    dead!: boolean;
}
