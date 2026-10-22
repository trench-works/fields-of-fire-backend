import { Id, Provide } from "../../../core";
import { Position } from "../../../game-lib";
import { Action } from "../../Action/data/Action";
import { CharacterClassRepository } from "../../CharacterClass/data/CharacterClassRepository";
import { Entity, EntityType } from "../../Game/data/Entity";
import { Game } from "../../Game/data/Game";
import { GameDataManager } from "../../Game/data/GameRepository";
import { PlayerCancelAction } from "../application/interfaces/PlayerCancelAction";
import { PlayerOutputActions } from "../web/PlayerSocketActions";
import { ActioAnimationService } from "./ActionAnimationService";

export class InvocationService {
    @Provide(CharacterClassRepository)
    private readonly characterClassRepository!: CharacterClassRepository;
    @Provide(GameDataManager)
    private readonly gameDataManager!: GameDataManager;
    @Provide(ActioAnimationService)
    private readonly animationService!: ActioAnimationService;

    async createInvocation(
        game: Game,
        invoker: Entity,
        action: Action,
        position: Position
    ): Promise<PlayerCancelAction | void> {
        const cell = game.plateau[position.x][position.y];
        if (cell.entityId) {
            return {
                actionId: PlayerOutputActions.CANCEL_ACTION,
                payload: {
                    reason: "occupied",
                },
            };
        }
        if (action.invocateClass) {
            const charClass = (await this.characterClassRepository.get(
                action.invocateClass
            ))!;
            const entity: Entity = {
                id: Id.get(),
                classId: charClass.id,
                teamId: invoker.teamId,
                controllerId: invoker.id,
                type: EntityType.NPC,
                position,
                stats: charClass.stats,
                effects: [],
                boosts: [],
                dead: false,
                isInvocation: true,
                isPlaying: charClass.isPlaying,
            };
            game.teams
                .find((team) => team.id === invoker.teamId)
                ?.entitiesIds.push(entity.id);
            game.entities.push(entity);
            //game.playerTurns.splice(1, 0, entity.id);
            cell.entityId = entity.id;
            invoker.stats.energy -= action.cost;
            this.animationService.animate(game, invoker, action, cell, []);
            await this.gameDataManager.set(game.id, game);
        }
    }
}
