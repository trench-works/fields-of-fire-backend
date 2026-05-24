import {
    WsController,
    WsListenerOptions,
    Provide,
    SocketError,
    SingleClientOutputAction,
} from "../../../core";
import { PlayerKey } from "./interfaces/PlayerKey";
import { PlayerAction } from "./interfaces/PlayerAction";
import { PlayerActionService } from "../services/PlayerActionService";
import {
    PlayerInputActions,
    PlayerOutputActions,
} from "../web/PlayerSocketActions";
import { PlayerWebSocketManager } from "../web/PlayerWebSocketManager";
import { Game } from "../../Game/data/Game";

export class PlayerController extends WsController<
    PlayerKey,
    PlayerInputActions,
    PlayerOutputActions
> {
    constructor(
        @Provide(PlayerActionService)
        private readonly playerActionService: PlayerActionService,
        @Provide(PlayerWebSocketManager) socketManager: PlayerWebSocketManager
    ) {
        super({ topic: "game", key: PlayerKey, socketManager });
        // this.on(PlayerInputActions.MOVE, this.move.bind(this), {
        //     payloadType: MovePlayer,
        // });
        this.on(PlayerInputActions.ACTION, this.action.bind(this), {
            payloadType: PlayerAction,
        });
    }

    async action({
        key,
        user,
        payload,
    }: WsListenerOptions<
        PlayerKey,
        PlayerAction
    >): Promise<SingleClientOutputAction<Game, PlayerOutputActions> | void> {
        this.logger.debug("payload received:", key, user, payload);
        const game = await this.playerActionService.action(
            payload.actionId,
            key.gameId,
            key.playerId,
            payload.target
        );
        if (game === null) {
            return {
                actionId: "error",
                error: new SocketError("can't do action"),
            };
        }
        this.logger.debug("action result:", game);

        if (game) {
            this.emit({
                actionId: PlayerOutputActions.UPDATE,
                key: { gameId: key.gameId },
                payload: game,
            });
        }
    }
}
