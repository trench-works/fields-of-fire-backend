import { WsManager } from "../../../core";
import { PlayerKey } from "../application/interfaces/PlayerKey";
import { PlayerOutputActions } from "./PlayerSocketActions";


export class PlayerWebSocketManager extends WsManager<PlayerKey, PlayerOutputActions> {}