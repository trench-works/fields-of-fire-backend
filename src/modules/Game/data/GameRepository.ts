import { HotRessource } from "../../../core/app/Database/HotDB";
import { Game } from "./Game";



export class GameRepository extends HotRessource<Game> {
    constructor() {
        super("game")
    }
}