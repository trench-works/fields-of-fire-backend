import { Id, Provide } from "../../../core";
import { Position } from "../../../game-lib";
import { Action } from "../../Action/data/Action";
import { CharacterClassRepository } from "../../CharacterClass/data/CharacterClassRepository";
import { Entity, EntityType } from "../../Game/data/Entity";
import { Game } from "../../Game/data/Game";

export class InvocationService {
    @Provide(CharacterClassRepository)
    private readonly characterClassRepository!: CharacterClassRepository;

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
        }
    }
}
