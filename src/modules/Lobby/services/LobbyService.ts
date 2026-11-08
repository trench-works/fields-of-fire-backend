import {
    DBError,
    Id,
    Logger,
    NotFoundError,
    Provide,
    SocketBadRequest,
    SocketError,
} from "../../../core";
import { LobbyDataManager } from "../data/LobbyDataManager";
import { Lobby } from "../data/Lobby";
import { LobbyResponse } from "../../Menu/application/interfaces/UpdateLobbyListResponse";
import { MenuWebSocketManager } from "../../Menu/web/MenuWebSocketManager";
import { UserRepository } from "../../User/data/repository/UserRepository";
import { LobbyWebSocketManager } from "../web/LobbyWebSocketManager";
import { GameMode } from "../../Game/data/Game";
import { LobbyTeam } from "../data/LobbyTeam";
import { TEAM_COLORS } from "../../Game/data/Team";
import { UpdateLobby } from "../application/interfaces/UpdateLobby";
import { UpdateMasteries } from "../application/interfaces/UpdateMastery";
import { MasteryService } from "../../Mastery/services/MasteryService";
import { MasteryTreeRepository } from "../../Mastery/repository/MasteryTreeRepository";

export class LobbyService {
    @Provide(LobbyDataManager)
    private readonly lobbyDataManager!: LobbyDataManager;
    @Provide(MenuWebSocketManager)
    private readonly menuWebSocketManager!: MenuWebSocketManager;
    @Provide(LobbyWebSocketManager)
    private readonly lobbyWebSocketManager!: LobbyWebSocketManager;
    @Provide(UserRepository)
    private readonly userRepository!: UserRepository;
    @Provide(MasteryTreeRepository)
    private readonly masteryTreeRepository!: MasteryTreeRepository;
    @Provide("Logger")
    private readonly logger!: Logger;
    @Provide(MasteryService)
    private readonly masteryService!: MasteryService;

    async updateLobby(lobbyId: string, userId: string, payload: UpdateLobby) {
        const lobby = await this.lobbyDataManager.getLobby(lobbyId);
        if (lobby instanceof NotFoundError) {
            return lobby;
        }
        if (lobby.creatorId !== userId) {
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
            return new SocketBadRequest();
        }
        if (lobby.teams.length === 4) {
            return new SocketBadRequest();
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
            return new SocketBadRequest();
        }
        const team = lobby.teams[index];
        if (!team) {
            return new SocketBadRequest();
        }
        if (team.players.length === 4) {
            return new SocketBadRequest();
        }
        const player = lobby.teams
            .flatMap((team) => team.players)
            .find((player) => player.userId === userId);
        lobby.teams = lobby.teams.map((team) => {
            team.players = team.players.filter(
                (teamPlayer) => teamPlayer.playerId !== player?.playerId
            );
            return team;
        });
        const newTeam = lobby.teams[index];
        if (player) {
            newTeam.players.push(player);
        } else {
            const user = await this.userRepository.get(userId);
            if (!user) {
                return new SocketError("User doesnt exist");
            }
            newTeam.players.push({
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
            return new SocketBadRequest("User doesnt exist");
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

    async setMasteries(
        lobbyId: string,
        userId: string,
        payload: UpdateMasteries
    ) {
        const lobby = await this.lobbyDataManager.getLobby(lobbyId);
        if (lobby instanceof NotFoundError) {
            return lobby;
        }

        const player = lobby.teams
            .flatMap((team) => team.players)
            .find((p) => p.userId === userId);
        if (!player) {
            return new SocketError("Player not in lobby");
        }

        const tree = await this.masteryTreeRepository.get(player.classId);
        if (!tree || tree instanceof DBError) {
            return new SocketError("No mastery tree for this class");
        }

        const error = this.masteryService.validate(tree, payload.masteries);
        if (error) {
            return new SocketError(error);
        }

        player.masteries = payload.masteries;
        await this.lobbyDataManager.set(lobbyId, lobby);
        await this.lobbyWebSocketManager.emitLobbyUpdate(lobby);
    }
}
