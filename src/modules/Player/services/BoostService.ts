import { Logger, Provide } from "../../../core";
import { EffectRepository } from "../../Effect/data/EffectRepository";
import { Entity } from "../../Game/data/Entity";
import { BoostType } from "../data/BoostType";

export class BoostService {
    @Provide("Logger")
    private readonly logger!: Logger;
    @Provide(EffectRepository)
    private readonly effectRepository!: EffectRepository;

    async manageBoost(playerEntity: Entity, boostId: BoostType): Promise<void> {
        const boost = await this.effectRepository.get(boostId);
        if (!boost) return;

        switch (boostId) {
            case BoostType.LIFE:
                // +maxLife ET +life actuels
                playerEntity.stats.maxLife += boost.modifier.maxLife;
                playerEntity.stats.life += boost.modifier.maxLife;
                playerEntity.effects.push({ ...boost });
                break;

            case BoostType.HEAL_UP:
                // Remet la vie au max, pas d'effet ajouté
                playerEntity.stats.life = playerEntity.stats.maxLife;
                break;

            // Vampire et Range : on empile les effets (comptés via entity.effects)
            case BoostType.VAMPIRE:
            case BoostType.RANGE:
                playerEntity.effects.push({ ...boost });
                break;

            // Stats pures : on empile aussi via effects
            default:
                playerEntity.effects.push({ ...boost });
                break;
        }
    }
    }
