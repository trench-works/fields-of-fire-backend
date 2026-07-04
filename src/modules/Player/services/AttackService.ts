import { Logger, Provide, Ran } from "../../../core";
import {
    applyFovToGroundAttack,
    applyFovToUndergroundAttack,
    Position,
} from "../../../game-lib";
import {
    Action,
    ActionLevel,
    ActionType,
    ActionZoneType,
} from "../../Action/data/Action";
import { Effect, EffectAction, EffectType } from "../../Effect/data/Effect";
import { Entity } from "../../Game/data/Entity";
import { Cell } from "../../Game/data/Game";
import { Stats } from "../../Stat/data/Stats";
import { Player } from "../data/Player";

export class AttackService {
    @Provide("Logger")
    private readonly logger!: Logger;

    calculateFinalDamage(
        damage: number,
        action: Action,
        attacker: Entity,
        defenser: Entity
    ): { defenserDamage: number; attackerDamage: number } {
        const attackerStats = Stats.fromEntity(attacker);
        const defenserStats = Stats.fromEntity(defenser);

        let attackerDamage: number = 0;
        let defenserDamage: number;

        let statBonus: number = 0;
        // calculate stats bonus
        switch (action.actionType) {
            case ActionType.MELEE:
                {
                    statBonus += Math.ceil(attackerStats.strength / 10);
                    this.logger.debug(
                        `Calculated : ${statBonus} because strength = ${attacker.stats!.strength}`
                    );
                }
                break;
            case ActionType.RANGED:
                {
                    statBonus += Math.ceil(attackerStats.precision / 10);
                    this.logger.debug("range : ", statBonus);
                }
                break;
        }

        let brutTotal: number;
        if (damage < 0) {
            brutTotal = damage - statBonus;
            defenserDamage = brutTotal;
            if (defenserStats.life - defenserDamage > defenserStats.maxLife) {
                defenserDamage = -(defenserStats.maxLife - defenserStats.life);
            }
        } else {
            brutTotal = damage + statBonus;
            defenserDamage = Math.ceil(
                brutTotal * (100 / (100 + defenserStats.armor))
            );

            //Crit Logik
            const critRoll = Ran.int(100);
            const critChanceBuff = attacker.effects.filter(
                (e) => e.action === EffectAction.CRIT_CHANCE
            ).length;
            const critDammageBuff = attacker.effects.filter(
                (e) => e.action === EffectAction.CRIT_DAMMAGE
            ).length;
            const critChance = 1 + critChanceBuff * 3;
            if (critRoll < critChance) {
                defenserDamage = Math.ceil(
                    defenserDamage * (2 + 0.25 * critDammageBuff)
                );
            }
        }

        // Vampire : vol de vie par stack
        //Masochiste: self-dammage
        if ((action.damage?.min ?? -1) >= 0) {
            // seulement sur les dégâts positifs, pas les heals
            const vampireStacks = attacker.effects.filter(
                (e) => e.action === EffectAction.VAMPIRISM
            ).length;
            if (vampireStacks > 0) {
                const lifeSteal =
                    Math.ceil(defenserDamage / 10) * vampireStacks;
                attackerDamage = -lifeSteal;
            }

            const masoStacks = attacker.effects.filter(
                (e) => e.action === EffectAction.MASOCHISTIC
            ).length;
            if (masoStacks > 0) {
                const masoDamage = Math.floor(
                    defenserDamage * (0.2 * masoStacks)
                );
                attackerDamage = Math.ceil(
                    Math.floor(masoDamage / 2) *
                        (100 / (100 + attackerStats.armor))
                );
                defenserDamage += masoDamage;
            }

            const weaknessStacks = attacker.effects.filter(
                (e) => e.action === EffectAction.WEAKNESS
            ).length;
            if (weaknessStacks > 0) {
                const weaknessDamage = Math.floor(
                    defenserDamage * (0.2 * weaknessStacks)
                );
                defenserDamage += weaknessDamage;
            }
        }

        return { attackerDamage, defenserDamage };
    }

    applyDamage(
        action: Action,
        attacker: Entity,
        target: Entity,
        player?: Player
    ): number {
        //dodging - à voir si on peut dire au front que l'action à été dodge
        if (action.damage?.min ?? -1 >= 0) {
            const diceRoll = Ran.int(100);
            const isDodged = target.stats.dodging > diceRoll ? true : false;

            if (isDodged) {
                return 0;
            }
        }

        const randomDamage = action.damage
            ? action.damage.min + Ran.int(action.damage.max - action.damage.min)
            : 0;

        // calculate damages
        const { attackerDamage, defenserDamage } = this.calculateFinalDamage(
            randomDamage,
            action,
            attacker,
            target
        );

        target.effects = target.effects.filter(
            (effect) =>
                !(
                    effect.type === EffectType.CONSUMABLE &&
                    [EffectAction.WEAKNESS].includes(effect.action)
                )
        );

        attacker.stats.life -= player ? attackerDamage : attackerDamage * 1.2;
        target.stats.life -= player ? defenserDamage : defenserDamage * 0.8;

        //manage effect
        if ((action.effectList?.length ?? 0) > 0) {
            this.logger.debug(
                `action.effectList : ${JSON.stringify(action.effectList)}`
            );
            for (const effect of action.effectList!) {
                this.applyEffect(
                    player?.name ?? attacker.classId,
                    target,
                    effect
                );
            }
            target.effects = action.effectList!;
        }

        if (action.selfEffectList) {
            this.logger.debug(`action.effectList : ${action.effectList}`);
            for (const effect of action.selfEffectList) {
                this.applyEffect(
                    player?.name ?? attacker.classId,
                    attacker,
                    effect
                );
            }
        }

        return defenserDamage;
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

    getCellsInAttackRange(
        start: Position,
        action: Action,
        board: Cell[][]
    ): Cell[] {
        const result: Cell[] = [];

        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                let isInRange = false;
                const cell = board[x]?.[y];
                const dist = Math.abs(start.x - x) + Math.abs(start.y - y);

                switch (action.rangeType) {
                    case ActionZoneType.DIAMOND:
                    case ActionZoneType.CIRCLE:
                        if (
                            dist <= action.range.max &&
                            dist >= action.range.min &&
                            cell &&
                            !cell.isHole &&
                            !cell.isWall
                        ) {
                            isInRange = true;
                        }
                        break;
                    case ActionZoneType.PLUS:
                        if (
                            dist <= action.range.max &&
                            dist >= action.range.min &&
                            cell &&
                            !cell.isHole &&
                            !cell.isWall
                        ) {
                            if (x === start.x || y === start.y) {
                                isInRange = true;
                            }
                        }
                        break;
                    case ActionZoneType.XCROSS: {
                        const dx = Math.abs(start.x - x);
                        const dy = Math.abs(start.y - y);
                        if (
                            cell &&
                            !cell.isHole &&
                            !cell.isWall &&
                            dx === dy &&
                            dx >= action.range.min &&
                            dx <= action.range.max
                        ) {
                            isInRange = true;
                        }
                        break;
                    }
                }
                if (isInRange) {
                    result.push(board[x][y]);
                }
            }
        }
        if (action.level === ActionLevel.GROUND) {
            return applyFovToGroundAttack(start, result, board);
        }
        if (action.level === ActionLevel.UNDERGROUND) {
            return applyFovToUndergroundAttack(start, result, board);
        }
        return result;
    }
}
