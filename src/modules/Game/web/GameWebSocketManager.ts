import { WsManager } from "../../../core";
import {
    GameOutputActions,
    GameReturnActions,
} from "../application/interfaces/GameAction";
import { GameKey } from "../application/interfaces/GameKey";
import { Game } from "../data/Game";

export class GameWebSocketManager extends WsManager<
    GameKey,
    GameOutputActions,
    GameReturnActions
> {
    emitUpdate(game: Game, animations: any[]) {
        this.emit({
            actionId: GameOutputActions.UPDATE,
            key: { gameId: game.id },
            payload: { game, animations },
        });
    }
}
