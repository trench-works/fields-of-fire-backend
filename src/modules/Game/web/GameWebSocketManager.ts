import { WsManager } from "../../../core";
import {
    GameOutputActions,
    GameReturnActions,
} from "../application/interfaces/GameAction";
import { GameEndEvent } from "../application/interfaces/GameEndEvent";
import { GameKey } from "../application/interfaces/GameKey";
import { GameRenew } from "../application/interfaces/GameRenew";
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

    async emitGameRenew(game: Game) {
        await this.emit<GameRenew>({
            actionId: GameOutputActions.GAME_RENEW,
            key: { gameId: game.id },
            payload: { data: game },
        });
    }

    async emitGameEnd(
        gameId: string,
        getPayload: (index: number) => GameEndEvent
    ) {
        await this.emitMap<GameEndEvent>(
            GameOutputActions.GAME_END,
            { gameId },
            (_, i) => getPayload(i)
        );
    }
}
