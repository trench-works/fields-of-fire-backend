import { GameService } from "../services/GameService";
import { Provide, Controller, ListenerOptions } from "../../../core";
import { GameKey } from "./interfaces/GameKey";

export class GameController extends Controller<GameKey> {
    constructor(
        @Provide(GameService) private readonly gameService: GameService
    ) {
        super({ topic: "game" });
        this.on("subscribe", this.subscribeMe.bind(this));
    }

    subscribeMe({ key: { gameId }, user }: ListenerOptions<GameKey>) {
        return this.gameService.subscribe(user.id, gameId);
    }
}
