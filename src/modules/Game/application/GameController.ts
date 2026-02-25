import { GameService } from "../services/GameService";
import {
    Provide,
    Controller,
    ListenerOptions,
    SocketError,
    SingleClientOutputAction,
} from "../../../core";
import { GameKey } from "./interfaces/GameKey";
import { GameWebSocketManager } from "../web/GameWebSocketManager";
import { GameInputActions, GameOutputActions, GameReturnActions } from "./interfaces/GameAction";


export class GameController extends Controller<
    GameKey,
    GameInputActions,
    GameOutputActions,
    GameReturnActions
> {
    constructor(
        @Provide(GameService) private readonly gameService: GameService,
        @Provide(GameWebSocketManager) socketManager: GameWebSocketManager,
    ) {
        super({ topic: "game", key: GameKey, socketManager });
        this.on(GameInputActions.JOIN, this.joinMe.bind(this));
    }

    joinMe({
        key,
        user,
    }: ListenerOptions<GameKey>): SingleClientOutputAction<object, GameReturnActions> {
        this.logger.log("Received call on - Game - JoinMe");
        const subscribed = this.gameService.subscribe(user.id, key.gameId);
        if (subscribed instanceof SocketError) {
            return { actionId: "error", payload: subscribed };
        }
        const { game, player } = subscribed;
        this.emit({
            actionId: GameOutputActions.JOINED,
            key: { gameId: game.id },
            payload: { playerId: player.id },
        });
        return { actionId: GameReturnActions.JOIN, payload: subscribed };
    }
}
