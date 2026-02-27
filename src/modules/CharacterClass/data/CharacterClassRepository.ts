import { FolderRepository } from "../../../core/app/Database/FolderRepository";
import { CharacterClass } from "./CharacterClass";



export class CharacterClassRepository extends FolderRepository<CharacterClass> {
    constructor() {
        super("character-class", {})
    }
}