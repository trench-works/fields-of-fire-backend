import { EffectType } from "../../Effect/data/Effect";
import { Entity } from "../../Game/data/Entity";

export class Stats {
    life!: number;
    maxLife!: number;

    energy!: number;
    totalEnergy!: number;

    mouvement!: number;
    totalMouvement!: number;

    precision!: number;
    strength!: number;
    armor!: number;
    initiative!: number;
    dodging!: number;

    static add<BaseStat extends Partial<Stats>>(
        baseStats: BaseStat,
        ...stats: Partial<Stats>[]
    ): BaseStat {
        const addedStats = { ...baseStats };
        for (const stat of stats) {
            for (const [key, value] of Object.entries(stat)) {
                addedStats[key as keyof Stats] =
                    (addedStats[key as keyof Stats] ?? 0) + value;
            }
        }
        return addedStats;
    }

    static fromEntity(entity: Entity): Stats {
        const total = Stats.add(
            entity.stats,
            ...entity.effects
                .filter((effect) => effect.type === EffectType.APPLY)
                .map((effect) => effect.modifier)
            );
        
        // Caper energy and mouvement à 0
        total.energy = Math.max(total.energy, 0);
        total.mouvement = Math.max(total.mouvement, 0);
        total.totalEnergy = Math.max(total.totalEnergy, 0);
        total.totalMouvement = Math.max(total.totalMouvement, 0);
        total.life = Math.max(total.life, 0);
        return total;
    }

    static getEntityEffect(entity: Entity): Stats {
        const emptyStats: Stats = {
            life: 0,
            maxLife: 0,
            precision: 0,
            strength: 0,
            armor: 0,
            initiative: 0,
            dodging: 0,
            energy: 0,
            totalEnergy: 0,
            mouvement: 0,
            totalMouvement: 0,
        };
        return Stats.add(
            emptyStats,
            ...entity.effects
                .filter((effect) => effect.type === EffectType.APPLY)
                .map((effect) => effect.modifier)
        );
    }
}
