import { Controller } from "../../core/app/Controller";
import { Provide } from "../../core/decorators/Provide";
import { GameService } from "../services/GameService";
import { LobbyService } from "../services/LobbyService";

export class GameController extends Controller {
    constructor(
        @Provide(GameService) private readonly gameService: GameService
    ) {
        super({ topic: "game" });
    }
}
