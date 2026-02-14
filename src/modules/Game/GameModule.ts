import { Module } from "../../core/app/Module";
import { GameController } from "./application/GameController";
import { GameDataManager } from "./data/GameDataManager";
import { GameService } from "./services/GameService";

export class GameModule extends Module {
    constructor() {
        super({
            controllers: [GameController],
            providers: [GameDataManager, GameService],
        });
    }
}
