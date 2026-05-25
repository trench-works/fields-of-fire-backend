import { Module } from "../../core";
import { PlayerController } from "./application/PlayerController";
import { EntityService } from "./services/EntityService";
import { MobService } from "./services/MobService";
import { PlayerActionService } from "./services/PlayerActionService";
import { PlayerWebSocketManager } from "./web/PlayerWebSocketManager";

export class PlayerModule extends Module {
    constructor() {
        super({
            controllers: [PlayerController],
            providers: [
                PlayerActionService,
                PlayerWebSocketManager,
                MobService,
                EntityService,
            ],
        });
    }
}
