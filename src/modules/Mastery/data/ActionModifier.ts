import { ActionEntity, ActionZoneType, ActionType, ActionLevel, Action } from "../../Action/data/Action";
import { Effect } from "../../Effect/data/Effect";

export type ActionModification = { id: string } & ActionModifier;

export type ActionModificationEntity = { id: string } & ActionModifierEntity;

export class ActionModifier {
        name?: string;
        description?: string;
        damage?: { min?: number | string; max?: number |string };
        effectList?: Effect[];
        selfEffectList?: Effect[];
        onHitEffectList?: Effect[];
        rangeType?: ActionZoneType;
        range?: { min?: number | string; max?: number |string};
        zoneType?: ActionZoneType[];
        zoneSize?: number | string;
        actionType?: ActionType;
        maxUsePerTarget?: number | string;
        maxUsePerRound?: number | string;
        cost?: number | string;
        targetRequired?: boolean;
        invocateClass?: string;
        level?: ActionLevel;
}

export class ActionModifierEntity {
        name?: string;
        description?: string;
        damage?: { min?: number | string; max?: number |string };
        effectList?: string[];
        selfEffectList?: string[];
        onHitEffectList?: string[];
        rangeType?: ActionZoneType;
        range?: { min?: number | string; max?: number |string};
        zoneType?: ActionZoneType[];
        zoneSize?: number | string;
        actionType?: ActionType;
        maxUsePerTarget?: number | string;
        maxUsePerRound?: number | string;
        cost?: number | string;
        targetRequired?: boolean;
        invocateClass?: string;
        level?: ActionLevel;
}

const DELTA = /^([+\-*])(\d+(?:\.\d+)?)$/;

export function isValidModifierValue(v: number | string): boolean {
    return typeof v === "number" || DELTA.test(v.trim());
}

function resolveValue(base: number, mod?: number | string): number {
    if (mod === undefined) return base;
    if (typeof mod === "number") return mod;               
    const match = DELTA.exec(mod.trim());
    if (!match) return base;                               
    const n = Number(match[2]);
    switch (match[1]) {
        case "+": return base + n;
        case "-": return base - n;
        default:  return base * n;                         
    }
}

export function applyModification(action: Action, mod: ActionModification): Action {
    const { id: _id, damage, range, effectList, selfEffectList, onHitEffectList, zoneSize, maxUsePerTarget, maxUsePerRound, cost, ...simple } = mod;

    const defined = Object.fromEntries(
        Object.entries(simple).filter(([, v]) => v !== undefined),
    );

    const result: Action = { ...action, ...defined };

    if (range) {
        const min = Math.max(0, resolveValue(action.range.min, range.min));
        const max = Math.max(min, resolveValue(action.range.max, range.max));
        result.range = { min, max };
    }
    if (damage) {
        const min = Math.max(0, resolveValue(action.damage?.min ?? 0, damage.min));
        const max = Math.max(min, resolveValue(action.damage?.max ?? 0, damage.max));
        result.damage = { min, max };
    }
    if(zoneSize){
        result.zoneSize = resolveValue(action.zoneSize, zoneSize);
    }
    if(maxUsePerTarget){
        result.maxUsePerTarget = resolveValue(action.maxUsePerTarget ?? 0, maxUsePerTarget);
    }
    if(maxUsePerRound){
        result.maxUsePerRound = resolveValue(action.maxUsePerRound ?? 0, maxUsePerRound);
    }
    if(cost){
        result.cost = resolveValue(action.cost , cost);
    }
    if (effectList) result.effectList = effectList;
    if (selfEffectList) result.selfEffectList = selfEffectList;
    if (onHitEffectList) result.onHitEffectList = onHitEffectList;
    return result;
}