import { GameService } from "../services/GameService";
import {
  Provide,
  WsController,
  WsListenerOptions,
  SocketError,
  SingleClientOutputAction,
} from "../../../core";
import { GameKey } from "./interfaces/GameKey";
import { GameWebSocketManager } from "../web/GameWebSocketManager";
import {
  GameInputActions,
  GameOutputActions,
  GameReturnActions,
} from "./interfaces/GameAction";
import { JoinGameResponse } from "./interfaces/JoinGameResponse";
import { JoinGameInput } from "./interfaces/JoinGameInput";

export class GameController extends WsController<
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
    this.on(GameInputActions.JOIN, this.joinMe.bind(this), {
      payloadType: JoinGameInput,
      responsePayloadType: JoinGameResponse,
    });
  }

  async joinMe({
    key,
    user,
    payload,
  }: WsListenerOptions<GameKey, JoinGameInput>): Promise<
    SingleClientOutputAction<JoinGameResponse, GameReturnActions>
  > {
    this.logger.debug("Received call on - Game - JoinMe");
    const subscribed = await this.gameService.subscribe(
      user.id,
      key.gameId,
      payload.characterClassId,
    );
    if (subscribed instanceof SocketError) {
      return { actionId: "error", payload: subscribed };
    }
    const { game, player } = subscribed;

    this.emit({
      actionId: GameOutputActions.JOINED,
      key: { gameId: game.id },
      payload: { playerId: player.playerId },
    });
    return { actionId: GameReturnActions.JOIN, payload: subscribed };
  }
}
