import { FolderRepository } from "../../../core";
import { CharacterClass } from "./CharacterClass";
import { CharacterClassEntity } from "./CharacterClassEntity";



export class CharacterClassRepository extends FolderRepository<CharacterClass, CharacterClassEntity> {

    entityToRessource(entity: CharacterClassEntity): CharacterClass {
        return {
            ...entity,
            actionList: []
        }
    }

    constructor() {
        super("character-class", {
            "fantassin": {
                id: "fantassin",
                name: "Fantassin",
                imageKey: "entente_fantassin",
                spriteKey: "entente_fantassin_spritesheet",
                iconImageKey: "entente_fantassin_closeup",
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
            }
        })
    }
}