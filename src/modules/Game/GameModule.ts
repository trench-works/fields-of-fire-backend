import { Module } from "../../core";
import { GameController } from "./application/GameController";
import { GameDataManager } from "./data/GameDataManager";
import { GameRepository } from "./data/GameRepository";
import { GameService } from "./services/GameService";
import { GameWebSocketManager } from "./web/GameWebSocketManager";

export class GameModule extends Module {
    constructor() {
        super({
            controllers: [GameController],
            providers: [GameDataManager, GameService, GameWebSocketManager, GameRepository],
        });
    }
}
