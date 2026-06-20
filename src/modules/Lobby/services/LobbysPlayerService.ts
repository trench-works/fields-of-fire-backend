import { Id, Logger, NotFoundError, Provide, SocketError } from "../../../core";
import { LobbyDataManager } from "../data/LobbyDataManager";
import { Lobby } from "../data/Lobby";
import { MenuWebSocketManager } from "../../Menu/web/MenuWebSocketManager";
import { UserRepository } from "../../User/data/UserRepository";
import { LobbyService } from "./LobbyService";

export class LobbyPlayerService {
    @Provide(LobbyDataManager)
    private readonly lobbyDataManager!: LobbyDataManager;
    @Provide(MenuWebSocketManager)
    private readonly menuWebSocketManager!: MenuWebSocketManager;
    @Provide(UserRepository)
    private readonly userRepository!: UserRepository;
    @Provide("Logger")
    private readonly logger!: Logger;
    @Provide(LobbyService)
    private readonly lobbyService!: LobbyService;

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
        this.lobbyService.onLobbiesUpdate(lobby);
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
        const user = await this.userRepository.get(userId)!;
        lobby.players.push({
            userId,
            playerId: Id.get(),
            classId: "entente_fantassin",
            name: user?.username ?? "Entente Fantassin",
        });
        this.lobbyService.onLobbiesUpdate(lobby);
        this.logger.log(lobby.players);
        return lobby;
    }
}
