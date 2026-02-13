import { Provide } from "../../core/decorators/Provide";
import { LobbyService } from "./LobbyService";

export class GameService {
    constructor(
        @Provide(LobbyService) private readonly lobbyService: LobbyService
    ) {}
}
