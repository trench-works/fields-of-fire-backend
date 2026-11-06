import { EffectTarget } from "../../Action/data/Action";
import { GameEventType } from "../data/GameEvent";
import { PassiveDefinition } from "../data/Passive";

const healFactor = 0.5;

export const revengeful: PassiveDefinition = {
    id: "REVENGEFULL",
    triggers: [GameEventType.DAMAGE_DEALT],

    async run({ owner, event }) {
        if (event.type !== GameEventType.DAMAGE_DEALT) return;
        if (event.sourceId !== owner.id) return;
        if (event.damage <= 0) return;

        const lifeSteal = event.damage * healFactor;
        owner.stats.life = Math.min(owner.stats.maxLife, owner.stats.life + lifeSteal);
    },
};