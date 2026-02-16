import { GameService } from "../services/GameService";
import { Provide, Controller, ListenerOptions } from "../../../core";
import { MovePlayer } from "./interfaces/MovePlayer";
import { PlayerService } from "../../Player/services/PlayerService";

type GameKey = {
    gameId: string;
};
export class GameController extends Controller<GameKey> {
    constructor(
        @Provide(GameService) private readonly gameService: GameService,
        @Provide(PlayerService) private readonly playerService: PlayerService
    ) {
        super({ topic: "game" });
        this.on("subscribe", this.subscribeMe.bind(this));
        this.on("move", this.move.bind(this), { payloadType: MovePlayer });
    }

    subscribeMe({ key: { gameId }, user }: ListenerOptions<GameKey>) {
        return this.gameService.subscribe(user.id, gameId);
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
