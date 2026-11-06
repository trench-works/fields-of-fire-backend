import { GameEventType } from "../data/GameEvent";
import { PassiveDefinition } from "../data/Passive";
import { PassiveUtils } from "../utils/PassiveUtils";

const HEAL_PER_ENEMY = 4;

export const enduring: PassiveDefinition = {
    id: "ENDURING",
    triggers: [GameEventType.TURN_END],

    run({ game, owner, event }) {
        if (event.type !== GameEventType.TURN_END) return;
        if (event.entityId !== owner.id) return;            // pertinent ?

        const enemies = PassiveUtils.countAdjacentEnemies(game, owner);
        if (enemies === 0) return;

        const heal = HEAL_PER_ENEMY * enemies;
        owner.stats.life = Math.min(owner.stats.maxLife, owner.stats.life + heal);
    },
};