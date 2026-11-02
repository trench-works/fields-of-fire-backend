import {
    ColdRessource,
    DBError,
    FolderRepository,
    Provide,
} from "../../../core";
import { Effect } from "../../Effect/data/Effect";
import { EffectRepository } from "../../Effect/data/EffectRepository";
import { Action, ActionEntity } from "./Action";

export class ActionRepository extends FolderRepository<Action, ActionEntity> {
    @Provide(EffectRepository)
    private readonly effectRepository!: ColdRessource<Effect>;

    async entityToRessource(entity: ActionEntity): Promise<Action> {
        const effectList: Effect[] = [];
        const selfEffectList: Effect[] = [];
        const onHitEffectList: Effect[] = [];
        if (entity.effectList) {
            for (const key of entity.effectList) {
                const effect = await this.effectRepository.get(key);
                if (effect && !(effect instanceof DBError)) {
                    effectList.push(effect);
                }
            }
        }
        if (entity.selfEffectList) {
            for (const key of entity.selfEffectList) {
                const selfEffect = await this.effectRepository.get(key);
                if (selfEffect && !(selfEffect instanceof DBError)) {
                    selfEffectList.push(selfEffect);
                }
            }
        }
        if (entity.onHitEffectList) {
            for (const key of entity.onHitEffectList) {
                const onHitEffect = await this.effectRepository.get(key);
                if (onHitEffect && !(onHitEffect instanceof DBError)) {
                    onHitEffectList.push(onHitEffect);
                }
            }
        }
        return {
            ...entity,
            effectList,
            selfEffectList,
            onHitEffectList,
        };
    }

    constructor() {
        super("actions");
    }
}
