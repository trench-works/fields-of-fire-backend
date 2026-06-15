import { Logger, Provide, SocketError } from "../../../core";

import { PositionUtils } from "../../../game-lib/Utils";
import { Action, ActionType, ActionUtils } from "../../Action/data/Action";
import { ActionRepository } from "../../Action/data/ActionRepository";
import { Effect } from "../../Effect/data/Effect";
import { GameEventAnimation } from "../../Game/application/interfaces/GameUpdateEvent";
import { Entity } from "../../Game/data/Entity";
import { Cell, Game } from "../../Game/data/Game";
import { GameDataManager } from "../../Game/data/GameRepository";
import { GameTurnService } from "../../Game/services/GameTurnService";
import { GameWebSocketManager } from "../../Game/web/GameWebSocketManager";
import { Stats } from "../../Stat/data/Stats";
import { PlayerCancelAction } from "../application/interfaces/PlayerCancelAction";
import { Player } from "../data/Player";
import { PlayerOutputActions } from "../web/PlayerSocketActions";

export enum PlayerActionId {
    WALK = "walk",
    SHOOT = "shoot",
    HEAL = "heal",
    BAYONET = "bayonet",
    ARTILLERY_SUPPORT = "artillery_support",
    AMPUTATE = "amputate",
    INTIMIDATION = "intimidation",
    SNEAKY = "sneaky",
    DOPAGE = "dopage",
}

export class PlayerActionService {
    @Provide(GameDataManager)
    private readonly gameDataManager!: GameDataManager;
    @Provide("Logger")
    private readonly logger!: Logger;
    @Provide(ActionRepository)
    private readonly actionRepository!: ActionRepository;
    @Provide(GameWebSocketManager)
    private readonly socketManager!: GameWebSocketManager;
    @Provide(GameTurnService)
    private readonly gameTurnService!: GameTurnService;

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

        this.gameTurnService.finishTurn(game.id);
    }

    async action(
        actionId: PlayerActionId,
        gameId: string,
        playerId: string,
        target: { x: number; y: number }
    ): Promise<void | SocketError | PlayerCancelAction> {
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
            case PlayerActionId.DOPAGE:
            case PlayerActionId.SHOOT:
            case PlayerActionId.HEAL:
                return await this.attack(
                    game,
                    player,
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
    ): Promise<void | SocketError | PlayerCancelAction> {
        if (!this.checkMoveDestination(destination)) {
            return {
                actionId: PlayerOutputActions.CANCEL_ACTION,
                payload: {
                    reason: "occupied",
                },
            };
        }
        // Libère l'ancienne case
        const range = PositionUtils.distance(
            playerEntity.position,
            destination.position
        );
        if (range > playerEntity.stats.mouvement) {
            return {
                actionId: PlayerOutputActions.CANCEL_ACTION,
                payload: {
                    reason: "mouvement",
                },
            };
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

        await this.socketManager.emitUpdate(game, [
            {
                key: "move",
                data: {
                    entityId: playerEntity.entityId,
                },
            },
        ]);
    }

    async attack(
        game: Game,
        player: Player,
        playerEntity: Entity,
        action: Action,
        destination: Cell
    ): Promise<void | SocketError | PlayerCancelAction> {
        if (Stats.fromEntity(playerEntity).energy < action.cost) {
            return {
                actionId: PlayerOutputActions.CANCEL_ACTION,
                payload: {
                    reason: "energy",
                },
            };
        }
        const animations: GameEventAnimation[] = [
            {
                key: "attack",
                data: {
                    entityId: playerEntity.entityId,
                    actionId: action.id,
                    target: destination.position,
                },
            },
        ];
        if (action.targetRequired && !destination?.entityId) {
            return {
                actionId: PlayerOutputActions.CANCEL_ACTION,
                payload: {
                    reason: "target-visible",
                },
            };
        }
        const targetEntity: Entity[] = ActionUtils.getEntitiesInRange(
            action,
            game,
            destination.position
        );
        this.logger.log(`player ${playerEntity}`);
        for (const target of targetEntity) {
            if (action.damage) {
                const damage = this.calculateDamage(
                    playerEntity,
                    action,
                    target
                );
                this.applyDamage(target, damage);
            }
            if (action.effectList) {
                this.logger.debug(`action.effectList : ${action.effectList}`);
                for (const effect of action.effectList) {
                    this.applyEffect(player.name, target, effect);
                }
            }
        }

        //to finalize
        playerEntity.stats.energy -= action.cost;
        animations.push(...this.gameTurnService.detectEntityDeath(game));
        await this.gameDataManager.set(game.id, game);

        this.logger.log(
            `Player ${playerEntity.entityId} performed action ${action.name} on cell (${destination.position.x}, ${destination.position.y}) with damage ${action.damage?.min}-${action.damage?.max}`
        );
        await this.socketManager.emitUpdate(game, animations);
        await this.gameTurnService.detectGameEnd(game);
    }

    checkMoveDestination(cell: Cell): boolean {
        return Boolean(!cell.entityId && !cell.isHole && !cell.isWall);
    }

    calculateDamage(attacker: Entity, action: Action, target: Entity): number {
        const damageRange = action.damage!.max - action.damage!.min + 1;
        const randomDamage =
            Math.floor(Math.random() * damageRange) + action.damage!.min;

        let statBonus;

        switch (action.actionType) {
            case ActionType.MELEE:
                {
                    statBonus = Math.ceil(attacker.stats!.strength / 10);
                }
                break;
            case ActionType.RANGED:
                {
                    statBonus = Math.ceil(attacker.stats!.precision / 10);
                }
                break;
            default: {
                statBonus = 0;
            }
        }

        let brutTotal;
        let reduction;
        if (action.damage!.min < 0) {
            brutTotal = randomDamage - statBonus;
        } else {
            brutTotal = randomDamage + statBonus;
            reduction = Math.ceil(brutTotal * (target.stats!.armor / 100));
        }

        this.logger.log(`Calculated : ${brutTotal - (reduction ?? 0)} dammage`);

        const finalDamage = brutTotal - (reduction ?? 0);

        return finalDamage;

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

    applyEffect(caster: string | undefined, target: Entity, effect: Effect) {
        if (!target.stats) {
            this.logger.error("Target entity has no stats");
            return;
        }
        if (caster) {
            effect.author = caster;
        }
        target.effects.push(effect);
    }
}
