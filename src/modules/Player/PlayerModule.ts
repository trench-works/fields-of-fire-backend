import { Module } from "../../core";
import { PlayerController } from "./application/PlayerController";
import { PlayerActionService } from "./services/PlayerActionService";
import { PlayerService } from "./services/PlayerService";

export class PlayerModule extends Module {
    constructor() {
        super({
            controllers: [PlayerController],
            providers: [PlayerService, PlayerActionService],
        });
    }
}
