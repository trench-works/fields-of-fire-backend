import { AccessRefused, NotFoundError } from "../../../core";
import { Provide } from "../../../core/decorators/Provide";
import { Game } from "../data/Game";
import { GameDataManager } from "../data/GameDataManager";

export class GameService {
    constructor(
        @Provide(GameDataManager)
        private readonly gameDataManager: GameDataManager
    ) {}

    subscribe(
        userId: string,
        gameId: string
    ): NotFoundError | AccessRefused | Game {
        const game = this.gameDataManager.getGame(gameId);
        if (!game) {
            return new NotFoundError();
        }
        if (game.players.some((player) => player.userId === userId)) {
            return game;
        }
        return new AccessRefused();
    }
}
