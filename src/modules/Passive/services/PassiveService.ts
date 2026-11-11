import { Provide, Logger, ColdRessource, DBError } from "../../../core";
import { AsyncResolver, AsyncDependencyResolver } from "../../../core/app/Controller/DependencyResolver";
import { Action } from "../../Action/data/Action";
import { ActionRepository } from "../../Action/data/ActionRepository";
import { Effect } from "../../Effect/data/Effect";
import { EffectRepository } from "../../Effect/data/EffectRepository";
import { Entity } from "../../Game/data/Entity";
import { Game } from "../../Game/data/Game";
import { ActionAnimationService } from "../../Player/services/ActionAnimationService";
import { AttackService } from "../../Player/services/AttackService";
import { AttackTarget } from "../../Player/services/PlayerActionService";
import { GameEvent, GameEventType } from "../data/GameEvent";
import { PassiveContext } from "../data/Passive";
import { PASSIVES } from "../PassiveRegistry";


export class PassiveService implements AsyncResolver {
    private static readonly MAX_DEPTH = 3;

    @Provide("Logger")
    private readonly logger!: Logger;
    @Provide(ActionRepository)
    private readonly actionRepository!: ColdRessource<Action>;
    @Provide(EffectRepository)
    private readonly effectRepository!: ColdRessource<Effect>;
    @Provide(ActionAnimationService)
    private readonly animationService!: ActionAnimationService;

    private attackService!: AttackService;

    asyncResolve(resolver: AsyncDependencyResolver): void {
        this.attackService = resolver.getProvider(AttackService);
    }

    async dispatch(game: Game, event: GameEvent, depth = 0): Promise<void> {
        if (depth > PassiveService.MAX_DEPTH) {
            this.logger.error(`Passive depth limit reached on ${event.type}`);
            return;
        }

        const baseActions = await this.actionRepository.list();

        if ((baseActions instanceof DBError)) {
                return; // attention pas d'erreur affichée
            }

        for (const owner of [...game.entities]) {
            if (owner.dead) continue;

            for (const passiveId of owner.passives ?? []) {
                const definition = PASSIVES.get(passiveId);
                if (!definition) continue;
                if (!definition.triggers.includes(event.type)) continue;
                if (event.origin === "passive" && !definition.reactsToPassive) {
                    continue;
                }

                await definition.run(
                    this.buildContext(game, owner, event, baseActions, depth),
                );
            }
        }
    }

    private buildContext(
        game: Game,
        owner: Entity,
        event: GameEvent,
        baseActions: Action[],
        depth: number,
    ): PassiveContext {
        return {
            game,
            owner,
            event,
            baseActions,

            getCellsInRange: (start, action, board) =>
                this.attackService.getCellsInAttackRange(start, action, board),

            castFree: (caster, action, targets, reduction) =>
                this.castFree(game, caster, action, targets, depth, reduction),

            applyEffects: (caster, hitTarget, effects) =>
                this.attackService.applyManagedEffects(
                    game,
                    caster,
                    hitTarget,
                    effects,
                    true,
                ),

            getEffect: async (id) => {
                const effect = await this.effectRepository.get(id);
                if (!effect || effect instanceof DBError) {
                    this.logger.error(`Unknown effect ${id}`);
                    return undefined;
                }
                return effect;
            },
            changeLife: (entity, delta, sourceId) =>
                this.changeLife(game, entity, delta, sourceId, "passive", depth + 1)
        };
    }

    private async castFree(
        game: Game,
        caster: Entity,
        action: Action,
        targets: Entity[],
        depth: number,
        reduction?: number
    ): Promise<void> {
        if (targets.length === 0) return;

        const casterPreviousLife = caster.stats.life;

        const attackTargets: AttackTarget[] = targets.map((entity) => {
            const previousLife = entity.stats.life; // avant applyDamage
            const { damage, isCritical } = this.attackService.applyDamage(
                game,
                action,
                caster,
                entity,
                reduction
            );
            return { entity, damage, isCritical, previousLife, effects: [] };
        });

        // effets de l'action (cible, chance, onHit)
        this.attackService.applyManagedEffects(
            game,
            caster,
            targets[0],
            action.effectList ?? [],
            true,
        );
        for (const t of attackTargets) {
            if (t.damage !== 0) {
                await this.dispatch(
                    game,
                    {
                        type: GameEventType.DAMAGE_DEALT,
                        origin: "passive",
                        sourceId: caster.id,
                        targetId: t.entity.id,
                        actionId: action.id,
                        damage: t.damage,
                        isCritical: t.isCritical ?? false,
                    },
                    depth + 1,
                );
            }
            if (t.entity.stats.life !== t.previousLife) {
                await this.dispatch(
                    game,
                    {
                        type: GameEventType.HP_CHANGED,
                        origin: "passive",
                        entityId: t.entity.id,
                        previous: t.previousLife,
                        current: t.entity.stats.life,
                    },
                    depth + 1,
                );
            }
        }
        if (caster.stats.life !== casterPreviousLife) {
            await this.dispatch(
                game,
                {
                    type: GameEventType.HP_CHANGED,
                    origin: "passive",
                    entityId: caster.id,
                    previous: casterPreviousLife,
                    current: caster.stats.life,
                },
                depth + 1,
            );
        }

        const firstCell = game.plateau[targets[0].position.x][targets[0].position.y];
        await this.animationService.animate(game, caster, action, firstCell, attackTargets);
    }

   async changeLife(
        game: Game,
        entity: Entity,
        delta: number,
        sourceId?: string,
        origin: "player" | "passive" = "player",
        depth = 0,
    ): Promise<void> {
        const previous = entity.stats.life;
        const current = Math.min(entity.stats.maxLife, Math.max(0, previous + delta));
        if (current === previous) return;

        entity.stats.life = current;
        if (delta < 0 && sourceId && sourceId !== entity.id) {
            entity.lastDamagedBy = sourceId;
        }

        await this.dispatch(
            game,
            {
                type: GameEventType.HP_CHANGED,
                origin,
                entityId: entity.id,
                previous,
                current,
            },
            depth,
        );
    }
}