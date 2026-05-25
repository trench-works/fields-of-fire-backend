import { Logger, Provide } from "../../../core";
import { GameOutputActions } from "../../Game/application/interfaces/GameAction";
import { GameDataManager } from "../../Game/data/GameRepository";
import { GameWebSocketManager } from "../../Game/web/GameWebSocketManager";

export class MobService {
    constructor(
        @Provide(GameDataManager)
        private readonly gameDataManager: GameDataManager,
        @Provide("Logger") private readonly logger: Logger,
        @Provide(GameWebSocketManager)
        private readonly socketManager: GameWebSocketManager
    ) {}

    async play(gameId: string) {
        const game = await this.gameDataManager.get(gameId);
        if (!game) {
            //TODO: Skip turn to next entity
            return;
        }

        //TODO: do some playing actions with some Timeout

        const playingEntity = game.playerTurns.shift();
        if (playingEntity) {
            game.playerTurns.push(playingEntity);
        }

        // Emit Update
        this.socketManager.emit({
            actionId: GameOutputActions.UPDATE,
            key: { gameId },
            payload: game,
        });

        // If new playing entity is a mob, then launch playing actions for the mob
        const newPlayingMob = game.npc.find(
            (mob) => mob.entityId === game.playerTurns[0]
        );
        if (newPlayingMob) {
            this.play(gameId);
        }
    }
}
