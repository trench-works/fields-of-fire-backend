import { WebSocketManager } from "../../../core";
import { LobbyOutputActions, LobbyReturnActions } from "../application/interfaces/LobbyAction";
import { LobbyKeys } from "../application/interfaces/LobbyKeys";



export class LobbyWebSocketManager extends WebSocketManager<LobbyKeys, LobbyOutputActions, LobbyReturnActions> {}