import { Logger, Provide, Ran } from "../../../core";
import { Boost, BoostType } from "../../Effect/data/Boost";
import { BoostRepository } from "../../Effect/data/BoostRepository";
import { EffectRepository } from "../../Effect/data/EffectRepository";
import { Entity, EntityType } from "../../Game/data/Entity";
import { Game } from "../../Game/data/Game";
import { Stats } from "../../Stat/data/Stats";

export class BoostService {
    @Provide("Logger")
    private readonly logger!: Logger;
    @Provide(EffectRepository)
    private readonly effectRepository!: EffectRepository;
    @Provide(BoostRepository)
    private readonly boostRepository!: BoostRepository;

    async manageBoost(playerEntity: Entity, boostId: string): Promise<void> {
        const boost = await this.boostRepository.get(boostId);
        if (!boost) return;
        const effects = await Promise.all(
            boost.effects.map((effectId) => this.effectRepository.get(effectId))
        );
        switch (boostId) {
            case "heal":
                // Remet la vie au max, pas d'effet ajouté
                playerEntity.stats.life = playerEntity.stats.maxLife;
                break;
            default:
                {
                    for (const effect of effects) {
                        if (effect) {
                            playerEntity.effects.push(effect);
                        }
                    }

                    for (const statBoost of boost.boosts) {
                        playerEntity.stats = Stats.add(
                            playerEntity.stats,
                            statBoost
                        );
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

    async getEnnemiBoost(game: Game): Promise<Boost> {
        const ennemies = game.entities.filter((entity: Entity) => {
            return entity.entityType === EntityType.ENEMY;
        });
        const playerNumber = game.entities.length - ennemies.length;

        //si les joueur son plus nombreux que les ennemis alors les enenmis ont automatiquement un renfort
        if (playerNumber > ennemies.length) {
            return (await this.boostRepository.get("reinforcement"))!;
        }

        return (
            await this.getRandomBoosts(
                1,
                BoostType.AI,
                ennemies.length === 8 ? ["reinforcement"] : []
            )
        )[0];
    }
}
