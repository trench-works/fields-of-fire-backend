import { GameService } from "../services/GameService";
import { Provide, Controller } from "../../../core";

export class GameController extends Controller {
    constructor(
        @Provide(GameService) private readonly gameService: GameService
    ) {
        super({ topic: "game" });
    }
}
