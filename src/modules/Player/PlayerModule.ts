import { Module } from "../../core";
import { PlayerController } from "./application/PlayerController";
import { PlayerActionService } from "./services/PlayerActionService";
import { PlayerService } from "./services/PlayerService";
import { PlayerWebSocketManager } from "./web/PlayerWebSocketManager";

export class PlayerModule extends Module {
    constructor() {
        super({
            controllers: [PlayerController],
            providers: [PlayerService, PlayerActionService, PlayerWebSocketManager],
        });
    }
}
