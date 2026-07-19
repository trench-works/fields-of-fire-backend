import { Provide } from "../../../core";
import { Position } from "../../../game-lib";
import { Action } from "../../Action/data/Action";
import { GameEventAnimation } from "../../Game/application/interfaces/GameUpdateEvent";
import { Entity } from "../../Game/data/Entity";
import { Cell, Game } from "../../Game/data/Game";
import { GameTurnService } from "../../Game/services/GameTurnService";
import { GameWebSocketManager } from "../../Game/web/GameWebSocketManager";
import { AttackTarget } from "./PlayerActionService";

export class ActioAnimationService {
    @Provide(GameWebSocketManager)
    private readonly socketManager!: GameWebSocketManager;
    @Provide(GameTurnService)
    private readonly gameTurnService!: GameTurnService;

    async animate(
        game: Game,
        playerEntity: Entity,
        action: Action,
        destination: Cell,
        targets: AttackTarget[],
        path?: Position[]
    ) {
        const animations: GameEventAnimation[] = [
            {
                key: "attack",
                data: {
                    entityId: playerEntity.id,
                    actionId: action.id,
                    origin: playerEntity.position,
                    target: destination.position,
                    hits: targets.map(({ entity, damage }) => ({
                        ...entity.position,
                        damage,
                    })),
                    path,
                },
            },
        ];
        animations.push(...this.gameTurnService.detectEntityDeath(game));
        await this.socketManager.emitUpdate(game, animations);
    }
}
