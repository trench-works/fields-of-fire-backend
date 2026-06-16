import { Logger, Provide, Ran } from "../../../core";
import { Action, ActionType } from "../../Action/data/Action";
import { Entity } from "../../Game/data/Entity";

export class AttackService {
    @Provide("Logger")
    private readonly logger!: Logger;

    calculateDamage(action: Action, attacker: Entity, target: Entity): number {
        const randomDamage = action.damage
            ? action.damage.min + Ran.int(action.damage.max - action.damage.min)
            : 0;

        let statBonus;

        switch (action.actionType) {
            case ActionType.MELEE:
                {
                    statBonus = Math.ceil(attacker.stats!.strength / 10);
                }
                break;
            case ActionType.RANGED:
                {
                    statBonus = Math.ceil(attacker.stats!.precision / 10);
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
            reduction = Math.ceil(brutTotal * (target.stats!.armor / 100));
        }

        this.logger.log(`Calculated : ${brutTotal - (reduction ?? 0)} dammage`);

        const finalDamage = brutTotal - (reduction ?? 0);

        return finalDamage;

        //TODO: ajouter les effets de l'attaque, et ajout de chances d'échecs
    }
}
