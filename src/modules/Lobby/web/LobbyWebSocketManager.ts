import {WsManager } from "../../../core";
import {
  LobbyOutputActions,
  LobbyReturnActions,
} from "../application/interfaces/LobbyAction";
import { LobbyKeys } from "../application/interfaces/LobbyKeys";
import { LobbyUpdate } from "../application/interfaces/LobbyUpdate";
import { Lobby } from "../data/Lobby";

export class LobbyWebSocketManager extends WsManager<
  LobbyKeys,
  LobbyOutputActions,
  LobbyReturnActions
> {
    async emitLobbyUpdate(lobby: Lobby) {
      this.logger.log(`trying so updtate the lobby : ${JSON.stringify(lobby)}`)
        await this.emit<LobbyUpdate>({
            key: {lobbyId : lobby.id},
            actionId: LobbyOutputActions.UPDATE,
            payload: {
                lobby,
            },
        });
    }
}
