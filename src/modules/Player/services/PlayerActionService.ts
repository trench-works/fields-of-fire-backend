import { Logger, Provide, SocketError } from "../../../core";
import { Action } from "../../Action/data/Action";
import { ActionRepository } from "../../Action/data/ActionRepository";
import { Entity } from "../../Game/data/Entity";
import { Cell, Game } from "../../Game/data/Game";
import { GameDataManager } from "../../Game/data/GameRepository";
import { MobService } from "./MobService";

export class PlayerActionService {
    @Provide(GameDataManager)
    private readonly gameDataManager!: GameDataManager;
    @Provide("Logger") private readonly logger!: Logger;
    @Provide(ActionRepository)
    private readonly actionRepository!: ActionRepository;
    @Provide(MobService) private readonly mobService!: MobService;

    async finishTurn(
        gameId: string,
        playerId: string
    ): Promise<Game | SocketError> {
        const game = await this.gameDataManager.get(gameId);
        if (!game) {
            return new SocketError("Game not found");
        }

        // Determinate if it is player's turn
        const playingEntityId = game.playerTurns[0];
        const playerEntityId = game.players.find(
            (player) => player.playerId === playerId
        )!.entityId;
        if (playingEntityId !== playerEntityId) {
            return new SocketError("It is not the player's turn");
        }

        // Do turn change mechanic
        game.playerTurns.shift();
        game.playerTurns.push(playingEntityId);

        // If new playing entity is a mob, then launch playing actions for the mob
        const newPlayingMob = game.npc.find(
            (mob) => mob.entityId === game.playerTurns[0]
        );
        if (newPlayingMob) {
            this.mobService.play(gameId);
        } else {
            //TODO: if new playing entity is a player, start a Timeout to finish its turn automatically
        }

        return game;
    }

    async action(
        actionId: string,
        gameId: string,
        playerId: string,
        target: { x: number; y: number }
    ): Promise<Game | null> {
        this.logger.log("PlayerActionService action method called");

        const game = await this.gameDataManager.get(gameId);
        if (!game) {
            this.logger.error("Game not found");
            return null;
        }
        const destination = game.plateau[target.x][target.y];
        if (!this.checkDestination(destination)) {
            this.logger.error("Destination cell is already occupied");
            return null;
        }
        const player = game.players.find(
            (player) => player.playerId === playerId
        )!;
        const PlayerEntity = game.entities.find(
            (e) => e.entityId === player!.entityId
        );
        if (!PlayerEntity) {
            this.logger.error("Entity not found");
            return null;
        }

        const listActions = await this.actionRepository.list();
        const action = listActions.find((a) => a.id === actionId);
        if (!action) {
            this.logger.error("Action not found");
            return null;
        }

        switch (actionId) {
            case "walk": {
                // Libère l'ancienne case
                const currentCase =
                    game.plateau[PlayerEntity.position.x][
                        PlayerEntity.position.y
                    ];
                currentCase.entityId = undefined;
                // Occupe la nouvelle case
                destination.entityId = player.entityId;
                // Met à jour la position
                PlayerEntity.position = target;

                await this.gameDataManager.set(gameId, game);

                return game;
            }
            case "shoot":
                {
                    if (!destination?.entityId) {
                        this.logger.error("No entity to shoot at");
                        return null;
                    }
                    const targetEntity = game.entities.find(
                        (e) => e.entityId === destination.entityId
                    );
                    if (!targetEntity) {
                        this.logger.error("Target entity not found");
                        return null;
                    }

                    const damage = this.calculateDamage(PlayerEntity, action);
                    this.logger.log(`Calculated damage: ${damage}`);

                    this.applyDamage(targetEntity, damage);

                    //to finalize
                }
                break;
            case "heal":
                break;
            default:
                this.logger.error("Unknown action ID");
        }
        return null;
    }

    checkDestination(cell: Cell): boolean {
        return Boolean(!cell.entityId && !cell.isHole && !cell.isWall);
    }

    calculateDamage(attacker: Entity, action: Action): number {
        const dammageRandomRange = action.damage!.max - action.damage!.min + 1;
        const randomDammage =
            Math.floor(Math.random() * dammageRandomRange) + action.damage!.min;
        const statBonus =
            action.actionType === "melee"
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
