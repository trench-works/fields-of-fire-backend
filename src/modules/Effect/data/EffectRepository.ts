import { FolderRepository } from "../../../core";
import { Effect, EffectType } from "./Effect";

export class EffectRepository extends FolderRepository<Effect> {
    async entityToRessource(entity: Effect): Promise<Effect> {
        return {
            ...entity,
        };
    }
    constructor() {
        super("effects", {
            amputated: {
                id: "amputated",
                name: "amputé",
                duration: 2,
                type: EffectType.APPLY,
                modifier: {
                    life: 0,
                    maxLife: 0,
                    strength: 0,
                    precision: 0,
                    armor: 0,
                    dodging: 0,
                    initiative: 0,
                    energy: -1,
                    mouvement: 0,
                },
            },
            intimidated: {
                id: "intimidated",
                name: "intimidé",
                duration: 3,
                type: EffectType.APPLY,
                modifier: {
                    life: 0,
                    maxLife: 0,
                    strength: -15,
                    precision: -15,
                    armor: 0,
                    dodging: 0,
                    initiative: 0,
                    energy: 0,
                    mouvement: 0,
                },
            },
            doped: {
                id: "doped",
                name: "Dopé",
                duration: 3,
                type: EffectType.APPLY,
                modifier: {
                    life: 0,
                    maxLife: 0,
                    strength: 10,
                    precision: 10,
                    armor: 10,
                    dodging: 0,
                    initiative: 0,
                    energy: 0,
                    mouvement: 0,
                },
            },
            charge: {
                id: "charge",
                name: "charge",
                duration: 1,
                type: EffectType.APPLY,
                modifier: {
                    life: 0,
                    maxLife: 0,
                    strength: 0,
                    precision: 0,
                    armor: 0,
                    dodging: 0,
                    initiative: 0,
                    energy: 0,
                    mouvement: 2,
                },
            },
            enhanced_drug: {
                id: "enhanced_drug",
                name: "Drogue de combat",
                duration: 2,
                type: EffectType.APPLY,
                modifier: {
                    life: 0,
                    maxLife: 0,
                    strength: 10,
                    precision: 10,
                    armor: 0,
                    dodging: 0,
                    initiative: 0,
                    energy: 2,
                    mouvement: 0,
                },
            },
            // LES BOOST
            vampire: {
                id: "vampire",
                name: "Sanguinaire",
                duration: null,
                type: EffectType.APPLY,
                modifier: {
                    life: 0,
                    maxLife: 0,
                    strength: 0,
                    precision: 0,
                    armor: 0,
                    dodging: 0,
                    initiative: 0,
                    energy: 0,
                    mouvement: 0,
                },
            },
            range: {
                id: "range",
                name: "Tir éloigné",
                duration: null,
                type: EffectType.APPLY,
                modifier: {
                    life: 0,
                    maxLife: 0,
                    strength: 0,
                    precision: 0,
                    armor: 0,
                    dodging: 0,
                    initiative: 0,
                    energy: 0,
                    mouvement: 0,
                },
            },
            reaction: {
                id: "reaction",
                name: "Adrenaline",
                duration: null,
                type: EffectType.APPLY,
                modifier: {
                    life: 5,
                    maxLife: 0,
                    strength: 3,
                    precision: 3,
                    armor: 0,
                    dodging: 0,
                    initiative: 15,
                    energy: 0,
                    mouvement: 0,
                },
            },
        });
    }
}
