import { Id, Logger, Provide } from "../../../core";
import { LobbyDataManager } from "../data/LobbyDataManager";
import { Lobby } from "../data/Lobby";
import { LobbyResponse } from "../../Menu/application/interfaces/UpdateLobbyListResponse";
import { MenuWebSocketManager } from "../../Menu/web/MenuWebSocketManager";
import { UserRepository } from "../../User/data/UserRepository";
import { LobbyWebSocketManager } from "../web/LobbyWebSocketManager";

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
            creatorName: user?.username ?? "NO_NAME",
            name : `Partie de ${user?.username ?? "NO_NAME"}`,
            maxPlayers: 4,
            playerReady : []
        });
       
        lobby.players.push({
            userId,
            playerId: Id.get(),
            classId: "entente_fantassin",
            name: user?.username ?? "Entente Fantassin",
        });
        this.onLobbiesUpdate(lobby);
        return lobby;
    }

    async onLobbiesUpdate(lobby: Lobby) {
        await this.lobbyDataManager.set(lobby.id, lobby);
        this.menuWebSocketManager.emitLobbiesUpdate(await this.getLobbies());
    }

    async onLobbyUpdate(lobby: Lobby) {
        this.lobbyWebSocketManager.emitLobbyUpdate(lobby);
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
                    name : lobby.name
                };
            })
        );
    }
}
