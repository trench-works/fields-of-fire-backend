import { WsManager } from "../../../core";
import {
    GameOutputActions,
    GameReturnActions,
} from "../application/interfaces/GameAction";
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
    async emitConnectionUpdate(gameId: string, progress: number) {
        await this.emit<{ progress: number }>({
            actionId: GameOutputActions.CONNECTION_UPDATE,
            key: { gameId },
            payload: { progress },
        });
    }

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
}
