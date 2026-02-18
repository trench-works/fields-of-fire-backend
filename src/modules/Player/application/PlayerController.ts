import { Controller, ListenerOptions, Provide } from "../../../core";
import { GameKey } from "../../Game/application/interfaces/GameKey";
import { MovePlayer } from "./interfaces/MovePlayer";
import { PlayerService } from "../services/PlayerService";
import { PlayerKey } from "./interfaces/PlayerKey";

enum InputActions {
    MOVE = "move",
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
        @Provide(PlayerService) private readonly playerService: PlayerService
    ) {
        super({ topic: "game" });
        this.on(InputActions.MOVE, this.move.bind(this), {
            payloadType: MovePlayer,
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
}
