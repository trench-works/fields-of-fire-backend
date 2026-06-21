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
            const selfEffectList : Effect[] = [];
            if(entity.effectList) {
                for (const key of entity.effectList) {
                const effect = await this.effectRepository.get(key);
                    if (effect && !(effect instanceof DBError)) {
                        effectList.push(effect);
                    }
                }
            }
            if(entity.selfEffectList) {
                for (const key of entity.selfEffectList) {
                const selfEffect = await this.effectRepository.get(key);
                    if (selfEffect && !(selfEffect instanceof DBError)) {
                        effectList.push(selfEffect);
                    }
                }
            }
            return {
                ...entity,
                effectList,
                selfEffectList
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
                actionType: ActionType.MELEE,
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
            },
            amputate: {
                id: "amputate",
                name: "Amputation",
                description: "Attaque de mêlée",
                cost: 2,
                range: 1,
                damage: { min: 1, max: 4 },
                actionType: ActionType.MELEE,
                zoneType: [ActionZoneType.DIAMOND],
                zoneSize: 1,
                effectList: ["amputated"]
            },
            charge : {
                id: "charge",
                name: "Chargez !",
                description: "boost en zone",
                cost: 2,
                range: 0,
                actionType: ActionType.OTHER,
                zoneType: [ActionZoneType.DIAMOND],
                zoneSize: 3,
                effectList: ["charge"]
            },
            fighting_drug :{
                id: "fighting_drug",
                name: "Drogue de combat",
                description: "Boost monocible",
                cost: 4,
                range: 1,
                actionType: ActionType.OTHER,
                zoneType: [ActionZoneType.DIAMOND],
                zoneSize: 1,
                effectList: ["enhanced_drug"]
            },
            saber :{
                id: "saber",
                name: "Sabrer",
                description: "Frappe monocible",
                cost: 2,
                range: 1,
                damage: { min: 1, max: 5 },
                actionType: ActionType.MELEE,
                zoneType: [ActionZoneType.DIAMOND],
                zoneSize: 1,
            },
            break :{
                id: "break",
                name: "Briser",
                description: "Frappe monocible",
                cost: 2,
                range: 1,
                damage: { min: 1, max: 3 },
                actionType: ActionType.MELEE,
                zoneType: [ActionZoneType.DIAMOND],
                zoneSize: 1,
                selfEffectList :["angered"]
            },
            provok: {
                id: "provok",
                name: "Provoquer",
                description: "Debuff sur une cible",
                cost : 2,
                range : 3,
                actionType: ActionType.OTHER,
                zoneType: [ActionZoneType.DIAMOND],
                zoneSize:1,
                effectList :["provoked"]
            },
            shield_rush: {
                id: "shield_rush",
                name: "Charge de bouclier",
                description: "rush sur une cible",
                cost : 2,
                range : 3,
                actionType: ActionType.OTHER,
                zoneType: [ActionZoneType.DIAMOND],
                zoneSize:1,
            },
            barricade : {
                id: "barricade",
                name: "Barricade",
                description: "construit un obstacle",
                cost : 1,
                range : 1,
                actionType: ActionType.OTHER,
                zoneType: [ActionZoneType.DIAMOND],
                zoneSize:1,
            },

        });
    }
}
