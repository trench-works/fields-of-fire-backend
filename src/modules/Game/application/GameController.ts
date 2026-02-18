import { GameService } from "../services/GameService";
import { Provide, Controller, ListenerOptions } from "../../../core";
import { GameKey } from "./interfaces/GameKey";

export class GameController extends Controller<GameKey> {
    constructor(
        @Provide(GameService) private readonly gameService: GameService
    ) {
        super({ topic: "game" });
        this.on("join", this.joinMe.bind(this));
    }

    joinMe({ payload, user }: ListenerOptions<GameKey>) {
        const subscribed = this.gameService.subscribe(user.id, payload.gameId);
        if (subscribed instanceof Error) {
            return subscribed;
        }
        const { game, player } = subscribed;
        this.emit({
            actionId: "joined",
            key: { gameId: game.id },
            payload: { playerId: player.id },
        });
        return { actionId: "join", payload: subscribed };
    }
}
