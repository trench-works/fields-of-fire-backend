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
    EffectTarget,
    ManagedEffect,
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
        backlashDamage: number,
        action: Action,
        attacker: Entity,
        defenser: Entity
    ): { defenserDamage: number; attackerDamage: number, isCritical: boolean } {
        const attackerStats = Stats.fromEntity(attacker);
        const defenserStats = Stats.fromEntity(defenser);

        let attackerDamage: number = 0;
        let defenserDamage: number = 0;
        let isCritical : boolean = false;

        let statBonus: number = 0;
        // calculate stats bonus
        const sign = Math.sign(damage); // 1 : dégâts, -1 : soin
        switch (action.actionType) {
            case ActionType.MELEE:
                statBonus += sign * (attackerStats.strength / 10);
                break;
            case ActionType.RANGED:
                statBonus += sign * (attackerStats.precision / 10);
                break;
            case ActionType.SUPPORT:
                statBonus += sign * (attackerStats.intelligence / 10);
                break;
        }

        let brutTotal: number;

        //Appliquer le bonus sur les soins et les frappes
        if (action.damage) {
            const raw = damage + statBonus;
            brutTotal = damage > 0 ? Math.max(raw, 1) : Math.min(raw, -1);
        } else {
            brutTotal = damage + statBonus;
        }
        if (damage === 0) {
            return { attackerDamage: 0, defenserDamage: 0, isCritical: false };
        }

        //appliquer l'armure sur les frappe
        defenserDamage = brutTotal > 0 ? brutTotal * (100 / (100 + defenserStats.armor)): brutTotal;  

        //Crit Logik
        const critRoll = Ran.int(100);
        const critChanceBuff = attackerStats.critical;
        const critDammageBuff = attacker.effects.filter(
            (e) => e.action === EffectAction.CRIT_DAMMAGE
        ).length;
        const critChance = 1 + critChanceBuff;
        if (critRoll < critChance) {
            defenserDamage *= 2 + 0.33 * critDammageBuff;
            isCritical = true;
        }

        if (action.id === "shield_rush") {
            defenserDamage *=
                1 +
                (PositionUtils.distance(attacker.position, defenser.position) -
                    1) *
                    0.15;
        }

        // Vampire : vol de vie par stack
        //Masochiste: self-dammage
        if ((action.damage?.min ?? -1) >= 0) {
            // seulement sur les dégâts positifs, pas les heals
            const vampireStacks = attacker.effects.filter(
                (e) => e.action === EffectAction.VAMPIRISM
            ).length;
            if (vampireStacks > 0) {
                let lifeSteal = 0;
                if(action.zoneSize > 1){
                    lifeSteal = Math.ceil((defenserDamage / 20) * vampireStacks);
                }else {
                    lifeSteal = Math.ceil((defenserDamage / 10) * vampireStacks);
                }
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
                const weaknessDamage = defenserDamage * (0.25 * weaknessStacks);
                defenserDamage += weaknessDamage;
            }
        }
        //backlashLogik 
        attackerDamage += backlashDamage;
        //antiHealLogik
        if(defenserDamage < 0){
            if(defenser.effects.some(effect => effect.id === "untreatable")){
                defenserDamage = 0;
            }
        }
        if(attackerDamage < 0){
            if(attacker.effects.some(effect => effect.id === "untreatable")){
                attackerDamage = 0;
            }
        }
        
        console.log("[calc]", { damage, statBonus, brutTotal, defenserDamage });
        return {
            attackerDamage: Math.ceil(attackerDamage),
            defenserDamage: Math.ceil(defenserDamage),
            isCritical,
        };
    }

    applyDamage(
        game: Game,
        action: Action,
        attacker: Entity,
        target: Entity,
        reduction?: number
    ): {damage: number, isCritical: boolean, effectIdsBeforeAttack : string[]} {
        const attackerPlayer: Player | undefined = game.players.find(
            (player) => player.entityId === attacker.id
        );
        const targetPlayer: Player | undefined = game.players.find(
            (player) => player.entityId === target.id
        );

        const effectIdsBeforeAttack = target.effects.map((e) => e.id);
        const isHeal = (action.damage?.max ?? 0) <= 0 && action.damage !== undefined;
        const isSelf = attacker.id === target.id;
        const canDodge = !isHeal && !isSelf && (action.damage?.min ?? -1) >= 0;
        
        if (canDodge) {
            console.log("dodgeLogik");  
            const diceRoll = Ran.int(100);
            const isDodged = target.stats.dodging > diceRoll ? true : false;

            if (isDodged) {
                return { damage: 0, isCritical: false, effectIdsBeforeAttack};
            }
        }
        console.log("[applyDamage] avant roll", action.id, JSON.stringify(action.damage));
        const randomDamage = action.damage
            ? action.damage.min + Ran.int(action.damage.max - action.damage.min)
            : 0;
        
        const randomSelfDamage = action.backlash
        ? action.backlash.min + Ran.int(action.backlash.max - action.backlash.min)
        : 0;

        // calculate damages
        let { attackerDamage, defenserDamage, isCritical } = this.calculateFinalDamage(
            randomDamage,
            randomSelfDamage,
            action,
            attacker,
            target
        );
        // ajouter pour le cas du passif REFLEXSHOT
        if (reduction){
            defenserDamage = Math.round(defenserDamage / 100) * reduction;
            console.log(`reduced dammage : ${defenserDamage}`)
        } 
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
            this.logger.error(`!!! dammage done : ${defenserDamage}`);
            target.effects = target.effects.filter(
            (effect) =>
                !(
                    effect.type === EffectType.CONSUMABLE &&
                    [EffectAction.WEAKNESS].includes(effect.action)
                )
        );
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

        // vérifier en cas de mort indirecte (maso,bleeding, etc...)
        if (defenserDamage > 0 && attacker.id !== target.id) {
            target.lastDamagedBy = attacker.id;
        }
        if (target.stats.life === 0 && attackerPlayer) {
            attackerPlayer.stats.kills++; // count kills
        }

        //manage effect
        console.log("number of effect to apply ",action.effectList?.length)
        if ((action.effectList?.length ?? 0) > 0) {
            this.applyManagedEffects(game, attacker, target, action.effectList!, true);
        }

        return {damage: defenserDamage, isCritical, effectIdsBeforeAttack};
    }

    applyEffect(caster: string | undefined, target: Entity, effect: Effect) {
        if (!target.stats) {
            return;
        }
        const remaining = (e: { duration: number | null }) =>
            e.duration === null ? Infinity : e.duration;
        const effectCopy = { ...effect };
        if (caster) {
            effectCopy.author = caster;
        }

        if (effect.maxStacks !== undefined) {
            const stacks = target.effects.filter((e) => e.id === effect.id);

            if (stacks.length >= effect.maxStacks) {
                const oldest = stacks.reduce((a, b) => (remaining(a) <= remaining(b) ? a : b));

                if (remaining(effectCopy) > remaining(oldest)) {
                    oldest.duration = effectCopy.duration;
                    oldest.author = effectCopy.author;
                }
                return; 
            }
        }

        target.effects.push(effectCopy);
        if (effect.instant === undefined) this.logger.warn('the effect is badly written and will not apply !')
        target.stats = Stats.add(target.stats, effect.instant ?? {});
    }
    
    applyManagedEffects(
        game: Game,
        caster: Entity,
        hitTarget: Entity | undefined,
        effects: ManagedEffect[],
        hit: boolean,
    ): void {
        for (const managed of effects) {
            console.log("applying effect : ", managed.effect.name);
            if (managed.onHit && !hit) continue;
            for (const entity of this.resolveEffectTargets(managed.target, game, caster, hitTarget)) {
                if (managed.chanceToApply !== undefined && Ran.int(100) >= managed.chanceToApply) {
                    continue; 
                }
                const duration = managed.duration !== undefined ? managed.duration : managed.effect.duration;
                //this.logger.warn(` effect : ${managed.effect.name} is going to be applied to ${entity}`)
                this.applyEffect(caster.id, entity, { ...managed.effect, duration });
            }
        }
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
            return applyFovToGroundAttack(
                start,
                result,
                board,
                action.range.max
            );
        }
        if (action.level === ActionLevel.UNDERGROUND) {
            return applyFovToUndergroundAttack(
                start,
                result,
                board,
                action.range.max
            );
        }
        return result;
    }

    resolveEffectTargets(
    target: EffectTarget,
    game: Game,
    caster: Entity,
    hitTarget: Entity | undefined,
    ): Entity[] {
        const alive = game.entities.filter((e) => !e.dead);
        const allies = alive.filter((e) => e.teamId === caster.teamId);
        const foes = alive.filter((e) => e.teamId !== caster.teamId);

        switch (target) {
            case EffectTarget.SELF:
                return [caster];
            case EffectTarget.TARGET:
                return hitTarget ? [hitTarget] : [];
            case EffectTarget.RANDOM_ALLY:
                return allies.length ? [allies[Ran.int(allies.length)]] : [];
            case EffectTarget.RANDOM_FOE:
                return foes.length ? [foes[Ran.int(foes.length)]] : [];
            case EffectTarget.ALL_ALLY:
                return allies;
            case EffectTarget.ALL_FOE:
                return foes;
            case EffectTarget.ALL:
                return alive;
        }
    }

    actionFor(action: Action, attacker: Entity, target: Entity): Action {
        console.log("[actionFor]", action.id, attacker.teamId, target.teamId);
        if (!action.onAlly || attacker.teamId !== target.teamId) return action;
        return { ...action, ...action.onAlly };
    }
}
