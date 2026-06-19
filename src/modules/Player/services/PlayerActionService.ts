import { Logger, Provide, SocketError } from "../../../core";

import { Position, PositionUtils } from "../../../game-lib/Utils";
import { Action, ActionUtils } from "../../Action/data/Action";
import { ActionRepository } from "../../Action/data/ActionRepository";
import { Effect } from "../../Effect/data/Effect";
import { GameEventAnimation } from "../../Game/application/interfaces/GameUpdateEvent";
import { Entity } from "../../Game/data/Entity";
import { Cell, CellAStar, Game } from "../../Game/data/Game";
import { GameDataManager } from "../../Game/data/GameRepository";
import { GameTurnService } from "../../Game/services/GameTurnService";
import { GameWebSocketManager } from "../../Game/web/GameWebSocketManager";
import { Stats } from "../../Stat/data/Stats";
import { PlayerCancelAction } from "../application/interfaces/PlayerCancelAction";
import { Player } from "../data/Player";
import { PlayerOutputActions } from "../web/PlayerSocketActions";
import { AttackService } from "./AttackService";
import { BoostService } from "./BoostService";

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
    CHARGE = "charge",
    FIGHTING_DRUG = "fighting_drug",
    SABER = "saber",
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
    @Provide(AttackService)
    private readonly attackService!: AttackService;
    @Provide(BoostService)
    private readonly boostService!: BoostService;

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
            case PlayerActionId.SHOOT:
            case PlayerActionId.HEAL:
            case PlayerActionId.SABER:
                return await this.attack(
                    game,
                    player,
                    playerEntity,
                    action,
                    destination
                );
            case PlayerActionId.INTIMIDATION:
            case PlayerActionId.DOPAGE:
            case PlayerActionId.SNEAKY:
            case PlayerActionId.FIGHTING_DRUG:
            case PlayerActionId.CHARGE:
                return await this.boost(
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

    async boost(
        game: Game,
        player: Player,
        playerEntity: Entity,
        action: Action,
        destination: Cell
    ): Promise<void | SocketError | PlayerCancelAction> {
        this.checkIfAllowed(playerEntity, action, destination);

        const targetList = this.getTarget(
            game,
            playerEntity,
            action,
            destination
        );

        for (const target of targetList) {
            this.logger.debug(`action.effectList : ${action.effectList}`);
            for (const effect of action.effectList!) {
                this.applyEffect(player.name, target, effect);
            }
        }

        playerEntity.stats.energy -= action.cost;
        this.animate(game, playerEntity, action, destination, targetList);
        await this.gameDataManager.set(game.id, game);
    }

    async move(
        game: Game,
        playerEntity: Entity,
        destination: Cell
    ): Promise<void | SocketError | PlayerCancelAction> {
        // Libère l'ancienne case
        const range = PositionUtils.distance(
            playerEntity.position,
            destination.position
        );

        const mouvement = Stats.fromEntity(playerEntity).mouvement;
        if (range > mouvement) {
            return {
                actionId: PlayerOutputActions.CANCEL_ACTION,
                payload: {
                    reason: "mouvement",
                },
            };
        }
        const movePath: Position[] = new CellAStar().findPathPositions(
            playerEntity.position,
            destination.position,
            game.plateau
        );
        const currentCase =
            game.plateau[playerEntity.position.x][playerEntity.position.y];
        // Occupe la nouvelle case
        currentCase.entityId = undefined;
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
                    path: movePath,
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
        this.checkIfAllowed(playerEntity, action, destination);

        const targetList = this.getTarget(
            game,
            playerEntity,
            action,
            destination
        );

        for (const target of targetList) {
            if (action.damage) {
                const damage = this.attackService.calculateDamage(
                    action,
                    playerEntity,
                    target
                );
                this.applyDamage(target, damage);
            }
            if (action.effectList && target.stats.life > 0) {
                this.logger.debug(`action.effectList : ${action.effectList}`);
                for (const effect of action.effectList) {
                    this.applyEffect(player.name, target, effect);
                }
            }
        }
        //to finalize
        playerEntity.stats.energy -= action.cost;

        this.logger.log(
            `Player ${playerEntity.entityId} performed action ${action.name} on cell (${destination.position.x}, ${destination.position.y}) with damage ${action.damage?.min}-${action.damage?.max}`
        );
        this.animate(game, playerEntity, action, destination, targetList);

        await this.gameTurnService.detectGameEnd(game);
        await this.gameDataManager.set(game.id, game);
    }

    checkMoveDestination(cell: Cell): boolean {
        return Boolean(!cell.entityId && !cell.isHole && !cell.isWall);
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
        const effectCopy = { ...effect };
        if (caster) {
            effectCopy.author = caster;
        }

        target.effects.push(effectCopy);
    }

    getTarget(
        game: Game,
        playerEntity: Entity,
        action: Action,
        destination: Cell
    ): Entity[] {
        const targetEntity: Entity[] = ActionUtils.getEntitiesInRange(
            action,
            game,
            destination.position
        ).filter((entity) => entity.entityType === playerEntity.entityType);
        return targetEntity;
    }

    async animate(
        game: Game,
        playerEntity: Entity,
        action: Action,
        destination: Cell,
        targetEntity: Entity[]
    ) {
        const animations: GameEventAnimation[] = [
            {
                key: "attack",
                data: {
                    entityId: playerEntity.entityId,
                    actionId: action.id,
                    origin: playerEntity.position,
                    target: destination.position,
                    hits: targetEntity.map((target) => target.position),
                },
            },
        ];
        animations.push(...this.gameTurnService.detectEntityDeath(game));
        await this.socketManager.emitUpdate(game, animations);
    }

    checkIfAllowed(playerEntity: Entity, action: Action, destination: Cell) {
        this.logger.log(
            "WHATS THE VALUE ?" + Stats.fromEntity(playerEntity).energy
        );
        if (Stats.fromEntity(playerEntity).energy < action.cost) {
            return {
                actionId: PlayerOutputActions.CANCEL_ACTION,
                payload: {
                    reason: "energy",
                },
            };
        }
        if (action.targetRequired && !destination?.entityId) {
            return {
                actionId: PlayerOutputActions.CANCEL_ACTION,
                payload: {
                    reason: "target-visible",
                },
            };
        }
    }
}
