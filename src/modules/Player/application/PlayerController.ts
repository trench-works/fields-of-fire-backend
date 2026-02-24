import { Controller, ListenerOptions, Provide } from "../../../core";
import { GameKey } from "../../Game/application/interfaces/GameKey";
import { MovePlayer } from "./interfaces/MovePlayer";
import { PlayerService } from "../services/PlayerService";
import { PlayerKey } from "./interfaces/PlayerKey";
import { PlayerAction } from "./interfaces/PlayerAction";
import { PlayerActionService } from "../services/PlayerActionService";

enum InputActions {
    MOVE = "move",
    ACTION = "action",
}

enum OutputActions {
    MOVE = "move",
}

export class PlayerController extends Controller<
    PlayerKey,
    InputActions,
    OutputActions
> {
    constructor(
        @Provide(PlayerService) private readonly playerService: PlayerService, 
        @Provide(PlayerActionService) private readonly playerActionService: PlayerActionService,
    ) {
        super({ topic: "game", key : PlayerKey });
        this.on(InputActions.MOVE, this.move.bind(this), {
            payloadType: MovePlayer,
        });
        this.on(InputActions.ACTION, this.action.bind(this), {
            payloadType: PlayerAction,
        });
    }

    move({
        key: { gameId },
        user,
        payload,
    }: ListenerOptions<GameKey, MovePlayer>) {
        const moved = this.playerService.move(user.id, gameId, payload);
        if (moved instanceof Error) {
            return { actionId: "error", payload: moved };
        }
        this.emit({
            actionId: OutputActions.MOVE,
            key: { gameId },
            payload: moved,
        });
    }

    action({ key, user, payload }: ListenerOptions<PlayerKey, PlayerAction>) {
        this.playerActionService.action();
    }
}
