import { FolderRepository } from "../../../core";
import { Action, ActionType } from "./Action";

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
        iconSpriteKey: "action_image_arrowup",
        cost: 1,
        range: 1,
      },
    });
  }
}
