import { HttpController } from "../../../core";
import { CharacterClass } from "../data/CharacterClass";



export class CharacterClassController extends HttpController {
    constructor() {
        super();
        this.get("/character-class", this.getCharacterClasses.bind(this));
    }

    async getCharacterClasses(): Promise<CharacterClass[]> {
        return [];
    }
}