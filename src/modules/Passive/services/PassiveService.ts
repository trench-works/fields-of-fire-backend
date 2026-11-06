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

    // résolu en différé : AttackService appellera lui-même PassiveService (cycle)
    private attackService!: AttackService;

    asyncResolve(resolver: AsyncDependencyResolver): void {
        this.attackService = resolver.getProvider(AttackService);
    }

    /** Point d'entrée unique : annonce un événement à tous les porteurs de passifs. */
    async dispatch(game: Game, event: GameEvent, depth = 0): Promise<void> {
        if (depth > PassiveService.MAX_DEPTH) {
            this.logger.error(`Passive depth limit reached on ${event.type}`);
            return;
        }

        const baseActions = await this.actionRepository.list();

        if ((baseActions instanceof DBError)) {
                return; // attention pas d'erreur affichée
            }

        // copie : un passif peut modifier game.entities pendant la boucle
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

            castFree: (caster, action, targets) =>
                this.castFree(game, caster, action, targets, depth),

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
        };
    }

    private async castFree(
        game: Game,
        caster: Entity,
        action: Action,
        targets: Entity[],
        depth: number,
    ): Promise<void> {
        if (targets.length === 0) return;

        const attackTargets: AttackTarget[] = targets.map((entity) => {
            const { damage, isCritical } = this.attackService.applyDamage(
                game,
                action,
                caster,
                entity,
            );
            return { entity, damage, isCritical, effects: [] };
        });

        const firstCell = game.plateau[targets[0].position.x][targets[0].position.y];
        await this.animationService.animate(
            game,
            caster,
            action,
            firstCell,
            attackTargets,
        );

        // les passifs peuvent réagir, mais avec origin "passive" et une profondeur +1
        for (const { entity, damage, isCritical } of attackTargets) {
            await this.dispatch(
                game,
                {
                    type: GameEventType.DAMAGE_DEALT,
                    origin: "passive",
                    sourceId: caster.id,
                    targetId: entity.id,
                    actionId: action.id,
                    damage,
                    isCritical,
                },
                depth + 1,
            );
        }
    }
}