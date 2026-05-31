import { Logger, Provide, Ran } from "../../../core";
import { Action } from "../../Action/data/Action";
import { CharacterClass } from "../../CharacterClass/data/CharacterClass";
import { CharacterClassRepository } from "../../CharacterClass/data/CharacterClassRepository";
import { Entity } from "../../Game/data/Entity";
import { Game } from "../../Game/data/Game";
import { GameDataManager } from "../../Game/data/GameRepository";
import { GameWebSocketManager } from "../../Game/web/GameWebSocketManager";
import { Stats } from "../../Stat/data/Stats";
import { EntityService } from "./EntityService";

export class MobService {
    @Provide(GameDataManager)
    private readonly gameDataManager!: GameDataManager;
    @Provide("Logger")
    private readonly logger!: Logger;
    @Provide(GameWebSocketManager)
    private readonly socketManager!: GameWebSocketManager;
    @Provide(CharacterClassRepository)
    private readonly classRepository!: CharacterClassRepository;
    @Provide(EntityService)
    private readonly entityService!: EntityService;

    async play(gameId: string) {
        const game = await this.gameDataManager.get(gameId);
        if (!game) {
            return;
        }

        //await this.mobAction(game);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const playingEntityId = game.playerTurns.shift();
        if (playingEntityId) {
            game.playerTurns.push(playingEntityId);
        }
        const playerEntity = game.entities.find(
            (entity) => entity.entityId === playingEntityId
        )!;
        const entityClass = await this.classRepository.get(
            playerEntity.classId
        );
        playerEntity.stats = { ...playerEntity.stats, ...entityClass?.stats };

        // Emit Update
        this.gameDataManager.set(game.id, game);
        this.socketManager.emitUpdate(game);

        // If new playing entity is a mob, then launch playing actions for the mob
        const newPlayingMob = game.npc.find(
            (mob) => mob.entityId === game.playerTurns[0]
        );
        if (newPlayingMob) {
            this.play(gameId);
        }
    }

    private async mobAction(game: Game) {
        const entity = game.entities.find(
            (entity) => entity.entityId === game.playerTurns[0]
        )!;
        //const mob = game.npc.find((mob) => mob.entityId === entity.entityId)!;
        const charClass = await this.classRepository.get(entity.classId);
        if (!charClass) {
            return;
        }
        let lastStats: Stats = { ...entity.stats };
        while (
            (entity.stats.mouvement === charClass.stats.mouvement &&
                entity.stats.energy === charClass.stats.energy) ||
            (entity.stats.mouvement !== lastStats.mouvement &&
                entity.stats.energy !== lastStats.energy)
        ) {
            lastStats = { ...entity.stats };
            const nearestPlayer = await this.getNearestPlayer(game, entity);
            let distance = this.getDistance(entity, nearestPlayer);
            let playerRange = Math.abs(distance.x) + Math.abs(distance.y);

            const action = this.getAttack(
                charClass,
                playerRange,
                entity.stats.energy
            );
            if (entity.stats.energy) {
                if (action) {
                    // do damages
                    nearestPlayer.stats.life -= action.damage
                        ? action.damage.min +
                          Ran.int(action.damage.max - action.damage.min)
                        : 0;
                    // remove energy points
                    entity.stats.energy -= action.cost;
                }
            }
            if (entity.stats.mouvement) {
                if (action) {
                    break;
                }
                while (playerRange > 1 && entity.stats.mouvement > 0) {
                    distance = this.getDistance(entity, nearestPlayer);
                    playerRange = Math.abs(distance.x) + Math.abs(distance.y);

                    //TODO: move toward player
                    //await this.entityService.moveEntity(game, ...);

                    entity.stats.mouvement--;
                }
            }

            // Update users display
            this.socketManager.emitUpdate(game);
        }
    }

    private getDistance(
        entityA: Entity,
        entityB: Entity
    ): { x: number; y: number } {
        return {
            x: entityA.position.x - entityB.position.x,
            y: entityA.position.y - entityB.position.y,
        };
    }

    private getAttack(
        charClass: CharacterClass,
        minRange: number,
        energy: number
    ): Action | undefined {
        //TODO: apply transformer on damages based on target and action launcher
        const mostPowerfulInRangeAction = charClass.actionList
            .filter(
                (action) =>
                    (action.range ?? 0) > minRange && action.cost <= energy
            )
            .sort((actionA, actionB) => {
                const midDamageA = actionA.damage
                    ? (actionA.damage.max - actionA.damage.min) / 2 +
                      actionA.damage.min
                    : 0;
                const midDamageB = actionB.damage
                    ? (actionB.damage.max - actionB.damage.min) / 2 +
                      actionB.damage.min
                    : 0;
                return midDamageA > midDamageB ? 1 : -1;
            })[0];
        return mostPowerfulInRangeAction;
    }

    private async getNearestPlayer(
        game: Game,
        entity: Entity
    ): Promise<Entity> {
        const player = game.players[0];
        const playerEntity = game.entities.find(
            (entity) => entity.entityId === player.entityId
        )!;
        return playerEntity;
    }
}
