import { Logger, Provide } from "../../../core";
import {
    AsyncDependencyResolver,
    AsyncResolver,
} from "../../../core/app/Controller/DependencyResolver";
import { Position, PositionUtils } from "../../../game-lib";
import { ActionType } from "../../Action/data/Action";
import { CharacterClassRepository } from "../../CharacterClass/data/CharacterClassRepository";
import { GameEventAnimation } from "../../Game/application/interfaces/GameUpdateEvent";
import { Entity } from "../../Game/data/Entity";
import { CellAStar, Game } from "../../Game/data/Game";
import { GameDataManager } from "../../Game/data/GameRepository";
import { GameTurnService } from "../../Game/services/GameTurnService";
import { GameWebSocketManager } from "../../Game/web/GameWebSocketManager";
import { ActionEvaluator } from "../utils/ActionEvaluator";
import { AttackService } from "./AttackService";
import { MoveService } from "./MoveService";

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
                    })[] = [];
                    if (action?.targets) {
                        for (const target of action?.targets ?? []) {
                            const damage = this.attackService.applyDamage(
                                game,
                                action.action,
                                entity,
                                target
                            );
                            hits.push({ ...action.position, damage });
                        }
                    }
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
                        ...this.gameTurnService.detectEntityDeath(game)
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
}
