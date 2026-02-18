import { GameService } from "../services/GameService";
import { Provide, Controller, ListenerOptions } from "../../../core";
import { GameKey } from "./interfaces/GameKey";
import { SingleClientOutputAction } from "../../../core/types/Action";

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
        @Provide(GameService) private readonly gameService: GameService
    ) {
        super({ topic: "game" });
        this.on(InputActions.JOIN, this.joinMe.bind(this));
    }

    joinMe({
        payload,
        user,
    }: ListenerOptions<GameKey>): SingleClientOutputAction<any, ReturnActions> {
        const subscribed = this.gameService.subscribe(user.id, payload.gameId);
        if (subscribed instanceof Error) {
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
