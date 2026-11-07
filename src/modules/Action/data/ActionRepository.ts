import {
    ColdRessource,
    DBError,
    FolderRepository,
    Provide,
} from "../../../core";
import { Effect } from "../../Effect/data/Effect";
import { EffectRepository } from "../../Effect/data/EffectRepository";
import { Action, ActionEntity, ManagedEffect } from "./Action";

export class ActionRepository extends FolderRepository<Action, ActionEntity> {
    @Provide(EffectRepository)
    private readonly effectRepository!: ColdRessource<Effect>;

    async entityToRessource(entity: ActionEntity): Promise<Action> {
    const effectList: ManagedEffect[] = [];
    for (const managed of entity.effectList ?? []) {
        const effect = await this.effectRepository.get(managed.effect);
        if (effect && !(effect instanceof DBError)) {
            const { effect: _id, ...rest } = managed;
            effectList.push({ ...rest, effect });
        }
    }
    return { ...entity, effectList };
}

    constructor() {
        super("actions");
    }
}
