import { Provide } from "../../../core";
import { GameDataManager } from "../../Game/data/GameRepository";
import { GameService } from "../../Game/services/GameService";
import { LobbyService } from "../../Lobby/services/LobbyService";
import { BoostService } from "./BoostService";

export class PlayerService {
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
        await this.boostService.applyBoost(entity, boostId);
        game.readyPlayers.push(playerId);
        await this.gameDataManager.set(gameId, game);

        if (game.players.length === game.readyPlayers.length) {
            this.gameService.newGameFromGame(game.id);
        }
    }
}
