import { Provide } from "../../../core";
import {
    AsyncDependencyResolver,
    AsyncResolver,
} from "../../../core/app/Controller/DependencyResolver";
import { Boost } from "../../Effect/data/Boost";
import { BoostService } from "../../Player/services/BoostService";
import { MobService } from "../../Player/services/MobService";
import { PlayerWebSocketManager } from "../../Player/web/PlayerWebSocketManager";
import { Stats } from "../../Stat/data/Stats";
import { GameEventAnimation } from "../application/interfaces/GameUpdateEvent";
import { EntityType } from "../data/Entity";
import { Game } from "../data/Game";
import { GameDataManager } from "../data/GameRepository";
import { TeamName } from "../data/Team";
import { GameWebSocketManager } from "../web/GameWebSocketManager";

export class GameTurnService implements AsyncResolver {
    @Provide(GameDataManager)
    private readonly gameDataManager!: GameDataManager;
    @Provide(GameWebSocketManager)
    private readonly socketManager!: GameWebSocketManager;
    @Provide(PlayerWebSocketManager)
    private readonly playerSocketManager!: PlayerWebSocketManager;
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
                if (entity.stats.life <= 0 && !entity.dead) {
                    entity.dead = true;
                    game.playerTurns = game.playerTurns.filter(
                        (entityId) => entityId !== entity.id
                    );
                    game.plateau[entity.position.x][
                        entity.position.y
                    ].entityId = undefined;
                    animations.push({
                        key: "death",
                        data: {
                            entityId: entity.id,
                        },
                    });
                }
            }
        }
        return animations;
    }

    public async detectGameEnd(game: Game): Promise<boolean> {
        const aliveTeams = game.teams.filter((team) =>
            team.entitiesIds.some(
                (entityId) =>
                    game.entities.find((entity) => entity.id === entityId)!
                        .dead === false
            )
        );
        if (aliveTeams.length <= 1) {
            const boostMap: Map<string, Boost[]> = new Map();
            for (const player of game.players) {
                const entity = game.entities.find(
                    (entity) => entity.id === player.entityId
                )!;
                if (entity.dead) {
                    entity.dead = false;
                    entity.stats.life = entity.stats.maxLife;
                    boostMap.set(player.id, []);
                } else {
                    const boosts =
                        await this.boostService.getPlayerBoostSelection();
                    boostMap.set(player.id, boosts);
                    player.randomBoost = boosts;
                }
            }
            const playerWin = aliveTeams?.[0]?.name === TeamName.PLAYERS;
            game.isStopped = true;
            game.playerWin = playerWin;
            await this.gameDataManager.set(game.id, game);
            await this.playerSocketManager.emitGameEnd(game.id, (playerId) => ({
                playerWin: playerWin,
                boosts: boostMap.get(playerId) ?? [],
            }));

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
            (entity) => entity.id === playingEntityId
        )!;
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

        playerEntity.stats.mouvement =
            Stats.fromEntity(playerEntity).totalMouvement;
        playerEntity.stats.energy = Stats.fromEntity(playerEntity).totalEnergy;

        await this.gameDataManager.set(game.id, game);

        // If new playing entity is a mob, then launch playing actions for the mob
        const newPlayingEntity = game.entities.find(
            (entity) => entity.id === game.playerTurns[0]
        )!;

        await this.socketManager.emitUpdate(game, []);
        if (newPlayingEntity?.type === EntityType.NPC) {
            this.mobService.play(gameId);
        } else {
            // this.turnTimeoutRepository.newTimeout(gameId, () => //FIXME: player turn timeout system is shitty and creating issues
            //     this.finishTurn(game.id)
            // );
        }
    }
}
