import { EffectModifier, EffectModifierEntity } from "../../Effect/data/EffectModifier";
import { ActionZoneType, ActionType, ActionLevel, Action, ManagedEffect, ManagedEffectEntity, EffectTarget, AllyOverride, AllyOverrideEntity } from "./Action";

export type ActionModification = { id: string } & ActionModifier;

export type ActionModificationEntity = { id: string } & ActionModifierEntity;

export class ActionModifier {
        name?: string;
        description?: string;
        damage?: { min?: number | string; max?: number |string };
        effectList?: ManagedEffect[];
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
        onAlly?: AllyOverride
        level?: ActionLevel;
        effectModified?: EffectModifier[];
}

export class ActionModifierEntity {
        name?: string;
        description?: string;
        damage?: { min?: number | string; max?: number |string };
        effectList?: ManagedEffectEntity[];
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
        onAlly?: AllyOverrideEntity;
        invocateClass?: string;
        level?: ActionLevel;
        effectModified?: EffectModifierEntity[];
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
    const { id: _id, damage, range, effectList, effectModified, zoneSize, maxUsePerTarget, maxUsePerRound, cost, ...simple } = mod;

    const defined = Object.fromEntries(
        Object.entries(simple).filter(([, v]) => v !== undefined),
    );

    const result: Action = { ...action, ...defined };
    const clampChance = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

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
    if (zoneSize !== undefined) {
        result.zoneSize = Math.max(0, resolveValue(action.zoneSize, zoneSize));
    }
    if (cost !== undefined) {
        result.cost = Math.max(0, resolveValue(action.cost, cost));
    }
    if (maxUsePerTarget !== undefined) {
        result.maxUsePerTarget = resolveOptionalValue(action.maxUsePerTarget, maxUsePerTarget);
    }
    if (maxUsePerRound !== undefined) {
        result.maxUsePerRound = resolveOptionalValue(action.maxUsePerRound, maxUsePerRound);
    }
    if (effectList) result.effectList = effectList;

    if (effectModified?.length) {
        const list = [...(result.effectList ?? action.effectList ?? [])];
        for (const p of effectModified) {
            const index = list.findIndex(
                (m) =>
                    m.effect.id === p.effect.id &&
                    (p.target === undefined || p.target === m.target),
            );
            if (index >= 0) {
                const current = list[index];
                list[index] = {
                    ...current,
                    chanceToApply:
                        p.chanceToApply === undefined
                            ? current.chanceToApply
                            : clampChance(resolveValue(current.chanceToApply ?? 100, p.chanceToApply)),
                };
            } else if (p.create) {
                list.push({
                    effect: p.effect,
                    target: p.target ?? EffectTarget.TARGET,
                    onHit: p.onHit,
                    // un effet créé part de 0 % : le delta s'ajoute dessus
                    chanceToApply:
                        p.chanceToApply === undefined
                            ? undefined
                            : clampChance(resolveValue(0, p.chanceToApply)),
                });
            }
        }
        result.effectList = list;
    }
    
    return result;
}

function resolveOptionalValue(base: number | undefined,mod: number | string,): number | undefined {
    if (typeof mod === "number") return mod;     
    if (base === undefined) return undefined;
    return resolveValue(base, mod);
}