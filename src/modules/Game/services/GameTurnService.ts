import { Provide } from "../../../core";
import {
    AsyncDependencyResolver,
    AsyncResolver,
} from "../../../core/app/Controller/DependencyResolver";
import { CharacterClassRepository } from "../../CharacterClass/data/CharacterClassRepository";
import { TurnTimeoutRepository } from "../../Player/data/TurnTimeoutRepository";
import { MobService } from "../../Player/services/MobService";
import { Stats } from "../../Stat/data/Stats";
import { Game } from "../data/Game";
import { GameDataManager } from "../data/GameRepository";
import { GameWebSocketManager } from "../web/GameWebSocketManager";

export class GameTurnService implements AsyncResolver {
    @Provide(GameDataManager)
    private readonly gameDataManager!: GameDataManager;
    @Provide(CharacterClassRepository)
    private readonly classRepository!: CharacterClassRepository;
    @Provide(GameWebSocketManager)
    private readonly socketManager!: GameWebSocketManager;
    @Provide(TurnTimeoutRepository)
    private readonly turnTimeoutRepository!: TurnTimeoutRepository;

    private mobService!: MobService;

    asyncResolve(resolver: AsyncDependencyResolver): void {
        this.mobService = resolver.getProvider(MobService);
    }

    private detectEntityDeath(game: Game) {
        for (const entity of game.entities) {
            if (Stats.fromEntity(entity).life <= 0) {
                entity.dead = true;
                game.playerTurns = game.playerTurns.filter(
                    (entityId) => entityId !== entity.entityId
                );
            }
        }
    }

    private detectGameEnd(game: Game): boolean {
        const alivePlayersCount = game.entities.filter(
            (entity) => entity.side === "player" && !entity.dead
        ).length;
        if (alivePlayersCount === 0) {
            //TODO: create new lobby, send game end event and destroy game
            return true;
        }
        return false;
    }

    async finishTurn(gameId: string) {
        this.turnTimeoutRepository.clearTimeout(gameId);
        const game = (await this.gameDataManager.get(gameId))!;

        this.detectEntityDeath(game);
        if (this.detectGameEnd(game)) {
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
        playerEntity.stats.energy = entityClass.stats.energy;
        playerEntity.stats.mouvement = entityClass.stats.mouvement;

        this.gameDataManager.set(game.id, game);

        // If new playing entity is a mob, then launch playing actions for the mob
        const newPlayingMob = game.npc.find(
            (mob) => mob.entityId === game.playerTurns[0]
        );

        this.socketManager.emitUpdate(game, []);
        if (newPlayingMob) {
            this.mobService.play(gameId);
        } else {
            this.turnTimeoutRepository.newTimeout(gameId, () =>
                this.finishTurn(game.id)
            );
        }
    }
}
