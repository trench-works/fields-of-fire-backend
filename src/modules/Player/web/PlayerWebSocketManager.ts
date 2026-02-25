import { WebSocketManager } from "../../../core";
import { PlayerKey } from "../application/interfaces/PlayerKey";
import { PlayerOutputActions } from "./PlayerSocketActions";


export class PlayerWebSocketManager extends WebSocketManager<PlayerKey, PlayerOutputActions> {}