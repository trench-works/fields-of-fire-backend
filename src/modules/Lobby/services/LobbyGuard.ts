import {
    Guard,
    NotFoundError,
    Provide,
    RessourceAccessLevel,
} from "../../../core";
import { LobbyDataManager } from "../data/LobbyDataManager";

export class LobbyGuard implements Guard {
    constructor(
        @Provide(LobbyDataManager)
        private readonly lobbyDataManager: LobbyDataManager
    ) {}

    validate(): RessourceAccessLevel {
        const lobbyId = "";
        const userId = "";
        const lobby = this.lobbyDataManager.getLobby(lobbyId);
        if (lobby instanceof NotFoundError) {
            return RessourceAccessLevel.NONE;
        }
        if (lobby.creatorId === userId) {
            return RessourceAccessLevel.DELETE;
        }
        if (lobby.playersId.includes(userId)) {
            return RessourceAccessLevel.READ;
        }
        return RessourceAccessLevel.NONE;
    }
}
