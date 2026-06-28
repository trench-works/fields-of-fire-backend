import {
    ColdRessource,
    DBError,
    FolderRepository,
    Provide,
} from "../../../core";
import { Action } from "../../Action/data/Action";
import { ActionRepository } from "../../Action/data/ActionRepository";
import { CharacterClass } from "./CharacterClass";
import { CharacterClassEntity } from "./CharacterClassEntity";

export class CharacterClassRepository extends FolderRepository<
    CharacterClass,
    CharacterClassEntity
> {
    @Provide(ActionRepository)
    private readonly actionRepository!: ColdRessource<Action>;

    async entityToRessource(
        entity: CharacterClassEntity
    ): Promise<CharacterClass> {
        const actionList: Action[] = [];
        for (const key of entity.actionList) {
            const action = await this.actionRepository.get(key);
            if (action && !(action instanceof DBError)) {
                actionList.push(action);
            }
        }
        return {
            ...entity,
            actionList,
        };
    }

    constructor() {
        super("classes");
    }
}
