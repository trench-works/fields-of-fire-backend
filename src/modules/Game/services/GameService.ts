import { AccessRefused, NotFoundError } from "../../../core";
import { Provide } from "../../../core/decorators/Provide";
import { Player } from "../../Player/data/Player";
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
    ): NotFoundError | AccessRefused | { game: Game; player: Player } {
        const game = this.gameDataManager.getGame(gameId);
        if (!game) {
            return new NotFoundError();
        }
        const player = game.players.find((player) => player.userId === userId);
        if (player) {
            return { game, player };
        }
        return new AccessRefused();
    }
}
