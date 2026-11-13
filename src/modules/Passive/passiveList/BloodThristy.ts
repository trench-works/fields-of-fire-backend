import { GameEventType } from "../data/GameEvent";
import { PassiveDefinition } from "../data/Passive";

const healFactor = 0.5;

export const bloodthirsty: PassiveDefinition = {
    id: "BLOODTHIRSTY",
    triggers: [GameEventType.DAMAGE_DEALT],

    async run({ game, owner, event }) {
        if (event.type !== GameEventType.DAMAGE_DEALT) return;
        if (event.sourceId !== owner.id) return;
        if (event.damage <= 0) return;
        if (event.actionId !== "meat_cleaver") return;

        const targetEntity = game.entities.find(
            (entity) => entity.id === event.targetId
        );
        if(!targetEntity || !targetEntity.effects){
            return
        }
        for( const effect of targetEntity.effects ){
            if(effect.id === "bleeding" || effect.id === "infected"){
                const lifeSteal = event.damage * healFactor;
                owner.stats.life = Math.min(owner.stats.maxLife, owner.stats.life + lifeSteal);
            }
        }   
    },
};