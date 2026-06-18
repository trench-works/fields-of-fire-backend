import { Logger, Provide, Ran } from "../../../core";
import { Boost, BoostType } from "../../Effect/data/Boost";
import { BoostRepository } from "../../Effect/data/BoostRepository";
import { EffectRepository } from "../../Effect/data/EffectRepository";
import { Entity } from "../../Game/data/Entity";
import { Stats } from "../../Stat/data/Stats";

export class BoostService {
    @Provide("Logger")
    private readonly logger!: Logger;
    @Provide(EffectRepository)
    private readonly effectRepository!: EffectRepository;
    @Provide(BoostRepository)
    private readonly boostRepository!: BoostRepository;

    async applyBoost(entity: Entity, boostId: string): Promise<void> {
        const boost = await this.boostRepository.get(boostId);
        if (!boost) return;
        const effects = await Promise.all(
            boost.effects.map((effectId) => this.effectRepository.get(effectId))
        );
        switch (boostId) {
            case "heal":
                // Remet la vie au max, pas d'effet ajouté
                entity.stats.life = entity.stats.maxLife;
                break;
            default:
                {
                    for (const effect of effects) {
                        if (effect) {
                            entity.effects.push(effect);
                        }
                    }

                    for (const statBoost of boost.boosts) {
                        entity.stats = Stats.add(entity.stats, statBoost);
                    }
                }
                break;
        }
    }

    async getBoostProbabilityMap(
        boostType: BoostType,
        bans: string[]
    ): Promise<[Record<number, Boost>, number]> {
        const probabilityMap: Record<number, Boost> = {};
        let total = 0;
        for (const boost of (await this.boostRepository.list()).filter(
            (boost) =>
                (!boost.type || boost.type === boostType) &&
                !bans.includes(boost.id)
        )) {
            total += boost.probability;
            probabilityMap[total] = boost;
        }
        return [probabilityMap, total];
    }

    async getRandomBoosts(
        count: number,
        boostType: BoostType,
        bans: string[]
    ): Promise<Boost[]> {
        const boosts: Boost[] = [];
        const [probabilityMap, total] = await this.getBoostProbabilityMap(
            boostType,
            bans
        );
        for (let i = 0; i < count; i++) {
            const random = Ran.int(total);
            boosts.push(probabilityMap[random]);
        }
        return boosts;
    }

    async getPlayerBoostSelection(): Promise<Boost[]> {
        return await this.getRandomBoosts(3, BoostType.PLAYER, []);
    }

    async getMobBoost(
        playerCount: number,
        mobCount: number,
        boostCount: number
    ): Promise<Boost[]> {
        const boosts: Boost[] = [];
        //si les joueur son plus nombreux que les ennemis alors les enenmis ont automatiquement un renfort
        while (playerCount > mobCount && boostCount > boosts.length) {
            boosts.push((await this.boostRepository.get("reinforcement"))!);
        }
        if (boostCount > boosts.length) {
            boosts.push(
                ...(await this.getRandomBoosts(
                    boostCount - boosts.length,
                    BoostType.AI,
                    mobCount === 8 ? ["reinforcement"] : []
                ))
            );
        }

        return boosts;
    }
}
