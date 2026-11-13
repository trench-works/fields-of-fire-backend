import {
    ColdRessource,
    DBError,
    FolderRepository,
    Provide,
} from "../../../core";
import { Effect } from "../../Effect/data/Effect";
import { EffectRepository } from "../../Effect/data/EffectRepository";
import { Action, ActionEntity, AllyOverride, ManagedEffect, ManagedEffectEntity } from "./Action";

export class ActionRepository extends FolderRepository<Action, ActionEntity> {
    @Provide(EffectRepository)
    private readonly effectRepository!: ColdRessource<Effect>;

    async entityToRessource(entity: ActionEntity): Promise<Action> {
        const effectList = await this.managedEffectsToRessources(
            entity.effectList
        );

        let onAlly: AllyOverride | undefined;

        if (entity.onAlly) {
            onAlly = {
                ...entity.onAlly,
                effectList: await this.managedEffectsToRessources(
                    entity.onAlly.effectList
                ),
            };
        }

        return {
            ...entity,
            effectList,
            onAlly,
        };
    }

    constructor() {
        super("actions");
    }

    private async managedEffectsToRessources(
        managedEffects?: ManagedEffectEntity[]
    ): Promise<ManagedEffect[]> {
        const effectList: ManagedEffect[] = [];

        for (const managed of managedEffects ?? []) {
            const effect = await this.effectRepository.get(managed.effect);

            if (effect && !(effect instanceof DBError)) {
                const { effect: _id, ...rest } = managed;
                effectList.push({ ...rest, effect });
            }
        }
        return effectList;
    }
}
