import { EffectType } from "../../Effect/data/Effect";
import { Entity } from "../../Game/data/Entity";

export class Stats {
    life!: number;
    precision!: number;
    strength!: number;
    armor!: number;
    initiative!: number;
    dodging!: number;
    energy!: number;
    mouvement!: number;

    static add(baseStats: Stats, ...stats: Stats[]): Stats {
        const addedStats = { ...baseStats };
        for (const stat of stats) {
            for (const [key, value] of Object.entries(stat)) {
                addedStats[key as keyof Stats] =
                    addedStats[key as keyof Stats] + value;
            }
        }
        return addedStats;
    }

    static fromEntity(entity: Entity): Stats {
        return Stats.add(
            entity.stats,
            ...entity.effects
                .filter((effect) => effect.type === EffectType.APPLY)
                .map((effect) => effect.modifier)
        );
    }
}
