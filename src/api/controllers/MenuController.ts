import { Controller } from "../../core/app/Controller";
import { Provide } from "../../core/decorators/Provide";
import { LobbyService } from "../services/LobbyService";

export class MenuController extends Controller {
    constructor(@Provide(LobbyService) lobbyService: LobbyService) {
        super({ path: "menu" });
    }
}
