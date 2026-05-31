import { Id, NotFoundError, Provide, SocketError } from "../../../core";
import { LobbyDataManager } from "../data/LobbyDataManager";
import { Lobby } from "../data/Lobby";

export class LobbyService {
    @Provide(LobbyDataManager)
    private readonly lobbyDataManager!: LobbyDataManager;

    async createLobby(userId: string) {
        const lobby = await this.lobbyDataManager.addLobby({
            creatorId: userId,
            maxPlayers: 4,
        });
        lobby.players.push({
            userId,
            playerId: Id.get(),
            classId: "entente_fantassin",
        });
        return lobby;
    }

    async removePlayer(
        lobbyId: string,
        userId: string
    ): Promise<Lobby | NotFoundError> {
        const lobby = await this.lobbyDataManager.getLobby(lobbyId);
        if (lobby instanceof NotFoundError) {
            return lobby;
        }
        lobby.players = lobby.players.filter(
            (player) => player.userId !== userId
        );
        return lobby;
    }

    async changeClass(
        lobbyId: string,
        userId: string,
        classId: string
    ): Promise<Lobby | NotFoundError> {
        const lobby = await this.lobbyDataManager.getLobby(lobbyId);
        if (lobby instanceof NotFoundError) {
            return lobby;
        }
        lobby.players.find((player) => player.userId === userId)!.classId =
            classId;
        return lobby;
    }

    async addPlayerToLobby(
        lobbyId: string,
        userId: string
    ): Promise<Lobby | SocketError> {
        const lobby = await this.lobbyDataManager.get(lobbyId);
        if (!lobby) {
            return new NotFoundError();
        }
        const currentPlayer = lobby.players.find(
            (player) => player.userId === userId
        );
        if (currentPlayer) {
            return lobby;
        }
        if (lobby.players.length === lobby.maxPlayers) {
            return new SocketError("Lobby is already full !");
        }
        lobby.players.push({
            userId,
            playerId: Id.get(),
            classId: "entente_fantassin",
        });
        return lobby;
    }
}
