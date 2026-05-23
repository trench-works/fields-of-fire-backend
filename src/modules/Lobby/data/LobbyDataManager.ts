import { MappedRepository, NotFoundError } from "../../../core";
import { Lobby } from "./Lobby";
import { v4 as uuidv4 } from "uuid";

export class LobbyDataManager extends MappedRepository<Lobby> {
    async getLobby(lobbyId: string): Promise<Lobby | NotFoundError> {
        const lobby = await this.get(lobbyId);
        if (!lobby) {
            return new NotFoundError();
        }
        return lobby;
    }

    async addLobby(lobby: Omit<Lobby, "id" | "players">): Promise<Lobby> {
        const lobbyId = uuidv4();
        return await this.set(lobbyId, { ...lobby, id: lobbyId, players: [] });
    }

    async addPlayerToLobby(
        lobbyId: string,
        userId: string
    ): Promise<NotFoundError | Lobby> {
        const lobby = await this.get(lobbyId);
        if (!lobby) {
            return new NotFoundError();
        }
        lobby.players.push({
            userId,
            playerId: uuidv4(),
            classId: "entente_fantassin",
        });
        return lobby;
    }
}
