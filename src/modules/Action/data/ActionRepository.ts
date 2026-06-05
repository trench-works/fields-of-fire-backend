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
                cost: 0,
                range: 0,
                isWalkAction: true,
                zoneType: [],
                zoneSize: 0,
            },
            shoot: {
                id: "shoot",
                name: "Attaquer",
                description: "Attaquer un ennemi à portée",
                cost: 2,
                range: 3,
                damage: { min: 1, max: 3 },
                actionType: ActionType.RANGED,
                zoneType: [ActionZoneType.DIAMOND],
                zoneSize: 1,
            },
            heal: {
                id: "heal",
                name: "Soigner",
                description: "buff un allié",
                cost: 1,
                range: 1,
                damage: { min: -3, max: -1 },
                targetRequired: true,
                zoneType: [ActionZoneType.DIAMOND],
                zoneSize: 1,
            },
            bayonet: {
                id: "bayonet",
                name: "Baïonnette",
                description: "Attaque de mêlée",
                cost: 2,
                range: 1,
                damage: { min: 2, max: 4 },
                actionType: ActionType.MELEE,
                zoneType: [ActionZoneType.DIAMOND],
                zoneSize: 1,
            },
            artillery_support: {
                id: "artillery_support",
                name: "Appui d'artillerie",
                description: "Attaque à distance sur une zone",
                cost: 4,
                range: 5,
                damage: { min: 2, max: 5 },
                actionType: ActionType.RANGED,
                zoneType: [ActionZoneType.CIRCLE],
                zoneSize: 3,
            },
        });
    }
}
