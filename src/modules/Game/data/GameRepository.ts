import { BaseHotRessource } from "../../../core/app/Database/HotDB";
import { Game } from "./Game";



export class GameRepository extends BaseHotRessource<Game> {
    constructor() {
        super("game")
    }
}