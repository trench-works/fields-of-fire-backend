import { Logger, Provide, Ran } from "../../../core";
import { PositionUtils } from "../../../game-lib";
import { Action } from "../../Action/data/Action";
import { CharacterClass } from "../../CharacterClass/data/CharacterClass";
import { CharacterClassRepository } from "../../CharacterClass/data/CharacterClassRepository";
import { Entity } from "../../Game/data/Entity";
import { CellAStar, Game } from "../../Game/data/Game";
import { GameDataManager } from "../../Game/data/GameRepository";
import { GameWebSocketManager } from "../../Game/web/GameWebSocketManager";
import { Stats } from "../../Stat/data/Stats";

export class MobService {
    @Provide(GameDataManager)
    private readonly gameDataManager!: GameDataManager;
    @Provide("Logger")
    private readonly logger!: Logger;
    @Provide(GameWebSocketManager)
    private readonly socketManager!: GameWebSocketManager;
    @Provide(CharacterClassRepository)
    private readonly classRepository!: CharacterClassRepository;

    async play(gameId: string) {
        const game = await this.gameDataManager.get(gameId);
        if (!game) {
            return;
        }

        await this.mobAction(game);
        //await new Promise((resolve) => setTimeout(resolve, 1000));

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
        const stats = Stats.fromEntity(entity);
        let lastPA = stats.energy;
        let lastPM = stats.mouvement;
        let PA = stats.energy;
        let PM = stats.mouvement;
        let firstTry = true;
        while (firstTry || (PM !== lastPM && PA !== lastPA)) {
            firstTry = false;
            lastPA = PA;
            lastPM = PM;
            console.log(PA, PM, lastPA, lastPM);

            const nearestPlayer = this.getNearestPlayer(game, entity);
            let playerRange = this.getDistance(entity, nearestPlayer);

            const action = this.getAttack(charClass, playerRange, PA);
            if (PA) {
                if (action) {
                    // do damages
                    const damage = action.damage
                        ? action.damage.min +
                          Ran.int(action.damage.max - action.damage.min)
                        : 0;
                    nearestPlayer.stats.life -= damage; //TODO: apply defense and dodge
                    // remove energy points
                    PA -= action.cost;
                }
            }
            if (PM) {
                if (action) {
                    break;
                }
                while (playerRange > 0 && PM > 0) {
                    playerRange = this.getDistance(entity, nearestPlayer);

                    const moves = new CellAStar().findPath(
                        entity.position,
                        nearestPlayer.position,
                        game.plateau
                    );
                    while (PM > 0 && moves.length > 1) {
                        entity.position = PositionUtils.add(
                            entity.position,
                            moves[0]
                        );
                        PM--;
                        moves.shift();
                    }
                }
            }

            // Update users display
            this.gameDataManager.set(game.id, game);
            this.socketManager.emitUpdate(game);
        }
    }

    private getDistance(entityA: Entity, entityB: Entity): number {
        return PositionUtils.distance(entityA.position, entityB.position);
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
            })?.[0];
        return mostPowerfulInRangeAction;
    }

    private getNearestPlayer(game: Game, mob: Entity): Entity {
        const entitiesRange: Record<string, number> = {};
        for (const player of game.players) {
            const entity = game.entities.find(
                (entity) => entity.entityId === player.entityId
            )!;
            entitiesRange[entity.entityId] = this.getDistance(mob, entity);
        }

        const targetEntityId = Object.entries(entitiesRange).sort(
            ([, aRange], [, bRange]) => (aRange > bRange ? -1 : 1)
        )?.[0]?.[0];

        return game.entities.find(
            (entity) => entity.entityId === targetEntityId
        )!;
    }
}
