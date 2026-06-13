import { ColdRessource, DBError, FolderRepository, Provide } from "../../../core";
import { Effect } from "../../Effect/data/Effect";
import { EffectRepository } from "../../Effect/data/EffectRepository";
import { Action, ActionEntity, ActionType, ActionZoneType } from "./Action";

export class ActionRepository extends FolderRepository<Action, ActionEntity> {

    @Provide(EffectRepository)
        private readonly effectRepository!: ColdRessource<Effect>;

    async entityToRessource(
            entity: ActionEntity
        ): Promise<Action> {
            const effectList: Effect[] = [];
            if(entity.effectList) {
                for (const key of entity.effectList) {
                const effect = await this.effectRepository.get(key);
                    if (effect && !(effect instanceof DBError)) {
                        effectList.push(effect);
                    }
                }
            }
            return {
                ...entity,
                effectList,
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
                range: 6,
                damage: { min: 2, max: 5 },
                actionType: ActionType.RANGED,
                zoneType: [ActionZoneType.DIAMOND],
                zoneSize: 2,
            },
            intimidation: {
                id: "intimidation",
                name: "Intimidation",
                description: "Debuff sur une cible",
                cost : 2,
                range : 5,
                actionType: ActionType.OTHER,
                zoneType: [ActionZoneType.DIAMOND],
                zoneSize:1,
                effectList :["intimidated"]
            },
            dopage: {
                id: "dopage",
                name: "Dopage",
                description: "Buff sur soi",
                cost : 1,
                range : 0,
                actionType: ActionType.OTHER,
                zoneType: [ActionZoneType.DIAMOND],
                zoneSize:1,
                effectList :["doped"]
            }
        });
    }
}
