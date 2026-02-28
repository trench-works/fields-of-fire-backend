import { ColdRessource, DBError, FolderRepository, Provide } from "../../../core";
import { Action } from "../../Action/data/Action";
import { ActionRepository } from "../../Action/data/ActionRepository";
import { CharacterClass } from "./CharacterClass";
import { CharacterClassEntity } from "./CharacterClassEntity";



export class CharacterClassRepository extends FolderRepository<CharacterClass, CharacterClassEntity> {

    @Provide(ActionRepository) private readonly actionRepository!: ColdRessource<Action>;

    async entityToRessource(entity: CharacterClassEntity): Promise<CharacterClass> {
        const actionList: Action[] = [];
        for (const key of entity.actionList) {
            const action = await this.actionRepository.get(key);
            if (action && !(action instanceof DBError)) {
                actionList.push(action);
            }
        }
        return {
            imageKey: entity.id,
            spriteKey: entity.id + "_spritesheet",
            iconImageKey: entity.id + "_closeup",
            ...entity,
            actionList
        }
    }

    constructor() {
        super("class", {
            "entente_fantassin": {
                id: "entente_fantassin",
                name: "Fantassin",
                stats:{
                    life: 24,
                    precision: 10,
                    strength: 20,
                    accuracy: 100,
                    initiative: 80,
                    dodging: 0,
                    energy: 4,
                    mouvement: 3,
                },
                classDescription: "Un soldat polyvalent, capable de s'adapter à différentes situations sur le champ de bataille. Il est équipé d'une armure légère et d'une épée, ce qui lui permet de se déplacer rapidement et d'attaquer efficacement à courte portée. Le Fantassin est également capable d'utiliser des compétences de soutien pour renforcer ses alliés ou affaiblir ses ennemis.",
                actionList: ["walk", "shoot", "heal"]
            },
            "entente_medic": {
                id: "entente_medic",
                name: "Medic",
                stats: {
                    life: 16,
                    precision: 5,
                    strength: 10,
                    accuracy: 100,
                    initiative: 70,
                    dodging: 5,
                    energy: 4,
                    mouvement: 2,
                },
                classDescription: "Un soigneur spécialisé dans le soutien de ses alliés. Le Medic est équipé d'une armure légère et d'un pistolet, ce qui lui permet de se déplacer rapidement et d'attaquer à distance. Sa principale force réside dans sa capacité à soigner les blessures de ses alliés et à fournir des buffs pour améliorer leurs performances au combat.",
                actionList: ["walk", "shoot", "heal"]
            },
            "entente_caporal": {
                id: "entente_caporal",
                name: "Caporal",
                stats : {
                    life: 20,
                    precision: 15,
                    strength: 30,
                    accuracy: 100,
                    initiative: 90,
                    dodging: 5,
                    energy: 4,
                    mouvement: 4,
                },
                classDescription: "Un combattant robuste et discipliné, le Caporal est équipé d'une armure lourde et d'une hache, ce qui lui permet de résister aux attaques ennemies et de causer des dégâts importants à courte portée. Il excelle dans les combats rapprochés et peut utiliser des compétences pour augmenter sa défense ou infliger des dégâts supplémentaires à ses adversaires.",
                actionList: ["walk", "shoot", "heal"]
            }
        })
    }
}