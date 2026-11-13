import { GameEventType } from "../data/GameEvent";
import { PassiveDefinition } from "../data/Passive";

const healFactor = 0.4;

export const bloodthirsty: PassiveDefinition = {
    id: "BLOODTHIRSTY",
    triggers: [GameEventType.DAMAGE_DEALT],

    async run({ owner, event }) {
        if (event.type !== GameEventType.DAMAGE_DEALT) return;
        if (event.sourceId !== owner.id) return;
        if (event.damage <= 0) return;
        if (event.actionId !== "meat_cleaver") return;

        const hadEffect = (event.targetEffectIdsBefore ?? []).some(
            (id) => id === "bleeding" || id === "infected",
        );
        if (!hadEffect) return;

        const lifeSteal = Math.round(event.damage * healFactor);
        owner.stats.life = Math.min(owner.stats.maxLife, owner.stats.life + lifeSteal);
    }
};