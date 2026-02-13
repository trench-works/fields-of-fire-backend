import { Provide } from "../../core/decorators/Provide";
import { GameDataManager } from "../data/GameDataManager";

export class LobbyService {
    constructor(
        @Provide(GameDataManager)
        private readonly gameDataManager: GameDataManager
    ) {}

    getTest() {
        console.log("test");
    }
}
