import { Logger, Provide, Ran } from "../../../core";
import {
    AsyncDependencyResolver,
    AsyncResolver,
} from "../../../core/app/Controller/DependencyResolver";
import { Position, PositionUtils } from "../../../game-lib";
import { Action } from "../../Action/data/Action";
import { CharacterClass } from "../../CharacterClass/data/CharacterClass";
import { CharacterClassRepository } from "../../CharacterClass/data/CharacterClassRepository";
import { GameEventAnimation } from "../../Game/application/interfaces/GameUpdateEvent";
import { Entity } from "../../Game/data/Entity";
import { CellAStar, Game } from "../../Game/data/Game";
import { GameDataManager } from "../../Game/data/GameRepository";
import { GameTurnService } from "../../Game/services/GameTurnService";
import { GameWebSocketManager } from "../../Game/web/GameWebSocketManager";
import { Stats } from "../../Stat/data/Stats";

export class MobService implements AsyncResolver {
    @Provide(GameDataManager)
    private readonly gameDataManager!: GameDataManager;
    @Provide("Logger")
    private readonly logger!: Logger;
    @Provide(GameWebSocketManager)
    private readonly socketManager!: GameWebSocketManager;
    @Provide(CharacterClassRepository)
    private readonly classRepository!: CharacterClassRepository;

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
            (entity) => entity.entityId === game.playerTurns[0]
        )!;
        //const mob = game.npc.find((mob) => mob.entityId === entity.entityId)!;
        const charClass = await this.classRepository.get(entity.classId);
        if (!charClass) {
            return;
        }
        const stats = Stats.fromEntity(entity);
        let lastPA = stats.energy;
        let lastPM = stats.mouvement;
        let PA = stats.energy;
        let PM = stats.mouvement;
        let firstTry = true;
        while (firstTry || PM !== lastPM || PA !== lastPA) {
            const animations: GameEventAnimation[] = [];
            firstTry = false;
            lastPA = PA;
            lastPM = PM;

            const nearestPlayer = this.getNearestPlayer(game, entity);
            let playerRange = this.getDistance(entity, nearestPlayer);

            const action = this.getAttack(charClass, playerRange, PA);
            if (PA) {
                if (action) {
                    // do damages
                    const damage = action.damage
                        ? action.damage.min +
                          Ran.int(action.damage.max - action.damage.min)
                        : 0;
                    nearestPlayer.stats.life -= damage; //TODO: apply defense and dodge
                    //TODO: do zone damages
                    // remove energy points
                    PA -= action.cost;
                    animations.push({
                        key: "attack",
                        data: {
                            entityId: entity.entityId,
                            actionId: action.id,
                            origin: entity.position,
                            target: nearestPlayer.position,
                            hits: [nearestPlayer.position],
                        },
                    });
                    animations.push(
                        ...this.gameTurnService.detectEntityDeath(game)
                    );
                }
            }
            if (PM) {
                if (!action) {
                    while (playerRange > 0 && PM > 0) {
                        playerRange = this.getDistance(entity, nearestPlayer);

                        const moves = new CellAStar().findPath(
                            entity.position,
                            nearestPlayer.position,
                            game.plateau
                        );
                        const originalPosition = { ...entity.position };
                        const movePath: Position[] = [{ ...entity.position }];
                        while (PM > 0 && moves.length > 1) {
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
                            ].entityId = entity.entityId;
                            PM--;
                            moves.shift();
                        }
                        if (
                            !PositionUtils.equal(
                                originalPosition,
                                entity.position
                            )
                        ) {
                            animations.push({
                                key: "move",
                                data: {
                                    entityId: entity.entityId,
                                    path: movePath,
                                },
                            });
                        }
                    }
                }
            }
            // Update users display
            await this.gameDataManager.set(game.id, game);
            await this.socketManager.emitUpdate(game, animations);
            if (await this.gameTurnService.detectGameEnd(game)) {
                return;
            }
        }
    }

    private getDistance(entityA: Entity, entityB: Entity): number {
        return PositionUtils.distance(entityA.position, entityB.position);
    }

    private getAttack(
        charClass: CharacterClass,
        minRange: number,
        energy: number
    ): Action | undefined {
        //TODO: apply transformer on damages based on target and action launcher
        const mostPowerfulInRangeAction = charClass.actionList
            .filter(
                (action) =>
                    action.range >= minRange &&
                    action.cost <= energy &&
                    (action.damage?.max ?? 0) > 0
            )
            .sort((actionA, actionB) => {
                const midDamageA = actionA.damage
                    ? (actionA.damage.max - actionA.damage.min) / 2 +
                      actionA.damage.min
                    : 0;
                const midDamageB = actionB.damage
                    ? (actionB.damage.max - actionB.damage.min) / 2 +
                      actionB.damage.min
                    : 0;
                return midDamageA > midDamageB ? 1 : -1;
            })?.[0];
        return mostPowerfulInRangeAction;
    }

    private getNearestPlayer(game: Game, mob: Entity): Entity {
        const entitiesRange: Record<string, number> = {};
        for (const entity of game.entities.filter(
            (entity) => entity.side === "player" && !entity.dead
        )) {
            entitiesRange[entity.entityId] = this.getDistance(mob, entity);
        }

        const targetEntityId = Object.entries(entitiesRange).sort(
            ([, aRange], [, bRange]) => (aRange > bRange ? -1 : 1)
        )?.[0]?.[0];

        return game.entities.find(
            (entity) => entity.entityId === targetEntityId
        )!;
    }
}
