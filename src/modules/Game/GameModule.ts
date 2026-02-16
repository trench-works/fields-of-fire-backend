import { Module } from "../../core";
import { GameController } from "./application/GameController";
import { GameSocketManager } from "./application/GameSocketManager";
import { GameDataManager } from "./data/GameDataManager";
import { GameService } from "./services/GameService";

export class GameModule extends Module {
    constructor() {
        super({
            controllers: [GameController],
            providers: [GameDataManager, GameService, GameSocketManager],
        });
    }
}
