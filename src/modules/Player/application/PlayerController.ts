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
import { PlayerReady } from "./interfaces/PlayerReady";
import { PlayerService } from "../services/PlayerService";

export class PlayerController extends WsController<
    PlayerKey,
    PlayerInputActions,
    PlayerOutputActions | GameOutputActions
> {
    constructor(
        @Provide(PlayerActionService)
        private readonly playerActionService: PlayerActionService,
        @Provide(PlayerService)
        private readonly playerService: PlayerService,
        @Provide(PlayerWebSocketManager) socketManager: PlayerWebSocketManager
    ) {
        super({ topic: "game", key: PlayerKey, socketManager });
        this.on(PlayerInputActions.FINISH_TURN, this.finishTurn.bind(this));
        this.on(PlayerInputActions.ACTION, this.action.bind(this), {
            payloadType: PlayerAction,
        });
        this.on(PlayerInputActions.READY, this.playerReady.bind(this), {
            payloadType: PlayerReady,
        });
        this.on(PlayerInputActions.DISCONNECT, this.disconnect.bind(this));
    }

    async disconnect({ key }: WsListenerOptions<PlayerKey>) {
        return await this.playerService.disconnect(key.gameId, key.playerId);
    }

    async playerReady({
        key,
        payload,
    }: WsListenerOptions<
        PlayerKey,
        PlayerReady
    >): Promise<SingleClientOutputError> {
        return await this.playerService.setGamePlayerReady(
            key.playerId,
            key.gameId,
            payload.boostId
        );
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
