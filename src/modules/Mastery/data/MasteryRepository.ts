import {
    ColdRessource,
    DBError,
    FolderRepository,
    Provide,
} from "../../../core";
import { Effect } from "../../Effect/data/Effect";
import { Action } from "../../Action/data/Action";
import { Mastery, MasteryEntity } from "./Mastery";
import { ActionRepository } from "../../Action/data/ActionRepository";
import { EffectRepository } from "../../Effect/data/EffectRepository";

export class MasteryRepository extends FolderRepository<Mastery, MasteryEntity> {
    @Provide(ActionRepository)
    private readonly actionRepository!: ColdRessource<Action>;
    @Provide(EffectRepository)
    private readonly effectRepository!: ColdRessource<Effect>;

    async entityToRessource(entity: MasteryEntity): Promise<Mastery> {
        const newActions: Action[] = [];
        const actionNewEffect: { actionId: string; effect: Effect }[] = [];
        let passive: Effect | undefined;
        if (entity.newActions) {
            for (const key of entity.newActions) {
                const effect = await this.actionRepository.get(key);
                if (effect && !(effect instanceof DBError)) {
                    newActions.push(effect);
                }
            }
        }
        for (const { actionId, effect: effectId } of entity.actionNewEffect ?? []) {
            const effect = await this.effectRepository.get(effectId);
            if (effect && !(effect instanceof DBError)) {
                actionNewEffect.push({ actionId, effect });
            }
        }
        if (entity.passive) {
            const effect = await this.effectRepository.get(entity.passive);
            if (effect && !(effect instanceof DBError)) {
                passive = effect;
            }
        }
        return {
            ...entity,
            newActions,
            actionNewEffect,
            passive,
        };
    }

    constructor() {
        super("masteries");
    }
}
