import { Logger, Provide, SocketError } from "../../../core";

import { Position, PositionUtils } from "../../../game-lib/Utils";
import { Action, ActionUtils, ActionZoneType } from "../../Action/data/Action";
import { ActionRepository } from "../../Action/data/ActionRepository";
import { Effect } from "../../Effect/data/Effect";
import { Entity } from "../../Game/data/Entity";
import { Cell, CellAStar, Game } from "../../Game/data/Game";
import { GameDataManager } from "../../Game/data/GameRepository";
import { GameDataLocker } from "../../Game/services/GameDataLocker";
import { GameTurnService } from "../../Game/services/GameTurnService";
import { GameWebSocketManager } from "../../Game/web/GameWebSocketManager";
import { Stats } from "../../Stat/data/Stats";
import { PlayerCancelAction } from "../application/interfaces/PlayerCancelAction";
import { Player } from "../data/Player";
import { PlayerOutputActions } from "../web/PlayerSocketActions";
import { ActioAnimationService } from "./ActionAnimationService";
import { AttackService } from "./AttackService";
import { InvocationService } from "./InvocationService";

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
    BREAK = "break",
    PROVOK = "provok",
    SHIELD_RUSH = "shield_rush",
    BARRICADE = "barricade",
}

export enum DashType {
    GAPCLOSE = "GAPCLOSE",
    IN = "IN",
    OUT = "OUT",
}

export type AttackTarget = {
    entity: Entity;
    damage: number;
    effects: Effect[];
};

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
    @Provide(ActioAnimationService)
    private readonly animationService!: ActioAnimationService;
    @Provide(InvocationService)
    private readonly invocationService!: InvocationService;
    @Provide(GameDataLocker)
    private readonly gameDataLocker!: GameDataLocker;

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
        const player = game.players.find((player) => player.id === playerId);
        if (playingEntityId !== player?.entityId) {
            return new SocketError("It is not the player's turn");
        }

        this.gameTurnService.finishTurn(game.id);
    }

    private isActionPossible(action: Action, entity: Entity): boolean {
        const stats = Stats.fromEntity(entity);
        switch (action.id) {
            case "WALK":
                if (!stats.mouvement) {
                    return false;
                }
                break;
            default:
                if (stats.energy < action.cost) {
                    return false;
                }
                break;
        }
        return true;
    }

    private async checkBeforeAction(
        actionId: PlayerActionId,
        gameId: string,
        playerId: string,
        target: Position
    ): Promise<
        | {
              game: Game;
              player: Player;
              playerEntity: Entity;
              destination: Cell;
              action: Action;
          }
        | SocketError
    > {
        const game = await this.gameDataManager.get(gameId);
        if (!game) {
            return new SocketError("Game not found");
        }
        const destination = game.plateau[target.x][target.y];
        const player = game.players.find((player) => player.id === playerId)!;
        const playerEntity = game.entities.find(
            (e) => e.id === player!.entityId
        );
        if (!playerEntity) {
            return new SocketError("Entity not found");
        }
        if (playerEntity.id !== game.playerTurns[0]) {
            return new SocketError("Not player turn");
        }

        const listActions = await this.actionRepository.list();
        const action = listActions.find((a) => a.id === actionId);
        if (!action) {
            return new SocketError("Action not found");
        }

        if (!this.isActionPossible(action, playerEntity)) {
            return new SocketError("Can't do this action");
        }
        return { game, player, playerEntity, destination, action };
    }

    async action(
        actionId: PlayerActionId,
        gameId: string,
        playerId: string,
        target: Position
    ): Promise<void | SocketError | PlayerCancelAction> {
        this.logger.log("PlayerActionService action method called");

        const precheckResult = await this.checkBeforeAction(
            actionId,
            gameId,
            playerId,
            target
        );
        if (precheckResult instanceof SocketError) {
            return precheckResult;
        }

        await this.gameDataLocker.waitLock(gameId); //WAIT FOR DATA IS UNLOCK
        this.gameDataLocker.lock(gameId); //LOCK THE GAME ID

        const checkResult = await this.checkBeforeAction(
            actionId,
            gameId,
            playerId,
            target
        );
        if (checkResult instanceof SocketError) {
            return checkResult;
        }
        const { game, player, playerEntity, destination, action } = checkResult;

        let result: void | SocketError | PlayerCancelAction = undefined;

        switch (actionId) {
            case PlayerActionId.WALK:
                result = await this.move(
                    game,
                    player,
                    playerEntity,
                    destination
                );
                break;
            case PlayerActionId.AMPUTATE:
            case PlayerActionId.ARTILLERY_SUPPORT:
            case PlayerActionId.BAYONET:
            case PlayerActionId.SHOOT:
            case PlayerActionId.HEAL:
            case PlayerActionId.SABER:
            case PlayerActionId.BREAK:
            case PlayerActionId.INTIMIDATION:
                result = await this.attack(
                    game,
                    playerEntity,
                    action,
                    destination
                );
                break;
            case PlayerActionId.PROVOK:
            case PlayerActionId.DOPAGE:
            case PlayerActionId.SNEAKY:
            case PlayerActionId.FIGHTING_DRUG:
            case PlayerActionId.CHARGE:
                result = await this.boost(
                    game,
                    player,
                    playerEntity,
                    action,
                    destination
                );
                break;
            case PlayerActionId.BARRICADE:
                result = await this.invocationService.createInvocation(
                    game,
                    playerEntity,
                    action,
                    destination.position
                );
                break;
            case PlayerActionId.SHIELD_RUSH:
                result = await this.attackAndDash(
                    game,
                    playerEntity,
                    action,
                    destination
                );
                break;
            default:
                this.logger.error("Unknown action ID");
        }
        this.gameDataLocker.unlock(gameId); //UNLOCK THE GAME ID
        return result;
    }

    private async boost(
        game: Game,
        player: Player,
        playerEntity: Entity,
        action: Action,
        destination: Cell
    ): Promise<void | SocketError | PlayerCancelAction> {
        this.checkIfAllowed(playerEntity, action, destination);

        const targetEntities = this.getBoostTarget(
            game,
            playerEntity,
            action,
            destination
        );

        const targets = targetEntities.map((entity) => {
            const target: AttackTarget = {
                entity,
                damage: 0,
                effects: [],
            };
            if (action.effectList) {
                for (const effect of action.effectList) {
                    this.attackService.applyEffect(player.name, entity, effect);
                }
                target.effects = action.effectList;
            }
            return target;
        });

        playerEntity.stats.energy -= action.cost;
        this.animationService.animate(
            game,
            playerEntity,
            action,
            destination,
            targets
        );
        await this.gameDataManager.set(game.id, game);
    }

    private async move(
        game: Game,
        player: Player,
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
        destination.entityId = playerEntity.id;
        // Met à jour la position
        playerEntity.position = destination.position;
        playerEntity.stats.mouvement -= range;

        player.stats.steps += movePath.length - 1; // count steps taken

        await this.gameDataManager.set(game.id, game);

        await this.socketManager.emitUpdate(game, [
            {
                key: "move",
                data: {
                    entityId: playerEntity.id,
                    path: movePath,
                },
            },
        ]);
    }

    private async attack(
        game: Game,
        playerEntity: Entity,
        action: Action,
        destination: Cell
    ): Promise<void | SocketError | PlayerCancelAction> {
        this.checkIfAllowed(playerEntity, action, destination);

        const targets = this.dammageTargets(
            game,
            playerEntity,
            action,
            destination
        );

        //to finalize
        playerEntity.stats.energy -= action.cost;

        this.logger.log(
            `Player ${playerEntity.id} performed action ${action.name} on cell (${destination.position.x}, ${destination.position.y}) with damage ${action.damage?.min}-${action.damage?.max}`
        );
        this.animationService.animate(
            game,
            playerEntity,
            action,
            destination,
            targets
        );

        await this.gameDataManager.set(game.id, game);

        await this.gameTurnService.detectGameEnd(game);
    }

    private async attackAndDash(
        game: Game,
        playerEntity: Entity,
        action: Action,
        destination: Cell
    ): Promise<void | SocketError | PlayerCancelAction> {
        const targets = this.dammageTargets(
            game,
            playerEntity,
            action,
            destination
        );
        const newCell = this.findGapClosePosition(
            game,
            playerEntity,
            destination
        );
        let movePath: Position[] = [];
        if (newCell) {
            movePath = new CellAStar().findPathPositions(
                playerEntity.position,
                newCell.position,
                game.plateau
            );
            game.plateau[playerEntity.position.x][
                playerEntity.position.y
            ].entityId = undefined;
            newCell.entityId = playerEntity.id;
            playerEntity.position = { ...newCell.position };
        }

        playerEntity.stats.energy -= action.cost;
        this.animationService.animate(
            game,
            playerEntity,
            action,
            destination,
            targets,
            movePath
        );
        await this.gameDataManager.set(game.id, game);
        await this.gameTurnService.detectGameEnd(game);
    }

    private checkMoveDestination(cell: Cell): boolean {
        return Boolean(!cell.entityId && !cell.isHole && !cell.isWall);
    }

    private getTarget(game: Game, action: Action, destination: Cell): Entity[] {
        const targetEntity: Entity[] = ActionUtils.getEntitiesInRange(
            action,
            game,
            destination.position
        );
        return targetEntity;
    }

    private getAttackTarget(game: Game, action: Action, destination: Cell) {
        return this.getTarget(game, action, destination);
    }

    private getBoostTarget(
        game: Game,
        playerEntity: Entity,
        action: Action,
        destination: Cell
    ) {
        return this.getTarget(game, action, destination).filter(
            (entity) => entity.teamId === playerEntity.teamId
        );
    }

    private checkIfAllowed(
        playerEntity: Entity,
        action: Action,
        destination: Cell
    ) {
        if (Stats.fromEntity(playerEntity).energy < action.cost) {
            return {
                actionId: PlayerOutputActions.CANCEL_ACTION,
                payload: {
                    reason: "energy",
                },
            };
        }

        this.checkRange(playerEntity, action, destination);

        if (action.targetRequired && !destination?.entityId) {
            return {
                actionId: PlayerOutputActions.CANCEL_ACTION,
                payload: {
                    reason: "target-visible",
                },
            };
        }
    }

    private checkRange(
        playerEntity: Entity,
        action: Action,
        destination: Cell
    ): PlayerCancelAction | void {
        const distance = PositionUtils.distance(
            playerEntity.position,
            destination.position
        );

        // Vérification de la distance min/max
        if (distance < action.range.min || distance > action.range.max) {
            return {
                actionId: PlayerOutputActions.CANCEL_ACTION,
                payload: { reason: "range" },
            };
        }

        // Vérification selon le type de zone
        const dx = Math.abs(destination.position.x - playerEntity.position.x);
        const dy = Math.abs(destination.position.y - playerEntity.position.y);

        switch (action.rangeType) {
            case ActionZoneType.PLUS:
                // ligne droite uniquement
                if (dx !== 0 && dy !== 0) {
                    return {
                        actionId: PlayerOutputActions.CANCEL_ACTION,
                        payload: { reason: "range" },
                    };
                }
                break;

            case ActionZoneType.XCROSS:
                // diagonale uniquement
                if (dx !== dy) {
                    return {
                        actionId: PlayerOutputActions.CANCEL_ACTION,
                        payload: { reason: "range" },
                    };
                }
                break;

            case ActionZoneType.DIAMOND:
            case ActionZoneType.CIRCLE:
                break;
        }
    }

    private dammageTargets(
        game: Game,
        playerEntity: Entity,
        action: Action,
        destination: Cell
    ) {
        const targetEntities = this.getAttackTarget(game, action, destination);
        this.logger.debug(`action : ${JSON.stringify(action)}`);

        const targets: AttackTarget[] = targetEntities.map<AttackTarget>(
            (entity) => {
                const target: AttackTarget = {
                    entity,
                    damage: 0,
                    effects: [],
                };

                const damage = this.attackService.applyDamage(
                    game,
                    action,
                    playerEntity,
                    entity
                );
                target.damage = damage;

                return target;
            }
        );
        return targets;
    }
    private findGapClosePosition(
        game: Game,
        attacker: Entity,
        destination: Cell
    ): Cell | null {
        const dx = destination.position.x - attacker.position.x;
        const dy = destination.position.y - attacker.position.y;

        // Direction normalisée vers la cible
        const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
        const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;

        // Cherche la case juste avant la cible (côté attaquant)
        // en remontant depuis la cible vers l'attaquant
        let checkX = destination.position.x;
        let checkY = destination.position.y;
        if (destination.entityId) {
            checkX -= stepX;
            checkY -= stepY;
        }

        while (
            checkX !== attacker.position.x ||
            checkY !== attacker.position.y
        ) {
            const cell = game.plateau[checkX]?.[checkY];
            if (cell && this.checkMoveDestination(cell)) {
                return cell; // première case libre adjacente à la cible
            }
            checkX -= stepX;
            checkY -= stepY;
        }

        return null; // pas de case libre trouvée
    }
}
