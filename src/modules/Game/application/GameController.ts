import { GameService } from "../services/GameService";
import {
    Provide,
    Controller,
    ListenerOptions,
    SocketError,
    SingleClientOutputAction,
    Logger,
} from "../../../core";
import { GameKey } from "./interfaces/GameKey";

enum InputActions {
    JOIN = "join",
}

enum OutputActions {
    JOINED = "joined",
}

enum ReturnActions {
    JOIN = "join",
}
export class GameController extends Controller<
    GameKey,
    InputActions,
    OutputActions,
    ReturnActions
> {
    constructor(
        @Provide(GameService) private readonly gameService: GameService,
        @Provide("Logger") private readonly logger: Logger
    ) {
        super({ topic: "game", key: GameKey });
        this.on(InputActions.JOIN, this.joinMe.bind(this));
    }

    joinMe({
        key,
        user,
    }: ListenerOptions<GameKey>): SingleClientOutputAction<object, ReturnActions> {
        this.logger.log("Received call on - Game - JoinMe");
        const subscribed = this.gameService.subscribe(user.id, key.gameId);
        if (subscribed instanceof SocketError) {
            return { actionId: "error", payload: subscribed };
        }
        const { game, player } = subscribed;
        this.emit({
            actionId: OutputActions.JOINED,
            key: { gameId: game.id },
            payload: { playerId: player.id },
        });
        return { actionId: ReturnActions.JOIN, payload: subscribed };
    }
}
