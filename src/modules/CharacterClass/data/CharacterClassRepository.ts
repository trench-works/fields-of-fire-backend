import { FolderRepository } from "../../../core";
import { CharacterClass } from "./CharacterClass";



export class CharacterClassRepository extends FolderRepository<CharacterClass> {
    constructor() {
        super("character-class", {})
    }
}