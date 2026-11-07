import { EffectTarget } from "../../Action/data/Action";
import { GameEventType } from "../data/GameEvent";
import { PassiveDefinition } from "../data/Passive";

export const revengeful: PassiveDefinition = {
    id: "REVENGEFULL",
    triggers: [GameEventType.DAMAGE_DEALT],

    async run({ owner, event, applyEffects, getEffect }) {
        if (event.type !== GameEventType.DAMAGE_DEALT) return;
        if (event.targetId !== owner.id) return;
        if (event.damage <= 0) return;

        const revengeEffect = await getEffect("revengefull");
        if (!revengeEffect) return; // déjà loggué par getEffect

        applyEffects(owner, owner, [
            { effect: revengeEffect, target: EffectTarget.SELF },
        ]);
    },
};