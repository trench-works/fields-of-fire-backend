import { FolderRepository } from "../../../core";
import { Action, ActionType, ActionZoneType } from "./Action";

export class ActionRepository extends FolderRepository<Action> {
    async entityToRessource(entity: Action): Promise<Action> {
        return {
            ...entity,
        };
    }

    constructor() {
    super("action", {
      walk: {
        id: "walk",
        name: "Marcher",
        description: "Se déplacer vers une position ciblée",
        iconSpriteKey: "action_image_moove",
        cost: 0,
        isWalkAction: true,
      },
      shoot: {
        id: "shoot",
        name: "Attaquer",
        description: "Attaquer un ennemi à portée",
        iconSpriteKey: "action_image_shoot",
        cost: 2,
        range: 3,
        damage: { min: 1, max: 3 },
        actionType: ActionType.RANGED,
      },
      heal: {
        id: "heal",
        name: "Soigner",
        description: "buff un allié",
        iconSpriteKey: "action_image_heal",
        cost: 1,
        range: 1,
        damage: { min: -3, max: -1 },
        targetRequired: true,
      },
      bayonet: {
        id: "bayonet",
        name: "Baïonnette",
        description: "Attaque de mêlée",
        iconSpriteKey: "action_image_bayonet",
        cost: 2,
        range: 1,
        damage: { min: 2, max: 4 },
        actionType: ActionType.MELEE,
      },
      artillery_support: {
        id: "artillery_support",
        name: "Appui d'artillerie",
        description: "Attaque à distance sur une zone",
        iconSpriteKey: "action_image_artillery_support",
        cost: 4,
        range: 5,
        damage: { min: 2, max: 5 },
        actionType: ActionType.RANGED,
        zoneType: ActionZoneType.SQUARE,
        zoneSize: 1,
      },
    });
  }
}
