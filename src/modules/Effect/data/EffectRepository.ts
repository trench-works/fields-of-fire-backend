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
                    energy: -1,
                },
            },
            intimidated: {
                id: "intimidated",
                name: "intimidé",
                duration: 3,
                type: EffectType.APPLY,
                modifier: {
                    strength: -15,
                    precision: -15,
                },
            },
            doped: {
                id: "doped",
                name: "Dopé",
                duration: 3,
                type: EffectType.APPLY,
                modifier: {
                    strength: 10,
                    precision: 10,
                    armor: 10,
                },
            },
            charge: {
                id: "charge",
                name: "charge",
                duration: 1,
                type: EffectType.APPLY,
                modifier: {
                    mouvement: 2,
                },
            },
            enhanced_drug: {
                id: "enhanced_drug",
                name: "Drogue de combat",
                duration: 2,
                type: EffectType.APPLY,
                modifier: {
                    strength: 10,
                    precision: 10,
                    energy: 2,
                },
            },
            // LES BOOST
            vampire: {
                id: "vampire",
                name: "Sanguinaire",
                duration: null,
                type: EffectType.APPLY,
                modifier: {},
            },
            range: {
                id: "range",
                name: "Tir éloigné",
                duration: null,
                type: EffectType.APPLY,
                modifier: {},
            },
        });
    }
}
