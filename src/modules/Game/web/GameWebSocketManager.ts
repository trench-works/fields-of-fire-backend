import { WsManager } from "../../../core";
import { Boost } from "../../Effect/data/Boost";
import {
    GameOutputActions,
    GameReturnActions,
} from "../application/interfaces/GameAction";
import { GameEndEvent } from "../application/interfaces/GameEndEvent";
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
    async emitUpdate(game: Game, animations: GameEventAnimation[]) {
        await this.emit<GameUpdateEvent>({
            actionId: GameOutputActions.UPDATE,
            key: { gameId: game.id },
            payload: { data: game, animations },
        });
    }

    async emitGameEnd(gameId: string, playerWin: boolean, boosts: Boost[]) {
        await this.emitMap<GameEndEvent>(
            GameOutputActions.GAME_END,
            { gameId },
            () => ({ playerWin, boosts }) //TODO: add end game boost selection, send unique payload for each client
        );
    }
}
