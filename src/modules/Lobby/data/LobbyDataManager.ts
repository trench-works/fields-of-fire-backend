import { Id, NotFoundError, Provide } from "../../../core";
import {
    RedisConnector,
    RedisRepository,
} from "../../../core/app/Database/Redis";
import { Lobby } from "./Lobby";

export class LobbyDataManager extends RedisRepository<Lobby> {
    constructor(
        @Provide(RedisConnector)
        connector: RedisConnector
    ) {
        super("lobbies", connector);
    }

    async getLobby(lobbyId: string): Promise<Lobby | NotFoundError> {
        const lobby = await this.get(lobbyId);
        if (!lobby) {
            return new NotFoundError();
        }
        return lobby;
    }

    async addLobby(lobby: Omit<Lobby, "id" | "teams">): Promise<Lobby | null> {
        const lobbyId = Id.get();
        return await this.set(lobbyId, { ...lobby, id: lobbyId, teams: [] });
    }
}
