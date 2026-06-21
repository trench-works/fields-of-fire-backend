import { Module } from "../../core";
import { GameController } from "./application/GameController";
import { GameDataManager } from "./data/GameRepository";
import { GameService } from "./services/GameService";
import { GameSubscriptionManager } from "./services/GameSubscriptionManager";
import { GameTurnService } from "./services/GameTurnService";
import { GameWebSocketManager } from "./web/GameWebSocketManager";

export class GameModule extends Module {
    constructor() {
        super({
            controllers: [GameController],
            providers: [
                GameDataManager,
                GameService,
                GameWebSocketManager,
                GameTurnService,
                GameSubscriptionManager,
            ],
        });
    }
}
