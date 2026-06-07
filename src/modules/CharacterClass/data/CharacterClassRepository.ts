import {
    ColdRessource,
    DBError,
    FolderRepository,
    Provide,
} from "../../../core";
import { Action } from "../../Action/data/Action";
import { ActionRepository } from "../../Action/data/ActionRepository";
import { CharacterClass } from "./CharacterClass";
import { CharacterClassEntity } from "./CharacterClassEntity";

export class CharacterClassRepository extends FolderRepository<
    CharacterClass,
    CharacterClassEntity
> {
    @Provide(ActionRepository)
    private readonly actionRepository!: ColdRessource<Action>;

    async entityToRessource(
        entity: CharacterClassEntity
    ): Promise<CharacterClass> {
        const actionList: Action[] = [];
        for (const key of entity.actionList) {
            const action = await this.actionRepository.get(key);
            if (action && !(action instanceof DBError)) {
                actionList.push(action);
            }
        }
        return {
            ...entity,
            actionList,
        };
    }

    constructor() {
        super("class", {
            entente_fantassin: {
                id: "entente_fantassin",
                name: "Fantassin de l'Entente",
                playable: true,
                stats: {
                    life: 24,
                    precision: 10,
                    strength: 20,
                    armor: 0,
                    initiative: 80,
                    dodging: 0,
                    energy: 4,
                    mouvement: 3,
                },
                classDescription:
                    "Un soldat polyvalent, capable de s'adapter à différentes situations sur le champ de bataille. Il est équipé d'une armure légère et d'une épée, ce qui lui permet de se déplacer rapidement et d'attaquer efficacement à courte portée. Le Fantassin est également capable d'utiliser des compétences de soutien pour renforcer ses alliés ou affaiblir ses ennemis.",
                actionList: ["walk", "shoot", "bayonet"],
            },
            entente_medic: {
                id: "entente_medic",
                name: "Médecin de l'Entente",
                playable: true,
                stats: {
                    life: 16,
                    precision: 5,
                    strength: 10,
                    armor: 0,
                    initiative: 70,
                    dodging: 5,
                    energy: 4,
                    mouvement: 2,
                },
                classDescription:
                    "Un soigneur spécialisé dans le soutien de ses alliés. Le Medic est équipé d'une armure légère et d'un pistolet, ce qui lui permet de se déplacer rapidement et d'attaquer à distance. Sa principale force réside dans sa capacité à soigner les blessures de ses alliés et à fournir des buffs pour améliorer leurs performances au combat.",
                actionList: ["walk", "shoot", "heal"],
            },
            entente_caporal: {
                id: "entente_caporal",
                name: "Caporal de l'Entente",
                playable: true,
                stats: {
                    life: 20,
                    precision: 15,
                    strength: 30,
                    armor: 0,
                    initiative: 90,
                    dodging: 5,
                    energy: 4,
                    mouvement: 4,
                },
                classDescription:
                    "Un combattant intelligent et discipliné, le Caporal est équipé d'un sabre et d'une fusil, ce qui lui permet de mettre à distance les ennemies et de causer des dégâts importants à moyenne et logngue portée. Il excelle dans les combats en groupe, de pars sa capacité à booster ses alliés.",
                actionList: ["walk", "shoot", "artillery_support"],
            },
            alliance_fantassin: {
                id: "alliance_fantassin",
                name: "Fantassin Coquin",
                playable: false,
                stats: {
                    life: 24,
                    precision: 10,
                    strength: 20,
                    armor: 0,
                    initiative: 60,
                    dodging: 0,
                    energy: 4,
                    mouvement: 3,
                },
                classDescription: "Un fantassin très vilain",
                actionList: ["walk", "shoot", "bayonet"],
            },
            alliance_medic: {
                id: "alliance_medic",
                name: "Médecin Coquin",
                playable: false,
                stats: {
                    life: 24,
                    precision: 10,
                    strength: 20,
                    armor: 0,
                    initiative: 60,
                    dodging: 0,
                    energy: 4,
                    mouvement: 3,
                },
                classDescription: "Un médecin très très vilain",
                actionList: ["walk", "shoot", "heal"],
            },
            alliance_caporal: {
                id: "alliance_caporal",
                name: "Caporal Coquin",
                playable: false,
                stats: {
                    life: 24,
                    precision: 10,
                    strength: 20,
                    armor: 0,
                    initiative: 60,
                    dodging: 0,
                    energy: 4,
                    mouvement: 3,
                },
                classDescription: "Un Caporal très très très vilain",
                actionList: ["walk", "shoot"],
            },
        });
    }
}
