import { Logger, Provide } from "../../../core";
import {
    AsyncDependencyResolver,
    AsyncResolver,
} from "../../../core/app/Controller/DependencyResolver";
import { Position, PositionUtils } from "../../../game-lib";
import { Action, ActionType } from "../../Action/data/Action";
import { CharacterClassRepository } from "../../CharacterClass/data/CharacterClassRepository";
import { GameEventAnimation } from "../../Game/application/interfaces/GameUpdateEvent";
import { Entity } from "../../Game/data/Entity";
import { Cell, CellAStar, Game } from "../../Game/data/Game";
import { GameDataManager } from "../../Game/data/GameRepository";
import { GameTurnService } from "../../Game/services/GameTurnService";
import { GameWebSocketManager } from "../../Game/web/GameWebSocketManager";
import { GameEventType } from "../../Passive/data/GameEvent";
import { PassiveService } from "../../Passive/services/PassiveService";
import { ActionEvaluator } from "../utils/ActionEvaluator";
import { AttackService } from "./AttackService";
import { MoveService } from "./MoveService";
import { AttackTarget } from "./PlayerActionService";

export class MobService implements AsyncResolver {
    @Provide(GameDataManager)
    private readonly gameDataManager!: GameDataManager;
    @Provide("Logger")
    private readonly logger!: Logger;
    @Provide(GameWebSocketManager)
    private readonly socketManager!: GameWebSocketManager;
    @Provide(CharacterClassRepository)
    private readonly classRepository!: CharacterClassRepository;
    @Provide(AttackService)
    private readonly attackService!: AttackService;
    @Provide(MoveService)
    private readonly moveService!: MoveService;
    @Provide(PassiveService)
    private readonly passiveService!: PassiveService; 

    private gameTurnService!: GameTurnService;

    asyncResolve(resolver: AsyncDependencyResolver): void {
        this.gameTurnService = resolver.getProvider(GameTurnService);
    }

    async play(gameId: string) {
        const game = await this.gameDataManager.get(gameId);
        if (!game) {
            return;
        }

        await this.mobAction(game);

        // Finish this turn
        this.gameTurnService.finishTurn(game.id);
    }

    private async mobAction(game: Game) {
        const entity = game.entities.find(
            (entity) => entity.id === game.playerTurns[0]
        )!;
        //const mob = game.npc.find((mob) => mob.entityId === entity.entityId)!;
        const charClass = await this.classRepository.get(entity.classId);
        if (!charClass) {
            return;
        }
        let didAction = true;
        while (didAction) {
            const animations: GameEventAnimation[] = [];
            didAction = false;

            const evaluator = new ActionEvaluator(
                entity,
                charClass.actionList,
                game,
                this.attackService,
                this.moveService
            ).evaluate();
            // evaluator.evaluations.forEach((evaluation) =>
            //     console.log(
            //         `${evaluation.evaluated.action.id} : ${JSON.stringify(evaluation.evaluated.position)} : ${evaluation.note}`
            //     )
            // );

            const action = evaluator.getBest();
            if (action) {
                if (
                    action.action.actionType === ActionType.MOUVEMENT &&
                    !PositionUtils.equal(entity.position, action.position)
                ) {
                    didAction = true;
                    const moves = new CellAStar().findPath(
                        entity.position,
                        action.position,
                        game.plateau
                    );
                    const originalPosition = { ...entity.position };
                    const movePath: Position[] = [{ ...entity.position }];
                    while (entity.stats.mouvement > 0 && moves.length > 0) {
                        game.plateau[entity.position.x][
                            entity.position.y
                        ].entityId = undefined;
                        entity.position = PositionUtils.add(
                            entity.position,
                            moves[0]
                        );
                        await this.emitMoved(game,entity, originalPosition, "walk")
                        movePath.push({ ...entity.position });
                        game.plateau[entity.position.x][
                            entity.position.y
                        ].entityId = entity.id;
                        entity.stats.mouvement--;
                        moves.shift();
                    }
                    if (
                        !PositionUtils.equal(originalPosition, entity.position)
                    ) {
                        animations.push({
                            key: "move",
                            data: {
                                entityId: entity.id,
                                path: movePath,
                            },
                        });
                    }
                } else {
                    didAction = true;
                    entity.stats.energy -= action.action.cost;
                    const hits: (Position & {
                        damage: number;
                        isCritical: boolean;
                    })[] = [];
                    const attackTargets : AttackTarget[] = []
                    if (action?.targets) {
                        for (const target of action?.targets ?? []) {
                            const previousLife = target.stats.life;
                            const result = this.attackService.applyDamage(
                                game,
                                action.action,
                                entity,
                                target
                            );
                            const attackTarget : AttackTarget = {
                                entity : target,
                                damage : result.damage,
                                previousLife: previousLife,
                                effects : action.action.effectList ?? [],
                                isCritical : result.isCritical
                            }
                            attackTargets.push(attackTarget);
                            hits.push({ ...action.position, damage: result.damage, isCritical: result.isCritical});
                        }
                    }
                    const targetedCell : Cell = game.plateau[action.position.x][action.position.y]

                    this.emitAttackEvents(game, entity, action.action, targetedCell, attackTargets, entity.stats.life)
                    animations.push({
                        key: "attack",
                        data: {
                            entityId: entity.id,
                            actionId: action.action.id,
                            origin: entity.position,
                            target: action.position,
                            hits,
                        },
                    });
                    animations.push(
                        ...await this.gameTurnService.detectEntityDeath(game)
                    );
                }
            }

            // Update users display
            await this.socketManager.emitUpdate(game, animations);
            if (await this.gameTurnService.detectGameEnd(game)) {
                return;
            }
            await this.gameDataManager.set(game.id, game);
        }
    }

    private getDistance(entityA: Entity, entityB: Entity): number {
        return PositionUtils.distance(entityA.position, entityB.position);
    }

    private getNearestPlayer(game: Game, mob: Entity): Entity {
        const entitiesRange: Record<string, number> = {};
        for (const entity of game.entities.filter(
            (entity) => entity.teamId !== mob.teamId && !entity.dead
        )) {
            entitiesRange[entity.id] = this.getDistance(mob, entity);
        }

        const targetEntityId = Object.entries(entitiesRange).sort(
            ([, aRange], [, bRange]) => (aRange > bRange ? 1 : -1)
        )?.[0]?.[0];

        return game.entities.find((entity) => entity.id === targetEntityId)!;
    }

    //Duplicate Code with PlayerService !!!
    private async emitAttackEvents(
            game: Game,
            caster: Entity,
            action: Action,
            destination: Cell,
            targets: AttackTarget[],
            casterPreviousLife: number,
        ): Promise<void> {
            await this.passiveService.dispatch(game, {
                type: GameEventType.ACTION_USED,
                origin: "player",
                sourceId: caster.id,
                actionId: action.id,
                targetPosition: destination.position,
                targetIds: targets.map((t) => t.entity.id),
            });
    
            for (const { entity, damage, isCritical } of targets) {
                await this.passiveService.dispatch(game, {
                    type: GameEventType.DAMAGE_DEALT,
                    origin: "player",
                    sourceId: caster.id,
                    targetId: entity.id,
                    actionId: action.id,
                    damage,
                    isCritical,
                });
            }
    
            for (const t of targets) {
                if (t.entity.stats.life !== t.previousLife) {
                    await this.passiveService.dispatch(game, {
                        type: GameEventType.HP_CHANGED,
                        origin: "player",
                        entityId: t.entity.id,
                        previous: t.previousLife,
                        current: t.entity.stats.life,
                    });
                }
            }
            if (caster.stats.life !== casterPreviousLife) {
                await this.passiveService.dispatch(game, {
                    type: GameEventType.HP_CHANGED,
                    origin: "player",
                    entityId: caster.id,
                    previous: casterPreviousLife,
                    current: caster.stats.life,
                });
            }
        }
    
        private async emitMoved(
            game: Game,
            entity: Entity,
            from: Position,
            cause: "walk" | "push" | "dash",
            movedById?: string,
        ): Promise<void> {
            if (from.x === entity.position.x && from.y === entity.position.y) return;
    
            await this.passiveService.dispatch(game, {
                type: GameEventType.ENTITY_MOVED,
                origin: "player",
                entityId: entity.id,
                from,
                to: { ...entity.position },
                cause,
                movedById,
            });
        }
}
