import { WsManager } from "../../../core";
import { GameAnimation } from "../../Player/data/Animation";
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
    emitUpdate(game: Game, animations: GameAnimation[]) {
        this.emit({
            actionId: GameOutputActions.UPDATE,
            key: { gameId: game.id },
            payload: { game, animations },
        });
    }
}
