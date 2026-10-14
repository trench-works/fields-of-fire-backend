import { Logger, Provide } from "../../../core";
import { GameDataManager } from "../../Game/data/GameRepository";
import { GameDataLocker } from "../../Game/services/GameDataLocker";
import { GameService } from "../../Game/services/GameService";
import { BoostService } from "./BoostService";

export class PlayerService {
    @Provide("Logger")
    private readonly logger!: Logger;
    @Provide(GameService)
    private readonly gameService!: GameService;
    @Provide(GameDataManager)
    private readonly gameDataManager!: GameDataManager;
    @Provide(BoostService)
    private readonly boostService!: BoostService;
    @Provide(GameDataLocker)
    private readonly gameDataLocker!: GameDataLocker;

    async setGamePlayerReady(
        playerId: string,
        gameId: string,
        boostId: string | null
    ) {
        await this.gameDataLocker.waitLock(gameId); //WAIT FOR DATA IS UNLOCK
        this.gameDataLocker.lock(gameId); //LOCK THE GAME ID

        const game = await this.gameDataManager.get(gameId);
        if (!game) {
            this.gameDataLocker.unlock(gameId); //UNLOCK THE GAME ID
            return;
        }
        if (game.readyPlayers.includes(playerId)) {
            this.gameDataLocker.unlock(gameId); //UNLOCK THE GAME ID
            return;
        }
        game.readyPlayers.push(playerId);

        if (boostId) {
            const player = game.players.find(
                (player) => player.id === playerId
            )!;
            const entity = game.entities.find(
                (entity) => entity.id === player.entityId
            )!;
            await this.boostService.applyBoost(entity, boostId);
        }

        await this.gameDataManager.set(gameId, game);

        this.gameDataLocker.unlock(gameId); //UNLOCK THE GAME ID
        if (game.players.length === game.readyPlayers.length) {
            this.gameService.newGameFromGame(game.id);
        }
    }

    async disconnect(gameId: string, playerId: string) {
        const game = await this.gameDataManager.get(gameId);
        if (!game) {
            return;
        }
        const playerIndex = game.players.findIndex(
            (player) => player.id === playerId
        );
        const [player] = game.players.splice(playerIndex, 1);
        const entityIndex = game.entities.findIndex(
            (entity) => entity.id === player.entityId
        );
        game.entities.splice(entityIndex, 1);
        game.playerTurns = game.playerTurns.filter(
            (player) => player !== playerId
        );
        game.readyPlayers = game.readyPlayers.filter(
            (player) => player !== playerId
        );
        //TODO: pousse au tour suivant si c'était le joueur actuel et que la game est toujours en cours
        //TODO: émettre un event update
        await this.gameDataManager.set(gameId, game);
    }
}
