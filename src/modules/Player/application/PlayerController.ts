import {
    WsController,
    WsListenerOptions,
    Provide,
    SocketError,
} from "../../../core";
import { PlayerKey } from "./interfaces/PlayerKey";
import { PlayerAction } from "./interfaces/PlayerAction";
import { PlayerActionService } from "../services/PlayerActionService";
import {
    PlayerInputActions,
    PlayerOutputActions,
} from "../web/PlayerSocketActions";
import { PlayerWebSocketManager } from "../web/PlayerWebSocketManager";
import { GameOutputActions } from "../../Game/application/interfaces/GameAction";
import { SingleClientOutputError } from "../../../core/types/Action";
import { PlayerCancelAction } from "./interfaces/PlayerCancelAction";

export class PlayerController extends WsController<
    PlayerKey,
    PlayerInputActions,
    PlayerOutputActions | GameOutputActions
> {
    constructor(
        @Provide(PlayerActionService)
        private readonly playerActionService: PlayerActionService,
        @Provide(PlayerWebSocketManager) socketManager: PlayerWebSocketManager
    ) {
        super({ topic: "game", key: PlayerKey, socketManager });
        this.on(PlayerInputActions.FINISH_TURN, this.finishTurn.bind(this));
        this.on(PlayerInputActions.ACTION, this.action.bind(this), {
            payloadType: PlayerAction,
        });
    }

    async finishTurn({
        key,
    }: WsListenerOptions<
        PlayerKey,
        PlayerAction
    >): Promise<SingleClientOutputError> {
        const game = await this.playerActionService.finishTurn(
            key.gameId,
            key.playerId
        );
        if (game instanceof SocketError) {
            return game;
        }
    }

    async action({
        key,
        user,
        payload,
    }: WsListenerOptions<PlayerKey, PlayerAction>): Promise<
        PlayerCancelAction | SingleClientOutputError
    > {
        this.logger.debug("payload received:", key, user, payload);
        return await this.playerActionService.action(
            payload.actionId,
            key.gameId,
            key.playerId,
            payload.target
        );
    }
}
