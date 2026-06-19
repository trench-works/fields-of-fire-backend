import { Logger, Provide } from "../../../core";
import { GameDataManager } from "../../Game/data/GameRepository";
import { GameService } from "../../Game/services/GameService";
import { LobbyService } from "../../Lobby/services/LobbyService";
import { BoostService } from "./BoostService";

export class PlayerService {
    @Provide("Logger")
    private readonly logger!: Logger;
    @Provide(GameService) private readonly gameService!: GameService;
    @Provide(GameDataManager)
    private readonly gameDataManager!: GameDataManager;
    @Provide(LobbyService)
    private readonly lobbyService!: LobbyService;
    @Provide(BoostService)
    private readonly boostService!: BoostService;

    async setGamePlayerReady(
        playerId: string,
        gameId: string,
        boostId: string
    ) {
        this.logger.log(`Player ${playerId} chose boost ${boostId}`);
        const game = await this.gameDataManager.get(gameId);
        if (!game) {
            return;
        }
        if (game.readyPlayers.includes(playerId)) {
            return;
        }
        const player = game.players.find(
            (player) => player.playerId === playerId
        )!;
        const entity = game.entities.find(
            (entity) => entity.entityId === player.entityId
        )!;
        this.logger.debug(
            `Player ${playerId} has stats ${JSON.stringify(entity.stats)}`
        );
        await this.boostService.applyBoost(entity, boostId);

        this.logger.debug(
            `Player ${playerId} has stats ${JSON.stringify(entity.stats)} after booost`
        );
        game.readyPlayers.push(playerId);
        await this.gameDataManager.set(gameId, game);

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
            (player) => player.playerId === playerId
        );
        const [player] = game.players.splice(playerIndex, 1);
        const entityIndex = game.entities.findIndex(
            (entity) => entity.entityId === player.entityId
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
