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
        const entityClass = await this.classRepository.get(
            playerEntity.classId
        );
        playerEntity.stats = { ...playerEntity.stats, ...entityClass?.stats };
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
            case PlayerActionId.SHOOT:
                return await this.shoot(
                    game,
                    playerEntity,
                    action,
                    destination
                );
            case PlayerActionId.HEAL:
                break;
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
        if (!destination?.entityId) {
            return new SocketError("No entity to shoot at");
        }
        const targetEntity = game.entities.find(
            (e) => e.entityId === destination.entityId
        );
        if (!targetEntity) {
            return new SocketError("Target entity not found");
        }

        const damage = this.calculateDamage(playerEntity, action);
        this.logger.log(`Calculated damage: ${damage}`);

        this.applyDamage(targetEntity, damage);

        //to finalize
        playerEntity.stats.energy -= action.cost;

        await this.gameDataManager.set(game.id, game);

        this.socketManager.emitUpdate(game);
    }

    checkMoveDestination(cell: Cell): boolean {
        return Boolean(!cell.entityId && !cell.isHole && !cell.isWall);
    }

    calculateDamage(attacker: Entity, action: Action): number {
        const dammageRandomRange = action.damage!.max - action.damage!.min + 1;
        const randomDammage =
            Math.floor(Math.random() * dammageRandomRange) + action.damage!.min;
        const statBonus =
            action.actionType === ActionType.MELEE
                ? Math.ceil(attacker.stats!.strength / 10)
                : Math.ceil(attacker.stats!.precision / 10);
        const totalDamage = randomDammage + statBonus;
        return totalDamage;

        //TODO: ajouter les effets de l'attaque, gestion multi-Target, et ajout de chances d'échecs
    }
    applyDamage(target: Entity, damage: number) {
        if (!target.stats) {
            this.logger.error("Target entity has no stats");
            return;
        }
        target.stats.life -= damage;
        if (target.stats.life < 0) {
            target.stats.life = 0;
        }

        return target.stats.life;
    }
}
