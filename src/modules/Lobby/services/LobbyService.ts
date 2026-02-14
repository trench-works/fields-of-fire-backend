import { GameDataManager } from "../../Game/data/GameDataManager";
import { Provide } from "../../../core/decorators/Provide";
import { CreateLobbyInterface } from "../../Menu/application/interfaces/CreateLobbyInterface";
import { LobbyDataManager } from "../data/LobbyDataManager";

export class LobbyService {
    constructor(
        @Provide(LobbyDataManager)
        private readonly lobbyDataManager: LobbyDataManager,
        @Provide(GameDataManager)
        private readonly gameDataManager: GameDataManager
    ) {}

    createLobby(createLobbyInterface: CreateLobbyInterface) {}
}
