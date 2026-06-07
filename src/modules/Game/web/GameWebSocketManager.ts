import { WsManager } from "../../../core";
import { Lobby } from "../../Lobby/data/Lobby";
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

    async emitGameEnd(gameId: string, lobby: Lobby, playerWin: boolean) {
        await this.emit<GameEndEvent>({
            actionId: GameOutputActions.GAME_END,
            key: { gameId },
            payload: { lobbyId: lobby.id, playerWin },
        });
    }
}
