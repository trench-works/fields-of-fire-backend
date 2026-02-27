import { BrutDataManager } from "../../../core/app/Database/BrutDataManager";
import { Game } from "./Game";

export class GameDataManager extends BrutDataManager<Game> {
    constructor() {
        super("game")
    }
}
