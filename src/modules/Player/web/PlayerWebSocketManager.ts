import { WsManager } from "../../../core";
import { GameEndEvent } from "../../Game/application/interfaces/GameEndEvent";
import { PlayerKey } from "../application/interfaces/PlayerKey";
import { PlayerOutputActions } from "./PlayerSocketActions";

export class PlayerWebSocketManager extends WsManager<
    PlayerKey,
    PlayerOutputActions
> {
    async emitGameEnd(
        gameId: string,
        getPayload: (playerId: string) => GameEndEvent
    ) {
        await this.emitMap<GameEndEvent>(
            PlayerOutputActions.GAME_END,
            { gameId },
            (client) => getPayload(client.key.playerId)
        );
    }
}
