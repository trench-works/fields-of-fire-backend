import { Controller, ListenerOptions, Provide } from "../../../core";
import { GameSocketManager } from "../../Game/application/GameSocketManager";
import { GameKey } from "../../Game/application/interfaces/GameKey";
import { MovePlayer } from "./interfaces/MovePlayer";
import { PlayerService } from "../services/PlayerService";
import { PlayerKey } from "./interfaces/PlayerKey";

export class PlayerController extends Controller<PlayerKey> {
    constructor(
        @Provide(PlayerService) private readonly playerService: PlayerService
    ) {
        super({ topic: "game" });
        this.on("move", this.move.bind(this), { payloadType: MovePlayer });
    }

    move({
        key: { gameId },
        user,
        payload,
    }: ListenerOptions<GameKey, MovePlayer>) {
        const moved = this.playerService.move(user.id, gameId, payload);
        if (moved instanceof Error) {
            return moved;
        }
        this.socketManager.emit({
            actionId: "move",
            key: { gameId },
            payload: moved,
        });
    }
}
