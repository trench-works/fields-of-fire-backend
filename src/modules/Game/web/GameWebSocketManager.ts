import { WebSocketManager } from "../../../core";
import { GameOutputActions, GameReturnActions } from "../application/interfaces/GameAction";
import { GameKey } from "../application/interfaces/GameKey";



export class GameWebSocketManager extends WebSocketManager<GameKey, GameOutputActions, GameReturnActions> {

}