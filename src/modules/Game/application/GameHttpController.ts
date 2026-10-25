import { HttpController, HttpError, Provide } from "../../../core";
import { UserRepository } from "../../User/data/UserRepository";
import { GameDataManager } from "../data/GameRepository";
import { GameListResponse } from "./interfaces/GameListResponse";

export class GameHttpController extends HttpController {
    constructor(
        @Provide(GameDataManager)
        private readonly repository: GameDataManager,
        @Provide(UserRepository)
        private readonly userRepository: UserRepository
    ) {
        super();
        this.get("/games", this.getGames.bind(this));
    }

    async getGames({
        headers,
    }: {
        headers: Record<string, string>;
    }): Promise<GameListResponse[] | HttpError> {
        const data = await this.repository.findAll();

        const myGames = data.filter((game) =>
            game.players.some((player) => player.userId === headers["uuid"])
        );

        return myGames.map((game) => ({
            id: game.id,
            name: game.name,
            size: game.players.length,
        }));
    }
}
