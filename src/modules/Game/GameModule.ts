import { Module } from "../../core";
import { GameController } from "./application/GameController";
import { GameDataManager } from "./data/GameRepository";
import { GameDataLocker } from "./services/GameDataLocker";
import { GameService } from "./services/GameService";
import { GameSubscriptionManager } from "./web/GameSubscriptionManager";
import { GameTurnService } from "./services/GameTurnService";
import { GameWebSocketManager } from "./web/GameWebSocketManager";
import { MapService } from "./services/MapService";
import { GameHttpController } from "./application/GameHttpController";

export class GameModule extends Module {
    constructor() {
        super({
            controllers: [GameController, GameHttpController],
            providers: [
                GameDataManager,
                GameService,
                GameWebSocketManager,
                GameTurnService,
                GameSubscriptionManager,
                GameDataLocker,
                MapService,
            ],
        });
    }
}
