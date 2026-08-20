import {
    HttpError,
    Id,
    Logger,
    NotFoundError,
    Provide,
    SocketError,
    UserInfos,
} from "../../../core";
import { LobbyDataManager } from "../data/LobbyDataManager";
import { Lobby } from "../data/Lobby";
import { LobbyResponse } from "../../Menu/application/interfaces/UpdateLobbyListResponse";
import { MenuWebSocketManager } from "../../Menu/web/MenuWebSocketManager";
import { UserRepository } from "../../User/data/UserRepository";
import { LobbyWebSocketManager } from "../web/LobbyWebSocketManager";
import { GameMode } from "../../Game/data/Game";
import { LobbyTeam } from "../data/LobbyTeam";
import { TEAM_COLORS } from "../../Game/data/Team";
import { UpdateLobby } from "../application/interfaces/UpdateLobby";

export class LobbyService {
    @Provide(LobbyDataManager)
    private readonly lobbyDataManager!: LobbyDataManager;
    @Provide(MenuWebSocketManager)
    private readonly menuWebSocketManager!: MenuWebSocketManager;
    @Provide(LobbyWebSocketManager)
    private readonly lobbyWebSocketManager!: LobbyWebSocketManager;
    @Provide(UserRepository)
    private readonly userRepository!: UserRepository;
    @Provide("Logger")
    private readonly logger!: Logger;

    async updateLobby(lobbyId: string, user: UserInfos, payload: UpdateLobby) {
        const lobby = await this.lobbyDataManager.getLobby(lobbyId);
        if (lobby instanceof NotFoundError) {
            return lobby;
        }
        if (lobby.creatorId !== user.id) {
            return;
        }
        lobby.boardSize = payload.boardSize ?? lobby.boardSize;
        lobby.mode = payload.mode ?? lobby.mode;
        lobby.name = payload.name ?? lobby.name;
        await this.lobbyDataManager.set(lobbyId, lobby);
        await this.lobbyWebSocketManager.emitLobbyUpdate(lobby);
    }

    async addTeam(lobbyId: string, userId: string) {
        const lobby = await this.lobbyDataManager.getLobby(lobbyId);
        if (lobby instanceof NotFoundError) {
            return lobby;
        }
        if (lobby.creatorId !== userId) {
            return new SocketError();
        }
        if (lobby.teams.length === 4) {
            return new SocketError();
        }
        lobby.teams.push({
            players: [],
            ai: 0,
            color: TEAM_COLORS[lobby.teams.length],
        });
        await this.lobbyDataManager.set(lobbyId, lobby);
        await this.lobbyWebSocketManager.emitLobbyUpdate(lobby);
    }

    async joinTeam(lobbyId: string, userId: string, index: number) {
        const lobby = await this.lobbyDataManager.getLobby(lobbyId);
        if (lobby instanceof NotFoundError) {
            return lobby;
        }
        if (lobby.mode === GameMode.INFINITY) {
            return new SocketError();
        }
        const team = lobby.teams[index];
        if (!team) {
            return new SocketError();
        }
        if (team.players.length === 4) {
            return new SocketError();
        }
        const player = lobby.teams
            .flatMap((team) => team.players)
            .find((player) => player.userId === userId);
        lobby.teams = lobby.teams.map((team) => {
            team.players = team.players.filter(
                (player) => player.playerId !== player.playerId
            );
            return team;
        });
        if (player) {
            team.players.push(player);
        } else {
            const user = await this.userRepository.get(userId);
            if (!user) {
                return new SocketError("User doesnt exist");
            }
            team.players.push({
                playerId: Id.get(),
                userId,
                classId: "entente_fantassin",
                name: user.username,
            });
        }
        await this.lobbyDataManager.set(lobbyId, lobby);
        await this.lobbyWebSocketManager.emitLobbyUpdate(lobby);
    }

    async createLobby(userId: string) {
        const user = await this.userRepository.get(userId);
        if (!user) {
            return new HttpError(400, "User doesnt exist");
        }
        const lobby = await this.lobbyDataManager.addLobby({
            creatorId: userId,
            mode: GameMode.INFINITY,
            creatorName: user.username,
            name: `Partie de ${user.username}`,
            maxPlayers: 4,
            boardSize: 10,
            playerReady: [],
        });

        if (!lobby) {
            return;
        }
        const team1: LobbyTeam = {
            players: [
                {
                    userId,
                    playerId: Id.get(),
                    classId: "entente_fantassin",
                    name: user.username,
                },
            ],
            ai: 0,
            color: TEAM_COLORS[0],
        };
        lobby.teams.push(team1);
        await this.onLobbiesUpdate(lobby);
        return lobby;
    }

    async onLobbiesUpdate(lobby: Lobby) {
        await this.lobbyDataManager.set(lobby.id, lobby);
        await this.menuWebSocketManager.emitLobbiesUpdate(
            await this.getLobbies()
        );
    }

    async getLobbies(): Promise<LobbyResponse[]> {
        const lobbies = await this.lobbyDataManager.findAll();
        return await Promise.all(
            lobbies.map(async (lobby) => {
                return {
                    id: lobby.id,
                    creator:
                        (await this.userRepository.get(lobby.creatorId))
                            ?.username ?? "NO_NAME",
                    maxPlayers: lobby.maxPlayers,
                    creatorId: lobby.creatorId,
                    teams: lobby.teams,
                    name: lobby.name,
                    mode: lobby.mode,
                    boardSize: lobby.boardSize,
                };
            })
        );
    }
}
