import { Module } from "../../core/app/Module";
import { LobbyController } from "./application/LobbyController";
import { LobbyDataManager } from "./data/LobbyDataManager";
import { LobbyService } from "./services/LobbyService";

export class LobbyModule extends Module {
    constructor() {
        super({
            controllers: [LobbyController],
            providers: [LobbyDataManager, LobbyService],
        });
    }
}
