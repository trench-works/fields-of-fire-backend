import { GameService } from "../services/GameService";
import { Provide, Controller, ListenerOptions } from "../../../core";
import { MovePlayer } from "../../Player/application/interfaces/MovePlayer";
import { PlayerService } from "../../Player/services/PlayerService";
import { GameSocketManager } from "./GameSocketManager";
import { GameKey } from "./interfaces/GameKey";

export class GameController extends Controller<GameKey> {
    constructor(
        @Provide(GameService) private readonly gameService: GameService,
        @Provide(GameSocketManager)
        socketManager: GameSocketManager
    ) {
        super({ topic: "game", socketManager });
        this.on("subscribe", this.subscribeMe.bind(this));
    }

    subscribeMe({ key: { gameId }, user }: ListenerOptions<GameKey>) {
        return this.gameService.subscribe(user.id, gameId);
    }
}
