import { Module } from "../../core/app/Module";
import { GameController } from "./application/GameController";

export class GameModule extends Module {
    constructor() {
        super({
            controllers: [GameController],
            providers: [],
        });
    }
}
