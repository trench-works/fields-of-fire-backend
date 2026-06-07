import { WsManager } from "../../../core";
import {
  LobbyOutputActions,
  LobbyReturnActions,
} from "../application/interfaces/LobbyAction";
import { LobbyKeys } from "../application/interfaces/LobbyKeys";

export class LobbyWebSocketManager extends WsManager<
  LobbyKeys,
  LobbyOutputActions,
  LobbyReturnActions
> {}
