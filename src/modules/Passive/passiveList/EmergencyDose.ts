import { EffectTarget, ManagedEffect } from "../../Action/data/Action";
import { GameEventType } from "../data/GameEvent";
import { PassiveDefinition } from "../data/Passive";

const HP_THRESHOLD = 40;
const EFFECT_ID = "fighting_drug";


export const emergencyDose: PassiveDefinition = {
    id: "EMERGENCY_DOSE",
    triggers: [GameEventType.HP_CHANGED],

    async run({ game, owner, event, applyEffects, getEffect }) {
        if (event.type !== GameEventType.HP_CHANGED) return;
        if(event.entityId !== owner.id) return;

        const percentHp = (event.current * 100) / owner.stats.maxLife;
        if (percentHp > HP_THRESHOLD) return;

        const effect = await getEffect(EFFECT_ID)
        if(!effect){
            console.log("[emergencyDose] : effect not found for id : ", EFFECT_ID)
            return
        }

        const alreadyFromPassive = owner.effects.some(
            (e) => e.id === EFFECT_ID && e.duration === null,
        );
        if (alreadyFromPassive) return;

        const managedEffect: ManagedEffect = {
            effect,
            target: EffectTarget.SELF,
            duration : null
        };

        applyEffects(owner, owner, [managedEffect]);
    },
};