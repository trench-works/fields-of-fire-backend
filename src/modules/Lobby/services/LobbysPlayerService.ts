import { Id, Logger, NotFoundError, Provide, SocketError } from "../../../core";
import { LobbyDataManager } from "../data/LobbyDataManager";
import { Lobby } from "../data/Lobby";
import { MenuWebSocketManager } from "../../Menu/web/MenuWebSocketManager";
import { UserRepository } from "../../User/data/UserRepository";
import { LobbyService } from "./LobbyService";
import { LobbyWebSocketManager } from "../web/LobbyWebSocketManager";

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
    @Provide(LobbyWebSocketManager)
    private readonly lobbyWebSocketManager!: LobbyWebSocketManager;

    async removePlayer(
        lobbyId: string,
        userId: string
    ): Promise<Lobby | NotFoundError> {
        const lobby = await this.lobbyDataManager.getLobby(lobbyId);
        if (lobby instanceof NotFoundError) {
            return lobby;
        }
        const playerTeam = lobby.teams.find((team) =>
            team.players.some((player) => player.userId === userId)
        )!;
        const leavingPlayer = lobby.teams
            .flatMap((team) => team.players)
            .find((player) => player.userId === userId)?.playerId;
        playerTeam.players = playerTeam.players.filter(
            (player) => player.userId !== userId
        );
        lobby.playerReady = lobby.playerReady.filter(
            (player) => player !== leavingPlayer
        );
        await this.lobbyService.onLobbiesUpdate(lobby);
        await this.lobbyWebSocketManager.emitLobbyUpdate(lobby);
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

        lobby.teams
            .flatMap((team) => team.players)
            .find((player) => player.userId === userId)!.classId = classId;

        await this.lobbyDataManager.set(lobbyId, lobby);
        await this.lobbyWebSocketManager.emitLobbyUpdate(lobby);
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
        const currentPlayer = lobby.teams
            .flatMap((team) => team.players)
            .find((player) => player.userId === userId);
        if (currentPlayer) {
            return lobby;
        }
        if (
            lobby.teams.flatMap((team) => team.players).length ===
            lobby.maxPlayers
        ) {
            return new SocketError("Lobby is already full !");
        }
        const user = await this.userRepository.get(userId)!;
        lobby.teams[0].players.push({
            //TODO: remove push to team 0 and instead push to first team with empty slot
            userId,
            playerId: Id.get(),
            classId: "entente_fantassin",
            name: user?.username ?? "Entente Fantassin",
        });
        await this.lobbyService.onLobbiesUpdate(lobby);
        await this.lobbyWebSocketManager.emitLobbyUpdate(lobby);
        return lobby;
    }

    async setLobbyPlayerReady(lobbyId: string, playerId: string) {
        const lobby = await this.lobbyDataManager.get(lobbyId);
        if (!lobby) {
            return;
        }
        if (lobby.playerReady.includes(playerId)) {
            return;
        }

        lobby.playerReady.push(playerId);

        await this.lobbyWebSocketManager.emitLobbyUpdate(lobby);
        await this.lobbyDataManager.set(lobbyId, lobby);

        return lobby;
    }
}
