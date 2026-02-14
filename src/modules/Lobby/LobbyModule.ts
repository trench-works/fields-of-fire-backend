import { Module } from "../../core";
import { LobbyController } from "./application/LobbyController";
import { LobbyDataManager } from "./data/LobbyDataManager";
import { LobbyGuard } from "./services/LobbyGuard";
import { LobbyService } from "./services/LobbyService";

export class LobbyModule extends Module {
    constructor() {
        super({
            controllers: [LobbyController],
            providers: [LobbyDataManager, LobbyService, LobbyGuard],
        });
    }
}
