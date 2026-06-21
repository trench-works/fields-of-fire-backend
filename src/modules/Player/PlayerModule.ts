import { Module } from "../../core";
import { PlayerController } from "./application/PlayerController";
import { TurnTimeoutRepository } from "./data/TurnTimeoutRepository";
import { AttackService } from "./services/AttackService";
import { BoostService } from "./services/BoostService";
import { EntityService } from "./services/EntityService";
import { InvocationService } from "./services/InvocationService";
import { MobService } from "./services/MobService";
import { PlayerActionService } from "./services/PlayerActionService";
import { PlayerService } from "./services/PlayerService";
import { PlayerWebSocketManager } from "./web/PlayerWebSocketManager";

export class PlayerModule extends Module {
    constructor() {
        super({
            controllers: [PlayerController],
            providers: [
                TurnTimeoutRepository,
                PlayerWebSocketManager,
                PlayerActionService,
                MobService,
                EntityService,
                AttackService,
                BoostService,
                PlayerService,
                InvocationService,
            ],
        });
    }
}
