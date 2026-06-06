import { WsManager } from "../../../core";
import {
    GameOutputActions,
    GameReturnActions,
} from "../application/interfaces/GameAction";
import { GameKey } from "../application/interfaces/GameKey";
import {
    GameEventAnimation,
    GameUpdateEvent,
} from "../application/interfaces/GameUpdateEvent";
import { Game } from "../data/Game";

export class GameWebSocketManager extends WsManager<
    GameKey,
    GameOutputActions,
    GameReturnActions
> {
    emitUpdate(game: Game, animations: GameEventAnimation[]) {
        this.emit<GameUpdateEvent>({
            actionId: GameOutputActions.UPDATE,
            key: { gameId: game.id },
            payload: { data: game, animations },
        });
    }
}
