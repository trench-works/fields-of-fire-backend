import { Logger, Provide, Ran } from "../../../core";
import { EffectRepository } from "../../Effect/data/EffectRepository";
import { Entity } from "../../Game/data/Entity";
import { Game } from "../../Game/data/Game";
import { BoostType, EnnemiBoost } from "../data/BoostType";

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

    getPlayerBoostSelection() {
        
    }

    getEnnemiBoost(game: Game) {
        const ennemies = game.entities.filter((entity: Entity) => {
            return entity.entityType === "ENEMY";
        });
        const playerNumber = game.entities.length - ennemies.length;
        const diceRoll = Ran.int(100);

        //si les joueur son plus nombreux que les ennemis alors les enenmis ont automatiquement un renfort
        if(playerNumber > ennemies.length  ){
            return EnnemiBoost.REINFORCEMENT;
        }

        if(playerNumber === ennemies.length ) {
            switch(true) {
                case diceRoll < 25 :
                    return EnnemiBoost.REINFORCEMENT;
                case diceRoll < 45 :
                    return EnnemiBoost.UPPRECISION;
                case diceRoll < 60 :
                    return EnnemiBoost.UPSTRENGTH;
                case diceRoll < 75 :
                    return EnnemiBoost.UPLIFE;
                case diceRoll < 90 :
                    return EnnemiBoost.UPMOUVEMENT;
                case diceRoll < 100 :
                    return EnnemiBoost.UPENERGY;
            }
        }
        
        if(playerNumber < ennemies.length ) {
            switch(true) {
                case diceRoll < 10 :
                    return EnnemiBoost.REINFORCEMENT;
                case diceRoll < 35 :
                    return EnnemiBoost.UPPRECISION;
                case diceRoll < 60 :
                    return EnnemiBoost.UPSTRENGTH;
                case diceRoll < 85 :
                    return EnnemiBoost.UPLIFE;
                case diceRoll < 92 :
                    return EnnemiBoost.UPMOUVEMENT;
                case diceRoll < 100 :
                    return EnnemiBoost.UPENERGY;
            }
        }

        //on ne rajoute pas + que 8 ennemis max.
        if (ennemies.length === 8) {
            switch(true) {
                case diceRoll < 30 :
                    return EnnemiBoost.UPPRECISION;
                case diceRoll < 60:
                    return EnnemiBoost.UPSTRENGTH;
                case diceRoll < 80 :
                    return EnnemiBoost.UPLIFE;
                case diceRoll < 90 :
                    return EnnemiBoost.UPMOUVEMENT;
                case diceRoll < 100 :
                    return EnnemiBoost.UPENERGY;
            }
        }

        
}
}
