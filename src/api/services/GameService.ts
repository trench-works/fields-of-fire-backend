import { Provide } from "../../core/decorators/Provide";
import { AsyncProvided } from "../../core/types/AsyncProvided";
import { Provider } from "../../core/types/Provider";
import { GameDataManager } from "../data/GameDataManager";
import { LobbyService } from "./LobbyService";

export class GameService implements AsyncProvided {
    lobbyService: LobbyService;

    constructor(
        @Provide(GameDataManager)
        private readonly gameDataManager: GameDataManager
    ) {}
    asyncProvide(...providers: Provider[]): void {
        throw new Error("Method not implemented.");
    }

    // asyncProvide(@Provide(LobbyService) lobbyService: LobbyService): void {
    //     this.lobbyService = lobbyService;
    //     console.log("oui");
    //     lobbyService.getTest();
    // }
}
