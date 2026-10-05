import { Logger, Provide, Ran } from "../../../core";
import {
    applyFovToGroundAttack,
    applyFovToUndergroundAttack,
    Position,
    PositionUtils,
} from "../../../game-lib";
import {
    Action,
    ActionLevel,
    ActionType,
    ActionZoneType,
} from "../../Action/data/Action";
import { Effect, EffectAction, EffectType } from "../../Effect/data/Effect";
import { Entity } from "../../Game/data/Entity";
import { Cell, Game } from "../../Game/data/Game";
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
                    statBonus += attackerStats.strength / 10;
                    this.logger.debug(
                        `Calculated : ${statBonus} because strength = ${attacker.stats!.strength}`
                    );
                }
                break;
            case ActionType.RANGED:
                {
                    statBonus += attackerStats.precision / 10;
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
            defenserDamage = brutTotal * (100 / (100 + defenserStats.armor));

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
                defenserDamage *= 2 + 0.25 * critDammageBuff;
            }
        }

        if (action.id === "shield_rush") {
            defenserDamage *=
                1 +
                (PositionUtils.distance(attacker.position, defenser.position) -
                    1) *
                    0.1;
        }

        // Vampire : vol de vie par stack
        //Masochiste: self-dammage
        if ((action.damage?.min ?? -1) >= 0) {
            // seulement sur les dégâts positifs, pas les heals
            const vampireStacks = attacker.effects.filter(
                (e) => e.action === EffectAction.VAMPIRISM
            ).length;
            if (vampireStacks > 0) {
                const lifeSteal = (defenserDamage / 10) * vampireStacks;
                attackerDamage -= lifeSteal;
            }

            const masoStacks = attacker.effects.filter(
                (e) => e.action === EffectAction.MASOCHISTIC
            ).length;
            if (masoStacks > 0) {
                const masoDamage = defenserDamage * (0.2 * masoStacks);
                attackerDamage +=
                    (masoDamage / 2) * (100 / (100 + attackerStats.armor));
                defenserDamage += masoDamage;
            }

            const weaknessStacks = defenser.effects.filter(
                (e) => e.action === EffectAction.WEAKNESS
            ).length;
            if (weaknessStacks > 0) {
                const weaknessDamage = defenserDamage * (0.2 * weaknessStacks);
                defenserDamage += weaknessDamage;
            }
        }

        return {
            attackerDamage: Math.ceil(attackerDamage),
            defenserDamage: Math.ceil(defenserDamage),
        };
    }

    applyDamage(
        game: Game,
        action: Action,
        attacker: Entity,
        target: Entity
    ): number {
        const attackerPlayer: Player | undefined = game.players.find(
            (player) => player.entityId === attacker.id
        );
        const targetPlayer: Player | undefined = game.players.find(
            (player) => player.entityId === target.id
        );
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

        // damagers to attacker
        if (attackerPlayer && attackerDamage > 0) {
            attackerPlayer.stats.damages += attackerDamage; // count damage on itself
            attackerPlayer.stats.sustained += attackerDamage; // count damage on itself
        }
        if (attackerPlayer && attackerDamage < 0) {
            attackerPlayer.stats.heal += -attackerDamage; // count heal on itself
        }
        attacker.stats.life -= attackerDamage;
        attacker.stats.life = Math.min(
            attacker.stats.maxLife,
            Math.max(0, attacker.stats.life)
        );

        // damages to target
        if (attackerPlayer && defenserDamage > 0) {
            attackerPlayer.stats.damages += defenserDamage; // count damage done
        }
        if (targetPlayer && defenserDamage > 0) {
            targetPlayer.stats.sustained += defenserDamage; // count damage taken
        }
        if (attackerPlayer && defenserDamage < 0) {
            attackerPlayer.stats.heal += -defenserDamage; // count heal done to other
        }
        target.stats.life -= defenserDamage;
        target.stats.life = Math.min(
            target.stats.maxLife,
            Math.max(0, target.stats.life)
        );
        if (target.stats.life === 0 && attackerPlayer) {
            attackerPlayer.stats.kills++; // count kills
        }

        //manage effect
        if ((action.effectList?.length ?? 0) > 0) {
            this.logger.debug(
                `action.effectList : ${JSON.stringify(action.effectList)}`
            );
            for (const effect of action.effectList!) {
                this.applyEffect(attacker.id, target, effect);
            }
            target.effects = action.effectList!;
        }

        if (action.selfEffectList) {
            this.logger.debug(`action.effectList : ${action.effectList}`);
            for (const effect of action.selfEffectList) {
                this.applyEffect(attacker.id, attacker, effect);
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
            return applyFovToGroundAttack(start, result, board, action.range.max);
        }
        if (action.level === ActionLevel.UNDERGROUND) {
            return applyFovToUndergroundAttack(start, result, board, action.range.max);
        }
        return result;
    }
}
