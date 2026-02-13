import { Provide } from "../../core/decorators/Provide";
import { GameDataManager } from "../data/GameDataManager";

export class GameService {
    constructor(
        @Provide(GameDataManager)
        private readonly gameDataManager: GameDataManager
    ) {}

    // asyncProvide(@Provide(LobbyService) lobbyService: LobbyService): void {
    //     this.lobbyService = lobbyService;
    //     console.log("oui");
    //     lobbyService.getTest();
    // }
}
