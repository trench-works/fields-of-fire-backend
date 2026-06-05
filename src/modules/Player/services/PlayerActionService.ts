import { Logger, Provide, SocketError } from "../../../core";
import { PositionUtils } from "../../../core/app/Utils";
import { Action, ActionType } from "../../Action/data/Action";
import { ActionRepository } from "../../Action/data/ActionRepository";
import { CharacterClassRepository } from "../../CharacterClass/data/CharacterClassRepository";
import { Entity } from "../../Game/data/Entity";
import { Cell, Game } from "../../Game/data/Game";
import { GameDataManager } from "../../Game/data/GameRepository";
import { GameWebSocketManager } from "../../Game/web/GameWebSocketManager";
import { MobService } from "./MobService";

export enum PlayerActionId {
    WALK = "walk",
    SHOOT = "shoot",
    HEAL = "heal",
    BAYONET = "bayonet",
    ARTILLERY_SUPPORT = "artillery_support",
    AMPUTATE = "amputate",
    INTIMIDATION = "intimidation",
    SNEAKY = "sneaky",
}

export class PlayerActionService {
    @Provide(GameDataManager)
    private readonly gameDataManager!: GameDataManager;
    @Provide("Logger")
    private readonly logger!: Logger;
    @Provide(ActionRepository)
    private readonly actionRepository!: ActionRepository;
    @Provide(CharacterClassRepository)
    private readonly classRepository!: CharacterClassRepository;
    @Provide(MobService)
    private readonly mobService!: MobService;
    @Provide(GameWebSocketManager)
    private readonly socketManager!: GameWebSocketManager;

    async finishTurn(
        gameId: string,
        playerId: string
    ): Promise<void | SocketError> {
        const game = await this.gameDataManager.get(gameId);
        if (!game) {
            return new SocketError("Game not found");
        }

        // Determinate if it is player's turn
        const playingEntityId = game.playerTurns[0];
        const player = game.players.find(
            (player) => player.playerId === playerId
        );
        if (playingEntityId !== player?.entityId) {
            return new SocketError("It is not the player's turn");
        }

        // Do turn change mechanic
        const playerEntity = game.entities.find(
            (entity) => entity.entityId === playingEntityId
        )!;
        const entityClass = (await this.classRepository.get(
            playerEntity.classId
        ))!;
        playerEntity.stats.energy = entityClass.stats.energy;
        playerEntity.stats.mouvement = entityClass.stats.mouvement;
        game.playerTurns.shift();
        game.playerTurns.push(playingEntityId);

        // If new playing entity is a mob, then launch playing actions for the mob
        const newPlayingMob = game.npc.find(
            (mob) => mob.entityId === game.playerTurns[0]
        );

        this.socketManager.emitUpdate(game);

        if (newPlayingMob) {
            try {
                await this.mobService.play(gameId);
            } catch (err) {
                this.logger.debug(err);
            }
        } else {
            //TODO: if new playing entity is a player, start a Timeout to finish its turn automatically
        }
    }

    async action(
        actionId: PlayerActionId,
        gameId: string,
        playerId: string,
        target: { x: number; y: number }
    ): Promise<void | SocketError> {
        this.logger.log("PlayerActionService action method called");

        const game = await this.gameDataManager.get(gameId);
        if (!game) {
            return new SocketError("Game not found");
        }
        const destination = game.plateau[target.x][target.y];
        const player = game.players.find(
            (player) => player.playerId === playerId
        )!;
        const playerEntity = game.entities.find(
            (e) => e.entityId === player!.entityId
        );
        if (!playerEntity) {
            return new SocketError("Entity not found");
        }

        const listActions = await this.actionRepository.list();
        const action = listActions.find((a) => a.id === actionId);
        if (!action) {
            return new SocketError("Action not found");
        }

        switch (actionId) {
            case PlayerActionId.WALK:
                return await this.move(game, playerEntity, destination);
            case PlayerActionId.AMPUTATE:
            case PlayerActionId.ARTILLERY_SUPPORT:
            case PlayerActionId.BAYONET:
            case PlayerActionId.INTIMIDATION:
            case PlayerActionId.SNEAKY:
            case PlayerActionId.SHOOT:
            case PlayerActionId.HEAL:
                return await this.shoot(
                    game,
                    playerEntity,
                    action,
                    destination
                );

            default:
                this.logger.error("Unknown action ID");
        }
    }

    async move(
        game: Game,
        playerEntity: Entity,
        destination: Cell
    ): Promise<void | SocketError> {
        if (!this.checkMoveDestination(destination)) {
            return new SocketError("Destination cell is already occupied");
        }
        // Libère l'ancienne case
        const range = PositionUtils.distance(
            playerEntity.position,
            destination.position
        );
        if (range > playerEntity.stats.mouvement) {
            return new SocketError(
                "Not enough movement points to perform this action"
            );
        }
        const currentCase =
            game.plateau[playerEntity.position.x][playerEntity.position.y];
        currentCase.entityId = undefined;
        // Occupe la nouvelle case
        destination.entityId = playerEntity.entityId;
        // Met à jour la position
        playerEntity.position = destination.position;
        playerEntity.stats.mouvement -= range;

        await this.gameDataManager.set(game.id, game);

        this.socketManager.emitUpdate(game);
    }

    async shoot(
        game: Game,
        playerEntity: Entity,
        action: Action,
        destination: Cell
    ): Promise<void | SocketError> {
        if (action.targetRequired && !destination?.entityId) {
            return new SocketError(
                "You must target a visible entity to perform this action"
            );
        }
        let targetEntity: Entity[] = [];

        if (action.zoneType && action.zoneSize) {
            switch (action.zoneType) {
                case "cross": {
                    const crossTargets = game.entities.filter((entity) => {
                        const isInCross =
                            (entity.position.x === destination.position.x &&
                                Math.abs(
                                    entity.position.y - destination.position.y
                                ) <= action.zoneSize!) ||
                            (entity.position.y === destination.position.y &&
                                Math.abs(
                                    entity.position.x - destination.position.x
                                ) <= action.zoneSize!);
                        return (
                            isInCross &&
                            entity.entityId !== playerEntity.entityId
                        );
                    });
                    targetEntity = crossTargets;
                    break;
                }
            }
        } else {
            const target = game.entities.find(
                (e) => e.entityId === destination.entityId
            );
            targetEntity.push(target!);
        }

        if (action.targetRequired && targetEntity.length === 0) {
            return new SocketError("Target entity not found");
        }

        for (const target of targetEntity) {
            const damage = this.calculateDamage(playerEntity, action, target);
            this.applyDamage(target, damage);
        }

        //to finalize
        playerEntity.stats.energy -= action.cost;

        await this.gameDataManager.set(game.id, game);
        this.logger.log(
            `Player ${playerEntity.entityId} performed action ${action.name} on cell (${destination.position.x}, ${destination.position.y}) with damage ${action.damage?.min}-${action.damage?.max}`
        );
        this.socketManager.emitUpdate(game);
    }

    checkMoveDestination(cell: Cell): boolean {
        return Boolean(!cell.entityId && !cell.isHole && !cell.isWall);
    }

    calculateDamage(attacker: Entity, action: Action, target: Entity): number {
        const damageRange = action.damage!.max - action.damage!.min + 1;
        const randomDamage =
            Math.floor(Math.random() * damageRange) + action.damage!.min;

        const statBonus =
            action.actionType === ActionType.MELEE
                ? Math.ceil(attacker.stats!.strength / 10)
                : Math.ceil(attacker.stats!.precision / 10);

        const brutTotal = randomDamage + statBonus;
        const reduction = Math.ceil(brutTotal * (target.stats!.armor / 100));

        this.logger.log(`Calculated : ${brutTotal - reduction} dammage`);

        return brutTotal - reduction;

        //TODO: ajouter les effets de l'attaque, et ajout de chances d'échecs
    }
    applyDamage(target: Entity, damage: number) {
        if (!target.stats) {
            this.logger.error("Target entity has no stats");
            return;
        }
        target.stats.life -= damage;
        this.logger.log(
            `Applied ${damage} damage to entity ${target.entityId}, remaining life: ${target.stats.life}`
        );
        if (target.stats.life < 0) {
            target.stats.life = 0;
        }

        return target.stats.life;
    }
}
