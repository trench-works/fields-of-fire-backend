import { GameDataManager } from "../../Game/data/GameRepository";
import { NotFoundError, Provide } from "../../../core";
import { LobbyDataManager } from "../data/LobbyDataManager";
import { Lobby } from "../data/Lobby";

export class LobbyService {
    constructor(
        @Provide(LobbyDataManager)
        private readonly lobbyDataManager: LobbyDataManager,
        @Provide(GameDataManager)
        private readonly gameDataManager: GameDataManager
    ) {}

    async createLobby(userId: string) {
        const lobby = await this.lobbyDataManager.addLobby({
            creatorId: userId,
        });
        this.lobbyDataManager.addPlayerToLobby(lobby.id, userId);
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

    async joinLobby(lobbyId: string, userId: string) {
        const lobby = await this.lobbyDataManager.addPlayerToLobby(
            lobbyId,
            userId
        );
        return lobby;
    }
}
