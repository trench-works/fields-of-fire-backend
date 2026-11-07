import { ActionUtils, ActionZoneType } from "../../Action/data/Action";
import { applyModification } from "../../Action/data/ActionModifier";
import { GameEventType } from "../data/GameEvent";
import { PassiveDefinition } from "../data/Passive";
import { PassiveUtils } from "../utils/PassiveUtils";

export const reflexShot: PassiveDefinition = {
    id: "REFLEX_SHOT",
    triggers: [GameEventType.TURN_END],

    async run({ game, owner, event, baseActions, getCellsInRange, castFree }) {
        if (event.type !== GameEventType.TURN_END) return;
        if (event.entityId !== owner.id) return;

        // condition : aucun ennemi au corps à corps
        if (PassiveUtils.hasAdjacentEnemy(game, owner)) return;

        // le tir du joueur, avec ses maîtrises (portée, zone...)
        const shoot = ActionUtils.getEntityAction(owner, "shoot", baseActions);
        if (!shoot) return;

        // -50 % de dégâts, par le même mécanisme que les maîtrises
        const reflex = applyModification(shoot, { id: shoot.id, rangeType: ActionZoneType.PLUS, damage: { min: "*0.5", max: "*0.5" } });

        // ennemis alignés et visibles : on réutilise la portée + la ligne de vue existantes
        const targets = getCellsInRange(owner.position, reflex, game.plateau)
            .filter((cell) => cell.entityId)
            .map((cell) => game.entities.find((e) => e.id === cell.entityId)!)
            .filter((e) => !e.dead && e.teamId !== owner.teamId);

        await castFree(owner, reflex, targets);
    },
};