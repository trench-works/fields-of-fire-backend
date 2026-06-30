import { Logger, Provide, Ran } from "../../../core";
import { Action, ActionType } from "../../Action/data/Action";
import { Effect } from "../../Effect/data/Effect";
import { Entity } from "../../Game/data/Entity";
import { Stats } from "../../Stat/data/Stats";
import { Player } from "../data/Player";

export class AttackService {
    @Provide("Logger")
    private readonly logger!: Logger;

    calculateDamage(action: Action, attacker: Entity, target: Entity, player? : Player): number {
        const attackerStats = Stats.fromEntity(attacker);
        const targetStats = Stats.fromEntity(target);

        //dodging - à voir si on peut dire au front que l'action à été dodge
        if(action.damage?.min ?? -1 >= 0) {
            const diceRoll = Ran.int(100);
            const isDodged = target.stats.dodging > diceRoll ? true : false;

            if (isDodged) {
                return 0;
            }
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
            finalDamage = Math.ceil(brutTotal * (100 / (100 + target.stats.armor)));
        }

        this.logger.log(`Calculated : ${brutTotal}`);

        // Vampire : vol de vie par stack
        //Masochiste: self-dammage
        if (action.damage!.min >= 0) {
            // seulement sur les dégâts positifs, pas les heals
            const vampireStacks = attacker.effects.filter(
                (e) => e.id === "vampire"
            ).length;
            if (vampireStacks > 0) {
                const lifeSteal = Math.ceil(finalDamage / 10) * vampireStacks;
                attacker.stats.life = Math.min(
                    attacker.stats.life + lifeSteal,
                    Stats.fromEntity(attacker).maxLife
                );
            }

            const masoStacks = attacker.effects.filter(
                (e) => e.id === "masochistic"
            ).length;
            if (masoStacks > 0) {
                const masoDamage = Math.floor(finalDamage * (0.2 * masoStacks));
                const selfDammage = Math.ceil((Math.floor(masoDamage/2)) * (100 / (100 + attacker.stats.armor)));
                finalDamage += masoDamage;
                attacker.stats.life = Math.max(
                    attacker.stats.life - selfDammage,
                    0
                );
            }
        }

        //Crit Logik
        const critRoll = Ran.int(100);
        const critChanceBuff = attacker.effects.filter(
                (e) => e.id === "critChance"
            ).length;
         const critDammageBuff = attacker.effects.filter(
                (e) => e.id === "critDammage"
            ).length;
        const critChance = 1 + critChanceBuff;
        if(critRoll < critChance ){
            finalDamage = finalDamage * (1.5 + (0.25 * critDammageBuff));
        } 

        //manage effect 
        if (action.effectList) {
            this.logger.debug(
                `action.effectList : ${JSON.stringify(action.effectList)}`
            );
            for (const effect of action.effectList) {
                this.applyEffect(player?.name ?? attacker.classId, target, effect);
            }
            target.effects = action.effectList;
        }

         if (action.selfEffectList) {
            this.logger.debug(`action.effectList : ${action.effectList}`);
            for (const effect of action.selfEffectList) {
                this.applyEffect(player?.name ?? attacker.classId, attacker, effect);
            }
        }

        return finalDamage;

        //TODO: ajouter les effets de l'attaque, et ajout de chances d'échecs
    }

    calculateAverageDammage(action: Action, stats: Stats,){

        const averageDamage = action.damage
            ? (action.damage.max - action.damage.min) / 2 +
            action.damage.min
            : 0;

        let statBonus: number = 0;

        switch (action.actionType) {
            case ActionType.MELEE:
                {
                    statBonus = Math.ceil(stats.strength / 10);
                }
                break;
            case ActionType.RANGED:
                {
                    statBonus = Math.ceil(stats.precision / 10);
                }
                break;
        }

        if (action.damage!.min < 0) {
            return averageDamage - statBonus;
        } else {
            return averageDamage + statBonus;
        }
    }

    applyEffect(caster: string | undefined, target: Entity, effect: Effect) {
        if (!target.stats) {
            this.logger.error("Target entity has no stats");
            return;
        }
        this.logger.log(`target is ${JSON.stringify(target)}`);
        const effectCopy = { ...effect };
        if (caster) {
            effectCopy.author = caster;
        }

        target.effects.push(effectCopy);
        target.stats = Stats.add(target.stats, effect.instant);
    }
}
