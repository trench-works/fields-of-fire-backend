import { NotFoundError } from "../../../core/errors/NotFound";
import { Lobby } from "./Lobby";
import { v4 as uuidv4 } from "uuid";

export class LobbyDataManager {
    lobbies: Lobby[] = [];

    addLobby(lobby: Lobby): Lobby {
        if (lobby.id === undefined) {
            lobby.id = uuidv4();
        }
        this.lobbies.push(lobby);
        return lobby;
    }

    addPlayerToLobby(
        lobbyId: string,
        newPlayerId: string
    ): NotFoundError | void {
        const lobby = this.lobbies.find((lobby) => (lobby.id = lobbyId));
        if (!lobby) {
            return new NotFoundError();
        }
        lobby.playersId.push(newPlayerId);
    }
}
