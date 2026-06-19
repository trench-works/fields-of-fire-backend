import { Logger, Provide, Ran } from "../../../core";
import { Action, ActionType } from "../../Action/data/Action";
import { Entity } from "../../Game/data/Entity";
import { Stats } from "../../Stat/data/Stats";

export class AttackService {
    @Provide("Logger")
    private readonly logger!: Logger;

    calculateDamage(action: Action, attacker: Entity, target: Entity): number {
        const attackerStats = Stats.fromEntity(attacker);
        const targetStats = Stats.fromEntity(target);

        //dodging - à voir si on peut dire au front que l'action à été dodge
        const diceRoll = Ran.int(100);
        const isDodged = target.stats.dodging > diceRoll ? true : false;

        if (isDodged) {
            return 0;
        }

        const randomDamage = action.damage
            ? action.damage.min + Ran.int(action.damage.max - action.damage.min)
            : 0;

        let statBonus: number = 0;

        switch (action.actionType) {
            case ActionType.MELEE:
                {
                    statBonus = Math.ceil(attackerStats.strength / 10);
                    this.logger.debug(
                        `Calculated : ${statBonus} because strength = ${attacker.stats!.strength}`
                    );
                }
                break;
            case ActionType.RANGED:
                {
                    statBonus = Math.ceil(attackerStats.precision / 10);
                    this.logger.debug("range : ", statBonus);
                }
                break;
        }

        let brutTotal: number;
        let reduction: number = 0;
        let finalDamage: number;

        if (action.damage!.min < 0) {
            brutTotal = randomDamage - statBonus;
            finalDamage = brutTotal;
            if (
                Stats.fromEntity(target).life - finalDamage >
                targetStats.maxLife
            ) {
                finalDamage = -(
                    targetStats.maxLife - Stats.fromEntity(target).life
                );
            }
        } else {
            brutTotal = randomDamage + statBonus;
            reduction = Math.ceil(brutTotal * (targetStats.armor / 100));
            finalDamage = Math.max(brutTotal - reduction, 0);
        }

        this.logger.log(`Calculated : ${brutTotal} - ${reduction}`);

        // Vampire : vol de vie par stack
        if (action.damage!.min >= 0) {
            // seulement sur les dégâts positifs, pas les heals
            const vampireStacks = attacker.effects.filter(
                (e) => e.id === "vampire"
            ).length;

            if (vampireStacks > 0) {
                const lifeSteal = Math.ceil(finalDamage / 2) * vampireStacks;
                attacker.stats.life = Math.min(
                    attacker.stats.life + lifeSteal,
                    Stats.fromEntity(attacker).maxLife
                );
            }
        }

        return finalDamage;

        //TODO: ajouter les effets de l'attaque, et ajout de chances d'échecs
    }
}
