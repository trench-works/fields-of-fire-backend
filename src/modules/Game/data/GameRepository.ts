import { MappedRepository } from "../../../core";
import { Game } from "./Game";

export class GameDataManager extends MappedRepository<Game> {
    constructor() {
        super("game");
    }
}
