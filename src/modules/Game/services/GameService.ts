import {
    AccessRefused,
    NotFoundError,
    Provide,
    SocketError,
} from "../../../core";
import { DBError } from "../../../core/app/Database/errors/DBError";
import { Player } from "../../Player/data/Player";
import { Game } from "../data/Game";
import { GameRepository } from "../data/GameRepository";

export class GameService {
    constructor(
        @Provide(GameRepository)
        private readonly gameDataManager: GameRepository
    ) {}

    async subscribe(
        userId: string,
        gameId: string
    ): Promise<SocketError | { game: Game; player: Player }> {
        const game = await this.gameDataManager.get(gameId);
        if (!game || game instanceof DBError) {
            return new NotFoundError();
        }
        const player = game.players.find((player) => player.userId === userId);
        if (player) {
            return { game, player };
        }
        return new AccessRefused();
    }
}
