import { EffectTarget } from "../../Action/data/Action";
import { Effect } from "./Effect";

export type EffectModifierEntity = {
    effect: string;
    chanceToApply?: number | string;   
    target?: EffectTarget;
    onHit?: boolean;
    create?: boolean;
};

export type EffectModifier = Omit<EffectModifierEntity, "effect"> & {
    effect: Effect;
};