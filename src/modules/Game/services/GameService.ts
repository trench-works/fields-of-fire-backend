import {
    AccessRefused,
    NotFoundError,
    Provide,
    SocketError,
} from "../../../core";
import { DBError } from "../../../core/app/Database/errors/DBError";
import { HotRessource } from "../../../core/app/Database/HotDB";
import { Player } from "../../Player/data/Player";
import { Game } from "../data/Game";
import { GameRepository } from "../data/GameRepository";

export class GameService {
    constructor(
        @Provide(GameRepository)
        private readonly gameDataManager: HotRessource<Game>
    ) {}

    async subscribe(
        userId: string,
        gameId: string
    ): Promise<SocketError | { game: Game; player: Player }> {
        let game = await this.gameDataManager.get(gameId);
        if (!game) {
            const newGame: Game = {
                id: "3630",
                creatorId: "dev",
                players: [
                    {
                        id: "arthurchar",
                        userId: "dev",
                        characterClass: {},
                        stats: {
                            speed: 10,
                            hp: 200,
                        },
                        position: {
                            x: 2,
                            y: 2,
                        },
                        modifier: [],
                    },
                ],
            };
            await this.gameDataManager.set(gameId, newGame);
            game = newGame;
        }
        if ( game instanceof DBError) {
            return new NotFoundError();
        }
        const player = game.players.find((player) => player.userId === userId);
        if (player) {
            return { game, player };
        }
        return new AccessRefused();
    }
}
