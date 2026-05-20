import { WsController, WsListenerOptions, Provide, SocketError } from "../../../core";
import { PlayerKey } from "./interfaces/PlayerKey";
import { PlayerAction } from "./interfaces/PlayerAction";
import { PlayerActionService } from "../services/PlayerActionService";
import { PlayerInputActions, PlayerOutputActions } from "../web/PlayerSocketActions";
import { PlayerWebSocketManager } from "../web/PlayerWebSocketManager";


export class PlayerController extends WsController<
    PlayerKey,
    PlayerInputActions,
    PlayerOutputActions
> {
    
    constructor(
        @Provide(PlayerActionService) private readonly playerActionService: PlayerActionService,
        @Provide(PlayerWebSocketManager) socketManager: PlayerWebSocketManager,
    ) {
        super({ topic: "game", key : PlayerKey, socketManager });
        // this.on(PlayerInputActions.MOVE, this.move.bind(this), {
        //     payloadType: MovePlayer,
        // });
        this.on(PlayerInputActions.ACTION, this.action.bind(this), {
            payloadType: PlayerAction,
        });
    }

    // async move({
    //     key: { gameId },
    //     user,
    //     payload,
    // }: WsListenerOptions<GameKey, MovePlayer>) {
    //     const moved = await this.playerService.move(user.id, gameId, payload);
    //     if (moved instanceof SocketError) {
    //         return { actionId: "error", payload: moved };
    //     }
    //     this.emit({
    //         actionId: PlayerOutputActions.MOVE,
    //         key: { gameId },
    //         payload: moved,
    //     });
    // }

    async action({
        key,
        user,
        payload,
    }: WsListenerOptions<PlayerKey, PlayerAction>) {
        console.log("payload received:", key, user, payload);
        const action = await this.playerActionService.action(payload.actionId, key.gameId, key.playerId, payload.target);
        if (action instanceof SocketError) {
            return { actionId: "error", payload: action};
        }
        console.log("action result:", action);

        if (action) {
            this.emit({
            actionId: PlayerOutputActions.MOVE,
            key: { gameId: key.gameId },
            payload: action,
            });
        }
    }
}
