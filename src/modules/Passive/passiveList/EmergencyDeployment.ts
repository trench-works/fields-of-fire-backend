import { EffectTarget, ManagedEffect } from "../../Action/data/Action";
import { GameEventType } from "../data/GameEvent";
import { PassiveDefinition } from "../data/Passive";

const HP_THRESHOLD = 30;
const EFFECT_ID = "emergency_deployment";

export const emergencyDeployment: PassiveDefinition = {
    id: "EMERGENCY_DEPLOYMENT",
    triggers: [GameEventType.HP_CHANGED],

    async run({ game, owner, event, applyEffects, getEffect }) {
        if (event.type !== GameEventType.HP_CHANGED) return;

        // l'entité dont les PV ont changé doit être un allié
        const ally = game.entities.find((entity) => entity.id === event.entityId);
        if (!ally || ally.teamId !== owner.teamId) return;

        const percentHp = (event.current * 100) / ally.stats.maxLife;
        const givesBonus = owner.effects.some(
            (effect) => effect.id === EFFECT_ID && effect.author === ally.id,
        );

        if (percentHp <= HP_THRESHOLD) {
            if(ally.stats.life <= 0){
                if (givesBonus) {
                    owner.effects = owner.effects.filter(
                        (e) => !(e.id === EFFECT_ID && e.author === ally.id),
                    );
                }
                return;
            }
            if (givesBonus) return; 

            const effect = await getEffect(EFFECT_ID);
            if (!effect) {
                console.log("[emergencyDeployment] effet introuvable :", EFFECT_ID);
                return;
            }

            const managedEffect: ManagedEffect = {
                effect,
                target: EffectTarget.TARGET, 
                duration: null,
            };
            
            applyEffects(ally, owner, [managedEffect]);
        } else if (givesBonus) {
            owner.effects = owner.effects.filter(
                (effect) => !(effect.id === EFFECT_ID && effect.author === ally.id),
            );
        }
    },
};