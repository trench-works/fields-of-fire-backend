import { Id, Logger, Provide } from "../../../core";
import { LobbyDataManager } from "../data/LobbyDataManager";
import { Lobby } from "../data/Lobby";
import { LobbyResponse } from "../../Menu/application/interfaces/UpdateLobbyListResponse";
import { MenuWebSocketManager } from "../../Menu/web/MenuWebSocketManager";
import { UserRepository } from "../../User/data/UserRepository";
import { LobbyWebSocketManager } from "../web/LobbyWebSocketManager";
import { GameMode } from "../../Game/data/Game";
import { LobbyTeam } from "../data/LobbyTeam";
import { TEAM_COLORS } from "../../Game/data/Team";

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

    async createLobby(userId: string) {
        const user = await this.userRepository.get(userId)!;
        const lobby = await this.lobbyDataManager.addLobby({
            creatorId: userId,
            mode: GameMode.INFINITY,
            creatorName: user?.username ?? "NO_NAME",
            name: `Partie de ${user?.username ?? "NO_NAME"}`,
            maxPlayers: 4,
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
                    name: user?.username ?? "Entente Fantassin",
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
                };
            })
        );
    }
}
