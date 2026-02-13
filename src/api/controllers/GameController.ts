import { Controller } from "../../core/app/Controller";
import { Provide } from "../../core/decorators/Provide";
import { GameService } from "../services/GameService";
import { LobbyService } from "../services/LobbyService";

export class GameController extends Controller {
    constructor(
        @Provide(LobbyService) private readonly lobbyService: LobbyService,
        @Provide(GameService) private readonly gameService: GameService
    ) {
        super({ path: "/game/{gameId}" });
    }
}
