import { Provide } from "../../../core";
import {
    AsyncDependencyResolver,
    AsyncResolver,
} from "../../../core/app/Controller/DependencyResolver";
import { CharacterClassRepository } from "../../CharacterClass/data/CharacterClassRepository";
import { Boost } from "../../Effect/data/Boost";
import { BoostService } from "../../Player/services/BoostService";
import { MobService } from "../../Player/services/MobService";
import { Stats } from "../../Stat/data/Stats";
import { GameEventAnimation } from "../application/interfaces/GameUpdateEvent";
import { Game } from "../data/Game";
import { GameDataManager } from "../data/GameRepository";
import { GameWebSocketManager } from "../web/GameWebSocketManager";
import { GameService } from "./GameService";

export class GameTurnService implements AsyncResolver {
    @Provide(GameDataManager)
    private readonly gameDataManager!: GameDataManager;
    @Provide(CharacterClassRepository)
    private readonly classRepository!: CharacterClassRepository;
    @Provide(GameWebSocketManager)
    private readonly socketManager!: GameWebSocketManager;
    @Provide(GameService)
    private readonly gameService!: GameService;
    @Provide(BoostService)
    private readonly boostService!: BoostService;

    private mobService!: MobService;

    asyncResolve(resolver: AsyncDependencyResolver): void {
        this.mobService = resolver.getProvider(MobService);
    }

    public detectEntityDeath(game: Game): GameEventAnimation[] {
        const animations: GameEventAnimation[] = [];
        if (game.entities) {
            for (const entity of game.entities) {
                if (Stats.fromEntity(entity).life <= 0 && !entity.dead) {
                    entity.dead = true;
                    game.playerTurns = game.playerTurns.filter(
                        (entityId) => entityId !== entity.entityId
                    );
                    game.plateau[entity.position.x][
                        entity.position.y
                    ].entityId = undefined;
                    animations.push({
                        key: "death",
                        data: {
                            entityId: entity.entityId,
                        },
                    });
                }
            }
        }
        return animations;
    }

    public async detectGameEnd(game: Game): Promise<boolean> {
        const alivePlayersCount = game.entities.filter(
            (entity) => entity.side === "player" && !entity.dead
        ).length;
        const aliveMobsCount = game.entities.filter(
            (entity) => entity.side === "mob" && !entity.dead
        ).length;
        if (alivePlayersCount === 0 || aliveMobsCount === 0) {
            const boostArray: Boost[][] = [];
            for (const player of game.players) {
                const entity = game.entities.find(
                    (entity) => entity.entityId === player.entityId
                )!;
                if (entity.dead) {
                    entity.dead = false;
                    entity.stats.life = entity.stats.maxLife;
                    boostArray.push([]);
                } else {
                    const boosts =
                        await this.boostService.getPlayerBoostSelection();
                    boostArray.push(boosts);
                }
            }
            game.isStopped = true;
            await this.socketManager.emitGameEnd(game.id, (i) => ({
                playerWin: aliveMobsCount === 0,
                boosts: boostArray[i],
            }));
            await this.gameDataManager.set(game.id, game);
            return true;
        }
        return false;
    }

    async finishTurn(gameId: string) {
        //this.turnTimeoutRepository.clearTimeout(gameId);
        const game = await this.gameDataManager.get(gameId);
        if (!game || game.isStopped) {
            return;
        }
        this.detectEntityDeath(game);
        if (await this.detectGameEnd(game)) {
            return;
        }
        // Do turn change mechanic
        const playingEntityId = game.playerTurns.shift()!;
        game.playerTurns.push(playingEntityId);
        const playerEntity = game.entities.find(
            (entity) => entity.entityId === playingEntityId
        )!;
        const entityClass = (await this.classRepository.get(
            playerEntity.classId
        ))!;
        playerEntity.effects = playerEntity.effects
            .map((effect) => ({
                ...effect,
                duration: effect.duration
                    ? effect.duration - 1
                    : effect.duration,
            }))
            .filter(
                (effect) => effect.duration === null || effect.duration > 0
            );
        playerEntity.stats.energy = entityClass.stats.energy;
        playerEntity.stats.mouvement = entityClass.stats.mouvement;

        this.gameDataManager.set(game.id, game);

        // If new playing entity is a mob, then launch playing actions for the mob
        const newPlayingMob = game.npc.find(
            (mob) => mob.entityId === game.playerTurns[0]
        );

        await this.socketManager.emitUpdate(game, []);
        if (newPlayingMob) {
            this.mobService.play(gameId);
        } else {
            // this.turnTimeoutRepository.newTimeout(gameId, () => //FIXME: player turn timeout system is shitty and creating issues
            //     this.finishTurn(game.id)
            // );
        }
    }
}
