import { GameService } from "../services/GameService";
import { Provide, WsController } from "../../../core";
import { GameKey } from "./interfaces/GameKey";
import { GameWebSocketManager } from "../web/GameWebSocketManager";
import {
    GameInputActions,
    GameOutputActions,
    GameReturnActions,
} from "./interfaces/GameAction";

export class GameController extends WsController<
    GameKey,
    GameInputActions,
    GameOutputActions,
    GameReturnActions
> {
    constructor(
        @Provide(GameService) private readonly gameService: GameService,
        @Provide(GameWebSocketManager) socketManager: GameWebSocketManager
    ) {
        super({ topic: "game", key: GameKey, socketManager });
    }
}
