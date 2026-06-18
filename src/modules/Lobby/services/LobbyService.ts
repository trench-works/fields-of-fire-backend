import { Id, Logger, NotFoundError, Provide, SocketError } from "../../../core";
import { LobbyDataManager } from "../data/LobbyDataManager";
import { Lobby } from "../data/Lobby";
import { LobbyResponse } from "../../Menu/application/interfaces/UpdateLobbyListResponse";
import { MenuWebSocketManager } from "../../Menu/web/MenuWebSocketManager";
import { UserRepository } from "../../User/data/UserRepository";

export class LobbyService {
    @Provide(LobbyDataManager)
    private readonly lobbyDataManager!: LobbyDataManager;
    @Provide(MenuWebSocketManager)
    private readonly menuWebSocketManager!: MenuWebSocketManager;
    @Provide(UserRepository)
    private readonly userRepository!: UserRepository;
    @Provide("Logger")
    private readonly logger!: Logger;

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
        this.onLobbiesUpdate(lobby);
        return lobby;
    }

    async onLobbiesUpdate(lobby : Lobby) {
        await this.lobbyDataManager.set(lobby.id, lobby);
        this.menuWebSocketManager.emitLobbiesUpdate(await this.getLobbies());
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
        this.onLobbiesUpdate(lobby);
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
        await this.lobbyDataManager.set(lobbyId, lobby);
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
        this.onLobbiesUpdate(lobby);
        this.logger.log(lobby.players)
        return lobby;
    }

    async getLobbies(): Promise<LobbyResponse[]> {
        const lobbies = await this.lobbyDataManager.getAll();
        return await Promise.all(
            lobbies.map(async (lobby) => {
                return {
                    id: lobby.id,
                    creator:
                        (await this.userRepository.get(lobby.creatorId))
                            ?.username ?? "NO_NAME",
                    maxPlayers: lobby.maxPlayers,
                    creatorId: lobby.creatorId,
                    players: lobby.players,
                };
            })
        );
    }
}
