import { Module } from "../../core";
import { LobbyController } from "./application/LobbyController";
import { LobbyHttpController } from "./application/LobbyHttpController";
import { LobbyDataManager } from "./data/LobbyDataManager";
import { LobbyGuard } from "./services/LobbyGuard";
import { LobbyService } from "./services/LobbyService";
import { LobbyWebSocketManager } from "./web/LobbyWebSocketManager";

export class LobbyModule extends Module {
    constructor() {
        super({
            controllers: [LobbyController, LobbyHttpController],
            providers: [
                LobbyDataManager,
                LobbyService,
                LobbyGuard,
                LobbyWebSocketManager,
            ],
        });
    }
}
