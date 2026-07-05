import { Id, Provide } from "../../../core";
import { Position } from "../../../game-lib";
import { Action } from "../../Action/data/Action";
import { CharacterClassRepository } from "../../CharacterClass/data/CharacterClassRepository";
import { Entity, EntityType } from "../../Game/data/Entity";
import { Game } from "../../Game/data/Game";
import { GameDataManager } from "../../Game/data/GameRepository";
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
    ) {
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
                dead: false,
            };
            game.teams
                .find((team) => team.id === invoker.teamId)
                ?.entitiesIds.push(entity.id);
            game.entities.push(entity);
            //game.playerTurns.splice(1, 0, entity.id);
            const cell = game.plateau[position.x][position.y];
            cell.entityId = entity.id;
            this.animationService.animate(game, invoker, action, cell, []);
            await this.gameDataManager.set(game.id, game);
        }
    }
}
