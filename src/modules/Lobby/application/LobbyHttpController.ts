import {
    DBError,
    HttpController,
    HttpError,
    Provide,
    UnknownError,
} from "../../../core";
import { Lobby } from "../data/Lobby";
import { LobbyDataManager } from "../data/LobbyDataManager";

export class LobbyHttpController extends HttpController {
    constructor(
        @Provide(LobbyDataManager)
        private readonly repository: LobbyDataManager
    ) {
        super();
        this.get("/lobbies", this.getLobbies.bind(this));
    }

    async getLobbies(): Promise<Lobby[] | HttpError> {
        const data = await this.repository.getAll();
        if (data instanceof DBError) {
            return new UnknownError();
        }
        return data;
    }
}
