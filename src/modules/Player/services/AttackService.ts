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
        
        const randomDamage = action.damage
            ? action.damage.min + Ran.int(action.damage.max - action.damage.min)
            : 0;

        let statBonus;

        switch (action.actionType) {
            case ActionType.MELEE:
                {
                    statBonus = Math.ceil(attackerStats.strength / 10);
                    this.logger.debug(`Calculated : ${statBonus} because strength = ${attacker.stats!.strength}`);
                }
                break;
            case ActionType.RANGED:
                {
                    statBonus = Math.ceil(attackerStats.precision / 10);
                    this.logger.debug("range : ", statBonus)
                }
                break;
            default: {
                statBonus = 0;
            }
        }

        let brutTotal;
        let reduction;
        if (action.damage!.min < 0) {
            brutTotal = randomDamage - statBonus;
        } else {
            brutTotal = randomDamage + statBonus;
            reduction = Math.ceil(brutTotal * (targetStats.armor / 100));
        }


        this.logger.log(`Calculated : ${brutTotal} - ${reduction}`);

        const finalDamage = brutTotal - (reduction ?? 0);

        return finalDamage;

        //TODO: ajouter les effets de l'attaque, et ajout de chances d'échecs
    }
}
