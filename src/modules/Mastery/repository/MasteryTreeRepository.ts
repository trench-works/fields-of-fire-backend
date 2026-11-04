import { FolderRepository, Provide, ColdRessource, DBError } from "../../../core";
import { Action } from "../../Action/data/Action";
import { ActionRepository } from "../../Action/data/ActionRepository";
import { Effect } from "../../Effect/data/Effect";
import { EffectRepository } from "../../Effect/data/EffectRepository";
import { MasteryTree, Mastery, MasteryEntity, MasteryTreeEntity } from "../data/Mastery";

export class MasteryTreeRepository extends FolderRepository<MasteryTree, MasteryTreeEntity> {
    @Provide(ActionRepository)
    private readonly actionRepository!: ColdRessource<Action>;
    @Provide(EffectRepository)
    private readonly effectRepository!: ColdRessource<Effect>;

    async entityToRessource(entity: MasteryTreeEntity): Promise<MasteryTree> {
        const masteries: Mastery[] = [];
        for (const m of entity.masteries) {
            masteries.push(await this.resolveMastery(m));
        }
        const rootMastery = entity.rootMastery
            ? await this.resolveMastery(entity.rootMastery)
            : undefined;
        return { ...entity, rootMastery, masteries };
    }

    private async resolveMastery(entity: MasteryEntity): Promise<Mastery> {
        const newActions: Action[] = [];
        for (const id of entity.newActions ?? []) {
            const action = await this.actionRepository.get(id);
            if (action && !(action instanceof DBError)) newActions.push(action);
        }

        const actionNewEffect: { actionId: string; effect: Effect }[] = [];
        for (const { actionId, effectId } of entity.actionNewEffect ?? []) {
            const effect = await this.effectRepository.get(effectId);
            if (effect && !(effect instanceof DBError)) {
                actionNewEffect.push({ actionId, effect });
            }
        }

        let passive: Effect | undefined;
        if (entity.passive) {
            const effect = await this.effectRepository.get(entity.passive);
            if (effect && !(effect instanceof DBError)) passive = effect;
        }

        const subMasteries: Mastery[] = [];
        for (const sub of entity.subMasteries ?? []) {
            subMasteries.push(await this.resolveMastery(sub));
        }

        const { newActions: _a, actionNewEffect: _e, passive: _p, subMasteries: _s, ...rest } = entity;
        return { ...rest, newActions, actionNewEffect, passive, subMasteries };
    }

    constructor() {
        super("masteries");
    }
}