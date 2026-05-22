import { NotFoundError } from "../../../core";
import { Lobby } from "./Lobby";
import { v4 as uuidv4 } from "uuid";

export class LobbyDataManager {
  private lobbies: Lobby[] = [];

  getLobby(lobbyId: string): Lobby | NotFoundError {
    const lobby = this.lobbies.find((lobby) => (lobby.id = lobbyId));
    if (!lobby) {
      return new NotFoundError();
    }
    return lobby;
  }

  getLobbies(): Lobby[] {
    return this.lobbies;
  }

  addLobby(lobby: Lobby): Lobby {
    if (lobby.id === undefined) {
      lobby.id = uuidv4();
    }
    this.lobbies.push(lobby);
    return lobby;
  }

  addPlayerToLobby(lobbyId: string, newPlayerId: string): NotFoundError | void {
    const lobby = this.lobbies.find((lobby) => (lobby.id = lobbyId));
    if (!lobby) {
      return new NotFoundError();
    }
    lobby.playersId.push(newPlayerId);
  }
}
