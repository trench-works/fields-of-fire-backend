import { Controller, ListenerOptions, Provide } from "../../../core";
import { GameKey } from "../../Game/application/interfaces/GameKey";
import { MovePlayer } from "./interfaces/MovePlayer";
import { PlayerService } from "../services/PlayerService";
import { PlayerKey } from "./interfaces/PlayerKey";
import { PlayerAction } from "./interfaces/PlayerAction";
import { PlayerActionService } from "../services/PlayerActionService";
import { PlayerInputActions, PlayerOutputActions } from "../web/PlayerSocketActions";
import { PlayerWebSocketManager } from "../web/PlayerWebSocketManager";


export class PlayerController extends Controller<
    PlayerKey,
    PlayerInputActions,
    PlayerOutputActions
> {
    
    constructor(
        @Provide(PlayerService) private readonly playerService: PlayerService, 
        @Provide(PlayerActionService) private readonly playerActionService: PlayerActionService,
        @Provide(PlayerWebSocketManager) socketManager: PlayerWebSocketManager,
    ) {
        super({ topic: "game", key : PlayerKey, socketManager });
        this.on(PlayerInputActions.MOVE, this.move.bind(this), {
            payloadType: MovePlayer,
        });
        this.on(PlayerInputActions.ACTION, this.action.bind(this), {
            payloadType: PlayerAction,
        });
    }

    async move({
        key: { gameId },
        user,
        payload,
    }: ListenerOptions<GameKey, MovePlayer>) {
        const moved = await this.playerService.move(user.id, gameId, payload);
        if (moved instanceof Error) {
            return { actionId: "error", payload: moved };
        }
        this.emit({
            actionId: PlayerOutputActions.MOVE,
            key: { gameId },
            payload: moved,
        });
    }

    async action() {
        this.playerActionService.action();
    }
}
