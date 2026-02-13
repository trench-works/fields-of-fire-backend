import { GameDataManager } from "../../Game/data/GameDataManager";
import { Provide } from "../../../core/decorators/Provide";

export class LobbyService {
    constructor(
        @Provide(GameDataManager)
        private readonly gameDataManager: GameDataManager
    ) {}

    getTest() {
        console.log("test");
    }
}
